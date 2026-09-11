import React, { useState } from "react";
import { clearAlerts } from "../../api/alertApi";

const AlertDevice = ({ alerts, devicePublicId, onAlertsCleared }) => {
  const [clearing, setClearing] = useState(false);

  const handleClearAlerts = async () => {
    if (!devicePublicId) {
      console.log("No device selected");
      return;
    }

    if (alerts.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear all alerts for this device?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setClearing(true);

      await clearAlerts(devicePublicId);

      // Parent state ko empty karo
      if (onAlertsCleared) {
        onAlertsCleared();
      }
    } catch (error) {
      console.error("Unable to clear alerts:", error);

      alert("Unable to clear alerts");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white shadow-xl border p-6">
      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Live Alerts</h2>

        <button
          onClick={handleClearAlerts}
          disabled={clearing || alerts.length === 0 || !devicePublicId}
          className={`
                        px-4
                        py-2
                        rounded-lg
                        text-sm
                        font-semibold
                        transition
                        ${
                          alerts.length === 0 || !devicePublicId
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }
                    `}
        >
          {clearing ? "Clearing..." : "Clear Alerts"}
        </button>
      </div>

      {/* ================= NO ALERTS ================= */}

      {alerts.length === 0 ? (
        <div className="text-center py-10 text-slate-500">No Alerts Yet</div>
      ) : (
        /* ================= ALERT LIST ================= */

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-red-700">{alert.title}</h3>

                  <p className="text-slate-700 mt-1">{alert.message}</p>
                </div>

                <div className="text-xs text-slate-500">
                  {new Date(alert.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertDevice;
