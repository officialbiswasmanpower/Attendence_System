import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  CalendarDays,
  MoreHorizontal,
  FileText,
  KeyRound,
  UserPlus,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const allMenu = [
  { path: "/", name: "Dashboard", icon: LayoutDashboard },
  { path: "/mark-attendance", name: "Attendance", icon: CalendarCheck },
  { path: "/employees", name: "Employees", icon: Users },
  { path: "/MonthlyAttendance", name: "Monthly", icon: CalendarDays },
  { path: "/leave-applications", name: "Leaves", icon: FileText },
  { path: "/change-password", name: "Change Password", icon: KeyRound },
  { path: "/create-admin", name: "Create Admin", icon: UserPlus },
];

// Bottom nav order: Employees | Attendance | Dashboard(center) | Monthly | More
const bottomNav = [
  { path: "/employees", name: "Employees", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { path: "/mark-attendance", name: "Attendance", icon: CalendarCheck, color: "text-green-600", bg: "bg-green-50" },
  { path: "/", name: "Dashboard", icon: LayoutDashboard, color: "text-indigo-600", bg: "bg-indigo-50", center: true },
  { path: "/MonthlyAttendance", name: "Monthly", icon: CalendarDays, color: "text-purple-600", bg: "bg-purple-50" },
];

const moreMenu = [
  { path: "/leave-applications", name: "Leave Applications", icon: FileText, color: "text-orange-600" },
  { path: "/change-password", name: "Change Password", icon: KeyRound, color: "text-rose-600" },
  { path: "/create-admin", name: "Create Admin", icon: UserPlus, color: "text-teal-600" },
];

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isMoreActive = moreMenu.some((m) => location.pathname === m.path);

  return (
    <>
      {/* ========== DESKTOP SIDEBAR (lg+) ========== */}
      <div className="hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-dvh w-64 bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="flex justify-between items-center p-5 border-b border-white/30">
          <h2 className="text-2xl font-bold tracking-wide">Attendence</h2>
        </div>

        <nav className="max-h-[calc(100dvh-88px)] overflow-y-auto p-4 space-y-3">
          {allMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
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

      {/* ========== MOBILE BOTTOM NAV (<lg) ========== */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] lg:hidden">
        <div className="flex items-end justify-around h-16 px-1">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            if (item.center) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center -mt-5"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-transform ${
                      active
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 scale-110"
                        : "bg-gradient-to-br from-indigo-400 to-purple-500"
                    }`}
                  >
                    <Icon size={24} strokeWidth={2.2} className="text-white" />
                  </div>
                  <span className={`text-[10px] font-semibold mt-0.5 ${active ? "text-indigo-600" : "text-gray-500"}`}>
                    {item.name}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-0.5 py-1.5 min-w-[56px]"
              >
                <div className={`p-1.5 rounded-lg transition-colors ${active ? item.bg : ""}`}>
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.4 : 1.8}
                    className={active ? item.color : "text-gray-400"}
                  />
                </div>
                <span className={`text-[10px] font-medium leading-tight ${active ? item.color : "text-gray-400"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <div className="relative flex flex-col items-center" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex flex-col items-center gap-0.5 py-1.5 min-w-[56px]"
            >
              <div className={`p-1.5 rounded-lg transition-colors ${isMoreActive || moreOpen ? "bg-pink-50" : ""}`}>
                <MoreHorizontal
                  size={22}
                  strokeWidth={isMoreActive || moreOpen ? 2.4 : 1.8}
                  className={isMoreActive || moreOpen ? "text-pink-600" : "text-gray-400"}
                />
              </div>
              <span className={`text-[10px] font-medium leading-tight ${isMoreActive || moreOpen ? "text-pink-600" : "text-gray-400"}`}>
                More
              </span>
            </button>

            {moreOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {moreMenu.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 transition-colors border-b border-gray-50 last:border-0 ${
                        active
                          ? "bg-gray-50 font-semibold"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={20} className={item.color} />
                      <span className={`text-sm ${active ? item.color : "text-gray-700"}`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Sidebar;
