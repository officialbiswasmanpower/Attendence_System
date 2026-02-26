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
    <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-2xl animate-[fadeIn_0.6s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
          My Monthly Attendance
        </h2>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg shadow-sm hover:shadow-md transition"
        />
      </div>

      {/* Attendance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {[...Array(totalDaysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateObj = new Date(year, monthIndex - 1, day);
          const dayName = getDayName(day);
          const record = attendance.find(a => new Date(a.date).getDate() === day);
          const status = record ? record.status : "-";

          const isSunday = dateObj.getDay() === 0;

          const bgClass =
            status === "Present" ? "bg-green-100 text-green-800" :
            status === "Absent" ? "bg-red-100 text-red-800" :
            "bg-gray-100 text-gray-600";

          return (
            <div
              key={day}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-xl shadow-md transition-transform hover:scale-105 cursor-default
                ${isSunday ? "bg-red-200 text-red-800 font-bold" : bgClass}`}
            >
              <span className="text-sm text-gray-500">{dayName}</span>
              <span className="text-lg font-semibold">{day}</span>
              <span className="mt-1 text-sm">{status}</span>

              {/* Tooltip on hover */}
              {record && record.status === "Present" && (record.checkIn || record.checkOut) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-20">
                  <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    {record.checkIn && <div>🟢 In: {record.checkIn}</div>}
                    {record.checkOut && <div>🔴 Out: {record.checkOut}</div>}
                    {!record.checkOut && <div className="text-yellow-300">⏳ Not checked out</div>}
                  </div>
                  <div className="w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
