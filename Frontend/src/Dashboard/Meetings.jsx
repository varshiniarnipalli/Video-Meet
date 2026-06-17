import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";

import DashboardLayout from "./DashboardLayout";
import "./Meetings.css";
import { API_URL } from "../config";

const Meetings = () => {
  const navigate = useNavigate();

  const [cookies] = useCookies(["token"]);

  const [username, setUsername] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Verify User
  useEffect(() => {
    const verifyUser = async () => {
      try {
        if (!cookies.token) {
          navigate("/login");
          return;
        }

        const { data } = await axios.post(
          `${API_URL}/dashboard`,
          {},
          {
            withCredentials: true,
          }
        );

        if (data.status) {
          setUsername(data.user);
        } else {
          navigate("/login");
        }
      } catch {
        navigate("/login");
      }
    };

    verifyUser();
  }, [cookies.token, navigate]);

  const rejoinMeeting = (id) => {
    navigate("/join", { state: { username, prefillId: id } });
  };

  // Load Meetings
  useEffect(() => {
    if (!username) return;

    axios
      .get(`${API_URL}/meetings/${username}`)
      .then(({ data }) => {
        setMeetings(data.meetings || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [username]);

  // Search
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return meetings;

    return meetings.filter(
      (m) =>
        m.meetingId?.toLowerCase().includes(q) ||
        m.host?.toLowerCase().includes(q)
    );
  }, [query, meetings]);

  // Delete Card (frontend only)
  const deleteMeeting = (meetingId) => {
    setMeetings((prev) =>
      prev.filter((m) => m.meetingId !== meetingId)
    );
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <DashboardLayout title="Meetings" username={username}>
      {/* Header */}
      <div className="page-head">
        <div>
          <h1>Meetings</h1>
          <p>
            Browse, rejoin, or manage your past meetings.
          </p>
        </div>

        <button
          className="btn-primary solid"
          onClick={() =>
            navigate("/create", {
              state: { username },
            })
          }
        >
          <i className="fa fa-plus"></i>
          New Meeting
        </button>
      </div>

      {/* Search */}
      <div className="search-bar surface">
        <i className="fa fa-search"></i>

        <input
          type="text"
          placeholder="Search Meeting ID..."
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
        />

        {query && (
          <button
            className="clear-search"
            onClick={() => setQuery("")}
          >
            <i className="fa fa-times"></i>
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="empty-state surface">
          <i className="fa fa-spinner fa-spin"></i>
          <p>Loading meetings...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="meetings-list">
          {filtered.map((m) => (
            <div
              className="meeting-row surface"
              key={m.meetingId}
            >
              <span className="meeting-row-icon">
                <i className="fa fa-video-camera"></i>
              </span>

              <div className="meeting-row-main">
                <h4>
                  {m.host === username
                    ? "Hosted Meeting"
                    : "Meeting"}
                </h4>

                <span className="meeting-id">
                  ID: {m.meetingId}
                </span>
              </div>

              <div className="meeting-meta">
                <span>
                  <i className="fa fa-calendar"></i>
                  {formatDate(m.createdAt)}
                </span>

                <span>
                  <i className="fa fa-users"></i>
                  {m.participants?.length || 0}
                </span>

                <span>
                  <i
                    className={`fa ${
                      m.active
                        ? "fa-circle"
                        : "fa-circle-o"
                    }`}
                  ></i>

                  {m.active
                    ? " Active"
                    : " Ended"}
                </span>
              </div>

              <div className="meeting-row-actions">
                {m.active ? (
                  <button
                    className="btn-success"
                    onClick={() =>
                      navigate("/join", {
                        state: {
                          username,
                          prefillId: m.meetingId,
                        },
                      })
                    }
                  >
                    Rejoin
                  </button>
                ) : (
                  <button
                    className="btn-outline"
                    onClick={() =>rejoinMeeting(m.meetingId)}
                  >
                    Rejoin
                  </button>
                )}

                <button
                  className="icon-danger"
                  onClick={() =>
                    deleteMeeting(m.meetingId)
                  }
                >
                  <i className="fa fa-trash-o"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state surface">
          <span className="empty-icon">
            <i className="fa fa-calendar-o"></i>
          </span>

          <h3>No meetings found</h3>

          <p>
            {query
              ? "Try another search term."
              : "You haven't joined any meetings yet."}
          </p>

          <button
            className="btn-primary solid"
            onClick={() =>
              navigate("/create", {
                state: { username },
              })
            }
          >
            <i className="fa fa-plus"></i>
            Start Meeting
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Meetings;
