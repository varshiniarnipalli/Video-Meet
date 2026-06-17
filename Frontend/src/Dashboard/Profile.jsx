import DashboardLayout from "./DashboardLayout";
import "./Profile.css";

const stats = [
  { value: "12", label: "Meetings Hosted", icon: "fa-video-camera", tone: "blue" },
  { value: "38", label: "Meetings Joined", icon: "fa-users", tone: "green" },
  { value: "24h", label: "Total Hours", icon: "fa-clock-o", tone: "slate" },
];

const details = [
  { icon: "fa-user", label: "Username", value: "Varshini" },
  { icon: "fa-envelope", label: "Email", value: "varshini@videomeet.com" },
  { icon: "fa-calendar", label: "Joined", value: "January 2026" },
  { icon: "fa-map-marker", label: "Timezone", value: "GMT +5:30 (IST)" },
];

const Profile = () => {
  return (
    <DashboardLayout title="Profile">
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p>Manage your personal information and account activity.</p>
        </div>
      </div>

      <div className="profile-grid">
        <section className="profile-hero surface">
          <div className="profile-cover" aria-hidden="true"></div>
          <div className="profile-hero-body">
            <div className="profile-big-avatar">V</div>
            <h2>Varshini</h2>
            <p className="profile-role">Product Designer</p>
            <span className="profile-badge">
              <span className="status-dot" aria-hidden="true"></span>
              Active now
            </span>
            <button className="btn-primary solid edit-profile">
              <i className="fa fa-pencil" aria-hidden="true"></i>
              Edit Profile
            </button>
          </div>
        </section>

        <div className="profile-right">
          <section className="surface info-card">
            <h3>Account Details</h3>
            <ul className="detail-list">
              {details.map((d) => (
                <li key={d.label}>
                  <span className="detail-icon">
                    <i className={`fa ${d.icon}`} aria-hidden="true"></i>
                  </span>
                  <div>
                    <span className="detail-label">{d.label}</span>
                    <span className="detail-value">{d.value}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="profile-stats">
            {stats.map((s) => (
              <div className="stat-card" key={s.label}>
                <span className={`stat-icon ${s.tone}`}>
                  <i className={`fa ${s.icon}`} aria-hidden="true"></i>
                </span>
                <div>
                  <h2>{s.value}</h2>
                  <p>{s.label}</p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
