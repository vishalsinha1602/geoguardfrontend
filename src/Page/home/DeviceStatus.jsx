import RegisterDevice from "./RegisterDevice";

const DeviceStatus = ({ devices, alerts }) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg mt-8 p-8 border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            Registered Devices
          </h2>

          <p className="text-slate-500 mt-1">
            Current status of all registered devices
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-4 font-semibold text-slate-600">
                Device
              </th>

              <th className="text-left py-4 font-semibold text-slate-600">
                Type
              </th>

              <th className="text-left py-4 font-semibold text-slate-600">
                Status
              </th>

              <th className="text-left py-4 font-semibold text-slate-600">
                Last Seen
              </th>

              <th className="text-center py-4 font-semibold text-slate-600">
                Alert
              </th>
            </tr>
          </thead>

          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-500">
                  No Devices Found
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <RegisterDevice
                  key={device.publicId}
                  device={device}
                  alerts={alerts}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceStatus;
