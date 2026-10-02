import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import { Bell, LogOut } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="dashboard-navbar h-20 bg-[#1E293B] border-b border-slate-800 px-8 flex items-center justify-between">
      {/* Left */}

      <div>
        <p className="text-lg font-bold text-slate-400">Welcome</p>
      </div>

      {/* Right */}

      <div className="dashboard-navbar-actions flex items-center gap-10">
        <button className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition">
          <Bell className="text-white" size={20} />

          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
