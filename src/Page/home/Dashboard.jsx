import { useEffect, useState } from "react";

import DashboardSkeleton from "./DashboardSkeleton";
import SummaryCard from "./SummaryCard";
import RecentAlerts from "./RecentAlerts";
import DeviceStatus from "./DeviceStatus";
import QuicAction from "./QuicAction";

import { getDevices } from "../../api/deviceApi";
import { getAlerts } from "../../api/alertApi";
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

  useEffect(() => {
    getDevices()
      .then(async (response) => {
        const deviceList = response.data.data;
        setDevices(deviceList);

        const alertGroups = await Promise.all(
          deviceList.map(async (device) => {
            try {
              const alertResponse = await getAlerts(device.publicId);
              return (alertResponse.data.data || []).map((alert) => ({
                ...alert,
                deviceName: device.name,
              }));
            } catch (error) {
              console.error(`Could not load alerts for ${device.name}:`, error);
              return [];
            }
          }),
        );

        setAlerts(
          alertGroups
            .flat()
            .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)),
        );
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  // ============================
  // Dashboard Alert WebSocket
  // ============================

  useEffect(() => {
    if (loading) return;

    connectWebSocket(
      devices.map((device) => device.publicId),

      () => {},

      (liveAlert) => {
        console.log("🚨 Dashboard Alert");
        console.log(liveAlert);

        const device = devices.find(
          (d) => d.publicId === liveAlert.devicePublicId,
        );

        setAlerts((prev) => {
          if (prev.some((alert) => alert.id === liveAlert.id)) return prev;
          return [
            {
              ...liveAlert,
              deviceName: device?.name || "Unknown Device",
            },
            ...prev,
          ];
        });
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
