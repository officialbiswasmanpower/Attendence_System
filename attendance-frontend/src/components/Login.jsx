import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Login({ setRole, setEmployeeId }) {
  const navigate = useNavigate();

  const [portal, setPortal] = useState("employee"); // employee | admin
  const [mode, setMode] = useState("login"); // login | signup

  const [employeeId, setEmployeeIdInput] = useState("");
  const [password, setPassword] = useState("");
  const [adminUsername, setAdminUsername] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // ================= EMPLOYEE LOGIN =================
  const handleEmployeeLogin = async () => {
    if (!employeeId || !password)
      return showMessage("error", "Fill all fields");

    try {
      setLoading(true);

      const res = await API.post("/employees/login", {
        employeeId,
        password,
      });

      const empRole = res.data.employee.role || "employee";

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", empRole);
      localStorage.setItem("employeeId", res.data.employee.employeeId);

      setRole(empRole);
      setEmployeeId(res.data.employee.employeeId);

      navigate("/mark-attendance");
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= EMPLOYEE SIGNUP =================
  const handleSignup = async () => {
    if (!employeeId || !password)
      return showMessage("error", "Fill all fields");

    try {
      setLoading(true);

      await API.post("/employees/set-password", {
        employeeId,
        password,
      });

      showMessage("success", "Password created successfully!");
      setMode("login");
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= ADMIN LOGIN =================
  const handleAdminLogin = async () => {
    if (!adminUsername || !password)
      return showMessage("error", "Fill all fields");

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        username: adminUsername,
        password,
      });

      const { token, role, pages, employeeId: empId } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("pages", JSON.stringify(pages || []));
      if (empId) localStorage.setItem("employeeId", empId);

      setRole(role);

      if (role === "subadmin") {
        navigate("/mark-attendance");
      } else {
        navigate("/");
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-3 sm:p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/30 bg-white/20 p-5 text-white shadow-2xl backdrop-blur-lg sm:p-8">

        <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
        Biswas group Attendance
        </h2>

        {/* Portal Toggle */}
        <div className="flex bg-white/20 rounded-full p-1 mb-6">
          <button
            onClick={() => setPortal("employee")}
            className={`w-1/2 py-2 rounded-full transition ${
              portal === "employee"
                ? "bg-white text-purple-600 font-semibold"
                : "text-white"
            }`}
          >
            Employee
          </button>
          <button
            onClick={() => setPortal("admin")}
            className={`w-1/2 py-2 rounded-full transition ${
              portal === "admin"
                ? "bg-white text-purple-600 font-semibold"
                : "text-white"
            }`}
          >
            Admin
          </button>
        </div>

        {message.text && (
          <div
            className={`mb-4 text-sm p-3 rounded-lg ${
              message.type === "error"
                ? "bg-red-500/80"
                : "bg-green-500/80"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ================= EMPLOYEE SIDE ================= */}
{portal === "employee" && (
  <>
    {mode === "login" ? (
      <>
        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeIdInput(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/30 mb-3"
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 pr-10 rounded-lg bg-white/30"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
            <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
          </button>
        </div>

        <button
          onClick={handleEmployeeLogin}
          className="w-full py-3 rounded-lg bg-white text-purple-600 font-bold"
        >
          {loading ? "Please wait..." : "Login"}
        </button>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <span
            onClick={() => {
              setPassword("");
              setMode("signup");
            }}
            className="font-semibold underline cursor-pointer"
          >
            Sign Up
          </span>
        </p>
      </>
    ) : (
      <>
        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeIdInput(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/30 mb-3"
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 pr-10 rounded-lg bg-white/30"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
            <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
          </button>
        </div>

        <button
          onClick={handleSignup}
          className="w-full py-3 rounded-lg bg-green-500 text-white font-bold"
        >
          {loading ? "Please wait..." : "Create Password"}
        </button>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => {
              setPassword("");
              setMode("login");
            }}
            className="font-semibold underline cursor-pointer"
          >
            Back to Login
          </span>
        </p>
      </>
    )}
  </>
)}

        {/* ================= ADMIN SIDE ================= */}
        {portal === "admin" && (
          <>
            <input
              type="text"
              placeholder="Username"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/30 mb-3"
            />
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-10 rounded-lg bg-white/30"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            <button
              onClick={handleAdminLogin}
              className="w-full py-3 rounded-lg bg-white text-purple-600 font-bold"
            >
              {loading ? "Please wait..." : "Admin Login"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
