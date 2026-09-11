import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { X, MapPinned, Trash2 } from "lucide-react";

const GeofencePanel = ({
  showFencePanel,
  setShowFencePanel,
  setDrawingFence,
  radius,
  setRadius,
  geofences,
  deleteFence,
}) => {
  if (!showFencePanel) return null;

  return (
    <div
      className="
            absolute
            right-5
            top-20
            z-[1000]
            w-96
            rounded-3xl
            bg-white
            shadow-2xl
            border
            p-6
            "
    >
      {/* Header */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-xl p-2">
            <MapPinned size={22} className="text-blue-600" />
          </div>

          <div>
            <h2 className="font-bold text-lg">Geofences</h2>

            <p className="text-xs text-gray-500">
              Click anywhere on the map to create a geofence.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowFencePanel(false);

            setDrawingFence(false);
          }}
          className="hover:bg-gray-100 rounded-lg p-2"
        >
          <X size={18} />
        </button>
      </div>

      {/* Radius */}

      <div className="mt-6">
        <label className="text-sm font-medium">Radius</label>

        <Select
          value={radius.toString()}
          onValueChange={(value) => setRadius(Number(value))}
        >
          <SelectTrigger
            className="
                        mt-2
                        h-12
                        rounded-xl
                        "
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="rounded-xl">
            <SelectItem value="50">50 meters</SelectItem>

            <SelectItem value="100">100 meters</SelectItem>

            <SelectItem value="250">250 meters</SelectItem>

            <SelectItem value="500">500 meters</SelectItem>

            <SelectItem value="1000">1000 meters</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Existing Geofences */}

      <div className="mt-8">
        <h3 className="font-semibold mb-3">Existing Geofences</h3>

        {geofences.length === 0 ? (
          <div
            className="
                                rounded-xl
                                border
                                border-dashed
                                p-5
                                text-center
                                text-gray-400
                                "
          >
            No Geofence Created
          </div>
        ) : (
          <div
            className="
                                max-h-72
                                overflow-y-auto
                                space-y-3
                                "
          >
            {geofences.map((fence) => (
              <div
                key={fence.id}
                className="
                                            flex
                                            justify-between
                                            items-center
                                            rounded-xl
                                            border
                                            bg-slate-50
                                            p-4
                                            "
              >
                <div>
                  <h4 className="font-medium">{fence.name}</h4>

                  <p
                    className="
                                                    text-xs
                                                    text-gray-500
                                                    "
                  >
                    Radius : {fence.radius}m
                  </p>
                </div>

                <button
                  onClick={() => deleteFence(fence.id)}
                  className="
                                                p-2
                                                rounded-lg
                                                hover:bg-red-50
                                                text-red-600
                                                "
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeofencePanel;
