import { Bars3Icon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

void motion;

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
      className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b bg-white px-3 py-3 shadow-md sm:px-4 md:px-6 md:py-4"
    >
      {/* Hamburger */}
      <div
        className="cursor-pointer lg:hidden shrink-0"
        onClick={() => setSidebarOpen(true)}
      >
        <Bars3Icon className="h-7 w-7 text-indigo-500" />
      </div>

      {/* Title */}
      <h1 className="flex-1 truncate px-2 text-center text-base font-bold text-gray-800 sm:text-lg md:text-2xl">
        Employee Management System
      </h1>

      {/* Profile + Dropdown */}
      <div className="relative shrink-0">
        <img
          src={profileImage || "/image.png"}
          alt="Profile"
          onClick={() => setOpen(!open)}
          className="h-9 w-9 cursor-pointer rounded-full border-2 sm:h-10 sm:w-10"
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
