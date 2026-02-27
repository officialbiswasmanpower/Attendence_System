import { Link, useLocation } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
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

const bottomNav = allMenu.slice(0, 4);
const moreMenu = allMenu.slice(4);

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // close "More" popup on outside click
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
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  active
                    ? "text-indigo-600"
                    : "text-gray-500 hover:text-indigo-500"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[10px] font-medium leading-tight">
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                isMoreActive || moreOpen
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-indigo-500"
              }`}
            >
              <MoreHorizontal
                size={22}
                strokeWidth={isMoreActive || moreOpen ? 2.4 : 1.8}
              />
              <span className="text-[10px] font-medium leading-tight">
                More
              </span>
            </button>

            {/* More popup (slides up) */}
            {moreOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-[fadeIn_0.15s_ease-out]">
                {moreMenu.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        active
                          ? "bg-indigo-50 text-indigo-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm">{item.name}</span>
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
