import { useState } from "react";
import "./InviteModal.css";

const InviteModal = ({ meetingId, password, onClose }) => {
  const [pwVisible, setPwVisible] = useState(false);
  const [copiedField, setCopiedField] = useState(null); // "id" | "password" | "all"

  const copy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const inviteText =
    `You're invited to a VideoMeet meeting.\n` +
    `Meeting ID: ${meetingId}\n` +
    `Password: ${password}\n` +
    `Join at: ${window.location.origin}/join`;

  return (
    <div className="invite-overlay" onClick={onClose}>
      <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invite-header">
          <h3>
            <i className="fa fa-share-alt" aria-hidden="true"></i>
            Invite people
          </h3>
          <button className="invite-close" onClick={onClose} aria-label="Close">
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>

        <p className="invite-sub">Share these details to let others join.</p>

        {/* Meeting ID row */}
        <div className="invite-row">
          <div>
            <span className="invite-label">Meeting ID</span>
            <span className="invite-value">{meetingId}</span>
          </div>
          <button
            className="invite-copy-btn"
            onClick={() => copy(meetingId, "id")}
            title="Copy ID"
          >
            {copiedField === "id"
              ? <i className="fa fa-check" aria-hidden="true"></i>
              : <i className="fa fa-clone" aria-hidden="true"></i>
            }
          </button>
        </div>

        {/* Password row */}
        <div className="invite-row">
          <div>
            <span className="invite-label">Password</span>
            <span className="invite-value">
              {pwVisible ? password : "•".repeat(password.length)}
            </span>
          </div>
          <div className="invite-row-actions">
            <button
              className="invite-copy-btn"
              onClick={() => setPwVisible((v) => !v)}
              title={pwVisible ? "Hide" : "Show"}
            >
              <i className={`fa ${pwVisible ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true"></i>
            </button>
            <button
              className="invite-copy-btn"
              onClick={() => copy(password, "password")}
              title="Copy password"
            >
              {copiedField === "password"
                ? <i className="fa fa-check" aria-hidden="true"></i>
                : <i className="fa fa-clone" aria-hidden="true"></i>
              }
            </button>
          </div>
        </div>

        <hr className="invite-divider" />

        {/* Full invite message */}
        <p className="invite-label" style={{ marginBottom: "6px" }}>Full invite message</p>
        <div className="invite-text-box">{inviteText}</div>

        <div className="invite-btn-row">
          <button
            className="invite-btn-main"
            onClick={() => copy(inviteText, "all")}
          >
            {copiedField === "all" ? (
              <><i className="fa fa-check" aria-hidden="true"></i> Copied!</>
            ) : (
              <><i className="fa fa-clipboard" aria-hidden="true"></i> Copy full invite</>
            )}
          </button>
          <button className="invite-btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;