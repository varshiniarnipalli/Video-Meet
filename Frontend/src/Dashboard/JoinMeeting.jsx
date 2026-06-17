import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import socket from "../socket";
import "./JoinMeeting.css";

const JoinMeeting = () => {
  const location = useLocation();
  const username = location.state?.username || "Guest";
  const navigate = useNavigate();
  const prefillId = location.state?.prefillId || ""; 

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [meetingId, setMeetingId] = useState(prefillId); 

  const validate = (value) => /^[A-Za-z0-9-]{4,}$/.test(value.trim());

  const handleJoin = (e) => {
    e.preventDefault();
    const value = meetingId.trim();

    if (!value) { setError("Please enter a meeting ID."); return; }
    if (!validate(value)) { setError("Meeting ID must be at least 4 letters, numbers, or dashes."); return; }
    if (!password.trim()) { setError("Please enter the meeting password."); return; }

    setError("");
    setLoading(true);

    socket.emit("verify-password", { meetingId: value, password: password.trim() });

    socket.once("verify-result", ({ success, error }) => {
      setLoading(false);
      if (success) {
        navigate(`/meeting/${value}`, { state: { username } });
      } else {
        setError(error || "Could not join. Check your ID and password.");
      }
    });
  };

  const isValid = validate(meetingId);

  return (
    <div className="join-page">
      <div className="join-card">
        <Link to="/dashboard" className="join-brand">
          <span className="logo-badge">
            <i className="fa fa-video-camera" aria-hidden="true"></i>
          </span>
          <span>VideoMeet</span>
        </Link>

        <h1>Join a meeting</h1>
        <p className="join-sub">
          Enter the meeting ID and password shared with you.
        </p>

        <form onSubmit={handleJoin} noValidate>
          {/* Meeting ID field */}
          <div className={`join-field ${error ? "has-error" : ""} ${isValid ? "is-valid" : ""}`}>
            <i className="fa fa-hashtag" aria-hidden="true"></i>
            <input
              type="text"
              placeholder="e.g. MTG-12345"
              value={meetingId}
              onChange={(e) => { setMeetingId(e.target.value); if (error) setError(""); }}
              aria-invalid={!!error}
            />
            {isValid && <i className="fa fa-check-circle valid-icon" aria-hidden="true"></i>}
          </div>

          {/* Password field */}
          <div className={`join-field ${error ? "has-error" : ""}`} style={{ marginTop: "12px" }}>
            <i className="fa fa-lock" aria-hidden="true"></i>
            <input
              type="password"
              placeholder="Meeting password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
            />
          </div>

          {error && (
            <p className="join-error" id="join-error">
              <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
              {error}
            </p>
          )}

          <button type="submit" className="join-btn" disabled={loading}>
            {loading ? (
              <><i className="fa fa-spinner fa-spin" aria-hidden="true"></i> Connecting...</>
            ) : (
              <><i className="fa fa-sign-in" aria-hidden="true"></i> Join Meeting</>
            )}
          </button>
        </form>

        <div className="join-divider"><span>or</span></div>

        <Link to="/create" state={{ username }} className="join-create">
          <i className="fa fa-plus" aria-hidden="true"></i>
          Start a new meeting instead
        </Link>

        <Link to="/dashboard" className="join-back">
          <i className="fa fa-arrow-left" aria-hidden="true"></i>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default JoinMeeting;
