import "./Footer.css";
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">

        <div className="footer-content">

          {/* Brand */}
          <div className="footer-section">
            <h3 className="footer-logo">
              <i className="fa fa-video-camera me-2"></i>
              Video Meet
            </h3>

            <p className="footer-description">
              Connect, collaborate, and communicate seamlessly with
              secure video meetings from anywhere in the world.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h5>Quick Links</h5>

            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/hiw">How It Works</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div className="footer-section">
            <h5>Features</h5>

            <ul>
              <li>Video Meetings</li>
              <li>Screen Sharing</li>
              <li>Live Chat</li>
              <li>Meeting Recording</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h5>Contact</h5>

            <p>support@videomeet.com</p>
            <p>Available Worldwide</p>

            <div className="social-icons">
              <i className="fa fa-github"></i>
              <i className="fa fa-linkedin"></i>
              <i className="fa fa-twitter"></i>
            </div>
          </div>

        </div>

        <hr />

        <div className="footer-bottom">
          © 2026 Video Meet. All rights reserved.
        </div>

      </div>
    </footer>
  );
}