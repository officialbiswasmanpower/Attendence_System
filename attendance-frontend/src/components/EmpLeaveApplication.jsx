import { useCallback, useEffect, useState } from "react";
import API from "../api";

const statusClasses = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Denied: "bg-red-100 text-red-700",
};

export default function EmpLeaveApplication() {
  const employeeId = localStorage.getItem("employeeId");
  const [leaveDate, setLeaveDate] = useState("");
  const [reason, setReason] = useState("");
  const [applications, setApplications] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!employeeId) return;
    try {
      const res = await API.get(`/leaves/employee/${employeeId}`);
      setApplications(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveDate || !reason.trim()) return;

    try {
      setSubmitting(true);
      await API.post("/leaves", {
        employeeId,
        leaveDate,
        reason: reason.trim(),
      });
      setLeaveDate("");
      setReason("");
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to submit leave application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl">Apply Leave</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter leave reason"
            rows={4}
            className="w-full rounded-lg border border-gray-300 p-3"
            required
          />
        </form>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-800 sm:text-xl">My Leave Applications</h3>
        {applications.length === 0 ? (
          <p className="text-sm text-gray-500">No leave applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((item) => (
              <div key={item._id} className="rounded-xl border border-gray-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-gray-800">{item.leaveDate}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[item.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{item.reason}</p>
                {item.adminRemark ? (
                  <p className="mt-2 text-xs text-gray-500">Admin Remark: {item.adminRemark}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
