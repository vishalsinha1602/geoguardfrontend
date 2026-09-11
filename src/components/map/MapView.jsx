import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import GeofencePanel from "./GeofencePanel";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from "react-leaflet";

import { ChevronDown, LocateFixed, MapPinned, Save, X } from "lucide-react";

const FenceSelector = ({ enabled, onSelect }) => {
  useMapEvents({
    click(e) {
      if (!enabled) return;

      onSelect({
        id: Date.now(),
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
};

const MapView = ({
  selectedDevice,
  location,
  geofences,
  saveGeofence,
  removeGeofence,
  onRefresh,
  refreshing,
  refreshTrigger,
}) => {
  const center = location
    ? [location.latitude, location.longitude]
    : [28.6139, 77.209];

  const mapRef = useRef(null);

  const [showFencePanel, setShowFencePanel] = useState(false);

  const [drawingFence, setDrawingFence] = useState(false);

  const [radius, setRadius] = useState(100);

  const firstLoad = useRef(true);

  useEffect(() => {
    if (!location) return;

    if (!mapRef.current) return;

    if (!firstLoad.current) return;

    mapRef.current.flyTo(
      [Number(location.latitude), Number(location.longitude)],
      17,
      {
        animate: true,
        duration: 1.5,
      },
    );

    firstLoad.current = false;
  }, [location]);

  useEffect(() => {
    if (!location) return;

    if (!mapRef.current) return;

    if (refreshTrigger === 0) return;

    mapRef.current.flyTo(
      [Number(location.latitude), Number(location.longitude)],
      17,
      {
        animate: true,
        duration: 1.5,
      },
    );
  }, [refreshTrigger]);

  const addFence = async (point) => {
    console.log("Clicked Point:", point);

    const name = window.prompt("Enter Geofence Name");

    if (!name) return;

    const payload = {
      name,
      latitude: point.lat,
      longitude: point.lng,
      radius,
    };

    console.log("Payload:", payload);

    await saveGeofence(payload);
  };

  return (
    <div className="relative h-full rounded-2xl overflow-hidden shadow-xl border-2  bg-white">
      {/* Refresh */}

      <button
        className="absolute top-5 right-5 z-[1000] bg-white rounded-full shadow-lg border p-3 hover:scale-110 transition"
        onClick={onRefresh}
      >
        <LocateFixed
          className={refreshing ? "animate-spin text-blue-600" : ""}
        />
      </button>

      {/* Geofence Panel */}

      <button
        onClick={() => {
          setShowFencePanel(true);

          setDrawingFence(true);
        }}
        className="absolute right-4 top-24 z-[1000]
                bg-blue-600 text-white rounded-full
                p-3 shadow-lg hover:bg-blue-700"
      >
        <MapPinned size={30} />
      </button>

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

      {refreshing && (
        <div
          className="absolute inset-0
                    bg-black/10 z-[999]
                    flex justify-center items-center"
        >
          <div className="bg-white rounded-xl p-5 py-3 shadow-lg flex gap-3">
            <LocateFixed />
            Refreshing...
          </div>
        </div>
      )}

      <MapContainer
        whenReady={(e) => {
          mapRef.current = e.target;
        }}
        center={center}
        zoom={17}
        className="h-full w-full"
      >
        {geofences.map((fence) => (
          <Circle
            key={fence.id}
            center={[fence.latitude, fence.longitude]}
            radius={fence.radius}
            pathOptions={{
              color: "#FF4433",
              fillColor: "#FF4433",
              fillOpacity: 0.25,
              weight: 3,
            }}
          />
        ))}

        {geofences.map((fence, index) => (
          <Marker
            key={`marker-${fence.id}`}
            position={[fence.latitude, fence.longitude]}
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

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <FenceSelector enabled={drawingFence} onSelect={addFence} />
        {location && (
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>
              <div className="space-y-2">
                <h2 className="font-bold text-lg">{selectedDevice?.name}</h2>

                <p>Latitude: {location.latitude}</p>

                <p>Longitude: {location.longitude}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
