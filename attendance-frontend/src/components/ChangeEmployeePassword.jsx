import { useState, useEffect } from "react";
import API from "../api";

export default function ChangeEmployeePassword() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Superadmin own password
  const role = localStorage.getItem("role");
  const [oldPassword, setOldPassword] = useState("");
  const [ownNewPassword, setOwnNewPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showOwnNewPass, setShowOwnNewPass] = useState(false);
  const [ownLoading, setOwnLoading] = useState(false);
  const [ownMessage, setOwnMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    API.get("/employees")
      .then((res) => {
        const sorted = res.data.sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        setEmployees(sorted);
      })
      .catch((err) => console.log(err));
  }, []);

  const showMsg = (setter, type, text) => {
    setter({ type, text });
    setTimeout(() => setter({ type: "", text: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !newPassword)
      return showMsg(setMessage, "error", "Select employee and enter new password");
    if (newPassword.length < 6)
      return showMsg(setMessage, "error", "Password must be at least 6 characters");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/admin/change-employee-password",
        { employeeId: selectedEmployee, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMsg(setMessage, "success", res.data.message);
      setNewPassword("");
      setSelectedEmployee("");
    } catch (err) {
      showMsg(setMessage, "error", err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleOwnPasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !ownNewPassword)
      return showMsg(setOwnMessage, "error", "Fill all fields");
    if (ownNewPassword.length < 6)
      return showMsg(setOwnMessage, "error", "Password must be at least 6 characters");

    try {
      setOwnLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/admin/change-own-password",
        { oldPassword, newPassword: ownNewPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMsg(setOwnMessage, "success", res.data.message);
      setOldPassword("");
      setOwnNewPassword("");
    } catch (err) {
      showMsg(setOwnMessage, "error", err.response?.data?.message || "Failed to change password");
    } finally {
      setOwnLoading(false);
    }
  };

  const EyeButton = ({ show, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
    >
      <i className={`fas ${show ? "fa-eye-slash" : "fa-eye"}`}></i>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 gap-6">
      {/* Change Employee Password */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Change Employee Password
        </h2>

        {message.text && (
          <div className={`mb-4 text-sm p-3 rounded-lg ${message.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Select Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                className="w-full border border-gray-300 p-3 pr-10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
              <EyeButton show={showNewPass} onClick={() => setShowNewPass(!showNewPass)} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Superadmin Own Password */}
      {role === "superadmin" && (
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Change My Password
          </h2>

          {ownMessage.text && (
            <div className={`mb-4 text-sm p-3 rounded-lg ${ownMessage.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
              {ownMessage.text}
            </div>
          )}

          <form onSubmit={handleOwnPasswordChange} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showOldPass ? "text" : "password"}
                  className="w-full border border-gray-300 p-3 pr-10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <EyeButton show={showOldPass} onClick={() => setShowOldPass(!showOldPass)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showOwnNewPass ? "text" : "password"}
                  className="w-full border border-gray-300 p-3 pr-10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={ownNewPassword}
                  onChange={(e) => setOwnNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                />
                <EyeButton show={showOwnNewPass} onClick={() => setShowOwnNewPass(!showOwnNewPass)} />
              </div>
            </div>

            <button
              type="submit"
              disabled={ownLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
            >
              {ownLoading ? "Updating..." : "Update My Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
