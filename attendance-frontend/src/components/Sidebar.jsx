import { Link, useLocation } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  const menu = [
    { path: "/", name: "Dashboard" },
     { path: "/mark-attendance", name: "Mark Attendance" },
    { path: "/employees", name: "Add Employees" },
    { path: "/MonthlyAttendance", name: "Monthly Attendance" },
    {path: "/create-admin", name: "Create Admin" }

  ];

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div
        className={`fixed lg:static z-50 w-64 h-full bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-500 text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex justify-between items-center p-5 border-b border-white/30">
          <h2 className="text-2xl font-bold tracking-wide">Attendence</h2>
          <XMarkIcon
            className="h-6 w-6 cursor-pointer lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        </div>

<nav className="p-4 space-y-3">
  {menu.map((item) => (
    <Link
      key={item.path}
      to={item.path}
      onClick={() => setSidebarOpen(false)}   // ✅ Auto close
      className={`block px-4 py-2 rounded-xl transition-all duration-300 ${
        location.pathname === item.path
          ? "bg-white text-indigo-700 shadow-lg scale-105"
          : "hover:bg-white/20"
      }`}
    >
      {item.name}
    </Link>
  ))}
</nav>
      </div>
    </>
  );
}

export default Sidebar;