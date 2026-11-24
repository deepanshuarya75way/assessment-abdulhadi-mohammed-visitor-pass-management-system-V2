import { useEffect } from "react";

const amHours = ["09", "10", "11"];
const pmHours = ["12", "01", "02", "03", "04", "05"];
const minutesList = ["00", "15", "30", "45"];

export const buildISOFromParts = (date, hour, minute, period) => {
  let militaryHour = parseInt(hour, 10);
  if (period === "PM" && militaryHour !== 12) {
    militaryHour += 12;
  } else if (period === "AM" && militaryHour === 12) {
    militaryHour = 0;
  }
  const formattedHour = militaryHour.toString().padStart(2, "0");
  return new Date(`${date}T${formattedHour}:${minute}:00`).toISOString();
};

const DateTimePicker = ({
  date,
  setDate,
  hour,
  setHour,
  minute,
  setMinute,
  period,
  setPeriod,
}) => {
  const currentHours = period === "AM" ? amHours : pmHours;

  useEffect(() => {
    if (period === "AM" && !amHours.includes(hour)) setHour("09");
    if (period === "PM" && !pmHours.includes(hour)) setHour("12");
  }, [period, hour, setHour]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Date
        </label>
        <input
          type="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
          required
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
        />
      </div>

      <div className="flex w-full rounded-lg shadow-sm">
        <button
          type="button"
          onClick={() => setPeriod("AM")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-l-lg border border-r-0 transition-colors cursor-pointer ${
            period === "AM"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-slate-50 text-gray-500 border-gray-200 hover:bg-gray-100"
          }`}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => setPeriod("PM")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-r-lg border transition-colors cursor-pointer ${
            period === "PM"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-slate-50 text-gray-500 border-gray-200 hover:bg-gray-100"
          }`}
        >
          PM
        </button>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Hour
          </label>
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-center appearance-none"
          >
            {currentHours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-none flex items-center justify-center pb-2.5 font-bold text-gray-400">
          :
        </div>

        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Minute
          </label>
          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-center appearance-none"
          >
            {minutesList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DateTimePicker;
