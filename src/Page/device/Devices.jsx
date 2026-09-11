import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Plus,
  Smartphone,
  BatteryFull,
  Circle,
  Trash2,
  Edit,
} from "lucide-react";

import { getDevices, deleteDevice } from "../../api/deviceApi";

import { Spinner } from "@/components/ui/spinner";

const Devices = () => {
  const [devices, setDevices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await getDevices();

      console.log("DEVICES:", response.data);

      setDevices(response.data.data || []);
    } catch (error) {
      console.error("GET DEVICES ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE DEVICE
  // =========================

  const handleDelete = async (publicId, deviceName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${deviceName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(publicId);

      console.log("Deleting device:", publicId);

      const response = await deleteDevice(publicId);

      console.log("DELETE RESPONSE:", response.data);

      // Remove deleted device from UI
      setDevices((prevDevices) =>
        prevDevices.filter((device) => device.publicId !== publicId),
      );

      alert("Device deleted successfully.");
    } catch (error) {
      console.error("DELETE DEVICE ERROR:", error);

      console.error("STATUS:", error.response?.status);

      console.error("DATA:", error.response?.data);

      alert(error.response?.data?.message || "Unable to delete device.");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-3">
        <Spinner className="size-10 text-primary" />

        <p className="text-muted-foreground">Loading Devices...</p>
      </div>
    );
  }

  return (
    <div>
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">My Devices</h1>

          <p className="text-gray-500 mt-2">
            Manage all your connected devices.
          </p>
        </div>

        <Link
          to="/devices/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow"
        >
          <Plus size={20} />
          Add Device
        </Link>
      </div>

      {/* ========================= */}
      {/* EMPTY STATE */}
      {/* ========================= */}

      {devices.length === 0 && (
        <div className="bg-white rounded-xl shadow p-16 text-center">
          <Smartphone size={70} className="mx-auto text-gray-300" />

          <h2 className="text-2xl font-bold mt-6">No Devices Found</h2>

          <p className="text-gray-500 mt-2">
            Add your first device to start tracking.
          </p>

          <Link
            to="/devices/new"
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Add Device
          </Link>
        </div>
      )}

      {/* ========================= */}
      {/* DEVICE CARDS */}
      {/* ========================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {devices.map((device) => (
          <div
            key={device.publicId}
            className="bg-white rounded-xl shadow hover:shadow-xl transition p-6"
          >
            {/* ========================= */}
            {/* TOP */}
            {/* ========================= */}

            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{device.name}</h2>

                <p className="text-gray-500 mt-1">{device.type}</p>
              </div>

              <div className="flex items-center gap-2">
                <Circle
                  size={12}
                  fill={device.status === "ONLINE" ? "green" : "red"}
                  color={device.status === "ONLINE" ? "green" : "red"}
                />

                <span className="font-semibold">{device.status}</span>
              </div>
            </div>

            <hr className="my-5" />

            {/* ========================= */}
            {/* DEVICE INFO */}
            {/* ========================= */}

            <div className="space-y-3">
              {/* BATTERY */}

              <div className="flex justify-between">
                <span className="text-gray-500">Battery</span>

                <span className="flex items-center gap-2 font-semibold">
                  <BatteryFull size={18} />
                  {device.batteryLevel ?? 0}%
                </span>
              </div>

              {/* LAST SEEN */}

              <div className="flex justify-between">
                <span className="text-gray-500">Last Seen</span>

                <span>{device.lastSeen || "-"}</span>
              </div>
            </div>

            {/* ========================= */}
            {/* BUTTONS */}
            {/* ========================= */}

            <div className="flex gap-3 mt-8">
              {/* EDIT */}

              <Link
                to={`/devices/${device.publicId}/edit`}
                className="flex-1 flex items-center justify-center gap-2 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
              >
                <Edit size={17} />
                Edit
              </Link>

              {/* DELETE */}

              <button
                type="button"
                disabled={deletingId === device.publicId}
                onClick={() => handleDelete(device.publicId, device.name)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-2 rounded-lg transition"
              >
                <Trash2 size={17} />

                {deletingId === device.publicId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Devices;
