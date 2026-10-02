import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import "./map-markers.css";

import GeofencePanel from "./GeofencePanel";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMapEvents,
} from "react-leaflet";

import { Crosshair, LocateFixed, MapPinned } from "lucide-react";

// =====================================================
// MAP PIN
// =====================================================

const createMapPin = (color, className) =>
  L.divIcon({
    className: "geoguard-marker-icon",

    html: `
      <span
        class="geoguard-marker ${className}"
        aria-hidden="true"
      >
        <span
          class="geoguard-marker__pulse"
        ></span>

        <svg
          viewBox="0 0 44 54"
          focusable="false"
        >
          <path
            d="M22 51S3 30 3 20a19 19 0 1 1 38 0c0 10-19 31-19 31Z"
            fill="${color}"
            stroke="white"
            stroke-width="3"
          />

          <circle
            cx="22"
            cy="20"
            r="9"
            fill="white"
          />

          <circle
            cx="22"
            cy="20"
            r="4"
            fill="${color}"
          />
        </svg>
      </span>
    `,
    iconSize: [44, 54],
    iconAnchor: [22, 51],
    popupAnchor: [0, -48],
  });

const deviceMarkerIcon = createMapPin("#0f766e", "geoguard-marker--device");

const geofenceMarkerIcon = createMapPin("#d97706", "geoguard-marker--fence");

// =====================================================
// FENCE SELECTOR
// =====================================================

const FenceSelector = ({ enabled, onSelect }) => {
  useMapEvents({
    click(event) {
      if (!enabled) {
        return;
      }

      onSelect({
        id: Date.now(),
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
};

// =====================================================
// MAP VIEW
// =====================================================

const MapView = ({
  selectedDevice,
  location,
  trackPoints = [],
  geofences = [],
  saveGeofence,
  removeGeofence,
  onRefresh,
  onCenterCurrentLocation,
  refreshing,
  refreshTrigger,
  trackingRadius = 500,
}) => {
  // ===================================================
  // CENTER
  // ===================================================

  const center =
    location &&
    Number.isFinite(Number(location.latitude)) &&
    Number.isFinite(Number(location.longitude))
      ? [Number(location.latitude), Number(location.longitude)]
      : [28.6139, 77.209];

  // ===================================================
  // REFS / STATE
  // ===================================================

  const mapRef = useRef(null);

  const firstLoad = useRef(true);

  const [showFencePanel, setShowFencePanel] = useState(false);

  const [drawingFence, setDrawingFence] = useState(false);

  const [radius, setRadius] = useState(100);

  // ===================================================
  // FIRST LOCATION
  // ===================================================

  useEffect(() => {
    if (!location) {
      return;
    }

    if (!mapRef.current) {
      return;
    }

    if (!firstLoad.current) {
      return;
    }

    const latitude = Number(location.latitude);

    const longitude = Number(location.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    mapRef.current.flyTo([latitude, longitude], 17, {
      animate: true,
      duration: 1.5,
    });

    firstLoad.current = false;
  }, [location]);

  // ===================================================
  // MANUAL REFRESH
  // ===================================================

  useEffect(() => {
    if (!location) {
      return;
    }

    if (!mapRef.current) {
      return;
    }

    if (refreshTrigger === 0) {
      return;
    }

    const latitude = Number(location.latitude);

    const longitude = Number(location.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    mapRef.current.flyTo([latitude, longitude], 17, {
      animate: true,
      duration: 1.5,
    });
  }, [refreshTrigger, location]);

  // ===================================================
  // ADD GEOFENCE
  // ===================================================

  const addFence = async (point) => {
    console.log("Clicked Point:", point);

    const name = window.prompt("Enter Geofence Name");

    if (!name) {
      return;
    }

    const payload = {
      name,
      latitude: point.lat,
      longitude: point.lng,
      radius,
    };

    console.log("Geofence Payload:", payload);

    await saveGeofence(payload);

    setDrawingFence(false);
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div
      className="
        relative
        h-full
        rounded-2xl
        overflow-hidden
        shadow-xl
        border-2
        bg-white
      "
    >
      {/* =============================================
          REFRESH
      ============================================= */}

      <div className="absolute right-5 top-5 z-[1000] flex items-center gap-2">
        <button
          type="button"
          title="Center on current location"
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            border
            border-emerald-200/80
            bg-slate-950/85
            text-emerald-200
            shadow-[0_0_20px_rgba(16,185,129,0.25)]
            transition
            duration-200
            hover:scale-105
            hover:border-emerald-100
            hover:text-white
          "
          onClick={onCenterCurrentLocation}
        >
          <Crosshair size={20} />
        </button>

        <button
          type="button"
          title="Refresh tracking"
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            border
            border-cyan-200/80
            bg-slate-950/85
            text-cyan-200
            shadow-[0_0_25px_rgba(34,211,238,0.35)]
            transition
            duration-200
            hover:scale-105
            hover:border-cyan-100
            hover:text-white
          "
          onClick={onRefresh}
        >
          <LocateFixed
            size={20}
            className={
              refreshing ? "animate-spin text-cyan-300" : "text-cyan-200"
            }
          />
        </button>
      </div>

      {/* =============================================
          GEOFENCE BUTTON
      ============================================= */}

      <button
        onClick={() => {
          setShowFencePanel(true);
          setDrawingFence(true);
        }}
        className="
          absolute
          right-4
          top-24
          z-[1000]
          bg-blue-600
          text-white
          rounded-full
          p-3
          shadow-lg
          hover:bg-blue-700
        "
        title="Create geofence"
      >
        <MapPinned size={30} />
      </button>

      {/* =============================================
          GEOFENCE PANEL
      ============================================= */}

      {showFencePanel && (
        <GeofencePanel
          showFencePanel={showFencePanel}
          setShowFencePanel={setShowFencePanel}
          setDrawingFence={setDrawingFence}
          radius={radius}
          setRadius={setRadius}
          geofences={geofences}
          deleteFence={removeGeofence}
        />
      )}

      {/* =============================================
          REFRESH OVERLAY
      ============================================= */}

      {refreshing && (
        <div
          className="
            absolute
            inset-0
            bg-black/10
            z-[999]
            flex
            justify-center
            items-center
          "
        >
          <div
            className="
              bg-white
              rounded-xl
              p-5
              py-3
              shadow-lg
              flex
              gap-3
            "
          >
            <LocateFixed />
            Refreshing...
          </div>
        </div>
      )}

      {/* =============================================
          MAP
      ============================================= */}

      <MapContainer
        whenReady={(event) => {
          mapRef.current = event.target;
        }}
        center={center}
        zoom={17}
        className="h-full w-full"
      >
        {/* ===========================================
            TILE
        =========================================== */}

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* ===========================================
            500M TRACKING WINDOW
        =========================================== */}

        {location &&
          Number.isFinite(Number(location.latitude)) &&
          Number.isFinite(Number(location.longitude)) && (
            <Circle
              center={[Number(location.latitude), Number(location.longitude)]}
              radius={trackingRadius}
              pathOptions={{
                color: "#22d3ee",
                weight: 2,
                opacity: 0.45,
                fillColor: "#22d3ee",
                fillOpacity: 0.04,
                dashArray: "8 8",
              }}
            />
          )}

        {/* ===========================================
            GEOFENCES
        =========================================== */}

        {geofences.map((fence) => (
          <Circle
            key={fence.id}
            center={[Number(fence.latitude), Number(fence.longitude)]}
            radius={Number(fence.radius)}
            pathOptions={{
              color: "#FF4433",
              fillColor: "#FF4433",
              fillOpacity: 0.25,
              weight: 3,
            }}
          />
        ))}

        {geofences.map((fence) => (
          <Marker
            key={`marker-${fence.id}`}
            position={[Number(fence.latitude), Number(fence.longitude)]}
            icon={geofenceMarkerIcon}
          >
            <Popup>
              <div className="space-y-2 min-w-[190px]">
                <h3 className="font-bold text-blue-600">{fence.name}</h3>

                <hr />

                <p>
                  <b>Latitude:</b> {fence.latitude}
                </p>

                <p>
                  <b>Longitude:</b> {fence.longitude}
                </p>

                <p>
                  <b>Radius:</b> {fence.radius} m
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ===========================================
            TRACK
        =========================================== */}

        {trackPoints.length > 1 && (
          <>
            {/* Glow */}

            <Polyline
              positions={trackPoints}
              pathOptions={{
                color: "#ffffff",
                weight: 11,
                opacity: 0.8,
                lineCap: "round",
                lineJoin: "round",
                className: "route-glow",
              }}
              /*
               * Don't use Leaflet smoothing to hide bad
               * GPS data. The coordinates are filtered
               * before reaching this component.
               */
              smoothFactor={0}
            />

            {/* Actual route */}

            <Polyline
              positions={trackPoints}
              pathOptions={{
                color: "#22d3ee",
                weight: 6,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
                dashArray: "10 14",
                className: "route-core",
              }}
              smoothFactor={0}
            />
          </>
        )}

        {/* ===========================================
            FENCE SELECTOR
        =========================================== */}

        <FenceSelector enabled={drawingFence} onSelect={addFence} />

        {/* ===========================================
            CURRENT DEVICE MARKER
        =========================================== */}

        {location &&
          Number.isFinite(Number(location.latitude)) &&
          Number.isFinite(Number(location.longitude)) && (
            <Marker
              position={[Number(location.latitude), Number(location.longitude)]}
              icon={deviceMarkerIcon}
            >
              <Popup>
                <div className="space-y-2">
                  <h2 className="font-bold text-lg">{selectedDevice?.name}</h2>

                  <p>
                    <b>Latitude:</b> {location.latitude}
                  </p>

                  <p>
                    <b>Longitude:</b> {location.longitude}
                  </p>

                  {location.speed != null && (
                    <p>
                      <b>Speed:</b> {Number(location.speed).toFixed(1)} km/h
                    </p>
                  )}

                  {location.satellites != null && (
                    <p>
                      <b>Satellites:</b> {location.satellites}
                    </p>
                  )}

                  {location.hdop != null && (
                    <p>
                      <b>HDOP:</b> {Number(location.hdop).toFixed(2)}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
      </MapContainer>
    </div>
  );
};

export default MapView;
