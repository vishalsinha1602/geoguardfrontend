import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  LocateFixed,
  MapPin,
  Menu,
  Radio,
  ShieldCheck,
  X,
} from "lucide-react";
import "./landing.css";

const features = [
  {
    icon: LocateFixed,
    title: "Live location",
    description:
      "See the latest reported position of each connected device on one map.",
  },
  {
    icon: MapPin,
    title: "Geofence alerts",
    description:
      "Set an area around a place and review alerts when a device crosses its boundary.",
  },
  {
    icon: Radio,
    title: "Phone and ESP32 support",
    description:
      "Connect a phone or a compatible ESP32 tracker to send location updates.",
  },
];

const steps = [
  {
    number: "01",
    title: "Add a device",
    description: "Register a phone or ESP32 tracker to your account.",
  },
  {
    number: "02",
    title: "Send location updates",
    description: "The device reports its GPS position over an internet connection.",
  },
  {
    number: "03",
    title: "Check the map",
    description: "View the latest position and review device activity from your dashboard.",
  },
];

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-header__inner">
          <Link to="/" className="landing-brand" aria-label="GeoGuard home" onClick={closeMenu}>
            <span className="landing-brand__mark"><img src="/geoguard-shield.svg" alt="" width="22" height="22" /></span>
            <span>GeoGuard</span>
          </Link>

          <button
            className="landing-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav className={`landing-nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#how-it-works" onClick={closeMenu}>How it works</a>
            <a href="#about" onClick={closeMenu}>About</a>
            <div className="landing-nav__actions">
              <Link className="landing-sign-in" to="/login" onClick={closeMenu}>Sign in</Link>
              <Link className="landing-button landing-button--small" to="/signup" onClick={closeMenu}>
                Create account <ArrowRight size={16} />
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="hero-title">
          <div className="landing-hero__copy">
            <h1 id="hero-title">Know where your devices are.</h1>
            <p className="landing-hero__text">
              GeoGuard brings device locations, geofence boundaries, and recent activity together in one map.
            </p>
            <div className="landing-hero__actions">
              <Link className="landing-button" to="/signup">
                Create an account <ArrowRight size={18} />
              </Link>
              <Link className="landing-button landing-button--outline" to="/login">Sign in</Link>
            </div>
          </div>

          <figure className="landing-hero__photo landing-hero__photo--diagram">
            <img
              src="/images/rakshak-circuit-diagram.png"
              alt="Rakshak ESP32 circuit diagram showing the GPS, OLED, SOS button, charging module, battery, and power converter"
              fetchPriority="high"
            />
            <figcaption>
              <span>Rakshak device circuit</span>
              <span className="landing-hero__diagram-caption">
                ESP32, GPS, OLED, SOS button and battery system
              </span>
            </figcaption>
          </figure>
        </section>

        <section className="landing-features landing-section" id="features">
          <div className="landing-section__heading">
            <h2>Location tools in one place</h2>
            <p>Keep track of device positions and the areas that matter to you.</p>
          </div>
          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <article className="landing-feature-card" key={title}>
                <span className="landing-feature-card__icon"><Icon size={22} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-how landing-section" id="how-it-works">
          <div className="landing-section__heading">
            <h2>From device to dashboard</h2>
          </div>
          <div className="landing-steps">
            {steps.map((step) => (
              <article className="landing-step" key={step.number}>
                <span className="landing-step__number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-about" id="about">
          <div className="landing-about__icon"><ShieldCheck size={26} /></div>
          <div>
            <h2>A straightforward view of device activity.</h2>
            <p>
              GeoGuard is a device tracking dashboard. Add a supported device, view its latest location, and manage geofences from your account.
            </p>
          </div>
          <Link className="landing-button landing-button--light" to="/signup">
            Get started <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer__main">
          <div className="landing-footer__brand">
            <Link to="/" className="landing-brand" aria-label="GeoGuard home">
              <span className="landing-brand__mark"><img src="/geoguard-shield.svg" alt="" width="22" height="22" /></span>
              <span>GeoGuard</span>
            </Link>
            <p>Device locations and geofence activity, together in one dashboard.</p>
          </div>
          <div className="landing-footer__links">
            <div>
              <h3>Explore</h3>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
              <a href="#about">About GeoGuard</a>
            </div>
            <div>
              <h3>Account</h3>
              <Link to="/login">Sign in</Link>
              <Link to="/signup">Create account</Link>
            </div>
          </div>
        </div>
        <div className="landing-footer__bottom">
          <span>© {new Date().getFullYear()} GeoGuard</span>
          <span>Location updates depend on device connectivity and GPS availability.</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
