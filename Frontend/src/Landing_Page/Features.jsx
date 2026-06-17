import "./Features.css";

export default function Features() {
  const features = [
    {
      icon: "fa-video-camera",
      title: "HD Video Calls",
      description:
        "Crystal-clear video and audio quality for professional meetings."
    },
    {
      icon: "fa-desktop",
      title: "Screen Sharing",
      description:
        "Share presentations, documents, and screens effortlessly."
    },
    {
      icon: "fa-shield",
      title: "Secure Meetings",
      description:
        "End-to-end encryption keeps your conversations private."
    },
    {
      icon: "fa-comments",
      title: "Live Chat",
      description:
        "Communicate instantly with integrated meeting chat."
    },
    {
      icon: "fa-floppy-o",
      title: "Meeting Recording",
      description:
        "Record important meetings and access them anytime."
    },
    {
      icon: "fa-globe",
      title: "Global Connectivity",
      description:
        "Connect with teams and clients anywhere in the world."
    }
  ];

  return (
    <section className="features-section" id="features" >
      <div className="container">

        <h2 className="features-title">
          Powerful Features for Better Meetings
        </h2>

        <p className="features-subtitle">
          Everything you need to collaborate, communicate,
          and stay productive from anywhere.
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">
                <i className={`fa ${feature.icon}`}></i>
              </div>

              <h4>{feature.title}</h4>

              <p>{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}