import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import "./Settings.css";

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    className={`toggle ${checked ? "on" : ""}`}
    onClick={() => onChange(!checked)}
  >
    <span className="toggle-knob" />
  </button>
);

const Settings = () => {
  const [theme, setTheme] = useState("light");
  const [camera, setCamera] = useState("FaceTime HD Camera");
  const [mic, setMic] = useState("Default Microphone");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1200);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Customize your devices, appearance, and account preferences.</p>
        </div>
      </div>

      <div className="settings-stack">
        {/* Appearance */}
        <section className="surface settings-section">
          <div className="settings-section-head">
            <span className="settings-icon blue">
              <i className="fa fa-paint-brush" aria-hidden="true"></i>
            </span>
            <div>
              <h3>Appearance</h3>
              <p>Choose how VideoMeet looks to you.</p>
            </div>
          </div>
          <div className="theme-options">
            {["light", "dark", "system"].map((t) => (
              <button
                key={t}
                className={`theme-option ${theme === t ? "selected" : ""}`}
                onClick={() => setTheme(t)}
              >
                <i
                  className={`fa ${
                    t === "light"
                      ? "fa-sun-o"
                      : t === "dark"
                      ? "fa-moon-o"
                      : "fa-desktop"
                  }`}
                  aria-hidden="true"
                ></i>
                <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Devices */}
        <section className="surface settings-section">
          <div className="settings-section-head">
            <span className="settings-icon green">
              <i className="fa fa-sliders" aria-hidden="true"></i>
            </span>
            <div>
              <h3>Devices</h3>
              <p>Select your default camera and microphone.</p>
            </div>
          </div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="camera">
                <i className="fa fa-video-camera" aria-hidden="true"></i> Camera
              </label>
              <select
                id="camera"
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
              >
                <option>FaceTime HD Camera</option>
                <option>Logitech C920</option>
                <option>External USB Camera</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="mic">
                <i className="fa fa-microphone" aria-hidden="true"></i> Microphone
              </label>
              <select
                id="mic"
                value={mic}
                onChange={(e) => setMic(e.target.value)}
              >
                <option>Default Microphone</option>
                <option>AirPods Pro</option>
                <option>Blue Yeti USB Mic</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="surface settings-section">
          <div className="settings-section-head">
            <span className="settings-icon blue">
              <i className="fa fa-bell" aria-hidden="true"></i>
            </span>
            <div>
              <h3>Notifications</h3>
              <p>Decide what updates you want to receive.</p>
            </div>
          </div>
          <div className="pref-row">
            <div>
              <h4>Email notifications</h4>
              <p>Meeting invites and summaries sent to your inbox.</p>
            </div>
            <Toggle
              checked={emailNotif}
              onChange={setEmailNotif}
              label="Toggle email notifications"
            />
          </div>
          <div className="pref-row">
            <div>
              <h4>Push notifications</h4>
              <p>Real-time alerts when a meeting starts.</p>
            </div>
            <Toggle
              checked={pushNotif}
              onChange={setPushNotif}
              label="Toggle push notifications"
            />
          </div>
        </section>

        {/* Security */}
        <section className="surface settings-section">
          <div className="settings-section-head">
            <span className="settings-icon slate">
              <i className="fa fa-shield" aria-hidden="true"></i>
            </span>
            <div>
              <h3>Security</h3>
              <p>Keep your account safe and protected.</p>
            </div>
          </div>
          <div className="security-list">
            <button className="security-item">
              <span>
                <i className="fa fa-lock" aria-hidden="true"></i> Change password
              </span>
              <i className="fa fa-chevron-right" aria-hidden="true"></i>
            </button>
            <button className="security-item">
              <span>
                <i className="fa fa-mobile" aria-hidden="true"></i> Two-factor
                authentication
              </span>
              <i className="fa fa-chevron-right" aria-hidden="true"></i>
            </button>
            <button className="security-item danger">
              <span>
                <i className="fa fa-trash-o" aria-hidden="true"></i> Delete account
              </span>
              <i className="fa fa-chevron-right" aria-hidden="true"></i>
            </button>
          </div>
        </section>

        <div className="settings-actions">
          {saved && (
            <span className="save-status">
              <i className="fa fa-check-circle" aria-hidden="true"></i> Settings
              saved
            </span>
          )}
          <button
            className="btn-primary solid"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fa fa-floppy-o" aria-hidden="true"></i>
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
