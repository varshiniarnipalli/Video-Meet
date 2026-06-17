import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { toast } from "react-toastify";

import DashboardLayout from "./DashboardLayout";
import "./Dashboard.css";
import { API_URL } from "../config";

const DEFAULT_STATS = [
  { value: "0",  label: "Meetings Hosted", icon: "fa-video-camera", tone: "blue"  },
  { value: "0",  label: "Meetings Joined",  icon: "fa-users",        tone: "green" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [cookies, , removeCookie] = useCookies(["token"]);

  const [username,       setUsername]       = useState("");
  const [meetingId,      setMeetingId]      = useState("");
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [stats,          setStats]          = useState(DEFAULT_STATS);

  // ── Verify user ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cookies.token) { navigate("/login"); return; }

    axios
      .post(`${API_URL}/dashboard`, {}, { withCredentials: true })
      .then(({ data }) => {
        if (data.status) {
          setUsername(data.user);
          toast.success(`Welcome ${data.user}`, { position: "top-right" });
        } else {
          removeCookie("token");
          navigate("/login");
        }
      })
      .catch(() => {
        removeCookie("token");
        navigate("/login");
      });
  }, [cookies.token, navigate, removeCookie]);

  // ── Fetch stats ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!username) return;

    axios
      .get(`${API_URL}/dashboard-stats/${username}`)
      .then(({ data }) => {
        setStats([
          { value: data.hosted,            label: "Meetings Hosted", icon: "fa-video-camera", tone: "blue"  },
          { value: data.joined,            label: "Meetings Joined",  icon: "fa-users",        tone: "green" },
        ]);
      })
      .catch(console.error);
  }, [username]);

  // ── Fetch recent meetings (bug fix: filter by host OR participant) ─────────────
  useEffect(() => {
    if (!username) return;

    axios
      .get(`${API_URL}/meetings/${username}`)
      .then(({ data }) => {
        const all = data.meetings || [];
        // Only show meetings where the user was actually involved
        const mine = all.filter(
          (m) => m.host === username || m.participants?.includes(username)
        );
        setRecentMeetings(mine.slice(0, 5));
      })
      .catch(console.error);
  }, [username]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const createMeeting  = () => navigate("/create", { state: { username } });
  const joinMeeting    = () => navigate("/join",   { state: { username } });
  const rejoinMeeting  = (id) => navigate("/join", { state: { username, prefillId: id } });

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      title="Dashboard"
      username={username}
      action={
        <button className="btn-primary" onClick={createMeeting}>
          <i className="fa fa-plus" /> New Meeting
        </button>
      }
    >
      {/* Welcome */}
      <section className="welcome-section">
        <div>
          <h1>Welcome back, {username} 👋</h1>
          <p>Ready to start your next meeting?</p>
        </div>
        <button className="btn-primary" onClick={createMeeting}>
          <i className="fa fa-plus" /> New Meeting
        </button>
      </section>

      {/* Quick Actions */}
      <section className="action-cards">
        <div className="action-card">
          <span className="action-icon blue">
            <i className="fa fa-video-camera" />
          </span>
          <h3>Create Meeting</h3>
          <p>Start an instant video meeting and invite your team.</p>
          <button className="btn-primary full" onClick={createMeeting}>
            Create
          </button>
        </div>

        <div className="action-card">
          <span className="action-icon green">
            <i className="fa fa-users" />
          </span>
          <h3>Join Meeting</h3>
          <p>Enter a meeting ID to join an ongoing session.</p>
          <div className="join-row">
            <input
              type="text"
              placeholder="Enter Meeting ID"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinMeeting()}
            />
            <button className="btn-success" onClick={joinMeeting}>
              Join
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        {stats.map((item) => (
          <div className="stat-card" key={item.label}>
            <span className={`stat-icon ${item.tone}`}>
              <i className={`fa ${item.icon}`} />
            </span>
            <div>
              <h2>{item.value}</h2>
              <p>{item.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Meetings */}
      <section className="recent-meetings">
        <div className="section-head">
          <h2>Recent Meetings</h2>
          <button className="link-btn" onClick={() => navigate("/dashboard/meetings")}>
            View All
          </button>
        </div>

        {recentMeetings.length === 0 ? (
          <p>No recent meetings found.</p>
        ) : (
          recentMeetings.map((meeting) => (
            <div className="meeting-card" key={meeting.meetingId}>
              <div className="meeting-left">
                <span className="meeting-icon">
                  <i className="fa fa-calendar" />
                </span>
                <div>
                  <h4>{meeting.host === username ? "Hosted Meeting" : "Joined Meeting"}</h4>
                  <p>
                    ID: {meeting.meetingId} &bull;{" "}
                    {new Date(meeting.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button className="btn-outline" onClick={() => rejoinMeeting(meeting.meetingId)}>
                Rejoin
              </button>
            </div>
          ))
        )}
      </section>
    </DashboardLayout>
  );
};

export default Dashboard;
