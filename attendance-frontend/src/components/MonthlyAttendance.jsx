import { useState, useEffect } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function MonthlyAttendance() {
  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  // ================= STATE =================
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState(getCurrentMonth());
  const [attendance, setAttendance] = useState({});
  const [officeOffs, setOfficeOffs] = useState([]);
  const [showOffPicker, setShowOffPicker] = useState(false);
  const [offDate, setOffDate] = useState("");
  const [offReason, setOffReason] = useState("");

  // ================= LOAD EMPLOYEES =================
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await API.get("/employees");
        const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
        setEmployees(sorted);
      } catch (error) {
        console.log(error);
      }
    };
    fetchEmployees();
  }, []);

  // ================= GET TOTAL DAYS =================
  const [year, mon] = month.split("-");
  const totalDaysInMonth = new Date(year, mon, 0).getDate();

  // ================= GET SUNDAYS =================
  const getSundays = () => {
    const sundays = [];
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const date = new Date(year, mon - 1, i);
      if (date.getDay() === 0) sundays.push(i);
    }
    return sundays;
  };
  const sundays = getSundays();

  // ================= FETCH ATTENDANCE =================
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!month || employees.length === 0) return;

      try {
        const attendanceByAll = {};
        for (let emp of employees) {
          const res = await API.get(`/attendance/employee/${emp.employeeId}?month=${month}`);
          const empAttendance = res.data.reduce((acc, rec) => {
            const day = new Date(rec.date).getDate();
            acc[day] = rec.status === "Present" ? "P" : "A";
            return acc;
          }, {});
          attendanceByAll[emp._id] = empAttendance;
        }
        setAttendance(attendanceByAll);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAttendance();
  }, [month, employees]);

  // ================= OFFICE OFF =================
  const addOfficeOff = () => {
    if (!offDate || !offReason) return;

    const existsIndex = officeOffs.findIndex((o) => o.date === offDate);
    if (existsIndex >= 0) {
      const updated = [...officeOffs];
      updated[existsIndex].reason = offReason;
      setOfficeOffs(updated);
    } else {
      setOfficeOffs([...officeOffs, { date: offDate, reason: offReason }]);
    }

    setOffDate("");
    setOffReason("");
    setShowOffPicker(false);
  };

  const removeOfficeOff = (date) => {
    setOfficeOffs(officeOffs.filter((o) => o.date !== date));
  };

  const officeOffDays = [
    ...sundays,
    ...officeOffs
      .filter((o) => o.date.startsWith(month))
      .map((o) => Number(o.date.split("-")[2])),
  ];

  // ================= EXPORT TO EXCEL =================
  const exportToExcel = () => {
    const data = employees.map((emp) => {
      const empAttendance = attendance[emp._id] || {};
      const row = { Employee: emp.name };

      // Attendance for each day
      for (let i = 1; i <= totalDaysInMonth; i++) {
        const isOfficeOff = officeOffDays.includes(i);
        const status = isOfficeOff ? "OFF" : empAttendance[i] || "-";
        row[`Day ${i}`] = status;
      }

      // Calculate present, absent, salary
      const present = Object.values(empAttendance).filter((s) => s === "P").length;
      const absent = Object.values(empAttendance).filter((s) => s === "A").length;
      const paidLeaves = 2;
      const unpaidLeaves = Math.max(0, absent - paidLeaves);
      const salaryPerDay = emp.salary / totalDaysInMonth;
      const finalSalary = ((emp.salary) - salaryPerDay * unpaidLeaves).toFixed(2);

      row["Present"] = present;
      row["Absent"] = absent;
      row["Salary"] = finalSalary;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Attendance");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Attendance-${month}.xlsx`);
  };

  // ================= RENDER =================
  return (
    <div className="mx-auto max-w-full overflow-x-auto rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-3 shadow-2xl animate-[fadeIn_0.6s_ease-out] md:p-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 animate-[fadeIn_0.5s_ease-out]">
          Monthly Attendance Register
        </h2>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-start md:items-center">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 shadow-sm transition hover:shadow-md sm:w-auto"
          />

          <div className="relative flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              onClick={() => setShowOffPicker(!showOffPicker)}
              className="w-full rounded-lg bg-red-500 px-4 py-2 font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-red-600 hover:shadow-lg sm:w-auto"
            >
              Add Office Off
            </button>

            <button
              onClick={exportToExcel}
              className="w-full rounded-lg bg-green-500 px-4 py-2 font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-green-600 hover:shadow-lg sm:ml-2 sm:w-auto"
            >
              Export to Excel
            </button>

            {showOffPicker && (
              <div className="absolute right-0 mt-2 p-4 bg-white rounded-xl shadow-2xl border border-gray-200 animate-[fadeIn_0.5s_ease-out] w-64 z-20">
                <button
                  className="absolute top-1 right-2 text-gray-500 hover:text-red-500 font-bold text-lg"
                  onClick={() => setShowOffPicker(false)}
                >
                  ×
                </button>

                <label className="block font-semibold text-gray-700 mt-2">Date:</label>
                <input
                  type="date"
                  value={offDate}
                  onChange={(e) => setOffDate(e.target.value)}
                  className="w-full border p-2 rounded mb-2 hover:border-red-400 focus:ring-2 focus:ring-red-400 transition"
                />

                <label className="block font-semibold text-gray-700">Reason:</label>
                <input
                  type="text"
                  value={offReason}
                  onChange={(e) => setOffReason(e.target.value)}
                  placeholder="Holiday / Other"
                  className="w-full border p-2 rounded mb-2 hover:border-red-400 focus:ring-2 focus:ring-red-400 transition"
                />

                <button
                  onClick={addOfficeOff}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                >
                  Add / Update
                </button>

                {officeOffs.length > 0 && (
                  <div className="mt-3 max-h-32 overflow-y-auto border-t pt-2">
                    {officeOffs.map((o) => (
                      <div
                        key={o.date}
                        className="flex justify-between items-center bg-red-100 text-red-700 px-2 py-1 rounded mb-1 animate-[fadeIn_0.3s_ease-out]"
                      >
                        <span>{o.date.split("-")[2]} - {o.reason}</span>
                        <button className="font-bold" onClick={() => removeOfficeOff(o.date)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto shadow-lg rounded-2xl border border-gray-200">
        <table className="w-full border-collapse min-w-[900px]">
          <thead className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
            <tr>
              <th className="p-2 text-left">Employee</th>
              {[...Array(totalDaysInMonth)].map((_, i) => (
                <th key={i} className="p-1 text-center">{i + 1}</th>
              ))}
              <th className="p-2 text-center">Present</th>
              <th className="p-2 text-center">Absent</th>
              <th className="p-2 text-center">Salary</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => {
              const empAttendance = attendance[emp._id] || {};
              const present = Object.values(empAttendance).filter((s) => s === "P").length;
              const absent = Object.values(empAttendance).filter((s) => s === "A").length;
              const paidLeaves = 2;
              const unpaidLeaves = Math.max(0, absent - paidLeaves);
              const salaryPerDay = emp.salary / totalDaysInMonth;
              const finalSalary = ((emp.salary) - salaryPerDay * unpaidLeaves).toFixed(2);

              return (
                <tr key={emp._id} className={`${idx % 2 === 0 ? "bg-indigo-50" : "bg-purple-50"} transition-all duration-300`}>
                  <td className="p-2 font-medium text-gray-700">{emp.name}</td>
                  {[...Array(totalDaysInMonth)].map((_, dayIndex) => {
                    const day = dayIndex + 1;
                    const cell = empAttendance[day] || "";
                    const isOfficeOff = officeOffDays.includes(day);
                    const displayText = isOfficeOff ? "OFF" : cell || "-";

                    return (
                      <td key={day} className={`p-1 text-center text-xs sm:text-sm font-semibold ${
                        isOfficeOff
                          ? "bg-gray-200 text-gray-600"
                          : cell === "P"
                          ? "bg-green-200 text-green-800"
                          : cell === "A"
                          ? "bg-red-200 text-red-800"
                          : "text-gray-400"
                      }`}>
                        {displayText}
                      </td>
                    );
                  })}
                  <td className="p-2 text-center font-semibold text-green-700">{present}</td>
                  <td className="p-2 text-center font-semibold text-red-700">{absent}</td>
                  <td className="p-2 text-center font-semibold text-indigo-700">₹{finalSalary}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
