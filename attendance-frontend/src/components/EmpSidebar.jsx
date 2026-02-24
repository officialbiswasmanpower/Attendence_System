import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function EmpSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  const navItems = [
    { to: "/mark-attendance", label: "Mark Attendance", icon: "fas fa-calendar-check" },
    { to: "/my-attendance", label: "My Attendance", icon: "fas fa-calendar-alt" },
    { to: "/my-details", label: "My Details", icon: "fas fa-user" },
    { to: "/my-salary", label: "My Salary", icon: "fas fa-money-bill-wave" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Desktop Sidebar (always visible) */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gradient-to-b from-indigo-700 via-purple-600 to-pink-500 text-white shadow-2xl z-50">
        {/* Header */}
        <div className="flex items-center justify-center h-16 border-b border-white/25 font-bold text-2xl tracking-wide shadow-md">
          Employee Portal
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex flex-col gap-2 px-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                ${location.pathname === item.to ? "bg-white/25 font-semibold" : "hover:bg-white/20"}
              `}
            >
              <i className={`${item.icon} w-5 h-5 text-lg`}></i>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar (animated) */}
      <motion.aside
        className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-indigo-700 via-purple-600 to-pink-500 text-white shadow-2xl z-50 md:hidden"
        initial={{ x: "-100%" }}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="flex items-center justify-center h-16 border-b border-white/25 font-bold text-2xl tracking-wide shadow-md">
          Employee Portal
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex flex-col gap-2 px-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                ${location.pathname === item.to ? "bg-white/25 font-semibold" : "hover:bg-white/20"}
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`${item.icon} w-5 h-5 text-lg`}></i>
              {item.label}
            </Link>
          ))}

        </nav>
      </motion.aside>
    </>
  );
}
