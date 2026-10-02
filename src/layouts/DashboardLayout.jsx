import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="dashboard-shell flex h-screen overflow-hidden">

      {/* Sidebar */}
      <aside className="dashboard-sidebar-wrapper w-72 bg-[#1E293B] flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Right Side */}
      <div className="dashboard-content flex flex-1 flex-col">

        {/* Navbar */}
        <Navbar />

        {/* Page */}
        <main className="dashboard-main flex-1 overflow-y-auto bg-slate-100 p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;
