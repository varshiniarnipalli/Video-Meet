import './Hero.css';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-content">

        <span className="hero-badge">
          🚀 Secure Video Meetings
        </span>

        <h1 className="hero-title">
          Connect with Anyone,
          <span className="highlight"> Anywhere</span>
        </h1>

        <p className="hero-subtitle">
          Secure and lightning-fast video meetings for seamless communication.
          Collaborate, connect, and share ideas with people across the globe.
        </p>

        <div className="hero-buttons">
          <Link to='/signup'><button className="btn-primary-custom">
            Start Meeting
          </button></Link>

          <Link to='/login'><button className="btn-secondary-custom">
            Join Meeting
          </button></Link>
        </div>

      </div>
    </section>
  );
}

