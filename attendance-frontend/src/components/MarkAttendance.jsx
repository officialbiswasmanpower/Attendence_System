import { useEffect, useState } from "react";
import API from "../api";
import { CheckCircle, XCircle } from "lucide-react";

export default function MarkAttendance() {
  const getLocalToday = () => {
    const t = new Date();
    const year = t.getFullYear();
    const month = String(t.getMonth() + 1).padStart(2, "0");
    const day = String(t.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getLocalToday());
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState({});

  // ===== Load Employees =====
  useEffect(() => {
    API.get("/employees")
      .then(res => {
        const sortedEmployees = res.data.sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        setEmployees(sortedEmployees);

        // Default empty records
        const defaultRecords = {};
        sortedEmployees.forEach(emp => {
          defaultRecords[emp._id] = { status: "", checkIn: "", checkOut: "" };
        });
        setRecords(defaultRecords);
      })
      .catch(err => console.log(err));
  }, []);

  // ===== Fetch Attendance =====
  useEffect(() => {
    if (!date || employees.length === 0) return;

    const fetchAttendance = async () => {
      try {
        const res = await API.get(`/attendance/${date}`);
        const updatedRecords = {};

        employees.forEach(emp => {
          const found = res.data.find(a => a.employee._id === emp._id);
          updatedRecords[emp._id] = found
            ? { status: found.status, checkIn: found.checkIn || "", checkOut: found.checkOut || "" }
            : { status: "", checkIn: "", checkOut: "" };
        });

        setRecords(updatedRecords);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAttendance();
  }, [date, employees]);

  // ===== Status Change =====
  const handleStatusChange = (employeeId, status) => {
    const currentTime = new Date().toTimeString().slice(0, 5);

    setRecords(prev => ({
      ...prev,
      [employeeId]: {
        status,
        checkIn: status === "Present" ? prev[employeeId]?.checkIn || currentTime : "",
        checkOut: status === "Present" ? prev[employeeId]?.checkOut || "" : ""
      }
    }));
  };

  // ===== Time Change =====
  const handleTimeChange = (employeeId, field, value) => {
    setRecords(prev => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], [field]: value }
    }));
  };

// ===== Submit =====
const handleSubmit = async () => {
  if (!date) return;

  const formattedRecords = Object.keys(records)
  .filter(id => records[id].status !== "")
  .map(id => ({
    employeeId: employees.find(e => e._id === id).employeeId,
    status: records[id].status,
    checkIn: records[id].checkIn,
    checkOut: records[id].checkOut
  }));

  if (!formattedRecords.length) return;

  try {
    await API.post("/attendance", { date, records: formattedRecords });

    // Refetch after saving to show updated data
    const res = await API.get(`/attendance/${date}`);
    const updatedRecords = {};
    employees.forEach(emp => {
      const found = res.data.find(a => a.employee._id === emp._id);
      updatedRecords[emp._id] = found
        ? { status: found.status, checkIn: found.checkIn || "", checkOut: found.checkOut || "" }
        : { status: "", checkIn: "", checkOut: "" };
    });
    setRecords(updatedRecords);

  } catch (err) {
    console.log("Attendance save error:", err);
  }
};


  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Mark Attendance
          </span>
        </h1>
        <div className="flex items-center gap-3">
          <label className="font-medium text-gray-600 hidden sm:block">Select Date:</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white shadow-xl rounded-3xl p-6">
        <div className="max-h-[410px] overflow-y-auto space-y-2">
          {employees.map(emp => (
            <div
              key={emp._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl shadow-sm transition duration-300"
            >
              <div>
                <p className="font-semibold text-gray-700">{emp.name}</p>
                <p className="text-sm text-gray-500">{emp.department}</p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={records[emp._id]?.status}
                  onChange={e => handleStatusChange(emp._id, e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                >
                  <option value="">Select Status</option>
                  <option value="Present">Present ✅</option>
                  <option value="Absent">Absent ❌</option>
                </select>

                {records[emp._id]?.status === "Present" && (
                  <>
                    <input
                      type="time"
                      value={records[emp._id]?.checkIn}
                      onChange={e => handleTimeChange(emp._id, "checkIn", e.target.value)}
                      className="px-2 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="time"
                      value={records[emp._id]?.checkOut}
                      onChange={e => handleTimeChange(emp._id, "checkOut", e.target.value)}
                      className="px-2 py-2 border border-gray-300 rounded-lg"
                    />
                  </>
                )}

                {records[emp._id]?.status === "Present" && <CheckCircle className="text-green-500" />}
                {records[emp._id]?.status === "Absent" && <XCircle className="text-red-500" />}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 w-full py-3 font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition duration-300"
        >
          Save Attendance
        </button>
      </div>
    </div>
  );
}
