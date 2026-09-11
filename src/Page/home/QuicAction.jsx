import { Link } from "react-router-dom";
import { ArrowRight, Smartphone, Navigation } from "lucide-react";

const QuicAction = () => {
  return (
    <>
      <Link
        to="/map"
        className="group rounded-3xl overflow-hidden
                bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700
                text-white p-8 shadow-xl hover:scale-[1.02]
                transition duration-300"
      >
        <div className="flex justify-between items-start">
          <Navigation className="w-10 h-10" />

          <ArrowRight className="group-hover:translate-x-2 transition" />
        </div>

        <h2 className="text-3xl font-bold mt-12">Live Tracking</h2>

        <p className="mt-3 text-blue-100">
          Start live GPS tracking and monitor your selected device.
        </p>
      </Link>

      <Link
        to="/devices"
        className="bg-white rounded-3xl shadow-lg
                border border-slate-100 p-8
                hover:shadow-xl transition"
      >
        <Smartphone className="w-10 h-10 text-blue-600 mb-10" />

        <h2 className="text-2xl font-bold">Devices</h2>

        <p className="text-slate-500 mt-3">Register and manage your devices.</p>
      </Link>
    </>
  );
};

export default QuicAction;
