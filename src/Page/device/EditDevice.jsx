import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Smartphone,
  BatteryFull,
  Save,
  Cpu,
  Wifi,
} from "lucide-react";

import QRCode from "react-qr-code";

import { getDeviceById, updateDevice } from "../../api/deviceApi";

const EditDevice = () => {
  // ==============================
  // URL PARAM
  // ==============================

  const { publicId } = useParams();

  const navigate = useNavigate();

  // ==============================
  // STATE
  // ==============================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [device, setDevice] = useState({
    name: "",
    type: "MOBILE",
  });

  // ==============================
  // LOAD DEVICE
  // ==============================

  useEffect(() => {
    if (publicId) {
      loadDevice();
    }
  }, [publicId]);

  const loadDevice = async () => {
    try {
      const response = await getDeviceById(publicId);

      console.log("DEVICE RESPONSE:", response.data);

      setDevice(response.data.data);
    } catch (error) {
      console.error("LOAD DEVICE ERROR:", error);

      console.error("STATUS:", error.response?.status);

      console.error("DATA:", error.response?.data);

      alert("Unable to load device.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // HANDLE INPUT
  // ==============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDevice((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  // ==============================
  // QR DATA
  // ==============================

  /*
   * Same QR format as CreateDevice.jsx
   *
   * /connect
   * ?deviceId=...
   * &name=...
   * &type=...
   */

  const FRONTEND_URL = "http://10.226.9.235:5173";

  const qrData = device?.publicId
    ? `${FRONTEND_URL}/connect` +
      `?deviceId=${encodeURIComponent(device.publicId)}` +
      `&name=${encodeURIComponent(device.name || "")}` +
      `&type=${encodeURIComponent(device.type || "MOBILE")}`
    : "";

  // ==============================
  // UPDATE DEVICE
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation

    if (!device.name?.trim()) {
      alert("Please enter device name");

      return;
    }

    try {
      setSaving(true);

      const updateData = {
        name: device.name,

        type: device.type,
      };

      console.log("PUBLIC ID:", publicId);

      console.log("UPDATE DATA:", updateData);

      const response = await updateDevice(publicId, updateData);

      console.log("UPDATE RESPONSE:", response.data);

      alert("Device Updated Successfully");

      // Go to device details

      navigate(`/devices`);
    } catch (error) {
      console.error("UPDATE ERROR:", error);

      console.error("STATUS:", error.response?.status);

      console.error("DATA:", error.response?.data);

      alert(error.response?.data?.message || "Unable to update device");
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <h2 className="text-2xl font-semibold text-slate-700">Loading...</h2>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <div className="max-w-7xl mx-auto">
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="flex justify-between items-center mb-10">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="
                            flex
                            items-center
                            gap-2
                            text-slate-600
                            hover:text-blue-600
                            mb-3
                        "
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <h1 className="text-4xl font-bold text-slate-800">Edit Device</h1>

          <p className="text-slate-500 mt-2">Update device configuration</p>
        </div>

        {/* SAVE BUTTON */}

        <button
          form="editForm"
          type="submit"
          disabled={saving}
          className="
                        flex
                        items-center
                        gap-2
                        bg-blue-600
                        hover:bg-blue-700
                        disabled:bg-blue-400
                        text-white
                        px-6
                        py-3
                        rounded-xl
                        shadow-lg
                        transition
                    "
        >
          <Save size={18} />

          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* ================================= */}
      {/* MAIN GRID */}
      {/* ================================= */}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ================================= */}
        {/* LEFT SIDE - FORM */}
        {/* ================================= */}

        <div className="lg:col-span-2">
          <form
            id="editForm"
            onSubmit={handleSubmit}
            className="
                            bg-white
                            rounded-3xl
                            shadow-xl
                            p-8
                            border
                            border-slate-200
                        "
          >
            <h2 className="text-2xl font-bold mb-8">Device Information</h2>

            <div className="space-y-6">
              {/* ============================= */}
              {/* DEVICE NAME */}
              {/* ============================= */}

              <div>
                <label className="block mb-2 font-medium">Device Name</label>

                <input
                  type="text"
                  name="name"
                  value={device.name || ""}
                  onChange={handleChange}
                  disabled={saving}
                  className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-300
                                        px-4
                                        py-3
                                        focus:ring-2
                                        focus:ring-blue-500
                                        outline-none
                                        disabled:bg-slate-100
                                    "
                />
              </div>

              {/* ============================= */}
              {/* DEVICE TYPE */}
              {/* ============================= */}

              <div>
                <label className="block mb-2 font-medium">Device Type</label>

                <select
                  name="type"
                  value={device.type || "MOBILE"}
                  onChange={handleChange}
                  disabled={saving}
                  className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-300
                                        px-4
                                        py-3
                                        focus:ring-2
                                        focus:ring-blue-500
                                        outline-none
                                        disabled:bg-slate-100
                                    "
                >
                  <option value="MOBILE">Mobile</option>

                  <option value="LAPTOP">Laptop</option>

                  <option value="VEHICLE">Vehicle</option>

                  <option value="ESP32">ESP32</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

        <div>
          <div
            className="
                            bg-slate-900
                            rounded-3xl
                            text-white
                            p-8
                            shadow-xl
                            sticky
                            top-24
                        "
          >
            {/* ================================= */}
            {/* DEVICE ICON */}
            {/* ================================= */}

            <div className="flex justify-center mb-5">
              <div
                className="
                                    w-20
                                    h-20
                                    rounded-full
                                    bg-blue-600
                                    flex
                                    items-center
                                    justify-center
                                "
              >
                <Smartphone size={40} />
              </div>
            </div>

            {/* ================================= */}
            {/* PERMANENT QR CODE */}
            {/* ================================= */}

            {qrData && (
              <div className="mb-6">
                <div className="flex justify-center">
                  <div
                    className="
                                            bg-white
                                            p-4
                                            rounded-2xl
                                            shadow-lg
                                        "
                  >
                    <QRCode value={qrData} size={180} />
                  </div>
                </div>

                <p
                  className="
                                        text-center
                                        text-xs
                                        text-slate-400
                                        mt-3
                                    "
                >
                  Scan to connect this device
                </p>
              </div>
            )}

            {/* ================================= */}
            {/* DEVICE NAME */}
            {/* ================================= */}

            <h2 className="text-2xl font-bold text-center">
              {device.name || "Device"}
            </h2>

            {/* DEVICE TYPE */}

            <p
              className="
                                text-center
                                text-slate-400
                                mt-1
                            "
            >
              {device.type}
            </p>

            {/* ================================= */}
            {/* DEVICE INFORMATION */}
            {/* ================================= */}

            <div className="mt-8 space-y-5">
              {/* STATUS */}

              <div className="flex justify-between items-center">
                <span>Status</span>

                <span className="text-green-400 font-semibold">
                  ● {device.status || "UNKNOWN"}
                </span>
              </div>

              {/* BATTERY */}

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <BatteryFull size={18} />
                  Battery
                </span>

                <span>{device.batteryLevel ?? 0}%</span>
              </div>

              {/* TYPE */}

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Cpu size={18} />
                  Type
                </span>

                <span>{device.type || "-"}</span>
              </div>

              {/* LAST SEEN */}

              <div className="flex justify-between items-center gap-4">
                <span className="flex items-center gap-2">
                  <Wifi size={18} />
                  Last Seen
                </span>

                <span
                  className="
                                        text-sm
                                        text-right
                                        break-all
                                    "
                >
                  {device.lastSeen || "-"}
                </span>
              </div>
            </div>

            {/* ================================= */}
            {/* SEPARATOR */}
            {/* ================================= */}

            <hr className="my-8 border-slate-700" />

            {/* ================================= */}
            {/* DEVICE ID */}
            {/* ================================= */}

            <div>
              <p className="text-xs text-slate-400">Device ID</p>

              <p
                className="
                                    text-xs
                                    break-all
                                    mt-2
                                "
              >
                {device.publicId}
              </p>
            </div>

            {/* ================================= */}
            {/* QR URL - OPTIONAL DEBUG */}
            {/* ================================= */}

            <div className="mt-6">
              <p className="text-xs text-slate-500">QR URL</p>

              <p
                className="
                                    text-[10px]
                                    text-slate-500
                                    break-all
                                    mt-2
                                "
              >
                {qrData}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDevice;
