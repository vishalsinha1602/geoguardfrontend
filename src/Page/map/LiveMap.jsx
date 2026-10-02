// src/Page/map/LiveMap.jsx

import { useEffect, useRef, useState } from "react";

import { Spinner } from "@/components/ui/spinner";

import { getDevices } from "../../api/deviceApi";

import { getLatestLocation, getLocationHistory } from "../../api/locationApi";

import { getAlerts } from "@/api/alertApi";

import DeviceList from "../../components/map/DeviceList";

import MapView from "../../components/map/MapView";

import DeviceInfo from "../../components/map/DeviceInfo";

import {
  createGeofence,
  getDeviceGeofences,
  deleteGeofence,
} from "../../api/geofenceApi";

import {
  connectWebSocket,
  disconnectWebSocket,
  resetWebSocketSession,
} from "../../websocket/websocket";

import AlertDevice from "./AlertDevice";

import {
  distanceBetweenPoints,
  filterPointsWithinRadius,
  thinTrail,
  evaluateMovement,
} from "../../utils/gpsFilter";

// ============================================================
// TRACKING CONFIGURATION
// ============================================================

const VISIBLE_TRACK_RADIUS_METERS = 500;

const MAX_TRACK_POINTS = 300;

// ------------------------------------------------------------
// IMPORTANT
// ------------------------------------------------------------
//
// Device must move at least 100m before the frontend accepts
// a new position.
//
// If your NEO-M8N is still noisy while stationary:
//
// 100 -> 15
//
// If you want more sensitive walking tracking:
//
// 100 -> 80
//
// ------------------------------------------------------------

const MIN_MOVEMENT_METERS = 80;

// ------------------------------------------------------------
// Maximum acceptable GPS jump
// ------------------------------------------------------------

const MAX_JUMP_METERS = 150;

// ------------------------------------------------------------
// Movement confirmation
// ------------------------------------------------------------
//
// A single GPS point >10m away is not immediately accepted.
//
// The next GPS point must be close to that candidate.
//
// ------------------------------------------------------------

const CONFIRMATION_DISTANCE_METERS = 15;

// ------------------------------------------------------------
// Historical trail spacing
// ------------------------------------------------------------

const MIN_TRAIL_DISTANCE_METERS = 80;

// ============================================================
// LIVE MAP
// ============================================================

const LiveMap = () => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [devices, setDevices] = useState([]);

  const [selectedDevice, setSelectedDevice] = useState(null);

  const [location, setLocation] = useState(null);

  const [trackPoints, setTrackPoints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [geofences, setGeofences] = useState([]);

  const [liveAlerts, setLiveAlerts] = useState([]);

  // ==========================================================
  // REFS
  // ==========================================================

  /*
   * Last GPS location that was actually accepted.
   *
   * IMPORTANT:
   *
   * This is NOT necessarily the latest raw GPS reading.
   *
   * This is the last trusted position.
   */

  const lastAcceptedLocationRef = useRef(null);

  /*
   * Temporary GPS movement candidate.
   *
   * Example:
   *
   * Current accepted:
   *
   * A
   *
   * GPS suddenly says:
   *
   * B = 18m away
   *
   * We don't immediately accept B.
   *
   * B becomes candidate.
   *
   * Next GPS reading:
   *
   * B2
   *
   * If B2 is close to B,
   * then movement is confirmed.
   */

  const candidateLocationRef = useRef(null);

  /*
   * Used to prevent old asynchronous requests from updating
   * the current map after changing devices.
   */

  const trackingSessionRef = useRef(0);

  // ==========================================================
  // SELECTED DEVICE
  // ==========================================================

  const selectedDeviceId = selectedDevice?.publicId;

  // ==========================================================
  // KEEP VISIBLE TRACK WITHIN 500m
  // ==========================================================

  const keepVisibleTrack = (points, currentLocation) => {
    if (!currentLocation) {
      return [];
    }

    const filtered = filterPointsWithinRadius(
      points,
      currentLocation,
      VISIBLE_TRACK_RADIUS_METERS,
    );

    const thinned = thinTrail(filtered, MIN_TRAIL_DISTANCE_METERS);

    return thinned.slice(-MAX_TRACK_POINTS);
  };

  const buildHistoryTrack = (history, currentLocation, maxPoints = 60) => {
    if (!Array.isArray(history) || !currentLocation) {
      return [];
    }

    const points = history
      .map((entry) => {
        const latitude = Number(entry?.latitude);
        const longitude = Number(entry?.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }

        return {
          point: [latitude, longitude],
          timestamp: entry?.receivedAt
            ? new Date(entry.receivedAt).getTime()
            : Date.now(),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-maxPoints)
      .map((item) => item.point);

    if (points.length === 0) {
      return [
        [Number(currentLocation.latitude), Number(currentLocation.longitude)],
      ];
    }

    const visible = keepVisibleTrack(points, currentLocation);

    return visible.length > 0
      ? visible
      : [[Number(currentLocation.latitude), Number(currentLocation.longitude)]];
  };

  // ==========================================================
  // LOAD GEOFENCES
  // ==========================================================

  const loadGeofences = async (devicePublicId) => {
    if (!devicePublicId) {
      return;
    }

    try {
      const response = await getDeviceGeofences(devicePublicId);

      setGeofences(response.data?.data ?? []);
    } catch (error) {
      console.error("Could not load geofences:", error);
    }
  };

  // ==========================================================
  // SAVE GEOFENCE
  // ==========================================================

  const saveGeofence = async (geofence) => {
    if (!selectedDevice?.publicId) {
      return;
    }

    const payload = {
      ...geofence,

      devicePublicId: selectedDevice.publicId,
    };

    try {
      const response = await createGeofence(payload);

      console.log("Geofence saved:", response.data);

      await loadGeofences(selectedDevice.publicId);
    } catch (error) {
      console.error("Could not save geofence:", error);
    }
  };

  // ==========================================================
  // DELETE GEOFENCE
  // ==========================================================

  const removeGeofence = async (id) => {
    try {
      await deleteGeofence(id);

      if (selectedDeviceId) {
        await loadGeofences(selectedDeviceId);
      }
    } catch (error) {
      console.error("Could not delete geofence:", error);
    }
  };

  // ==========================================================
  // SELECT DEVICE
  // ==========================================================

  const handleSelectDevice = (device) => {
    // New tracking session
    trackingSessionRef.current += 1;

    setSelectedDevice(device);

    setLocation(null);

    setTrackPoints([]);

    // Reset GPS filter
    lastAcceptedLocationRef.current = null;

    candidateLocationRef.current = null;

    localStorage.setItem("selectedDeviceId", device.publicId);
  };

  // ==========================================================
  // LIVE LOCATION HANDLER
  // ==========================================================

  const handleLiveLocation = (liveData) => {
    if (!liveData) {
      return;
    }

    const latitude = Number(liveData.latitude);

    const longitude = Number(liveData.longitude);

    // ------------------------------------------------------
    // INVALID
    // ------------------------------------------------------

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      console.warn("⚠️ Invalid live GPS:", liveData);

      return;
    }

    const newPoint = [latitude, longitude];

    // ======================================================
    // FIRST GPS POSITION
    // ======================================================

    if (!lastAcceptedLocationRef.current) {
      const firstLocation = {
        ...liveData,

        latitude,

        longitude,
      };

      lastAcceptedLocationRef.current = firstLocation;

      candidateLocationRef.current = null;

      setLocation(firstLocation);

      setTrackPoints([newPoint]);

      console.log("📍 FIRST GPS POSITION ACCEPTED", firstLocation);

      return;
    }

    // ======================================================
    // LAST TRUSTED LOCATION
    // ======================================================

    const previousLocation = lastAcceptedLocationRef.current;

    const previousPoint = [
      Number(previousLocation.latitude),

      Number(previousLocation.longitude),
    ];

    // ======================================================
    // MOVEMENT FROM TRUSTED POSITION
    // ======================================================

    const movement = evaluateMovement(previousPoint, newPoint, {
      minimumDistanceMeters: MIN_MOVEMENT_METERS,

      maximumJumpMeters: MAX_JUMP_METERS,
    });

    console.log("📡 GPS CHECK:", {
      distance: Number.isFinite(movement.distance)
        ? movement.distance.toFixed(2)
        : "invalid",

      reason: movement.reason,

      accepted: movement.accepted,
    });

    // ======================================================
    // GPS JITTER
    // ======================================================

    if (movement.reason === "GPS_JITTER") {
      candidateLocationRef.current = null;

      console.log("⏸️ GPS jitter ignored:", movement.distance.toFixed(2), "m");

      // IMPORTANT:
      //
      // We DO NOT update:
      //
      // setLocation()
      //
      // Therefore the marker stays still.
      //

      return;
    }

    // ======================================================
    // GPS JUMP
    // ======================================================

    if (movement.reason === "GPS_JUMP") {
      candidateLocationRef.current = null;

      console.warn("🚫 GPS jump rejected:", movement.distance.toFixed(2), "m");

      return;
    }

    // ======================================================
    // REAL MOVEMENT CANDIDATE
    // ======================================================

    const candidate = candidateLocationRef.current;

    // ------------------------------------------------------
    // First candidate
    // ------------------------------------------------------

    if (!candidate) {
      candidateLocationRef.current = {
        ...liveData,

        latitude,

        longitude,
      };

      console.log(
        "🟡 GPS movement candidate:",
        movement.distance.toFixed(2),
        "m",
      );

      return;
    }

    // ======================================================
    // CONFIRM SECOND READING
    // ======================================================

    const candidatePoint = [
      Number(candidate.latitude),

      Number(candidate.longitude),
    ];

    const distanceFromCandidate = distanceBetweenPoints(
      candidatePoint,
      newPoint,
    );

    console.log(
      "🔎 Candidate confirmation:",
      distanceFromCandidate.toFixed(2),
      "m",
    );

    // ======================================================
    // CANDIDATE NOT CONFIRMED
    // ======================================================

    if (distanceFromCandidate > CONFIRMATION_DISTANCE_METERS) {
      /*
       * The previous candidate may have been a GPS glitch.
       *
       * Replace it with the newest point.
       */

      candidateLocationRef.current = {
        ...liveData,

        latitude,

        longitude,
      };

      console.log("🟡 Candidate changed; waiting for confirmation");

      return;
    }

    // ======================================================
    // MOVEMENT CONFIRMED
    // ======================================================

    const acceptedLocation = {
      ...liveData,

      latitude,

      longitude,
    };

    console.log(
      "🟢 REAL MOVEMENT CONFIRMED:",
      movement.distance.toFixed(2),
      "m",
    );

    // ------------------------------------------------------
    // Update trusted position
    // ------------------------------------------------------

    lastAcceptedLocationRef.current = acceptedLocation;

    candidateLocationRef.current = null;

    // ------------------------------------------------------
    // Update marker
    // ------------------------------------------------------

    setLocation(acceptedLocation);

    // ======================================================
    // UPDATE TRACK
    // ======================================================

    setTrackPoints((previousPoints) => {
      const candidatePoints = [...previousPoints, newPoint];

      const visible = keepVisibleTrack(candidatePoints, acceptedLocation);

      return visible;
    });

    // ======================================================
    // UPDATE DEVICE
    // ======================================================

    setSelectedDevice((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,

        batteryLevel: liveData.batteryLevel ?? previous.batteryLevel,

        status: liveData.status ?? previous.status,

        lastSeen: liveData.lastSeen ?? previous.lastSeen,
      };
    });

    // ======================================================
    // UPDATE DEVICE LIST
    // ======================================================

    setDevices((previous) =>
      previous.map((device) =>
        device.publicId === liveData.devicePublicId
          ? {
              ...device,

              batteryLevel: liveData.batteryLevel ?? device.batteryLevel,

              status: liveData.status ?? device.status,

              lastSeen: liveData.lastSeen ?? device.lastSeen,
            }
          : device,
      ),
    );
  };

  // ==========================================================
  // LIVE ALERT HANDLER
  // ==========================================================

  const handleLiveAlert = (alertData) => {
    if (!alertData) {
      return;
    }

    console.log("🚨 LIVE ALERT:", alertData);

    setLiveAlerts((previous) => {
      const exists = previous.some((alert) => alert.id === alertData.id);

      if (exists) {
        return previous;
      }

      return [alertData, ...previous];
    });
  };

  // ==========================================================
  // REFRESH
  // ==========================================================
  //
  // IMPORTANT:
  //
  // Refresh means:
  //
  // OLD TRAIL
  //     ↓
  // DELETE FROM SCREEN
  //     ↓
  // NEW CURRENT POSITION
  //     ↓
  // NEW WEBSOCKET SESSION
  //
  // Backend history is NOT deleted.
  //
  // ==========================================================

  const handleCenterCurrentLocation = () => {
    if (!location || !selectedDeviceId) {
      return;
    }

    setRefreshTrigger((previous) => previous + 1);
  };

  const handleAlertsCleared = () => {
    setLiveAlerts([]);
  };

  const handleRefresh = async () => {
    if (!selectedDevice?.publicId) {
      return;
    }

    setRefreshing(true);

    try {
      console.log("🔄 STARTING FRESH TRACKING");

      // ====================================================
      // NEW TRACKING SESSION
      // ====================================================

      trackingSessionRef.current += 1;

      // ====================================================
      // STOP OLD WEBSOCKET
      // ====================================================

      await resetWebSocketSession();

      // ====================================================
      // CLEAR OLD MAP TRAIL
      // ====================================================

      setTrackPoints([]);

      // ====================================================
      // RESET GPS FILTER
      // ====================================================

      lastAcceptedLocationRef.current = null;

      candidateLocationRef.current = null;

      // ====================================================
      // FETCH LATEST
      // ====================================================

      const response = await getLatestLocation(selectedDevice.publicId);

      const latest = response.data?.data;

      if (!latest) {
        console.warn("No latest location available");

        return;
      }

      const latitude = Number(latest.latitude);

      const longitude = Number(latest.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        console.warn("Invalid latest location:", latest);

        return;
      }

      const freshLocation = {
        ...latest,

        latitude,

        longitude,
      };

      // ====================================================
      // SET NEW TRUSTED ANCHOR
      // ====================================================

      lastAcceptedLocationRef.current = freshLocation;

      setLocation(freshLocation);

      // ====================================================
      // RESET TRACK TO CURRENT POINT ONLY
      // ====================================================

      setTrackPoints([[latitude, longitude]]);

      // ====================================================
      // MOVE MAP
      // ====================================================

      setRefreshTrigger((previous) => previous + 1);

      // ====================================================
      // START NEW WEBSOCKET
      // ====================================================

      connectWebSocket(
        selectedDevice.publicId,

        handleLiveLocation,

        handleLiveAlert,
      );

      console.log("✅ FRESH TRACKING STARTED");
    } catch (error) {
      console.error("❌ Fresh tracking failed:", error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  };

  // ==========================================================
  // LOAD DEVICES
  // ==========================================================

  useEffect(() => {
    let active = true;

    const fetchDevices = async () => {
      try {
        const response = await getDevices();

        const deviceList = response.data?.data ?? [];

        if (!active) {
          return;
        }

        setDevices(deviceList);

        const savedId = localStorage.getItem("selectedDeviceId");

        const selected =
          deviceList.find((device) => device.publicId === savedId) ||
          deviceList[0];

        if (selected) {
          setSelectedDevice(selected);
        }
      } catch (error) {
        console.error("Could not load devices:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDevices();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================================
  // LOAD LOCATION + HISTORY + GEOFENCE + ALERT
  // ==========================================================

  useEffect(() => {
    if (!selectedDeviceId) {
      return;
    }

    const sessionId = ++trackingSessionRef.current;

    let active = true;

    // --------------------------------------------------------
    // RESET FILTER FOR NEW DEVICE
    // --------------------------------------------------------

    lastAcceptedLocationRef.current = null;

    candidateLocationRef.current = null;

    setLocation(null);

    setTrackPoints([]);

    // ========================================================
    // LOAD CURRENT LOCATION + HISTORY
    // ========================================================

    const loadTrackingData = async () => {
      try {
        const [latestResponse, historyResponse] = await Promise.all([
          getLatestLocation(selectedDeviceId),

          getLocationHistory(selectedDeviceId),
        ]);

        if (!active || sessionId !== trackingSessionRef.current) {
          return;
        }

        // ==================================================
        // CURRENT LOCATION
        // ==================================================

        const latest = latestResponse.data?.data;

        if (!latest) {
          console.warn("No latest GPS location");
        } else {
          const latitude = Number(latest.latitude);

          const longitude = Number(latest.longitude);

          if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            const currentLocation = {
              ...latest,

              latitude,

              longitude,
            };

            lastAcceptedLocationRef.current = currentLocation;

            setLocation(currentLocation);

            // ==================================================
            // HISTORY
            // ==================================================

            const history =
              historyResponse.data?.data ?? historyResponse.data ?? [];

            if (Array.isArray(history)) {
              const visibleHistory = buildHistoryTrack(
                history,
                currentLocation,
                60,
              );

              setTrackPoints(visibleHistory);
            } else {
              setTrackPoints([[latitude, longitude]]);
            }
          }
        }
      } catch (error) {
        console.error("Could not load tracking data:", error);
      }
    };

    // ========================================================
    // GEOFENCES + ALERTS
    // ========================================================

    const loadExtras = async () => {
      try {
        const [geofenceResponse, alertResponse] = await Promise.all([
          getDeviceGeofences(selectedDeviceId),

          getAlerts(selectedDeviceId),
        ]);

        if (!active || sessionId !== trackingSessionRef.current) {
          return;
        }

        setGeofences(geofenceResponse.data?.data ?? []);

        setLiveAlerts(alertResponse.data?.data ?? []);
      } catch (error) {
        console.error("Could not load map extras:", error);
      }
    };

    loadTrackingData();

    loadExtras();

    return () => {
      active = false;
    };
  }, [selectedDeviceId]);

  // ==========================================================
  // WEBSOCKET
  // ==========================================================

  useEffect(() => {
    if (!selectedDeviceId) {
      return;
    }

    connectWebSocket(
      selectedDeviceId,

      handleLiveLocation,

      handleLiveAlert,
    );

    return () => {
      disconnectWebSocket();
    };
  }, [selectedDeviceId]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-3">
        <Spinner className="size-10 text-primary" />

        <p className="text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <div className="space-y-6">
        {/* ====================================================
            MAP + DEVICE INFO
        ==================================================== */}

        <div className="live-map-overview grid grid-cols-12 gap-5">
          {/* MAP */}

          <div className="col-span-12 xl:col-span-8">
            <div className="live-map-canvas rounded-3xl overflow-hidden shadow-xl h-[620px]">
              <MapView
                selectedDevice={selectedDevice}
                location={location}
                trackPoints={trackPoints}
                geofences={geofences}
                saveGeofence={saveGeofence}
                removeGeofence={removeGeofence}
                onRefresh={handleRefresh}
                onCenterCurrentLocation={handleCenterCurrentLocation}
                refreshing={refreshing}
                refreshTrigger={refreshTrigger}
                trackingRadius={VISIBLE_TRACK_RADIUS_METERS}
              />
            </div>
          </div>

          {/* DEVICE INFO */}

          <div className="col-span-12 xl:col-span-4">
            <div className="live-map-device-info rounded-3xl border shadow-xl h-[620px] overflow-auto">
              <DeviceInfo selectedDevice={selectedDevice} location={location} />
            </div>
          </div>
        </div>

        {/* ====================================================
            DEVICES
        ==================================================== */}

        <div className="rounded-3xl bg-slate-900 border shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white">Active Devices</h2>

              <p className="text-slate-400 text-sm">
                Showing tracking history within 500m of the current device
                location
              </p>
            </div>

            <button
              type="button"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              View All Devices
            </button>
          </div>

          <DeviceList
            devices={devices}
            selectedDevice={selectedDevice}
            setSelectedDevice={handleSelectDevice}
          />
        </div>

        {/* ====================================================
            ALERTS
        ==================================================== */}

        <AlertDevice
          alerts={liveAlerts}
          devicePublicId={selectedDeviceId}
          onAlertsCleared={handleAlertsCleared}
        />
      </div>
    </>
  );
};

export default LiveMap;
