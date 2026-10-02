import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, LocateFixed, MapPin, ShieldCheck } from "lucide-react";
import { login } from "../../api/authApi";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setErrorMessage("");
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await login(formData);
      const accessToken = response.data?.data?.accessToken;

      if (!accessToken) {
        throw new Error("The server did not return a sign-in token.");
      }

      localStorage.setItem("accessToken", accessToken);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "We could not sign you in. Check your details and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-story" aria-label="About GeoGuard">
        <Link to="/" className="login-brand">
          <span className="login-brand__icon"><ShieldCheck size={22} /></span>
          <span>GeoGuard</span>
        </Link>

        <div className="login-story__content">
          <h1>Your devices, in view.</h1>
          <p>
            Check device locations, manage geofences, and review recent activity from one dashboard.
          </p>

          <ul className="login-benefits">
            <li><LocateFixed size={19} /><span>See the latest reported location</span></li>
            <li><MapPin size={19} /><span>Set boundaries and review alerts</span></li>
            <li><ShieldCheck size={19} /><span>Connect phones and ESP32 trackers</span></li>
          </ul>
        </div>

        <Link to="/" className="login-back-link"><ArrowLeft size={16} /> Back to GeoGuard</Link>
      </section>

      <section className="login-form-side" aria-labelledby="login-title">
        <div className="login-form-wrap">
          <Link to="/" className="login-brand login-brand--mobile">
            <span className="login-brand__icon"><ShieldCheck size={22} /></span>
            <span>GeoGuard</span>
          </Link>

          <h2 id="login-title">Welcome back</h2>
          <p className="login-form-intro">Sign in to open your tracking dashboard.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}

            <button className="login-submit" type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="login-signup-prompt">
            New to GeoGuard? <Link to="/signup">Create an account</Link>
          </p>

          <div className="login-guest-box">
            <div>
              <strong>Just looking around?</strong>
              <p>Explore the map and dashboard with sample data. No device or account needed.</p>
            </div>
            <Link to="/guest-preview" aria-label="Explore guest preview">
              Explore preview <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
