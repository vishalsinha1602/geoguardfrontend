import React from "react";
import {
  Smartphone,
  Battery,
  Gauge,
  Wifi,
  WifiOff,
  MoreVertical,
} from "lucide-react";

const DeviceList = ({ devices, selectedDevice, setSelectedDevice }) => {
  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((device) => {
          const online = device.status === "ONLINE";

          return (
            <div
              key={device.publicId}
              onClick={() => setSelectedDevice(device)}
              className={`cursor-pointer rounded-2xl border transition-all duration-300
              ${
                selectedDevice?.publicId === device.publicId
                  ? "border-blue-500 bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl scale-[1.02]"
                  : "  hover:border-blue-500 hover:-translate-y-1 hover:shadow-xl"
              }`}
            >
              <div className="p-5">
                {/* Header */}

                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center
                      ${
                        selectedDevice?.publicId === device.publicId
                          ? "bg-white/10"
                          : "bg-blue-600/20"
                      }`}
                    >
                      <Smartphone className="h-7 w-7 text-blue-400" />
                    </div>

                    <div>
                      <h3
                        className={`font-bold text-lg ${
                          selectedDevice?.publicId === device.publicId
                            ? "text-white"
                            : "text-white"
                        }`}
                      >
                        {device.name}
                      </h3>

                      <p className="text-slate-400 text-sm uppercase">
                        {device.type}
                      </p>
                    </div>
                  </div>

                  <MoreVertical className="text-slate-500" />
                </div>

                {/* Status */}

                <div className="mt-5 flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold
                    ${
                      online
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {online ? "ONLINE" : "OFFLINE"}
                  </span>

                  {online ? (
                    <Wifi className="text-green-400 h-5 w-5" />
                  ) : (
                    <WifiOff className="text-red-400 h-5 w-5" />
                  )}
                </div>

                {/* Bottom */}

                <div className="mt-6 flex justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Battery className="h-4 w-4 text-green-400" />

                    <span className="text-sm">
                      {device.batteryLevel ?? "--"}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Gauge className="h-4 w-4 text-purple-400" />

                    <span className="text-sm">{device.speed ?? 0} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeviceList;
