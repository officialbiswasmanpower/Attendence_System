import { useEffect, useState } from "react";
import API from "../api";

export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [form, setForm] = useState({
        name: "",
        department: "",
        position: "",
        salary: "",
        employeeId: "",
        email: "",
        phone: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [viewEmployee, setViewEmployee] = useState(null);

    const fetchEmployees = () => {
        API.get("/employees")
            .then(res => {
                const sorted = res.data.sort((a, b) =>
                    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
                );
                setEmployees(sorted);
            })
            .catch(err => console.log(err));
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.department || !form.position || !form.salary) {
            alert("All fields are required");
            return;
        }

        try {
            if (editingId) {
                await API.put(`/employees/${editingId}`, form);
            } else {
                await API.post("/employees", form);
            }
            setForm({ name: "", department: "", position: "", salary: "", employeeId: "" });
            setEditingId(null);
            setShowModal(false);
            fetchEmployees();
        } catch (err) {
            console.log(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            await API.delete(`/employees/${id}`);
            fetchEmployees();
        }
    };
const handleEdit = (emp) => {
    setForm({
        name: emp.name,
        department: emp.department,
        position: emp.position,
        salary: emp.salary,
        employeeId: emp.employeeId,
        email: emp.email || "",
        phone: emp.phone || ""
    });
    setEditingId(emp.employeeId); // <- change here
    setShowModal(true);
};

    const handleView = (emp) => {
        setViewEmployee(emp);
        setViewModal(true);
    };

    return (
        <div className="p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Employees List</h2>
                <button
                    onClick={() => {
                        setShowModal(true);
                        setEditingId(null);
                        setForm({ name: "", department: "", position: "", salary: "", employeeId: "" })
                    }}
                    className="px-6 py-2.5 rounded-lg text-white font-medium
                     bg-gradient-to-r from-indigo-500 to-purple-600
                     shadow-md hover:shadow-xl hover:scale-105 active:scale-95
                     transition-all duration-300"
                >
                    + Add Employee
                </button>
            </div>

            {/* Employee Table */}
          <div className="bg-white/70 backdrop-blur-lg shadow-2xl rounded-2xl border border-gray-100 max-h-[500px] overflow-hidden">
  <div className="overflow-y-auto max-h-[495px]">
    <table className="w-full text-left table-auto border-collapse">

      <thead className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white sticky top-0 z-10">
        <tr>
          <th className="p-4 font-semibold tracking-wide">Employee ID</th>
          <th className="p-4 font-semibold tracking-wide">Name</th>
          <th className="p-4 font-semibold tracking-wide">Email</th>
          <th className="p-4 font-semibold tracking-wide">Phone</th>
          <th className="p-4 font-semibold tracking-wide">Department</th>
          <th className="p-4 font-semibold tracking-wide">Position</th>
          <th className="p-4 font-semibold tracking-wide">Salary</th>
          <th className="p-4 font-semibold tracking-wide">Actions</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200">
        {employees.map(emp => (
          <tr
            key={emp._id}
            className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer"
          >
            <td className="p-4 font-semibold text-indigo-600 truncate max-w-[100px]" title={emp.employeeId}>
              {emp.employeeId}
            </td>

            <td className="p-4 font-medium text-gray-700 group-hover:text-blue-600 transition truncate max-w-[150px]" title={emp.name}>
              {emp.name}
            </td>

            <td className="p-4 text-gray-600 truncate max-w-[200px]" title={emp.email || "N/A"}>
              {emp.email || "N/A"}
            </td>

            <td className="p-4 text-gray-600 truncate max-w-[150px]" title={emp.phone || "N/A"}>
              {emp.phone || "N/A"}
            </td>

            <td className="p-4 text-gray-600 truncate max-w-[120px]" title={emp.department}>
              <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-600">{emp.department}</span>
            </td>

            <td className="p-4 text-gray-600 truncate max-w-[120px]" title={emp.position}>
              <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-600">{emp.position}</span>
            </td>

            <td className="p-4 text-gray-600 truncate max-w-[120px]" title={`₹${emp.salary}`}>
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-600">₹{emp.salary}</span>
            </td>

            <td className="p-4 flex gap-2">
              <button onClick={() => handleView(emp)} className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white" title="View">👁</button>
              <button onClick={() => handleEdit(emp)} className="p-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white" title="Edit">✏️</button>
              <button onClick={() => handleDelete(emp._id)} className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white" title="Delete">🗑️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

            {/* Add/Edit Modal */}
           {/* Add/Edit Modal */}
{showModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
    ></div>

    <div className="relative w-full max-w-lg mx-auto">
      <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          {editingId ? "Edit Employee" : "Add New Employee"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {editingId && (
            <div>
              <label className="text-sm text-gray-600">Employee ID</label>
              <input
                type="text"
                value={form.employeeId}
                readOnly
                className="w-full mt-1 p-3 rounded-lg bg-gray-100 border border-gray-200"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-gray-600">Employee Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-gray-50 border border-gray-200"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-gray-50 border border-gray-200"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-gray-50 border border-gray-200"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Department</label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-gray-50 border border-gray-200"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Position</label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-gray-50 border border-gray-200"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Monthly Salary</label>
            <input
              type="number"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-gray-50 border border-gray-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2 rounded-lg bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            >
              {editingId ? "Update Employee" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

            {/* View Modal */}
            {viewModal && viewEmployee && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewModal(false)}></div>
                    <div className="relative w-full max-w-md mx-4">
                        <div className="bg-white shadow-2xl rounded-2xl p-6 relative">
                            <button onClick={() => setViewModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">✕</button>
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">{viewEmployee.name}</h2>

                            <p><strong>Employee ID:</strong> {viewEmployee.employeeId}</p>
                            <p><strong>Department:</strong> {viewEmployee.department}</p>
                            <p><strong>Position:</strong> {viewEmployee.position}</p>
                            <p><strong>Salary:</strong> ₹{viewEmployee.salary}</p>
                            <p><strong>Email:</strong> {viewEmployee.email || "N/A"}</p>
                            <p><strong>Phone:</strong> {viewEmployee.phone || "N/A"}</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
