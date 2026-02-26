import { useEffect, useState } from "react";
import API from "../api";
import { motion } from "framer-motion";

void motion;

export default function EmpMarkAttendance() {
  const [attendanceToday, setAttendanceToday] = useState(null); // { status, checkIn, checkOut }
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const employeeId = localStorage.getItem("employeeId"); // MongoDB _id
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // IST YYYY-MM-DD

  // ===== Fetch today's attendance =====
  useEffect(() => {
    if (!employeeId) return;

    const monthStr = todayStr.slice(0, 7);

    API.get(`/attendance/employee/${employeeId}`, { params: { month: monthStr } })
      .then((res) => {
        const todayRecord = res.data.find((item) => item.date === todayStr);
        if (todayRecord) setAttendanceToday(todayRecord);
      })
      .catch((err) => console.error("Fetch error:", err.response?.data || err.message));
  }, [employeeId, todayStr]);

  // ===== Handle Check In =====
  const handleCheckIn = async () => {
    if (attendanceToday && attendanceToday.checkIn) return;

    setLoading(true);
    setMessage("");

    const payload = {
      date: todayStr,
      records: [
        {
          employeeId,
          status: "Present",
          checkIn: new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }),
          checkOut: ""
        }
      ]
    };

    try {
      await API.post("/attendance", payload);
      setAttendanceToday({ status: "Present", checkIn: payload.records[0].checkIn, checkOut: "" });
      setMessage("Checked In ✅");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("Error checking in ❌");
    } finally {
      setLoading(false);
    }
  };

  // ===== Handle Check Out =====
  const handleCheckOut = async () => {
    if (!attendanceToday || attendanceToday.checkOut) return;

    setLoading(true);
    setMessage("");

    const payload = {
      date: todayStr,
      records: [
        {
          employeeId,
          status: "Present",
          checkIn: attendanceToday.checkIn,
          checkOut: new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false })
        }
      ]
    };

    try {
      await API.post("/attendance", payload);
      setAttendanceToday({ ...attendanceToday, checkOut: payload.records[0].checkOut });
      setMessage("Checked Out ✅");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("Error checking out ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto mt-6 max-w-md rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 text-white shadow-2xl sm:mt-10 sm:p-6 md:mt-16 md:p-8"
    >
      <h2 className="text-3xl font-bold text-center mb-6">Employee Attendance</h2>
      <p className="text-center mb-6">Date: <b>{todayStr}</b></p>

      <div className="flex flex-col gap-4">
        {/* Check In */}
        <button
          onClick={handleCheckIn}
          disabled={loading || (attendanceToday && attendanceToday.checkIn)}
          className={`py-3 rounded-xl font-bold transition ${
            attendanceToday?.checkIn ? "bg-green-600 cursor-not-allowed" : "bg-green-400 hover:bg-green-500"
          }`}
        >
          {attendanceToday?.checkIn ? `Checked In at ${attendanceToday.checkIn}` : "Check In"}
        </button>

        {/* Check Out */}
        <button
          onClick={handleCheckOut}
          disabled={loading || !(attendanceToday?.checkIn) || (attendanceToday && attendanceToday.checkOut)}
          className={`py-3 rounded-xl font-bold transition ${
            attendanceToday?.checkOut ? "bg-red-600 cursor-not-allowed" : "bg-red-400 hover:bg-red-500"
          }`}
        >
          {attendanceToday?.checkOut ? `Checked Out at ${attendanceToday.checkOut}` : "Check Out"}
        </button>
      </div>

      {message && <p className="mt-4 text-center font-semibold">{message}</p>}
    </motion.div>
  );
}
