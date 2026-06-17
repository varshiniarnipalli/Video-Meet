import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import socket from "../socket";
import "./JoinMeeting.css";

const CreateMeeting = () => {
  const location = useLocation();
  const username = location.state?.username || "Guest";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateId = () =>
    "MTG-" + Math.random().toString(36).substring(2, 7).toUpperCase();

  const isPasswordValid = password.trim().length >= 4;
  const isConfirmValid = confirmPassword === password && confirmPassword.trim() !== "";

  const handleCreate = (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Please set a meeting password.");
      return;
    }
    if (password.trim().length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    const meetingId = generateId();

    socket.emit("create-room", { meetingId, password: password.trim(), username });

    socket.once("create-room-success", ({ meetingId }) => {
      setLoading(false);
      navigate(`/meeting/${meetingId}`, { state: { username, password: password.trim() } });
    });

    socket.once("create-room-error", (msg) => {
      setLoading(false);
      setError(msg || "Could not create meeting. Try again.");
    });
  };

  return (
    <div className="join-page">
      <div className="join-card">
        <Link to="/dashboard" className="join-brand">
          <span className="logo-badge">
            <i className="fa fa-video-camera" aria-hidden="true"></i>
          </span>
          <span>VideoMeet</span>
        </Link>

        <h1>Start a meeting</h1>
        <p className="join-sub">
          Set a password — share it with people you want to invite.
        </p>

        <form onSubmit={handleCreate} noValidate>
          {/* Password field */}
          <div
            className={`join-field ${error && !isPasswordValid ? "has-error" : ""} ${
              isPasswordValid ? "is-valid" : ""
            }`}
          >
            <i className="fa fa-lock" aria-hidden="true"></i>
            <input
              type="password"
              placeholder="Set a meeting password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
            />
            {isPasswordValid && (
              <i className="fa fa-check-circle valid-icon" aria-hidden="true"></i>
            )}
          </div>

          {/* Confirm password field */}
          <div
            className={`join-field ${error && !isConfirmValid ? "has-error" : ""} ${
              isConfirmValid ? "is-valid" : ""
            }`}
            style={{ marginTop: "12px" }}
          >
            <i className="fa fa-lock" aria-hidden="true"></i>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
              }}
            />
            {isConfirmValid && (
              <i className="fa fa-check-circle valid-icon" aria-hidden="true"></i>
            )}
          </div>

          {error && (
            <p className="join-error" id="create-error">
              <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
              {error}
            </p>
          )}

          <button type="submit" className="join-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>{" "}
                Creating...
              </>
            ) : (
              <>
                <i className="fa fa-plus" aria-hidden="true"></i> Create &amp;
                Join
              </>
            )}
          </button>
        </form>

        <div className="join-divider">
          <span>or</span>
        </div>

        <Link to="/join" state={{ username }} className="join-create">
          <i className="fa fa-sign-in" aria-hidden="true"></i>
          Join an existing meeting instead
        </Link>

        <Link to="/dashboard" className="join-back">
          <i className="fa fa-arrow-left" aria-hidden="true"></i>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default CreateMeeting;
