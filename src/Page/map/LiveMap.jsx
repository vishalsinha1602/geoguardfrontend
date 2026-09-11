import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

import { getDevices } from "../../api/deviceApi";
import { getLatestLocation } from "../../api/locationApi";
import { getAlerts } from "@/api/alertApi";

import DeviceList from "../../components/map/DeviceList";
import MapView from "../../components/map/MapView";
import DeviceInfo from "../../components/map/DeviceInfo";
// import BrowserTracker from "../../BrowserTracker/BrowserTracker";

import {
  createGeofence,
  getDeviceGeofences,
  deleteGeofence,
} from "../../api/geofenceApi";

import {
  connectWebSocket,
  disconnectWebSocket,
} from "../../websocket/websocket";
import AlertDevice from "./AlertDevice";

const LiveMap = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [geofences, setGeofences] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);

  const loadGeofences = async (devicePublicId) => {
    if (!devicePublicId) return;

    try {
      const response = await getDeviceGeofences(devicePublicId);

      setGeofences(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const saveGeofence = async (geofence) => {
    const payload = {
      ...geofence,
      devicePublicId: selectedDevice.publicId,
    };

    console.log("========== GEOFENCE ==========");
    console.log("Selected Device:", selectedDevice);
    console.log("Payload:", payload);
    console.log("devicePublicId:", payload.devicePublicId);
    console.log("latitude:", payload.latitude);
    console.log("longitude:", payload.longitude);
    console.log("radius:", payload.radius);

    try {
      const response = await createGeofence(payload);

      console.log("Backend Response:", response.data);
    } catch (error) {
      console.log("Status:", error.response?.status);
      console.log("Response:", error.response?.data);
      console.log("Message:", error.message);
    }
  };

  const removeGeofence = async (id) => {
    try {
      await deleteGeofence(id);

      await loadGeofences(selectedDevice.publicId);
    } catch (error) {
      console.log(error);
    }
  };

  // ----------------------------
  // Save Selected Device
  // ----------------------------

  const handleSelectDevice = (device) => {
    setSelectedDevice(device);

    localStorage.setItem("selectedDeviceId", device.publicId);
  };

  // ----------------------------
  // Latest Location
  // ----------------------------

  const loadLatestLocation = async (deviceId) => {
    if (!deviceId) return;

    try {
      const response = await getLatestLocation(deviceId);

      setLocation(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ----------------------------
  // Refresh
  // ----------------------------

  const handleRefresh = async () => {
    if (!selectedDevice) return;

    setRefreshing(true);

    try {
      const response = await getLatestLocation(selectedDevice.publicId);

      const latest = response.data.data;

      setLocation(latest);

      // Tell MapView to fly now
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    }
  };

  // ----------------------------
  // Load Devices
  // ----------------------------

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await getDevices();

        const deviceList = response.data.data;

        setDevices(deviceList);

        const savedId = localStorage.getItem("selectedDeviceId");

        const selected =
          deviceList.find((device) => device.publicId === savedId) ||
          deviceList[0];

        if (selected) {
          setSelectedDevice(selected);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // ----------------------------
  // Load Location
  // geofence
  // alert
  // ----------------------------

  useEffect(() => {
    if (!selectedDevice) return;

    loadLatestLocation(selectedDevice.publicId);

    loadGeofences(selectedDevice.publicId);

    loadAlerts(selectedDevice.publicId);
  }, [selectedDevice]);

  // ----------------------------
  // Load Alerts
  // ----------------------------

  const loadAlerts = async (devicePublicId) => {
    if (!devicePublicId) return;

    try {
      const response = await getAlerts(devicePublicId);

      setLiveAlerts(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ----------------------------
  // WebSocket
  // ----------------------------
  useEffect(() => {
    if (!selectedDevice) return;

    connectWebSocket(
      selectedDevice.publicId,

      // ================= LOCATION =================

      (message) => {
        const liveData = message.data ? message.data : message;

        setLocation((prev) => ({
          ...prev,

          latitude: liveData.latitude ?? prev?.latitude,

          longitude: liveData.longitude ?? prev?.longitude,

          speed: liveData.speed ?? prev?.speed,

          receivedAt: liveData.lastSeen ?? prev?.receivedAt,
        }));

        setSelectedDevice((prev) => {
          if (!prev) return prev;

          return {
            ...prev,

            batteryLevel: liveData.batteryLevel ?? prev.batteryLevel,

            status: liveData.status ?? prev.status,

            lastSeen: liveData.lastSeen ?? prev.lastSeen,
          };
        });

        setDevices((prev) =>
          prev.map((device) =>
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
      },

      // ================= ALERT =================

      (alertData) => {
        console.log("🚨 LIVE ALERT");
        console.log(alertData);

        setLiveAlerts((prev) => {
          const exists = prev.some((alert) => alert.id === alertData.id);

          if (exists) {
            return prev;
          }

          return [alertData, ...prev];
        });
      },
    );

    return () => disconnectWebSocket();
  }, [selectedDevice?.publicId]);

  // ----------------------------
  // Loading
  // ----------------------------

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-3">
        <Spinner className="size-10 text-primary" />
        <p className="text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }
  return (
    <>
      {/* <BrowserTracker
                    devicePublicId={selectedDevice?.publicId}
                /> */}

      <div className="space-y-6">
        {/* ================= TOP SECTION ================= */}

        <div className="grid grid-cols-12 gap-5">
          {/* MAP */}

          <div className="col-span-12 xl:col-span-8">
            <div className="rounded-3xl overflow-hidden shadow-xl h-[620px]">
              <MapView
                selectedDevice={selectedDevice}
                location={location}
                geofences={geofences}
                saveGeofence={saveGeofence}
                removeGeofence={removeGeofence}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>

          {/* DEVICE INFO */}

          <div className="col-span-12 xl:col-span-4 ">
            <div className="rounded-3xl  border  shadow-xl h-[620px] overflow-auto">
              <DeviceInfo selectedDevice={selectedDevice} location={location} />
            </div>
          </div>
        </div>

        {/* ================= DEVICES LIST ================= */}

        <div className="rounded-3xl bg-slate-900 border  shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white">Active Devices</h2>

              <p className="text-slate-400 text-sm">
                Overview of all tracking devices
              </p>
            </div>

            <button className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
              View All Devices
            </button>
          </div>

          <DeviceList
            devices={devices}
            selectedDevice={selectedDevice}
            setSelectedDevice={handleSelectDevice}
          />
        </div>

        <AlertDevice alerts={liveAlerts} />
      </div>
    </>
  );
};

export default LiveMap;
