import { Link } from "react-router-dom";
import { ArrowRight, LocateFixed, MapPin, ShieldCheck, Wifi } from "lucide-react";
import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./guest-preview.css";

const samplePosition = [28.6139, 77.209];

const GuestPreview = () => (
  <main className="guest-preview">
    <header className="guest-preview__header">
      <Link to="/" className="guest-preview__brand">
        <span><img src="/geoguard-shield.svg" alt="" width="21" height="21" /></span>GeoGuard
      </Link>
      <nav aria-label="Guest preview navigation">
        <Link to="/">Home</Link>
        <Link to="/login">Sign in</Link>
        <Link className="guest-preview__create" to="/signup">Create account</Link>
      </nav>
    </header>

    <section className="guest-preview__intro">
      <div>
        <h1>GeoGuard dashboard preview</h1>
        <p>Look around the map and device panels before creating an account.</p>
      </div>
      <p className="guest-preview__notice">
        This preview uses sample data. It is not connected to a real device or live location.
      </p>
    </section>

    <section className="guest-preview__dashboard" aria-label="Sample tracking dashboard">
      <div className="guest-preview__map">
        <MapContainer
          center={samplePosition}
          zoom={14}
          scrollWheelZoom={false}
          className="guest-preview__leaflet"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle
            center={samplePosition}
            radius={280}
            pathOptions={{ color: "#d97706", weight: 2, fillColor: "#f59e0b", fillOpacity: 0.12 }}
          />
          <CircleMarker
            center={samplePosition}
            radius={9}
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#0f766e", fillOpacity: 1 }}
          >
            <Popup>Sample tracker location · preview only</Popup>
          </CircleMarker>
        </MapContainer>
        <div className="guest-preview__map-caption"><MapPin size={16} /> Example map view</div>
      </div>

      <aside className="guest-preview__device-panel">
        <div className="guest-preview__device-heading">
          <span className="guest-preview__device-icon"><LocateFixed size={21} /></span>
          <div>
            <h2>Sample tracker</h2>
            <p>ESP32 device</p>
          </div>
        </div>

        <div className="guest-preview__detail">
          <span><Wifi size={17} /> Status</span>
          <strong>Preview</strong>
        </div>
        <div className="guest-preview__detail">
          <span><MapPin size={17} /> Location</span>
          <strong>Sample point</strong>
        </div>
        <div className="guest-preview__detail">
          <span><ShieldCheck size={17} /> Geofence</span>
          <strong>Example boundary</strong>
        </div>

        <div className="guest-preview__device-note">
          The map and device details here are examples. Sign in to view your own devices.
        </div>
        <Link to="/signup" className="guest-preview__button">
          Set up an account <ArrowRight size={17} />
        </Link>
      </aside>
    </section>

    <section className="guest-preview__next">
      <div>
        <h2>Ready to connect your device?</h2>
        <p>Create an account to register a phone or ESP32 and view its reported location.</p>
      </div>
      <Link to="/signup" className="guest-preview__button">Create account <ArrowRight size={17} /></Link>
    </section>
  </main>
);

export default GuestPreview;
