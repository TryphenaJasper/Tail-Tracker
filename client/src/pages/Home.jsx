import { Link } from "react-router-dom";
import "../styles/home.css";

function Home() {
  return (
    <div className="home">

      {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-tagline">🐾 Every paw deserves a chance</p>

          <h1>
            Give them a home.
            <br />
            <span>Give them hope.</span>
          </h1>

          <p className="hero-description">
            Tail Tracker connects stray animals with loving homes and helps
            injured pets find the veterinary care they need.
          </p>

          <div className="hero-buttons">
            <Link to="/adoption" className="btn btn-primary">
              Find a Friend
            </Link>

            <Link to="/rescue" className="btn btn-secondary">
              Rescue an Animal
            </Link>
          </div>
        </div>

        <div className="hero-image">
          {/* Temporary emoji — replace with an actual image later */}
          <div className="animal-circle">
            🐶
          </div>
        </div>
      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section className="how-it-works">
        <div className="section-heading">
          <p className="section-label">HOW TAIL TRACKER WORKS</p>

          <h2>
            Be the <span>voice</span> they never had.
            
          </h2>

          <p>
            Whether you're looking to adopt or you've found an animal in need,
            we're here to help.
          </p>
        </div>

        <div className="feature-container">

          {/* Adoption */}
          <div className="feature-card">
            <div className="feature-icon">🏠</div>

            <h3>Find a Home</h3>

            <p>
              Browse animals waiting for loving families and find your
              perfect companion.
            </p>

            <Link to="/adoption" className="feature-link">
              Explore Adoption →
            </Link>
          </div>


          {/* Rescue */}
          <div className="feature-card">
            <div className="feature-icon">🏥</div>

            <h3>Get Them Help</h3>

            <p>
              Found an injured or sick stray? Find nearby veterinary hospitals
              and get help quickly.
            </p>

            <Link to="/rescue" className="feature-link">
              Get Rescue Help →
            </Link>
          </div>


          {/* Report */}
          <div className="feature-card">
            <div className="feature-icon">❤️</div>

            <h3>Make a Difference</h3>

            <p>
              Speak up for animals and help create a safer community for
              every stray.
            </p>

            {/* Report page intentionally not linked yet */}
            <span className="feature-link coming-soon">
              More coming soon
            </span>
          </div>

        </div>
      </section>


      {/* ================= CTA ================= */}
      <section className="home-cta">

        <div className="cta-content">
          <p className="section-label">THEY NEED YOU</p>

          <h2>
            You could be the reason
            <br />
            <span>they're okay.</span>
          </h2>

          <p>
            One adoption. One rescue. One small act of kindness.
            It all matters.
          </p>

          <Link to="/adoption" className="btn btn-light">
            Start Helping
          </Link>
        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <p>
          🐾 <strong>Tail Tracker</strong>
        </p>

        <p>
          Helping paws find their way home.
        </p>
      </footer>

    </div>
  );
}

export default Home;