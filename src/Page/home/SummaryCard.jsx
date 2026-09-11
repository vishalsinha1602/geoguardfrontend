import { Bell, Smartphone, Activity, Cpu } from "lucide-react";

const SummaryCard = ({
  totalDevices,
  onlineDevices,
  offlineDevices,
  alertCount,
}) => {
  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Devices */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500">Devices</p>

            <h2 className="text-5xl font-bold mt-3">{totalDevices}</h2>
          </div>

          <Smartphone size={44} className="text-blue-600" />
        </div>
      </div>

      {/* Online */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500">Online</p>

            <h2 className="text-5xl font-bold mt-3 text-green-600">
              {onlineDevices}
            </h2>
          </div>

          <Activity size={44} className="text-green-600" />
        </div>
      </div>

      {/* Offline */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500">Offline</p>

            <h2 className="text-5xl font-bold mt-3 text-red-600">
              {offlineDevices}
            </h2>
          </div>

          <Cpu size={44} className="text-red-500" />
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500">Alerts</p>

            <h2 className="text-5xl font-bold mt-3 text-orange-500">
              {alertCount}
            </h2>
          </div>

          <Bell size={44} className="text-orange-500" />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
