import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import EmpSidebar from "./EmpSidebar";
import EmpTopbar from "./EmpTopbar";
import API from "../api";

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState(""); 
  const [profileImage, setProfileImage] = useState(null); // <-- track profile image
  const employeeId = localStorage.getItem("employeeId");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!employeeId) return;

      try {
        const res = await API.get(`/employees/${employeeId}`);
        console.log("Fetched employee:", res.data); // debug
        setEmployeeName(res.data.name?.trim() || "Employee");
        setProfileImage(res.data.profileImage || null); // <-- set initial profile image
      } catch (err) {
        console.log(err);
        setEmployeeName("Employee");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  return (
    <div className="flex h-screen">
      <EmpSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <EmpTopbar
          setSidebarOpen={setSidebarOpen}
          profileImage={profileImage} // <-- pass dynamic profile image
          employeeName={loading ? "Loading..." : employeeName} 
        />

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet context={{ employeeName, setProfileImage }} />
        </main>
      </div>
    </div>
  );
}