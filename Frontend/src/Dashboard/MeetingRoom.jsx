import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./MeetingRoom.css";
import socket from "../socket";
import InviteModal from "./InviteModal";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

const MeetingRoom = () => {
  const location      = useLocation();
  const { meetingId } = useParams();
  const navigate      = useNavigate();

  const username = location.state?.username || "Guest";
  const password = location.state?.password || "";

  const [participants, setParticipants] = useState([]);
  const [micOn,        setMicOn]        = useState(true);
  const [cameraOn,     setCameraOn]     = useState(true);
  const [sharing,      setSharing]      = useState(false);
  const [panel,        setPanel]        = useState("none");
  const [messages,     setMessages]     = useState([]);
  const [draft,        setDraft]        = useState("");
  const [copied,       setCopied]       = useState(false);
  const [showInvite,   setShowInvite]   = useState(false);
  const [screenSharer, setScreenSharer] = useState(null);
  const [remoteStreamsTick, setRemoteStreamsTick] = useState(0);

  const localStreamRef   = useRef(null);
  const screenStreamRef  = useRef(null);
  const localVideoRef    = useRef(null);
  const screenVideoRef   = useRef(null);
  const remoteScreenVideoRef = useRef(null);
  const peersRef         = useRef({});
  const remoteVideosRef  = useRef({});
  const remoteAudioRefs  = useRef({});
  const remoteStreamsRef = useRef({});
  const pendingIceRef    = useRef({});
  const screenSharerRef  = useRef(null);

  // ── Attach stream to video element ────────────────────────────────────────
  const attachStream = (videoEl, stream) => {
    if (!videoEl || !stream) return;
    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
      videoEl.play().catch(() => {});
    }
  };

  const resumeRemoteAudio = useCallback(() => {
    Object.values(remoteAudioRefs.current).forEach((audioEl) => {
      audioEl?.play().catch(() => {});
    });
  }, []);

  // ── Create peer connection ─────────────────────────────────────────────────
  const sendOffer = useCallback(async (remoteSocketId, attempt = 0) => {
    const pc = peersRef.current[remoteSocketId];
    if (!pc) return;
    if (pc.signalingState !== "stable") {
      if (attempt < 10) {
        setTimeout(() => sendOffer(remoteSocketId, attempt + 1), 120);
      }
      return;
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc-offer", {
        to: remoteSocketId,
        from: socket.id,
        offer: pc.localDescription,
      });
    } catch (err) {
      console.error("Offer error:", err);
    }
  }, []);

  const flushPendingIce = useCallback(async (remoteSocketId) => {
    const pc = peersRef.current[remoteSocketId];
    const pending = pendingIceRef.current[remoteSocketId] || [];
    if (!pc || !pc.remoteDescription || pending.length === 0) return;

    pendingIceRef.current[remoteSocketId] = [];
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch { /* benign */ }
    }
  }, []);

  const createPeer = useCallback((remoteSocketId) => {
    if (peersRef.current[remoteSocketId]) return peersRef.current[remoteSocketId];

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit("webrtc-ice-candidate", {
          to: remoteSocketId,
          from: socket.id,
          candidate,
        });
      }
    };

    pc.ontrack = ({ streams }) => {
      const stream = streams[0];
      if (!stream) return;
      remoteStreamsRef.current[remoteSocketId] = stream;
      setRemoteStreamsTick((v) => v + 1);

      const videoEl = remoteVideosRef.current[remoteSocketId];
      if (videoEl) attachStream(videoEl, stream);

      const audioEl = remoteAudioRefs.current[remoteSocketId];
      if (audioEl) attachStream(audioEl, stream);

      if (screenSharerRef.current?.socketId === remoteSocketId) {
        attachStream(remoteScreenVideoRef.current, stream);
      }
    };

    // Add local tracks right away — stream is guaranteed ready before createPeer
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    peersRef.current[remoteSocketId] = pc;
    return pc;
  }, []);

  const removePeer = useCallback((remoteSocketId) => {
    const pc = peersRef.current[remoteSocketId];
    if (pc) { pc.close(); delete peersRef.current[remoteSocketId]; }
    delete remoteStreamsRef.current[remoteSocketId];
    delete remoteVideosRef.current[remoteSocketId];
    delete remoteAudioRefs.current[remoteSocketId];
    delete pendingIceRef.current[remoteSocketId];
    setRemoteStreamsTick((v) => v + 1);
  }, []);

  // ── Step 1: Get media FIRST, then join room ───────────────────────────────
  // Critical: peer connections must be created AFTER localStream exists
  useEffect(() => {
    let didUnmount = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (didUnmount) { stream.getTracks().forEach((t) => t.stop()); return; }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) {
        console.warn("Media access failed:", err.message);
      }

      // Join room only after media is ready
      socket.emit("join-room", { meetingId, username });

      const recent  = JSON.parse(localStorage.getItem("recentMeetings") || "[]");
      const updated = [
        { title: "Meeting", id: meetingId, when: new Date().toLocaleString() },
        ...recent.filter((m) => m.id !== meetingId),
      ].slice(0, 5);
      localStorage.setItem("recentMeetings", JSON.stringify(updated));
    };

    start();

    return () => {
      didUnmount = true;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, username]);

  useEffect(() => {
    screenSharerRef.current = screenSharer;

    if (!screenSharer || screenSharer.socketId === socket.id) return;
    const stream = remoteStreamsRef.current[screenSharer.socketId];
    if (stream) attachStream(remoteScreenVideoRef.current, stream);
  }, [screenSharer, remoteStreamsTick]);

  // ── Step 2: Socket listeners ──────────────────────────────────────────────
  useEffect(() => {

    // I just joined — createPeer adds tracks → onnegotiationneeded fires automatically → sends offer
    // Do NOT manually createOffer here — that races with onnegotiationneeded and causes m-line mismatch
    socket.on("room-users", (users) => {
      setParticipants(users);
      users.forEach((user) => {
        if (user.id === socket.id) return;
        setTimeout(() => sendOffer(user.id), 0);
        createPeer(user.id); // tracks added inside → onnegotiationneeded handles the offer
      });
    });

    // New user joined after me — pre-create peer, wait for their offer
    socket.on("user-joined", (user) => {
      setParticipants((prev) =>
        prev.find((p) => p.id === user.id) ? prev : [...prev, user]
      );
      createPeer(user.id);
    });

    socket.on("user-left", ({ id }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== id));
      removePeer(id);
      setScreenSharer((prev) => (prev?.socketId === id ? null : prev));
    });

    // Receive offer → send answer (handles initial + renegotiation offers)
    socket.on("webrtc-offer", async ({ from, offer }) => {
      const pc = createPeer(from);
      try {
        if (pc.signalingState !== "stable") {
          await pc.setLocalDescription({ type: "rollback" });
        }
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushPendingIce(from);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-answer", {
          to: from,
          from: socket.id,
          answer: pc.localDescription,
        });
      } catch (err) {
        console.error("Answer error:", err);
      }
    });

    // Receive answer
    socket.on("webrtc-answer", async ({ from, answer }) => {
      const pc = peersRef.current[from];
      if (!pc) return;
      try {
        if (pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          await flushPendingIce(from);
        }
      } catch (err) {
        console.error("Remote answer error:", err);
      }
    });

    // ICE candidate
    socket.on("webrtc-ice-candidate", async ({ from, candidate }) => {
      const pc = peersRef.current[from];
      if (!pc || !pc.remoteDescription) {
        pendingIceRef.current[from] = [
          ...(pendingIceRef.current[from] || []),
          candidate,
        ];
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch { /* benign */ }
    });

    socket.on("screen-share-started", ({ socketId, username: sharerName }) => {
      setScreenSharer({ socketId, username: sharerName });
    });

    socket.on("screen-share-stopped", () => {
      setScreenSharer(null);
    });

    socket.on("receive-message", ({ name, text }) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), name, text, time: "Now", self: false },
      ]);
    });

    return () => {
      socket.off("room-users");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice-candidate");
      socket.off("screen-share-started");
      socket.off("screen-share-stopped");
      socket.off("receive-message");
    };
  }, [createPeer, flushPendingIce, removePeer, sendOffer]);

  // ── Controls ──────────────────────────────────────────────────────────────

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn((v) => !v);
  };

  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !cameraOn));
    setCameraOn((v) => !v);
  };

  const stopScreenShare = useCallback(async () => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setSharing(false);
    setScreenSharer(null);
    socket.emit("screen-share-stopped", { meetingId });

    // Swap back to camera track — onnegotiationneeded fires → renegotiates
    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    if (camTrack) {
      for (const [remoteSocketId, pc] of Object.entries(peersRef.current)) {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(camTrack);
        await sendOffer(remoteSocketId);
      }
    }
  }, [meetingId, sendOffer]);

  const toggleScreenShare = async () => {
    if (sharing) { await stopScreenShare(); return; }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false,
      });
      screenStreamRef.current = screenStream;

      if (screenVideoRef.current) screenVideoRef.current.srcObject = screenStream;

      setSharing(true);
      setScreenSharer({ socketId: socket.id, username });

      // replaceTrack triggers onnegotiationneeded → new offer → remote sees screen
      const screenTrack = screenStream.getVideoTracks()[0];
      for (const [remoteSocketId, pc] of Object.entries(peersRef.current)) {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(screenTrack);
        await sendOffer(remoteSocketId);
      }

      socket.emit("screen-share-started", { meetingId, username });

      screenTrack.onended = () => stopScreenShare();
    } catch (err) {
      console.warn("Screen share cancelled:", err.message);
    }
  };

  const handleLeave = () => {
    socket.emit("leave-room", { meetingId, username });
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    Object.values(peersRef.current).forEach((pc) => pc.close());
    navigate("/dashboard", { state: { username } });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    socket.emit("send-message", { meetingId, username, text });
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), name: username, text, time: "Now", self: true },
    ]);
    setDraft("");
  };

  const copyId = () => {
    navigator.clipboard.writeText(meetingId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const togglePanel = (name) => setPanel((prev) => (prev === name ? "none" : name));

  const showingScreen = !!screenSharer;
  const myParticipant = participants.find((p) => p.id === socket.id) || {
    id: socket.id,
    name: username,
    initials: username.charAt(0).toUpperCase(),
    host: true,
    muted: false,
  };
  const others = participants.filter((p) => p.id !== socket.id);

  return (
    <div className="room" onClick={resumeRemoteAudio}>

      {/* Header */}
      <header className="room-header">
        <div className="room-info">
          <span className="room-brand">
            <i className="fa fa-video-camera" />
            VideoMeet
          </span>
          <span className="room-divider" />
          <div className="room-meta">
            <h1>Meeting Room</h1>
            <button className="room-id" onClick={copyId}>
              ID: {meetingId}
              <i className={`fa ${copied ? "fa-check" : "fa-clone"}`} />
            </button>
          </div>
        </div>
        <div className="room-status">
          <span className="rec-dot" />
          {participants.length} participant{participants.length !== 1 ? "s" : ""}
        </div>
      </header>

      {/* Body */}
      <div className="room-body">
        <div className="stage">

          {/* Main stage */}
          <div className="main-speaker">
            {showingScreen ? (
              <>
                {screenSharer.socketId === socket.id ? (
                  <video ref={screenVideoRef} className="main-video" autoPlay muted playsInline />
                ) : (
                  <video
                    className="main-video"
                    autoPlay
                    muted
                    playsInline
                    ref={(el) => {
                      remoteScreenVideoRef.current = el;
                      if (!el) return;
                      const stream = remoteStreamsRef.current[screenSharer.socketId];
                      if (stream) attachStream(el, stream);
                    }}
                  />
                )}
                <div className="speaker-name">
                  <i className="fa fa-desktop" />
                  {screenSharer.socketId === socket.id
                    ? "Your screen"
                    : `${screenSharer.username}'s screen`}
                </div>
              </>
            ) : (
              <>
                <video ref={localVideoRef} className="main-video" autoPlay muted playsInline />
                {!cameraOn && (
                  <div className="video-off-overlay">
                    <div className="avatar-xl">{myParticipant.initials}</div>
                  </div>
                )}
                <div className="speaker-name">
                  <i className={`fa ${micOn ? "fa-microphone" : "fa-microphone-slash"}`} />
                  {username} (You){myParticipant.host && " · Host"}
                </div>
                <span className="speaking-ring" />
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div className="thumb-strip">
            {others.map((p) => (
              <div className="thumb" key={p.id}>
                <video
                  className="thumb-video"
                  autoPlay
                  muted
                  playsInline
                  ref={(el) => {
                    if (!el) return;
                    remoteVideosRef.current[p.id] = el;
                    const stream = remoteStreamsRef.current[p.id];
                    if (stream) attachStream(el, stream);
                  }}
                />
                <div className="thumb-avatar-fallback">
                  <div className="avatar-md">{p.initials}</div>
                </div>
                <span className="thumb-name">
                  {p.name.split(" ")[0]}
                  {p.host && <span className="host-tag"> ★</span>}
                </span>
                <span className={`thumb-mic ${p.muted ? "muted" : ""}`}>
                  <i className={`fa ${p.muted ? "fa-microphone-slash" : "fa-microphone"}`} />
                </span>
              </div>
            ))}
          </div>

          <div className="remote-audio-bank" aria-hidden="true">
            {others.map((p) => (
              <audio
                key={p.id}
                autoPlay
                ref={(el) => {
                  if (!el) return;
                  remoteAudioRefs.current[p.id] = el;
                  const stream = remoteStreamsRef.current[p.id];
                  if (stream) attachStream(el, stream);
                }}
              />
            ))}
          </div>
        </div>

        {/* Side panel */}
        {panel !== "none" && (
          <aside className="side-panel">
            <div className="panel-head">
              <h3>{panel === "chat" ? "Meeting Chat" : `Participants (${participants.length})`}</h3>
              <button className="panel-close" onClick={() => setPanel("none")}>
                <i className="fa fa-times" />
              </button>
            </div>

            {panel === "chat" ? (
              <>
                <div className="chat-messages">
                  {messages.map((m) => (
                    <div key={m.id} className={`chat-msg ${m.self ? "self" : ""}`}>
                      <div className="chat-msg-head">
                        <span className="chat-author">{m.name}</span>
                        <span className="chat-time">{m.time}</span>
                      </div>
                      <p>{m.text}</p>
                    </div>
                  ))}
                </div>
                <form className="chat-input" onSubmit={sendMessage}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button type="submit"><i className="fa fa-paper-plane" /></button>
                </form>
              </>
            ) : (
              <ul className="people-list">
                {participants.map((p) => (
                  <li key={p.id}>
                    <div className="avatar-sm">{p.initials}</div>
                    <span className="people-name">
                      {p.name}
                      {p.id === socket.id && <span className="you-tag"> You</span>}
                      {p.host && <span className="host-tag"> Host</span>}
                    </span>
                    <i className={`fa ${p.muted ? "fa-microphone-slash muted" : "fa-microphone"}`} />
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}
      </div>

      {/* Controls */}
      <footer className="controls">
        <div className="controls-group">
          <button className={`ctrl ${micOn ? "" : "off"}`} onClick={toggleMic}>
            <i className={`fa ${micOn ? "fa-microphone" : "fa-microphone-slash"}`} />
            <span>{micOn ? "Mute" : "Unmute"}</span>
          </button>

          <button className={`ctrl ${cameraOn ? "" : "off"}`} onClick={toggleCamera}>
            <i className={`fa ${cameraOn ? "fa-video-camera" : "fa-eye-slash"}`} />
            <span>{cameraOn ? "Stop Video" : "Start Video"}</span>
          </button>

          <button className={`ctrl ${sharing ? "active" : ""}`} onClick={toggleScreenShare}>
            <i className="fa fa-desktop" />
            <span>{sharing ? "Stop Share" : "Share Screen"}</span>
          </button>

          <button className={`ctrl ${panel === "people" ? "active" : ""}`} onClick={() => togglePanel("people")}>
            <i className="fa fa-users" />
            <span>People</span>
          </button>

          <button className={`ctrl ${showInvite ? "active" : ""}`} onClick={() => setShowInvite((v) => !v)}>
            <i className="fa fa-share-alt" />
            <span>Invite</span>
          </button>

          {showInvite && (
            <InviteModal meetingId={meetingId} password={password} onClose={() => setShowInvite(false)} />
          )}

          <button className={`ctrl ${panel === "chat" ? "active" : ""}`} onClick={() => togglePanel("chat")}>
            <i className="fa fa-comment" />
            <span>Chat</span>
          </button>
        </div>

        <button className="ctrl leave" onClick={handleLeave}>
          <i className="fa fa-phone" />
          <span>Leave</span>
        </button>
      </footer>
    </div>
  );
};

export default MeetingRoom;
