import { useCallback, useEffect, useState } from "react";
import API from "../api";
import { motion } from "framer-motion";

void motion;

const statusClasses = {
  Pending: "bg-amber-100 text-amber-700 border border-amber-200",
  Approved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Denied: "bg-rose-100 text-rose-700 border border-rose-200",
};

export default function EmpMarkAttendance() {
  const [attendanceToday, setAttendanceToday] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");
  const [leaveApplications, setLeaveApplications] = useState([]);

  const employeeId = localStorage.getItem("employeeId");
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const fetchLeaveApplications = useCallback(async () => {
    if (!employeeId) return;
    try {
      const res = await API.get(`/leaves/employee/${employeeId}`);
      setLeaveApplications(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [employeeId]);

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

  useEffect(() => {
    fetchLeaveApplications();
  }, [fetchLeaveApplications]);

  const handleCheckIn = async () => {
    if (attendanceToday?.checkIn) return;
    setLoading(true);
    setMessage("");

    const payload = {
      date: todayStr,
      records: [
        {
          employeeId,
          status: "Present",
          checkIn: new Date().toLocaleTimeString("en-GB", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          checkOut: "",
        },
      ],
    };

    try {
      await API.post("/attendance", payload);
      setAttendanceToday({
        status: "Present",
        checkIn: payload.records[0].checkIn,
        checkOut: "",
      });
      setMessage("Checked In");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("Error checking in");
    } finally {
      setLoading(false);
    }
  };

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
          checkOut: new Date().toLocaleTimeString("en-GB", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        },
      ],
    };

    try {
      await API.post("/attendance", payload);
      setAttendanceToday({ ...attendanceToday, checkOut: payload.records[0].checkOut });
      setMessage("Checked Out");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("Error checking out");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveDate || !leaveReason.trim()) return;

    setLeaveLoading(true);
    setLeaveMessage("");
    try {
      await API.post("/leaves", {
        employeeId,
        leaveDate,
        reason: leaveReason.trim(),
      });
      setLeaveDate("");
      setLeaveReason("");
      setLeaveMessage("Leave application submitted");
      fetchLeaveApplications();
    } catch (err) {
      setLeaveMessage(err.response?.data?.message || "Unable to submit leave");
    } finally {
      setLeaveLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-4 grid max-w-5xl gap-4 sm:mt-6 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 text-white shadow-2xl sm:p-6"
      >
        <h2 className="mb-4 text-center text-2xl font-bold sm:text-3xl">Employee Attendance</h2>
        <p className="mb-5 text-center">
          Date: <b>{todayStr}</b>
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleCheckIn}
            disabled={loading || Boolean(attendanceToday?.checkIn)}
            className={`rounded-xl py-3 font-bold transition ${
              attendanceToday?.checkIn ? "cursor-not-allowed bg-green-600" : "bg-green-400 hover:bg-green-500"
            }`}
          >
            {attendanceToday?.checkIn ? `Checked In at ${attendanceToday.checkIn}` : "Check In"}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={loading || !attendanceToday?.checkIn || Boolean(attendanceToday?.checkOut)}
            className={`rounded-xl py-3 font-bold transition ${
              attendanceToday?.checkOut ? "cursor-not-allowed bg-red-600" : "bg-red-400 hover:bg-red-500"
            }`}
          >
            {attendanceToday?.checkOut ? `Checked Out at ${attendanceToday.checkOut}` : "Check Out"}
          </button>
        </div>

        {message && <p className="mt-4 text-center text-sm font-semibold">{message}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl bg-gradient-to-br from-fuchsia-100 via-rose-50 to-amber-50 p-4 shadow-2xl ring-1 ring-fuchsia-200/50 sm:p-6"
      >
        <h3 className="mb-4 text-xl font-bold text-fuchsia-900 sm:text-2xl">Leave Application</h3>

        <form onSubmit={handleLeaveSubmit} className="space-y-3">
          <input
            type="date"
            value={leaveDate}
            onChange={(e) => setLeaveDate(e.target.value)}
            className="w-full rounded-lg border border-fuchsia-200 bg-white/90 p-3 text-gray-800 shadow-sm focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            required
          />
          <textarea
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
            placeholder="Enter leave reason"
            rows={3}
            className="w-full rounded-lg border border-fuchsia-200 bg-white/90 p-3 text-gray-800 shadow-sm focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            required
          />
          <button
            type="submit"
            disabled={leaveLoading}
            className="w-full rounded-lg bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:brightness-105 disabled:opacity-60"
          >
            {leaveLoading ? "Submitting..." : "Apply Leave"}
          </button>
        </form>

        {leaveMessage && <p className="mt-3 text-sm font-semibold text-fuchsia-800">{leaveMessage}</p>}

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-bold text-fuchsia-900">Recent Applications</h4>
          {leaveApplications.length === 0 ? (
            <p className="text-xs text-fuchsia-700/80">No applications yet.</p>
          ) : (
            leaveApplications.slice(0, 4).map((item) => (
              <div key={item._id} className="rounded-lg border border-white/60 bg-white/80 p-2 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-fuchsia-900">{item.leaveDate}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      statusClasses[item.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-fuchsia-900/85">{item.reason}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
