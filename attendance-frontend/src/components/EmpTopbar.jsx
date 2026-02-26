import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { motion, AnimatePresence } from "framer-motion";

void motion;

export default function EmpTopbar({ profileImage }) {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const employeeId = localStorage.getItem("employeeId");
  const menuRef = useRef();

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // Fetch employee info
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        if (!employeeId) return;
        const res = await API.get(`/employees/${employeeId}`);
        setEmployee(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEmployee();
  }, [employeeId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  const displayProfileImage = profileImage || employee?.profileImage;

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword)
      return showMessage("error", "All fields are required");

    if (newPassword !== confirmPassword)
      return showMessage("error", "Passwords do not match");

    try {
      await API.post("/employees/change-password", {
        employeeId,
        oldPassword,
        newPassword,
      });

      showMessage("success", "Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setShowModal(false), 1000);
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Update failed");
    }
  };

  // Close menu outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex h-14 items-center justify-between bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3 shadow-xl sm:h-16 sm:px-4 md:px-6"
      >
        <div className="h-9 w-9 shrink-0 md:hidden"></div>

        <div className="flex min-w-0 flex-1 flex-col text-center text-white font-semibold md:flex-none md:text-left">
          <span className="truncate text-sm sm:text-base md:text-lg">
            {employee ? employee.name : "Employee"}
          </span>
          <span className="truncate text-xs text-indigo-200 md:text-sm">
            {employee ? employee.position : ""}
          </span>
        </div>

        <div className="relative flex items-center gap-3 sm:gap-4" ref={menuRef}>
          {employee && displayProfileImage ? (
            <motion.img
              src={displayProfileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md cursor-pointer"
              whileHover={{ scale: 1.1 }}
              onClick={() => setMenuOpen(!menuOpen)}
            />
          ) : (
            <motion.div
              className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-bold cursor-pointer"
              whileHover={{ scale: 1.1 }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {employee ? employee.name.charAt(0) : "E"}
            </motion.div>
          )}

       <AnimatePresence>
  {menuOpen && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:w-64"
    >
      <div className="py-2">

        <button
          onClick={() => {
            setShowModal(true);
            setMenuOpen(false);
          }}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center gap-2 text-gray-700"
        >
          <span className="text-indigo-500">🔐</span>
          Change Password
        </button>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 text-left hover:bg-red-50 transition flex items-center gap-2 text-red-600"
        >
          <span>🚪</span>
          Logout
        </button>

      </div>
    </motion.div>
  )}
</AnimatePresence>
        </div>
      </motion.header>

      {/* ================= CHANGE PASSWORD MODAL ================= */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="w-[92vw] max-w-sm rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Change Password
              </h2>

              {message.text && (
                <div
                  className={`mb-3 text-sm p-2 rounded ${
                    message.type === "error"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full mb-3 p-2 border rounded-lg"
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mb-3 p-2 border rounded-lg"
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mb-4 p-2 border rounded-lg"
              />

              <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full rounded-lg bg-gray-200 px-4 py-2 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white sm:w-auto"
                >
                  Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
