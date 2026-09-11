import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <div className="w-72 bg-[#1E293B] flex-shrink-0">
        <Sidebar />
      </div>

      {/* Right Side */}
      <div className="flex flex-1 flex-col">

        {/* Navbar */}
        <Navbar />

        {/* Page */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;
