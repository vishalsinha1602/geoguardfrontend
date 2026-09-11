import { useEffect, useState } from "react";

import DashboardSkeleton from "./DashboardSkeleton";
import SummaryCard from "./SummaryCard";
import RecentAlerts from "./RecentAlerts";
import DeviceStatus from "./DeviceStatus";
import QuicAction from "./QuicAction";

import { getDevices } from "../../api/deviceApi";
import {
  connectWebSocket,
  disconnectWebSocket,
} from "../../websocket/websocket";

const Dashboard = () => {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalDevices = devices.length;

  const onlineDevices = devices.filter(
    (device) => device.status === "ONLINE",
  ).length;

  const offlineDevices = totalDevices - onlineDevices;

  // ============================
  // Load Devices
  // ============================

  const loadDevices = async () => {
    try {
      const response = await getDevices();

      setDevices(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  // ============================
  // Dashboard Alert WebSocket
  // ============================

  useEffect(() => {
    if (loading) return;

    connectWebSocket(
      null,

      () => {},

      (liveAlert) => {
        console.log("🚨 Dashboard Alert");
        console.log(liveAlert);

        const device = devices.find(
          (d) => d.publicId === liveAlert.devicePublicId,
        );

        setAlerts((prev) => [
          {
            ...liveAlert,

            deviceName: device?.name || "Unknown Device",
          },

          ...prev,
        ]);
      },
    );

    return () => {
      disconnectWebSocket();
    };
  }, [loading, devices]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Summary */}

      <SummaryCard
        totalDevices={totalDevices}
        onlineDevices={onlineDevices}
        offlineDevices={offlineDevices}
        alertCount={alerts.length}
      />

      {/* Quick Actions */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <QuicAction />
      </div>

      {/* Devices */}

      <DeviceStatus devices={devices} alerts={alerts} />

      {/* Recent Alerts */}

      <div className="mt-6">
        <RecentAlerts alerts={alerts} />
      </div>
    </div>
  );
};

export default Dashboard;
