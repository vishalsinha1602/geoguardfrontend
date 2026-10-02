import { useState, useEffect } from "react";

const DeviceForm = ({ initialData, onSubmit }) => {
  const [device, setDevice] = useState({
    name: "",
    type: "MOBILE",
  });

  useEffect(() => {
    if (initialData) {
      setDevice(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    setDevice({
      ...device,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(device);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Device Name"
        value={device.name}
        onChange={handleChange}
      />

      <br />
      <br />

      <select name="type" value={device.type} onChange={handleChange}>
        <option value="MOBILE">Mobile</option>
        <option value="LAPTOP">Laptop</option>
        <option value="VEHICLE">Vehicle</option>
        <option value="GPS_TRACKER">GPS Tracker</option>
        <option value="ESP32">ESP32</option>
      </select>

      <br />
      <br />

      <button type="submit">Save Device</button>
    </form>
  );
};

export default DeviceForm;
