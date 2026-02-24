import { Bars3Icon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Topbar({ setSidebarOpen, profileImage }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();      // clear saved data
    navigate("/login");        // redirect to login page
    window.location.reload();  // refresh app state
  };

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-between px-6 py-4 bg-white shadow-md sticky top-0 z-50 border-b"
    >
      {/* Hamburger */}
      <div
        className="lg:hidden cursor-pointer"
        onClick={() => setSidebarOpen(true)}
      >
        <Bars3Icon className="h-7 w-7 text-indigo-500" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 flex-1 text-center">
        Employee Management System
      </h1>

      {/* Profile + Dropdown */}
      <div className="relative">
        <img
          src={profileImage || "/image.png"}
          alt="Profile"
          onClick={() => setOpen(!open)}
          className="h-10 w-10 rounded-full cursor-pointer border-2"
        />

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Topbar;
