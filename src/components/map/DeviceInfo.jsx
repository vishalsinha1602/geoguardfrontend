import { format } from "date-fns";

import {
  Battery,
  MapPin,
  Clock,
  Activity,
  Gauge,
  Smartphone,
} from "lucide-react";

const DeviceInfo = ({ selectedDevice, location }) => {
  if (!selectedDevice) {
    return (
      <div className="h-full bg-white rounded-3xl shadow-2xl flex items-center justify-center">
        <h2 className="text-xl font-semibold text-slate-500">
          Select a Device
        </h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl  shadow-2xl h-full p-6 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-8">
        Device Information
      </h2>

      {/* Device */}

      <div className="flex items-center gap-4 mb-8  ">
        <div className="bg-blue-100 p-3 rounded-2xl">
          <Smartphone size={28} className="text-blue-600" />
        </div>

        <div>
          <h3 className="text-xl font-bold">{selectedDevice.name}</h3>

          <p className="text-slate-500">{selectedDevice.type}</p>
        </div>
      </div>

      <div className="space-y-5">
        <InfoRow
          icon={<Activity className="text-green-600" />}
          title="Status"
          value={selectedDevice.status ?? "--"}
        />

        <InfoRow
          icon={<Battery className="text-yellow-500" />}
          title="Battery"
          value={`${selectedDevice.batteryLevel ?? "--"}%`}
        />

        <InfoRow
          icon={<MapPin className="text-red-500" />}
          title="Latitude"
          value={
            location?.latitude != null
              ? Number(location.latitude).toFixed(7)
              : "--"
          }
        />

        <InfoRow
          icon={<MapPin className="text-red-500" />}
          title="Longitude"
          value={
            location?.longitude != null
              ? Number(location.longitude).toFixed(7)
              : "--"
          }
        />

        <InfoRow
          icon={<Gauge className="text-blue-600" />}
          title="Speed"
          value={`${location?.speed ?? 0} km/h`}
        />

        <InfoRow
          icon={<Clock className="text-orange-500" />}
          title="Last Update"
          value={
            location?.receivedAt
              ? format(new Date(location.receivedAt), "dd MMM yyyy, hh:mm:ss a")
              : selectedDevice?.lastSeen
                ? format(
                    new Date(selectedDevice.lastSeen),
                    "dd MMM yyyy, hh:mm:ss a",
                  )
                : "--"
          }
        />
      </div>
    </div>
  );
};

const InfoRow = ({ icon, title, value }) => (
  <div className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition rounded-2xl p-4">
    <div className="flex items-center gap-3">
      {icon}

      <span className="font-medium text-slate-600">{title}</span>
    </div>

    <span className="font-bold text-slate-800">{value}</span>
  </div>
);

export default DeviceInfo;
