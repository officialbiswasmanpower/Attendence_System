import { useState } from "react";
import API from "../api";

export default function CreateAdmin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  const allPages = [
    { label: "Dashboard", value: "dashboard" },
    { label: "Add Employees", value: "employees" },
    { label: "Mark Attendance", value: "markAttendance" },
    { label: "Monthly Attendance", value: "monthlyAttendance" }
  ];

  const handleCheckbox = (value) => {
    setPages((prev) =>
      prev.includes(value)
        ? prev.filter((p) => p !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    if (role !== "superadmin" && pages.length === 0) {
      return alert("Please assign at least one page");
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await API.post(
        "/admin/create",
        {
          username,
          password,
          role,
          pages:
            role === "superadmin"
              ? allPages.map((p) => p.value)
              : pages
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Admin Created Successfully!");

      setUsername("");
      setPassword("");
      setPages([]);
      setRole("admin");

    } catch (error) {
      alert(error.response?.data?.message || "Error creating admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-100 p-3 sm:p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-8">

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create Admin/Subadmin
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPages([]);
              }}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="admin">Admin</option>
              <option value="subadmin">Sub Admin</option>
            </select>
          </div>

          {/* Page Assignment */}
          {role !== "superadmin" && (
            <div>
              <h3 className="font-semibold mb-2 text-gray-700">
                Assign Pages
              </h3>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {allPages.map((page) => (
                  <label
                    key={page.value}
                    className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={pages.includes(page.value)}
                      onChange={() => handleCheckbox(page.value)}
                    />
                    <span>{page.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>

        </form>
      </div>
    </div>
  );
}
