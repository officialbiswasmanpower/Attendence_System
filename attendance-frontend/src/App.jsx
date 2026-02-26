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

// Employee components
import EmpSidebar from "./components/EmpSidebar";
import EmpMarkAttendance from "./components/EmpMarkAttendance";
import EmpMonthlyAttendance from "./components/EmpMonthlyAttendance";
import EmpDetails from "./components/EmpDetails";
import EmpSalary from "./components/EmpSalary";

// Auth
import Login from "./components/Login";
import EmpTopbar from "./components/EmpTopbar";

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

function EmployeeLayout({ sidebarOpen, setSidebarOpen }) {
  return (
    <div className="flex min-h-dvh bg-slate-50">
      <EmpSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <EmpTopbar setSidebarOpen={setSidebarOpen} profileImage="/image.png" />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [employeeId, setEmployeeId] = useState(localStorage.getItem("employeeId"));

  return (
    <BrowserRouter>
      {role ? (
        <Routes>
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
                  <Route path="*" element={<Navigate to="/" />} />
                </>
              )}
              {role === "subadmin" && (
                <>
                  <Route path="mark-attendance" element={<MarkAttendance />} />
                  <Route path="*" element={<Navigate to="mark-attendance" />} />
                </>
              )}
            </Route>
          )}

          {/* Employee Routes */}
{role === "employee" && (
  <Route path="/" element={<EmployeeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}>

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
      element={<EmpDetails employeeId={employeeId} />}
    />
    <Route
      path="my-salary"
      element={<EmpSalary employeeId={employeeId} />}
    />

    <Route path="*" element={<Navigate to="mark-attendance" replace />} />
  </Route>
)}

        </Routes>
      ) : (
        // Login Page
        <Routes>
          <Route path="*" element={<Login setRole={setRole} setEmployeeId={setEmployeeId} />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
