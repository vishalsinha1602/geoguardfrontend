import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";

import { createDevice, issueDeviceKey } from "../../api/deviceApi";

const CreateDevice = () => {
  const navigate = useNavigate();

  // ==============================
  // Device Form
  // ==============================

  const [device, setDevice] = useState({
    name: "",
    type: "MOBILE",
  });

  // Created Device
  const [createdDevice, setCreatedDevice] = useState(null);

  const [loading, setLoading] = useState(false);
  const [deviceKey, setDeviceKey] = useState("");
  const [keyLoading, setKeyLoading] = useState(false);

  // ==============================
  // Handle Input
  // ==============================

  const handleChange = (e) => {
    setDevice((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ==============================
  // Create Device
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!device.name.trim()) {
      alert("Please enter device name");
      return;
    }

    try {
      setLoading(true);

      const response = await createDevice(device);

      console.log("========== CREATE DEVICE ==========");
      console.log("Full Response:", response);
      console.log("Response Data:", response?.data);

      /*
        Backend response example:

        {
          data: {
            publicId: "...",
            name: "...",
            type: "MOBILE"
          },
          error: null,
          timeStamp: "..."
        }
      */

      const created = response?.data?.data || response?.data || response;

      console.log("Created Device:", created);

      // Validate Device ID
      if (!created?.publicId) {
        console.error("❌ Public ID missing", created);

        alert("Device created but Device ID was not returned.");

        return;
      }

      // Save Created Device
      setCreatedDevice(created);
      if (created.type === "ESP32" || created.type === "GPS_TRACKER") {
        await handleIssueDeviceKey(created.publicId);
      }
    } catch (error) {
      console.error("❌ Create Device Error:", error);

      console.error("Backend Response:", error?.response?.data);

      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message;

      if (status === 401) {
        alert("Your login session expired after switching the local backend database. Log out, then sign in again with the account in the Render database.");
      } else {
        alert(backendMessage || `Unable to create device${status ? ` (HTTP ${status})` : ""}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIssueDeviceKey = async (publicId = createdDevice?.publicId) => {
    if (!publicId) return;
    try {
      setKeyLoading(true);
      const keyResponse = await issueDeviceKey(publicId);
      setDeviceKey(keyResponse?.data?.data?.deviceKey || keyResponse?.data?.deviceKey || "");
    } catch (error) {
      console.error("Device key issue failed:", error?.response?.data || error);
      alert("Device was created, but its IoT key could not be issued. Tap Generate IoT Key to retry.");
    } finally {
      setKeyLoading(false);
    }
  };

  // ==============================
  // FRONTEND URL
  // ==============================

  /*
    Automatically detects:

    Local:
    http://localhost:5173

    Production:
    https://your-frontend.onrender.com
  */

  const FRONTEND_URL = window.location.origin;

  // ==============================
  // QR DATA
  // ==============================

  const qrData = createdDevice
    ? `${FRONTEND_URL}/connect?` +
      `deviceId=${encodeURIComponent(createdDevice.publicId)}` +
      `&name=${encodeURIComponent(createdDevice.name)}` +
      `&type=${encodeURIComponent(createdDevice.type)}`
    : "";

  // ==============================
  // Create Another Device
  // ==============================

  const handleCreateAnother = () => {
    setCreatedDevice(null);
    setDeviceKey("");

    setDevice({
      name: "",
      type: "MOBILE",
    });
  };

  // ==============================
  // UI
  // ==============================

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* ==============================
            HEADER
        ============================== */}

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Device</h1>

        <p className="text-gray-500 mb-8">Register a new device in GeoGuard</p>

        {/* ==============================
            FORM
        ============================== */}

        {!createdDevice && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* DEVICE NAME */}

            <div>
              <label className="block mb-2 font-semibold">Device Name</label>

              <input
                type="text"
                name="name"
                value={device.name}
                onChange={handleChange}
                placeholder="Enter device name"
                required
                disabled={loading}
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-lg
                  p-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  disabled:bg-gray-100
                "
              />
            </div>

            {/* DEVICE TYPE */}

            <div>
              <label className="block mb-2 font-semibold">Device Type</label>

              <select
                name="type"
                value={device.type}
                onChange={handleChange}
                disabled={loading}
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-lg
                  p-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  disabled:bg-gray-100
                "
              >
                <option value="MOBILE">Mobile</option>

                <option value="LAPTOP">Laptop</option>

                <option value="VEHICLE">Vehicle</option>

                <option value="GPS_TRACKER">GPS Tracker</option>
                <option value="ESP32">ESP32</option>
              </select>
            </div>

            {/* BUTTONS */}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:bg-blue-400
                  text-white
                  px-6
                  py-3
                  rounded-lg
                  transition
                "
              >
                {loading ? "Creating..." : "Create Device"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => navigate("/devices")}
                className="
                  bg-gray-300
                  hover:bg-gray-400
                  disabled:bg-gray-200
                  px-6
                  py-3
                  rounded-lg
                "
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ==============================
            CREATED DEVICE
        ============================== */}

        {createdDevice && (
          <div className="space-y-6">
            {/* SUCCESS */}

            <div
              className="
                rounded-xl
                border
                border-green-200
                bg-green-50
                p-5
              "
            >
              <h2
                className="
                  text-xl
                  font-bold
                  text-green-700
                "
              >
                ✓ Device Created Successfully
              </h2>

              <p
                className="
                  text-green-600
                  mt-1
                "
              >
                {createdDevice.type === "ESP32" || createdDevice.type === "GPS_TRACKER"
                  ? "Use the ID and key below to connect your Rakshak ESP32."
                  : "Scan this QR code from the phone you want to connect."}
              </p>
            </div>

            {/* ==============================
                DEVICE INFORMATION
            ============================== */}

            <div
              className="
                rounded-xl
                border
                bg-gray-50
                p-5
              "
            >
              <h2
                className="
                  text-xl
                  font-bold
                  text-gray-800
                  mb-4
                "
              >
                Device Information
              </h2>

              <div className="space-y-4">
                {/* NAME */}

                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>

                  <span className="font-semibold">{createdDevice.name}</span>
                </div>

                {/* TYPE */}

                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>

                  <span className="font-semibold">{createdDevice.type}</span>
                </div>

                {/* DEVICE ID */}

                <div>
                  <p
                    className="
                      text-gray-500
                      mb-1
                    "
                  >
                    Device ID
                  </p>

                  <p
                    className="
                      font-mono
                      text-sm
                      break-all
                      bg-white
                      border
                      rounded-lg
                      p-3
                    "
                  >
                    {createdDevice.publicId}
                  </p>
                </div>
              </div>
            </div>

            {/* ==============================
                QR CODE
            ============================== */}

            <div
              className="
                rounded-xl
                border
                bg-white
                p-6
              "
            >
              <h2
                className="
                  text-2xl
                  font-bold
                  text-center
                "
              >
                {createdDevice.type === "ESP32" || createdDevice.type === "GPS_TRACKER"
                  ? "Configure ESP32"
                  : "Scan to Connect"}
              </h2>

              <p
                className="
                  text-gray-500
                  text-center
                  mt-2
                  mb-6
                "
              >
                {createdDevice.type === "ESP32" || createdDevice.type === "GPS_TRACKER"
                  ? "Copy these credentials into Rakshak/secrets.h, then upload the sketch to your ESP32."
                  : "Scan this QR code using the phone that you want to track."}
              </p>

              {createdDevice.type !== "ESP32" && createdDevice.type !== "GPS_TRACKER" && <div className="flex justify-center">
                <div
                  className="
                    p-4
                    bg-white
                    border
                    rounded-xl
                    shadow
                  "
                >
                  {qrData && <QRCode value={qrData} size={220} />}
                </div>
              </div>}

              {(createdDevice.type === "ESP32" || createdDevice.type === "GPS_TRACKER") && (
                <div className="space-y-3 rounded-xl bg-slate-50 border p-4">
                  <div><b>GEOGUARD_DEVICE_PUBLIC_ID</b><p className="font-mono text-xs break-all">{createdDevice.publicId}</p></div>
                  <div><b>GEOGUARD_DEVICE_KEY (shown once)</b><p className="font-mono text-xs break-all">{deviceKey || "No key issued yet."}</p></div>
                  {!deviceKey && <button type="button" disabled={keyLoading} onClick={() => handleIssueDeviceKey()} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60">{keyLoading ? "Generating..." : "Generate IoT Key"}</button>}
                  <p className="text-sm text-slate-600">Keep this key private. Add both values to secrets.h. The ESP32 sends a GPS update every 10 seconds while it has a fix.</p>
                </div>
              )}

              <p
                className="
                  text-center
                  text-sm
                  text-gray-500
                  mt-5
                "
              >
                {createdDevice.type === "ESP32" || createdDevice.type === "GPS_TRACKER"
                  ? "Power on ESP32 → connect Wi-Fi → wait for GPS fix"
                  : "Scan → Open Chrome → Allow Location"}
              </p>
            </div>

            {/* ==============================
                QR URL DEBUG
            ============================== */}

            {createdDevice.type !== "ESP32" && createdDevice.type !== "GPS_TRACKER" && <div
              className="
                bg-gray-50
                border
                rounded-xl
                p-4
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-600
                  mb-2
                "
              >
                QR URL
              </p>

              <p
                className="
                  text-xs
                  font-mono
                  break-all
                  text-gray-500
                "
              >
                {qrData}
              </p>
            </div>}

            {/* ==============================
                BUTTONS
            ============================== */}

            <div className="flex gap-4">
              <button
                onClick={handleCreateAnother}
                className="
                  flex-1
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-6
                  py-3
                  rounded-lg
                "
              >
                Create Another Device
              </button>

              <button
                onClick={() => navigate("/devices")}
                className="
                  flex-1
                  bg-gray-300
                  hover:bg-gray-400
                  px-6
                  py-3
                  rounded-lg
                "
              >
                Back to Devices
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateDevice;
