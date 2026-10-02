import { Routes, Route } from "react-router-dom";

// =========================
// AUTH
// =========================

import Login from "../Page/auth/Login";
import Signup from "../Page/auth/Signup";
import Landing from "../Page/Landing";
import GuestPreview from "../Page/auth/GuestPreview";

// =========================
// DASHBOARD
// =========================

import Dashboard from "../Page/home/Dashboard";

// =========================
// DEVICES
// =========================

import Devices from "../Page/device/Devices";
import CreateDevice from "../Page/device/CreateDevice";
import EditDevice from "../Page/device/EditDevice";

// =========================
// MAP
// =========================

import LiveMap from "../Page/map/LiveMap";

// =========================
// CONNECT DEVICE
// =========================

import ConnectDevice from "@/Page/device/ConnectDevice";

// =========================
// LAYOUT / SECURITY
// =========================

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ========================================= */}
      {/* ROOT */}
      {/* ========================================= */}

      <Route path="/" element={<Landing />} />

      {/* ========================================= */}
      {/* PUBLIC AUTH ROUTES */}
      {/* ========================================= */}

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/guest-preview" element={<GuestPreview />} />

      {/* ========================================= */}
      {/* QR DEVICE CONNECTION */}
      {/* ========================================= */}

      {/*
                IMPORTANT:

                This route is PUBLIC.

                Phone QR scan karega:

                /connect?deviceId=...&name=...&type=...

                Phone ko login ki zarurat nahi hai.
            */}

      <Route path="/connect" element={<ConnectDevice />} />

      {/* ========================================= */}
      {/* PROTECTED DASHBOARD ROUTES */}
      {/* ========================================= */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* ================= DASHBOARD ================= */}

        <Route path="/dashboard" element={<Dashboard />} />

        {/* ================= DEVICES ================= */}

        <Route path="/devices" element={<Devices />} />

        {/* ================= CREATE DEVICE ================= */}

        <Route path="/devices/new" element={<CreateDevice />} />

        {/* ================= DEVICE DETAILS ================= */}

        {/* ================= EDIT DEVICE ================= */}

        <Route path="/devices/:publicId/edit" element={<EditDevice />} />

        {/* ================= LIVE MAP ================= */}

        <Route path="/map" element={<LiveMap />} />
      </Route>

      {/* ========================================= */}
      {/* 404 */}
      {/* ========================================= */}

      <Route
        path="*"
        element={
          <h1 className="text-center mt-10 text-2xl">404 | Page Not Found</h1>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
