import { useEffect, useState } from "react";
import API from "../api";

export default function EmpSalary({ employeeId }) {
  const [salaryInfo, setSalaryInfo] = useState(null);
  const [month, setMonth] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7)
  );

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        const res = await API.get(`/attendance/employee/${employeeId}?month=${month}`);
        const attendance = res.data;

        const present = attendance.filter((a) => a.status === "Present").length;
        const absent = attendance.filter((a) => a.status === "Absent").length;
        const paidLeaves = 2;
        const unpaidLeaves = Math.max(0, absent - paidLeaves);

        const empRes = await API.get(`/employees/${employeeId}`);
        const salaryPerDay =
          empRes.data.salary / new Date(month.split("-")[0], month.split("-")[1], 0).getDate();
        const finalSalary = (empRes.data.salary - salaryPerDay * unpaidLeaves).toFixed(2);

        setSalaryInfo({
          present,
          absent,
          unpaidLeaves,
          finalSalary,
          totalSalary: empRes.data.salary,
        });
      } catch (err) {
        console.log(err);
      }
    };
    fetchSalary();
  }, [employeeId, month]);

  if (!salaryInfo) return <div>Loading...</div>;

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl animate-[fadeIn_0.6s_ease-out]">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-4 text-center text-white sm:p-6">
        <h2 className="mb-2 text-2xl font-bold md:text-3xl">My Salary</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="mt-2 w-full rounded-md bg-white p-2 text-center font-medium text-gray-700 sm:w-auto"
        />
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <i className="fas fa-wallet h-5 w-5 text-indigo-600"></i>
          <span className="font-medium text-gray-700">Total Salary:</span>
          <span className="ml-auto text-right font-semibold">Rs {salaryInfo.totalSalary}</span>
        </div>

        <div className="flex items-center gap-3">
          <i className="fas fa-calendar-check h-5 w-5 text-green-600"></i>
          <span className="font-medium text-gray-700">Present Days:</span>
          <span className="ml-auto font-semibold">{salaryInfo.present}</span>
        </div>

        <div className="flex items-center gap-3">
          <i className="fas fa-calendar-times h-5 w-5 text-red-600"></i>
          <span className="font-medium text-gray-700">Absent Days:</span>
          <span className="ml-auto font-semibold">{salaryInfo.absent}</span>
        </div>

        <div className="flex items-center gap-3">
          <i className="fas fa-ban h-5 w-5 text-yellow-600"></i>
          <span className="font-medium text-gray-700">Unpaid Leaves:</span>
          <span className="ml-auto font-semibold">{salaryInfo.unpaidLeaves}</span>
        </div>

        <div className="flex items-center gap-3 rounded-lg border-l-4 border-green-500 bg-green-50 p-3">
          <i className="fas fa-money-bill-wave h-5 w-5 text-green-600"></i>
          <span className="font-medium text-gray-700">Salary This Month:</span>
          <span className="ml-auto text-right font-semibold text-green-700">Rs {salaryInfo.finalSalary}</span>
        </div>
      </div>
    </div>
  );
}
