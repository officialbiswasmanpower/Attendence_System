import { useState, useEffect } from "react";
import API from "../api";

export default function EmpMonthlyAttendance({ employeeId }) {
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const [month, setMonth] = useState(getCurrentMonth());
  const [attendance, setAttendance] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [activeDay, setActiveDay] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await API.get(`/employees/${employeeId}`);
        setEmployee(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEmployee();
  }, [employeeId]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!month || !employeeId) return;
      try {
        const res = await API.get(`/attendance/employee/${employeeId}?month=${month}`);
        setAttendance(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAttendance();
  }, [month, employeeId]);

  const [year, monthIndex] = month.split("-").map(Number);
  const totalDaysInMonth = new Date(year, monthIndex, 0).getDate();

  if (!employee) return <div>Loading...</div>;

  const getDayName = (day) => {
    const date = new Date(year, monthIndex - 1, day);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div className="rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-3 shadow-2xl animate-[fadeIn_0.6s_ease-out] sm:p-4 md:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h2 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
          My Monthly Attendance
        </h2>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 shadow-sm transition hover:shadow-md sm:w-auto"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-7">
        {[...Array(totalDaysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateObj = new Date(year, monthIndex - 1, day);
          const dayName = getDayName(day);
          const record = attendance.find((a) => new Date(a.date).getDate() === day);
          const status = record ? record.status : "-";
          const isSunday = dateObj.getDay() === 0;
          const hasTimeInfo =
            record && record.status === "Present" && (record.checkIn || record.checkOut);

          const bgClass =
            status === "Present"
              ? "bg-green-100 text-green-800"
              : status === "Absent"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-600";

          return (
            <div
              key={day}
              className={`group relative flex flex-col items-center justify-center rounded-xl p-3 text-center shadow-md transition-transform hover:scale-105 ${
                isSunday ? "bg-red-200 font-bold text-red-800" : bgClass
              }`}
            >
              <span className="text-sm text-gray-500">{dayName}</span>
              <span className="text-lg font-semibold">{day}</span>
              <span className="mt-1 text-sm">{status}</span>

              {hasTimeInfo && (
                <button
                  type="button"
                  onClick={() => setActiveDay(activeDay === day ? null : day)}
                  className="mt-2 rounded-md bg-black/10 px-2 py-1 text-xs font-semibold text-gray-700 md:hidden"
                >
                  {activeDay === day ? "Hide Time" : "View Time"}
                </button>
              )}

              {hasTimeInfo && (
                <div className="absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 flex-col items-center md:group-hover:flex">
                  <div className="whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-xs text-white shadow-lg">
                    {record.checkIn && <div>In: {record.checkIn}</div>}
                    {record.checkOut && <div>Out: {record.checkOut}</div>}
                    {!record.checkOut && <div className="text-yellow-300">Not checked out</div>}
                  </div>
                  <div className="-mt-1 h-2 w-2 rotate-45 bg-gray-800"></div>
                </div>
              )}

              {hasTimeInfo && activeDay === day && (
                <div className="mt-2 w-full rounded-lg bg-gray-800 px-2 py-2 text-xs text-white md:hidden">
                  {record.checkIn && <div>In: {record.checkIn}</div>}
                  {record.checkOut && <div>Out: {record.checkOut}</div>}
                  {!record.checkOut && <div className="text-yellow-300">Not checked out</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
