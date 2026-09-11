import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";

import { saveBrowserLocation } from "../../api/browserLocationApi";

const ConnectDevice = () => {
  const [searchParams] = useSearchParams();

  // ==========================================
  // QR DATA
  // ==========================================

  const deviceId = searchParams.get("deviceId");

  const deviceName = searchParams.get("name") || "Unknown Device";

  const deviceType = searchParams.get("type") || "MOBILE";

  // ==========================================
  // STATES
  // ==========================================

  const [tracking, setTracking] = useState(false);

  const [permission, setPermission] = useState("checking");

  const [location, setLocation] = useState(null);

  const [batteryLevel, setBatteryLevel] = useState(100);

  const [error, setError] = useState(null);

  // ==========================================
  // REFS
  // ==========================================

  const watchIdRef = useRef(null);

  const intervalRef = useRef(null);

  const latestPositionRef = useRef(null);

  const batteryRef = useRef(100);

  // ==========================================
  // STOP TRACKING
  // ==========================================

  const stopTracking = () => {
    console.log("🛑 Tracking Stopped");

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);

      watchIdRef.current = null;
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);

      intervalRef.current = null;
    }

    latestPositionRef.current = null;

    setTracking(false);
  };

  // ==========================================
  // BATTERY
  // ==========================================

  const loadBattery = async () => {
    try {
      if (!("getBattery" in navigator)) {
        console.log("Battery API not supported");

        batteryRef.current = 100;

        setBatteryLevel(100);

        return;
      }

      const battery = await navigator.getBattery();

      const updateBattery = () => {
        const level = Math.round(battery.level * 100);

        console.log("🔋 Battery:", level);

        batteryRef.current = level;

        setBatteryLevel(level);
      };

      updateBattery();

      battery.addEventListener("levelchange", updateBattery);
    } catch (err) {
      console.error("Battery Error:", err);

      batteryRef.current = 100;

      setBatteryLevel(100);
    }
  };

  // ==========================================
  // START TRACKING
  // ==========================================

  const startTracking = () => {
    if (!deviceId) {
      setError("Device ID is missing.");

      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");

      return;
    }

    if (!navigator.onLine) {
      setError("Internet connection is required.");

      return;
    }

    // Prevent duplicate tracking

    if (watchIdRef.current !== null) {
      return;
    }

    console.log("📍 Starting location tracking");

    setError(null);

    // ======================================
    // WATCH GPS
    // ======================================

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        console.log("📍 GPS Location:", position.coords);

        latestPositionRef.current = position;

        setLocation({
          latitude: position.coords.latitude,

          longitude: position.coords.longitude,

          speed: position.coords.speed ?? 0,
        });

        setTracking(true);
      },

      (gpsError) => {
        console.error("GPS Error:", gpsError);

        if (gpsError.code === gpsError.PERMISSION_DENIED) {
          setPermission("denied");

          setError("Location permission was denied.");
        } else if (gpsError.code === gpsError.POSITION_UNAVAILABLE) {
          setError("Unable to determine your location.");
        } else if (gpsError.code === gpsError.TIMEOUT) {
          setError("Location request timed out.");
        }

        stopTracking();
      },

      {
        enableHighAccuracy: true,

        maximumAge: 0,

        timeout: 15000,
      },
    );

    // ======================================
    // SEND LOCATION EVERY 5 SECONDS
    // ======================================

    intervalRef.current = setInterval(async () => {
      const position = latestPositionRef.current;

      if (!position) {
        console.log("Waiting for GPS...");

        return;
      }

      const locationData = {
        devicePublicId: deviceId,

        latitude: position.coords.latitude,

        longitude: position.coords.longitude,

        speed: position.coords.speed ?? 0,

        batteryLevel: batteryRef.current,
      };

      console.log("📡 Sending Location:", locationData);

      try {
        await saveBrowserLocation(locationData);

        console.log("✅ Location sent successfully");

        setTracking(true);

        setError(null);
      } catch (err) {
        console.error("❌ Location API Error:", err);

        console.error("Backend:", err.response?.data);

        setError("Unable to send location to server.");
      }
    }, 5000);
  };

  // ==========================================
  // REQUEST LOCATION PERMISSION
  // ==========================================

  const requestLocationPermission = () => {
    if (!deviceId) {
      setError("Invalid QR code. Device ID is missing.");

      return;
    }

    if (!navigator.geolocation) {
      setError("Your browser does not support location.");

      return;
    }

    setPermission("requesting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Permission Granted");

        setPermission("granted");

        setLocation({
          latitude: position.coords.latitude,

          longitude: position.coords.longitude,

          speed: position.coords.speed ?? 0,
        });

        latestPositionRef.current = position;

        startTracking();
      },

      (gpsError) => {
        console.error("Permission Error:", gpsError);

        if (gpsError.code === gpsError.PERMISSION_DENIED) {
          setPermission("denied");

          setError("Please allow location permission in Chrome settings.");
        } else {
          setError("Unable to get your location.");
        }
      },

      {
        enableHighAccuracy: true,

        maximumAge: 0,

        timeout: 15000,
      },
    );
  };

  // ==========================================
  // INITIALIZE
  // ==========================================

  useEffect(() => {
    if (!deviceId) {
      setError("Invalid QR code. Device ID not found.");

      return;
    }

    console.log("================================");

    console.log("Device:", deviceName);

    console.log("Type:", deviceType);

    console.log("Device ID:", deviceId);

    console.log("================================");

    loadBattery();

    return () => {
      stopTracking();
    };
  }, [deviceId]);

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5">
          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <div className="text-center mb-8">
            <div className="mx-auto w-25 h-25 rounded-full bg-blue-100 flex items-center justify-center mb-5">
              <span className="text-4xl">📍</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-800">RAKSHAK</h1>

            <p className="text-slate-500 mt-2">
              Allow location access to start tracking this device.
            </p>
          </div>

          {/* ================================= */}
          {/* DEVICE INFO */}
          {/* ================================= */}

          <div className="rounded-2xl bg-slate-50 border p-5 mb-6">
            <div className="flex justify-between mb-4">
              <span className="text-slate-500">Device</span>

              <span className="font-bold text-slate-800">{deviceName}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-slate-500">Type</span>

              <span className="font-semibold text-slate-700">{deviceType}</span>
            </div>

            <div>
              <p className="text-slate-500 text-sm mb-5">Device ID</p>

              <p className="font-mono text-xs break-all bg-white border rounded-lg p-3">
                {deviceId || "--"}
              </p>
            </div>
          </div>

          {/* ================================= */}
          {/* ERROR */}
          {/* ================================= */}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4 mb-6">
              <p className="font-semibold">⚠️ {error}</p>
            </div>
          )}

          {/* ================================= */}
          {/* PERMISSION */}
          {/* ================================= */}

          {!tracking && (
            <button
              onClick={requestLocationPermission}
              disabled={permission === "requesting"}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-3"
            >
              {permission === "requesting" ? (
                <>
                  <Spinner />
                  Connecting Device...
                </>
              ) : (
                "Allow Location & Connect"
              )}
            </button>
          )}

          {/* ================================= */}
          {/* TRACKING ACTIVE */}
          {/* ================================= */}

          {tracking && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6  ">
              <div className="flex items-center gap-2">
                <div className="w-16 h-10 rounded-full bg-green-200 flex items-center justify-center">
                  <span className="text-xl">✓</span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-green-700">
                    Device Connected
                  </h2>

                  <p className="text-green-600 text-sm">
                    {deviceName} is now sending its location.
                  </p>
                </div>
              </div>

              {/* STATUS */}

              <div className="mt-5 rounded-xl bg-white border border-green-200 p-5">
                <div className="flex justify-between">
                  <span className="text-slate-600">📍 Tracking</span>

                  <span className="font-bold text-sm text-green-600">
                    ACTIVE
                  </span>
                </div>

                <div className="flex justify-between mt-3">
                  <span className="text-slate-600">🔋 Battery</span>

                  <span className="font-semibold">{batteryLevel}%</span>
                </div>
              </div>

              {/* LOCATION */}

              {location && (
                <div className="mt-4 rounded-lg bg-white border py-4 px-2 ">
                  <p className="text-sm text-slate-500 mb-3">
                    Current Location
                  </p>

                  <p className=" text-sm mb-3">Lat: {location.latitude}</p>

                  <p className=" text-sm mb-3">Lng: {location.longitude}</p>

                  <p className=" text-sm mb-3">Speed: {location.speed} m/s</p>
                </div>
              )}

              {/* STOP */}

              <button
                onClick={stopTracking}
                className="w-full mt-5 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition"
              >
                Stop Tracking
              </button>
            </div>
          )}

          {/* ================================= */}
          {/* INFO */}
          {/* ================================= */}

          <p className="text-center text-xs text-slate-400 mt-6">
            Keep this page open for continuous browser-based tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectDevice;
