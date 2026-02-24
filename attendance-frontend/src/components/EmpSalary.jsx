import { useEffect, useState } from "react";
import API from "../api";

export default function EmpSalary({ employeeId }) {
  const [salaryInfo, setSalaryInfo] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        // Fetch attendance
        const res = await API.get(`/attendance/employee/${employeeId}?month=${month}`);
        const attendance = res.data;

        const present = attendance.filter(a => a.status === "Present").length;
        const absent = attendance.filter(a => a.status === "Absent").length;
        const paidLeaves = 2;
        const unpaidLeaves = Math.max(0, absent - paidLeaves);

        // Fetch employee info
        const empRes = await API.get(`/employees/${employeeId}`);
        const salaryPerDay = empRes.data.salary / new Date(month.split("-")[0], month.split("-")[1], 0).getDate();
        const finalSalary = (empRes.data.salary - salaryPerDay * unpaidLeaves).toFixed(2);

        setSalaryInfo({ present, absent, unpaidLeaves, finalSalary, totalSalary: empRes.data.salary });
      } catch (err) {
        console.log(err);
      }
    };
    fetchSalary();
  }, [employeeId, month]);

  if (!salaryInfo) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200 animate-[fadeIn_0.6s_ease-out]">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">My Salary</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="mt-2 p-2 rounded-md text-gray-700 bg-white text-center font-medium"
        />
      </div>

      {/* Salary Info */}
      <div className="p-6 space-y-4">

        <div className="flex items-center gap-3">
          <i className="fas fa-wallet text-indigo-600 w-5 h-5"></i>
          <span className="text-gray-700 font-medium">Total Salary:</span>
          <span className="ml-auto font-semibold">₹{salaryInfo.totalSalary}</span>
        </div>

        <div className="flex items-center gap-3">
          <i className="fas fa-calendar-check text-green-600 w-5 h-5"></i>
          <span className="text-gray-700 font-medium">Present Days:</span>
          <span className="ml-auto font-semibold">{salaryInfo.present}</span>
        </div>

        <div className="flex items-center gap-3">
          <i className="fas fa-calendar-times text-red-600 w-5 h-5"></i>
          <span className="text-gray-700 font-medium">Absent Days:</span>
          <span className="ml-auto font-semibold">{salaryInfo.absent}</span>
        </div>

        <div className="flex items-center gap-3">
          <i className="fas fa-ban text-yellow-600 w-5 h-5"></i>
          <span className="text-gray-700 font-medium">Unpaid Leaves:</span>
          <span className="ml-auto font-semibold">{salaryInfo.unpaidLeaves}</span>
        </div>

        <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
          <i className="fas fa-money-bill-wave text-green-600 w-5 h-5"></i>
          <span className="text-gray-700 font-medium">Salary This Month:</span>
          <span className="ml-auto font-semibold text-green-700">₹{salaryInfo.finalSalary}</span>
        </div>

      </div>
    </div>
  );
}
