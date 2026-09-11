import { BellRing } from "lucide-react";

const RecentAlerts = ({ alerts }) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 max-h-[380px] overflow-y-auto">
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`p-3 rounded-2xl ${
            alerts.length > 0 ? "bg-red-100" : "bg-green-100"
          }`}
        >
          <BellRing
            className={`w-7 h-7 ${
              alerts.length > 0 ? "text-red-600" : "text-green-600"
            }`}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold">Recent Alerts</h2>

          <p className="text-slate-500">Live monitoring events</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-10">
          <BellRing size={60} className="mx-auto text-green-500" />

          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            No Active Alerts
          </h3>

          <p className="text-slate-500 mt-2">
            All devices are operating normally.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl border p-5 transition hover:shadow-md ${
                alert.type === "GEOFENCE_ENTER"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <h3
                    className={`font-semibold ${
                      alert.type === "GEOFENCE_ENTER"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {alert.title}
                  </h3>

                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>

                  <p className="text-xs text-slate-400 mt-2">
                    Device : {alert.devicePublicId}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500">
                    {alert.createdAt
                      ? new Date(alert.createdAt).toLocaleString()
                      : "--"}
                  </span>

                  <div className="mt-2">
                    {alert.read ? (
                      <span className="text-xs text-green-600 font-semibold">
                        Read
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-semibold">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentAlerts;
