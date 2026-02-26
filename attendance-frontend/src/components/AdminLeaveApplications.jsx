import { useEffect, useState } from "react";
import API from "../api";

const statusClasses = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Denied: "bg-red-100 text-red-700",
};

export default function AdminLeaveApplications() {
  const [applications, setApplications] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [loadingId, setLoadingId] = useState("");

  const fetchApplications = async () => {
    try {
      const res = await API.get("/leaves");
      setApplications(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setLoadingId(id);
      await API.patch(`/leaves/${id}`, {
        status,
        adminRemark: remarks[id] || "",
      });
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update leave status");
    } finally {
      setLoadingId("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl">Leave Applications</h2>
        {applications.length === 0 ? (
          <p className="text-sm text-gray-500">No leave applications.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((item) => (
              <div key={item._id} className="rounded-xl border border-gray-200 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{item.employeeName}</p>
                    <p className="text-xs text-gray-500">{item.employeeId}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[item.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Date:</span> {item.leaveDate}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  <span className="font-semibold">Reason:</span> {item.reason}
                </p>

                <textarea
                  value={remarks[item._id] ?? item.adminRemark ?? ""}
                  onChange={(e) =>
                    setRemarks((prev) => ({
                      ...prev,
                      [item._id]: e.target.value,
                    }))
                  }
                  placeholder="Admin remark (optional)"
                  rows={2}
                  className="mt-3 w-full rounded-lg border border-gray-300 p-2 text-sm"
                />

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => updateStatus(item._id, "Approved")}
                    disabled={loadingId === item._id}
                    className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white sm:w-auto disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(item._id, "Denied")}
                    disabled={loadingId === item._id}
                    className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white sm:w-auto disabled:opacity-60"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
