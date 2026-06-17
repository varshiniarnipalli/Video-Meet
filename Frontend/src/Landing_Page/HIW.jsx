import "./HIW.css";

export default function HIW() {
  return (
    <section className="hiw-section" id="hiw">
      <div className="container">

        <h2 className="hiw-title">
          How It Works
        </h2>

        <p className="hiw-subtitle">
          Get started in just a few simple steps and connect with anyone,
          anywhere in the world.
        </p>

        <div className="hiw-grid">

          <div className="hiw-card">
            <div className="step-number">1</div>

            <h4>Create an Account</h4>

            <p>
              Sign up and securely create your personal account to access
              meetings and collaboration tools.
            </p>
          </div>

          <div className="hiw-card">
            <div className="step-number">2</div>

            <h4>Create or Join a Meeting</h4>

            <p>
              Start a new meeting instantly or join an existing one using
              a meeting code or invitation link.
            </p>
          </div>

          <div className="hiw-card">
            <div className="step-number">3</div>

            <h4>Collaborate in Real Time</h4>

            <p>
              Use video, chat, and screen sharing to communicate and work
              together seamlessly.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

