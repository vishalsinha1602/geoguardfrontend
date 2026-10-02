import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Laptop,
  Map,
  Settings,
  ShieldCheck,
} from "lucide-react";

const Sidebar = () => {
  const menus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Devices",
      path: "/devices",
      icon: Laptop,
    },
    {
      name: "Live Map",
      path: "/map",
      icon: Map,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="dashboard-sidebar flex h-full flex-col border-r border-olive-400">
      {/* Logo */}

      <div className="sidebar-brand border-b border-slate-800 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <img src="/geoguard-shield.svg" alt="" className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">GeoGuard</h2>

            <p className="text-xs text-slate-400">Tracking System</p>
          </div>
        </div>
      </div>

      {/* Menu */}

      <nav className="dashboard-nav flex-1 p-4 space-y-5">
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `dashboard-nav-link flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}

      <div className="sidebar-footer border-t border-slate-800 p-5">
        <div className="rounded-xl bg-slate-800 p-4">
          <h3 className="font-semibold text-white">GeoGuard</h3>

          <p className="mt-2 text-sm text-slate-400">
            Monitor devices in real-time and stay protected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
