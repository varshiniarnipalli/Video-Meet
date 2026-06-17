const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoute = require("./Routes/AuthRouter");
const Meeting = require("./Models/Meeting");
const { PORT, MONGO_URL } = process.env;

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "https://video-meet-f.onrender.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

// ── DB ────────────────────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Database Connected");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log("Connection Failed:", err.message);
    process.exit(1);
  });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: true, message: "Video Meet API is running" });
});

app.use("/", authRoute);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// In-memory participant tracking
// { meetingId: [{ id, name, initials, host, muted, joinedAt }] }
const rooms = {};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // ── 1. Create room ──────────────────────────────────────────────────────────
  socket.on("create-room", async ({ meetingId, password, username }) => {
    try {
      const exists = await Meeting.findOne({ meetingId });
      if (exists) {
        socket.emit("create-room-error", "Room ID already exists. Try again.");
        return;
      }
      await Meeting.create({ meetingId, password, host: username });
      rooms[meetingId] = [];
      console.log(`Room ${meetingId} created by ${username}`);
      socket.emit("create-room-success", { meetingId });
    } catch (err) {
      console.error(err);
      socket.emit("create-room-error", "Server error. Try again.");
    }
  });

  // ── 2. Verify password ──────────────────────────────────────────────────────
  socket.on("verify-password", async ({ meetingId, password }) => {
    try {
      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) {
        socket.emit("verify-result", { success: false, error: "Meeting not found." });
        return;
      }
      if (!meeting.active) {
        socket.emit("verify-result", { success: false, error: "This meeting has ended." });
        return;
      }
      if (meeting.password !== password) {
        socket.emit("verify-result", { success: false, error: "Incorrect password." });
        return;
      }
      socket.emit("verify-result", { success: true });
    } catch {
      socket.emit("verify-result", { success: false, error: "Server error." });
    }
  });

  // ── 3. Join room ────────────────────────────────────────────────────────────
  socket.on("join-room", async ({ meetingId, username }) => {
    socket.join(meetingId);

    if (!rooms[meetingId]) rooms[meetingId] = [];

    // Remove stale entry for same username (handles page refresh)
    rooms[meetingId] = rooms[meetingId].filter((u) => u.name !== username);

    const isHost = rooms[meetingId].length === 0;
    const user = {
      id: socket.id,
      name: username,
      initials: username.charAt(0).toUpperCase(),
      host: isHost,
      muted: false,
      joinedAt: Date.now(),
    };

    rooms[meetingId].push(user);

    await Meeting.findOneAndUpdate(
      { meetingId },
      { $addToSet: { participants: username } }
    );

    console.log(`${username} joined ${meetingId}`, rooms[meetingId].map((u) => u.name));

    // Send full room list to the joiner
    socket.emit("room-users", rooms[meetingId]);
    // Notify existing users about the new joiner
    socket.to(meetingId).emit("user-joined", user);
  });

  // ── 4. Leave room ───────────────────────────────────────────────────────────
  socket.on("leave-room", async ({ meetingId, username }) => {
    socket.leave(meetingId);

    if (rooms[meetingId]) {
      rooms[meetingId] = rooms[meetingId].filter((u) => u.id !== socket.id);
      io.to(meetingId).emit("user-left", { id: socket.id });

      if (rooms[meetingId].length === 0) {
        await Meeting.findOneAndUpdate(
          { meetingId },
          { active: false, endedAt: new Date() }
        );
        delete rooms[meetingId];
        console.log(`Room ${meetingId} ended`);
      }
    }
  });

  // ── 5. Chat ─────────────────────────────────────────────────────────────────
  socket.on("send-message", ({ meetingId, username, text }) => {
    socket.to(meetingId).emit("receive-message", { name: username, text });
  });

  // ── 6. WebRTC Signaling ─────────────────────────────────────────────────────
  // Relay offer from caller → specific peer
  socket.on("webrtc-offer", ({ to, from, offer }) => {
    io.to(to).emit("webrtc-offer", { from, offer });
  });

  // Relay answer from callee → specific peer
  socket.on("webrtc-answer", ({ to, from, answer }) => {
    io.to(to).emit("webrtc-answer", { from, answer });
  });

  // Relay ICE candidates between peers
  socket.on("webrtc-ice-candidate", ({ to, from, candidate }) => {
    io.to(to).emit("webrtc-ice-candidate", { from, candidate });
  });

  // Screen share started — notify everyone in room
  socket.on("screen-share-started", ({ meetingId, username }) => {
    socket.to(meetingId).emit("screen-share-started", { socketId: socket.id, username });
  });

  // Screen share stopped — notify everyone in room
  socket.on("screen-share-stopped", ({ meetingId }) => {
    socket.to(meetingId).emit("screen-share-stopped", { socketId: socket.id });
  });

  // ── 7. Disconnect fallback ──────────────────────────────────────────────────
  socket.on("disconnect", async () => {
    console.log("Socket disconnected:", socket.id);

    for (const meetingId in rooms) {
      const before = rooms[meetingId].length;
      rooms[meetingId] = rooms[meetingId].filter((u) => u.id !== socket.id);

      if (rooms[meetingId].length !== before) {
        io.to(meetingId).emit("user-left", { id: socket.id });

        if (rooms[meetingId].length === 0) {
          await Meeting.findOneAndUpdate(
            { meetingId },
            { active: false, endedAt: new Date() }
          );
          delete rooms[meetingId];
          console.log(`Room ${meetingId} ended (last user disconnected)`);
        }
        break;
      }
    }
  });
});

// ── Meeting History API ───────────────────────────────────────────────────────
app.get("/meetings/:username", async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { participants: req.params.username },
        { host: req.params.username },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("meetingId host participants active createdAt endedAt");

    res.json({ status: true, meetings });
  } catch {
    res.json({ status: false, meetings: [] });
  }
});
