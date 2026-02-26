import { Link, useLocation } from "react-router-dom";

export default function EmpSidebar() {
  const location = useLocation();

  const desktopNavItems = [
    { to: "/mark-attendance", label: "Mark", icon: "fas fa-calendar-check" },
    { to: "/my-attendance", label: "Attendance", icon: "fas fa-calendar-alt" },
    { to: "/my-details", label: "Profile", icon: "fas fa-user" },
    { to: "/my-salary", label: "Salary", icon: "fas fa-money-bill-wave" },
  ];

  // Mobile order requested:
  // middle-left: Attendance, middle: Mark, middle-right: Salary, right: Profile
  const mobileNavItems = [
    { to: "/my-attendance", label: "Attendance", icon: "fas fa-calendar-alt" },
    { to: "/mark-attendance", label: "Mark", icon: "fas fa-calendar-check" },
    { to: "/my-salary", label: "Salary", icon: "fas fa-money-bill-wave" },
    { to: "/my-details", label: "Profile", icon: "fas fa-user" },
  ];

  return (
    <>
      <aside className="hidden md:flex md:h-dvh md:w-64 md:flex-col md:bg-gradient-to-b md:from-indigo-700 md:via-purple-600 md:to-pink-500 md:text-white md:shadow-2xl">
        <div className="flex h-16 items-center justify-center border-b border-white/25 text-2xl font-bold tracking-wide shadow-md">
          Employee Portal
        </div>

        <nav className="mt-6 flex flex-col gap-2 px-4">
          {desktopNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                location.pathname === item.to ? "bg-white/25 font-semibold" : "hover:bg-white/20"
              }`}
            >
              <i className={`${item.icon} h-5 w-5 text-lg`}></i>
              {item.label === "Mark" ? "Mark Attendance" : item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-indigo-200/70 bg-gradient-to-r from-indigo-100/95 via-fuchsia-100/95 to-pink-100/95 px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_20px_rgba(79,70,229,0.18)] backdrop-blur md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex min-h-14 flex-col items-center justify-center rounded-lg px-1 py-1 text-[11px] font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-b from-indigo-600 to-fuchsia-600 text-white shadow-md"
                    : "text-indigo-700/75 hover:bg-white/60"
                }`}
              >
                <i className={`${item.icon} text-base`}></i>
                <span className="mt-1 leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
