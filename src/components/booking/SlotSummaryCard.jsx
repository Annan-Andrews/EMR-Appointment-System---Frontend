import { Stethoscope, Calendar, Clock } from "lucide-react";
import { formatDate, formatTime } from "../../utils/dateUtils";

const SlotSummaryCard = ({ doctor, slotDate, slotStart, slotEnd }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">
      Selected Slot
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 bg-blue-100 rounded-lg flex items-center
                        justify-center flex-shrink-0"
        >
          <Stethoscope size={18} className="text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-blue-400">Doctor</p>
          <p className="text-sm font-semibold text-blue-800">
            {doctor?.name || "Unknown"}
          </p>
          {doctor?.department && (
            <p className="text-xs text-blue-500">{doctor.department}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 bg-blue-100 rounded-lg flex items-center
                        justify-center flex-shrink-0"
        >
          <Calendar size={18} className="text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-blue-400">Date</p>
          <p className="text-sm font-semibold text-blue-800">
            {formatDate(slotDate)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 bg-blue-100 rounded-lg flex items-center
                        justify-center flex-shrink-0"
        >
          <Clock size={18} className="text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-blue-400">Time</p>
          <p className="text-sm font-semibold text-blue-800">
            {formatTime(slotStart)} — {formatTime(slotEnd)}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default SlotSummaryCard;
