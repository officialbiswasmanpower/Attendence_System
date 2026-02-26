import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";

// Admin/Superadmin components
import EmployeeList from "./components/EmployeeList";
import MarkAttendance from "./components/MarkAttendance";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MonthlyAttendance from "./components/MonthlyAttendance";
import CreateAdmin from "./components/CreateAdmin";
import ChangeEmployeePassword from "./components/ChangeEmployeePassword";
import AdminLeaveApplications from "./components/AdminLeaveApplications";

// Employee components
import EmpSidebar from "./components/EmpSidebar";
import EmpMarkAttendance from "./components/EmpMarkAttendance";
import EmpMonthlyAttendance from "./components/EmpMonthlyAttendance";
import EmpDetails from "./components/EmpDetails";

// Auth
import Login from "./components/Login";
import EmpTopbar from "./components/EmpTopbar";

const VALID_ROLES = ["employee", "admin", "superadmin", "subadmin"];

const getLandingPath = (role) => {
  if (role === "employee" || role === "subadmin") return "/mark-attendance";
  return "/";
};

function AdminLayout({ sidebarOpen, setSidebarOpen }) {
  return (
    <div className="flex min-h-dvh bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function EmployeeLayout({ profileImage }) {
  return (
    <div className="flex min-h-dvh bg-slate-50">
      <EmpSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <EmpTopbar profileImage={profileImage} />
        <main className="flex-1 overflow-y-auto p-3 pb-24 sm:p-4 sm:pb-24 md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(() => {
    const storedRole = localStorage.getItem("role");
    return VALID_ROLES.includes(storedRole) ? storedRole : null;
  });
  const [employeeId, setEmployeeId] = useState(localStorage.getItem("employeeId"));
  const [employeeProfile, setEmployeeProfile] = useState({ employeeId: "", imageUrl: "" });
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token && role && VALID_ROLES.includes(role));
  const landingPath = getLandingPath(role);

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Navigate to={landingPath} replace />} />

          {/* Admin / Superadmin / Subadmin Routes */}
          {(role === "admin" || role === "superadmin" || role === "subadmin") && (
            <Route path="/" element={<AdminLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}>
              {role === "superadmin" && (
                <>
                  <Route index element={<Dashboard />} />
                  <Route path="employees" element={<EmployeeList />} />
                  <Route path="mark-attendance" element={<MarkAttendance />} />
                  <Route path="MonthlyAttendance" element={<MonthlyAttendance />} />
                  <Route path="create-admin" element={<CreateAdmin />} />
                  <Route path="change-password" element={<ChangeEmployeePassword />} />
                  <Route path="leave-applications" element={<AdminLeaveApplications />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </>
              )}
              {role === "admin" && (
                <>
                  <Route index element={<Dashboard />} />
                  <Route path="employees" element={<EmployeeList />} />
                  <Route path="mark-attendance" element={<MarkAttendance />} />
                  <Route path="MonthlyAttendance" element={<MonthlyAttendance />} />
                  <Route path="change-password" element={<ChangeEmployeePassword />} />
                  <Route path="leave-applications" element={<AdminLeaveApplications />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </>
              )}
              {role === "subadmin" && (
                <>
                  <Route index element={<Navigate to="mark-attendance" replace />} />
                  <Route path="mark-attendance" element={<MarkAttendance />} />
                  <Route path="*" element={<Navigate to="mark-attendance" />} />
                </>
              )}
            </Route>
          )}

          {/* Employee Routes */}
{role === "employee" && (
  <Route
    path="/"
    element={
      <EmployeeLayout
        profileImage={
          employeeProfile.employeeId === employeeId ? employeeProfile.imageUrl : ""
        }
      />
    }
  >

    {/* ✅ Default page */}
    <Route index element={<Navigate to="mark-attendance" replace />} />

    <Route
      path="mark-attendance"
      element={<EmpMarkAttendance employeeId={employeeId} />}
    />
    <Route
      path="my-attendance"
      element={<EmpMonthlyAttendance employeeId={employeeId} />}
    />
    <Route
      path="my-details"
      element={
        <EmpDetails
          employeeId={employeeId}
          onProfileUpdate={(imageUrl) =>
            setEmployeeProfile({ employeeId: employeeId || "", imageUrl })
          }
        />
      }
    />
    <Route path="*" element={<Navigate to="mark-attendance" replace />} />
  </Route>
)}
          <Route path="*" element={<Navigate to={landingPath} replace />} />

        </Routes>
      ) : (
        // Login Page
        <Routes>
          <Route path="/login" element={<Login setRole={setRole} setEmployeeId={setEmployeeId} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
