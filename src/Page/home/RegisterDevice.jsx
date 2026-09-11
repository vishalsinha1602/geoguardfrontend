import { Bell } from "lucide-react";

const RegisterDevice = ({ device, alerts }) => {
  const online = device.status === "ONLINE";

  const hasAlert = alerts.some(
    (alert) => alert.devicePublicId === device.publicId,
  );

  const unreadCount = alerts.filter(
    (alert) => alert.devicePublicId === device.publicId && !alert.read,
  ).length;

  const getLastSeen = (lastSeen) => {
    if (!lastSeen) return "--";

    const now = new Date();
    const time = new Date(lastSeen);

    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return `${diff} sec ago`;

    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;

    if (diff < 86400) return `${Math.floor(diff / 3600)} hour ago`;

    return time.toLocaleDateString();
  };

  return (
    <tr className="border-b hover:bg-slate-50 transition">
      {/* Device */}
      <td className="py-5">
        <div>
          <p className="font-semibold text-slate-800">{device.name}</p>

          <p className="text-sm text-slate-500">{device.publicId}</p>
        </div>
      </td>

      {/* Type */}
      <td className="py-5">{device.type}</td>

      {/* Status */}
      <td className="py-5">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {device.status}
        </span>
      </td>

      {/* Last Seen */}
      <td className="py-5">{getLastSeen(device.lastSeen)}</td>

      {/* Alert */}
      <td className="py-5 text-center">
        <div className="relative inline-block">
          <button
            disabled={!online}
            className={`p-3 rounded-full transition-all duration-300 ${
              hasAlert
                ? "bg-red-600 text-white animate-pulse"
                : online
                  ? "bg-gray-200 text-gray-600"
                  : "bg-gray-100 text-gray-400"
            }`}
          >
            <Bell size={18} />
          </button>

          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1
                            bg-red-600 text-white
                            rounded-full
                            w-5 h-5
                            text-[11px]
                            flex items-center justify-center"
            >
              {unreadCount}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
};

export default RegisterDevice;
