import { useEffect, useState } from "react";
import api from "../api";

function Dashboard() {
  // Get today's date in local time
const getLocalToday = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });
};

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalToday());

  // ===== Fetch Employees =====
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees");
        const sortedEmployees = res.data.sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        setEmployees(sortedEmployees);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEmployees();
  }, []);

  // ===== Fetch Attendance =====
  useEffect(() => {
    if (!selectedDate) return;

    const fetchAttendance = async () => {
      try {
        const res = await api.get(`/attendance/${selectedDate}`);
        setAttendance(res.data);
      } catch (err) {
        console.log(err);
        setAttendance([]);
      }
    };

    fetchAttendance();
  }, [selectedDate]);

  // ===== Get attendance record for each employee =====
  const getRecord = (employeeId) => {
    return attendance.find(
      (item) => item.employee?._id === employeeId
    );
  };

  // Count stats
  const presentCount = attendance.filter(item => item.status === "Present").length;
  const absentCount = attendance.filter(item => item.status === "Absent").length;

  return (
    <div className="space-y-6 animate-fadeIn sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
          Admin Dashboard
        </h1>

        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300">
          <h3 className="text-lg font-semibold">Total Employees</h3>
          <p className="text-3xl font-bold mt-2">{employees.length}</p>
        </div>

        <div className="bg-gradient-to-r from-green-400 to-emerald-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300">
          <h3 className="text-lg font-semibold">Present</h3>
          <p className="text-3xl font-bold mt-2">{presentCount}</p>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300">
          <h3 className="text-lg font-semibold">Absent</h3>
          <p className="text-3xl font-bold mt-2">{absentCount}</p>
        </div>
      </div>

      {/* Employee Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-xl font-semibold text-gray-700">
            Employee Attendance
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Check In</th>
                <th className="px-6 py-3">Check Out</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {employees.map((emp) => {
                const record = getRecord(emp._id);

                return (
                  <tr key={emp._id} className="hover:bg-gray-50 transition duration-200">
                    <td className="px-6 py-4 font-medium text-gray-700">{emp.name}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.department}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.position}</td>

                    <td className="px-6 py-4">
                      {record?.status === "Present" && (
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700">
                          Present
                        </span>
                      )}
                      {record?.status === "Absent" && (
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-600">
                          Absent
                        </span>
                      )}
                      {!record && (
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-600">
                          Not Marked
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {record?.checkIn && record.checkIn !== "" ? record.checkIn : "-"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {record?.checkOut && record.checkOut !== "" ? record.checkOut : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
