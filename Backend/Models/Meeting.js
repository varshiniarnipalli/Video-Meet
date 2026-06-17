const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  meetingId:    { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  host:         { type: String, required: true },
  participants: [{ type: String }],
  duration:     { type: Number, default: 0 },
  active:       { type: Boolean, default: true },
  createdAt:    { type: Date, default: Date.now },
  endedAt:      { type: Date },
});

module.exports = mongoose.model("Meeting", meetingSchema);