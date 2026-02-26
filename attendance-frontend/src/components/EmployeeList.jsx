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
    phone: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);

  const fetchEmployees = () => {
    API.get("/employees")
      .then((res) => {
        const sorted = res.data.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );
        setEmployees(sorted);
      })
      .catch((err) => console.log(err));
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
      setForm({
        name: "",
        department: "",
        position: "",
        salary: "",
        employeeId: "",
        email: "",
        phone: "",
      });
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
      phone: emp.phone || "",
    });
    setEditingId(emp.employeeId);
    setShowModal(true);
  };

  const handleView = (emp) => {
    setViewEmployee(emp);
    setViewModal(true);
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">Employees List</h2>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingId(null);
            setForm({
              name: "",
              department: "",
              position: "",
              salary: "",
              employeeId: "",
              email: "",
              phone: "",
            });
          }}
          className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 font-medium text-white transition-all duration-300 hover:shadow-xl sm:w-auto"
        >
          + Add Employee
        </button>
      </div>

      <div className="grid gap-3 md:hidden">
        {employees.map((emp) => (
          <div key={emp._id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-800">{emp.name}</p>
                <p className="text-sm text-indigo-600">{emp.employeeId}</p>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                Rs {emp.salary}
              </span>
            </div>
            <p className="text-sm text-gray-600">{emp.department}</p>
            <p className="text-sm text-gray-600">{emp.position}</p>
            <p className="mt-1 text-sm text-gray-500">{emp.email || "N/A"}</p>
            <p className="text-sm text-gray-500">{emp.phone || "N/A"}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleView(emp)}
                className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white"
              >
                View
              </button>
              <button
                onClick={() => handleEdit(emp)}
                className="flex-1 rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(emp._id)}
                className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white/70 shadow-2xl backdrop-blur-lg md:block">
        <div className="max-h-[495px] overflow-auto">
          <table className="min-w-[980px] w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white">
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
              {employees.map((emp) => (
                <tr
                  key={emp._id}
                  className="group cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                >
                  <td className="max-w-[100px] truncate p-4 font-semibold text-indigo-600">{emp.employeeId}</td>
                  <td className="max-w-[150px] truncate p-4 font-medium text-gray-700 group-hover:text-blue-600">
                    {emp.name}
                  </td>
                  <td className="max-w-[200px] truncate p-4 text-gray-600">{emp.email || "N/A"}</td>
                  <td className="max-w-[150px] truncate p-4 text-gray-600">{emp.phone || "N/A"}</td>
                  <td className="max-w-[120px] truncate p-4 text-gray-600">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600">{emp.department}</span>
                  </td>
                  <td className="max-w-[120px] truncate p-4 text-gray-600">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-600">{emp.position}</span>
                  </td>
                  <td className="max-w-[120px] truncate p-4 text-gray-600">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-600">Rs {emp.salary}</span>
                  </td>
                  <td className="p-4">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => handleView(emp)}
                        className="rounded-lg bg-green-500 px-3 py-2 text-sm text-white"
                        title="View"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(emp)}
                        className="rounded-lg bg-yellow-500 px-3 py-2 text-sm text-white"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-8">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
              >
                X
              </button>

              <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
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
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-100 p-3"
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
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-3"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-3"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-3"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-3"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-3"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Monthly Salary</label>
                  <input
                    type="number"
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-3"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full rounded-lg bg-gray-200 px-5 py-2 sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-2 text-white sm:w-auto"
                  >
                    {editingId ? "Update Employee" : "Add Employee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {viewModal && viewEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewModal(false)}></div>
          <div className="relative w-full max-w-md">
            <div className="rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
              <button
                onClick={() => setViewModal(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
              >
                X
              </button>
              <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">{viewEmployee.name}</h2>

              <div className="space-y-2 text-sm text-gray-700 sm:text-base">
                <p><strong>Employee ID:</strong> {viewEmployee.employeeId}</p>
                <p><strong>Department:</strong> {viewEmployee.department}</p>
                <p><strong>Position:</strong> {viewEmployee.position}</p>
                <p><strong>Salary:</strong> Rs {viewEmployee.salary}</p>
                <p><strong>Email:</strong> {viewEmployee.email || "N/A"}</p>
                <p><strong>Phone:</strong> {viewEmployee.phone || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
