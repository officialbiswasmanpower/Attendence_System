import { useEffect, useState, useRef } from "react";
import API from "../api";

export default function EmpDetails({ employeeId, onProfileUpdate }) {
  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState({});
  const [editingDetails, setEditingDetails] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [savingImage, setSavingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch employee
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await API.get(`/employees/${employeeId}`);
        setEmployee(res.data);
        setForm(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEmployee();
  }, [employeeId]);

  // Preview image
  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedFile) return;
    setSavingImage(true);
    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      const res = await API.post(`/employees/${employeeId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEmployee(res.data);
      setSelectedFile(null);
      setPreview(null);
      if (onProfileUpdate) onProfileUpdate(res.data.profileImage);
      alert("Profile image updated successfully!");
    } catch (err) {
      console.log(err);
      alert("Failed to update profile image.");
    } finally {
      setSavingImage(false);
    }
  };

  const handleCancelImage = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleSaveDetails = async () => {
    try {
      await API.put(`/employees/${employeeId}`, form);
      const res = await API.get(`/employees/${employeeId}`);
      setEmployee(res.data);
      setForm(res.data);
      setEditingDetails(false);
      alert("Details updated successfully!");
    } catch (err) {
      console.log(err);
      alert("Failed to update details.");
    }
  };

  if (!employee) return <div>Loading...</div>;

  return (
    <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl animate-[fadeIn_0.6s_ease-out]">

      {/* Top Banner */}
      <div className="relative flex flex-col items-center gap-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-5 text-center text-white sm:p-8">

        {/* Profile Image */}
        <div className="relative w-28 h-28">
          <img
            src={preview || employee.profileImage || "/default-avatar.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
          />
          {/* Pencil Icon */}
          <button
            onClick={handleFileClick}
            className="absolute bottom-0 right-0 w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition"
            title="Change Profile Photo"
          >
            <i className="fas fa-pencil-alt"></i>
          </button>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Save / Cancel Buttons appear only after selection */}
        {selectedFile && (
          <div className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              onClick={handleSaveImage}
              disabled={savingImage}
              className="px-4 py-1 bg-white text-indigo-600 font-semibold rounded hover:bg-gray-100 transition"
            >
              {savingImage ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancelImage}
              className="px-4 py-1 bg-gray-200 text-black font-semibold rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            {/* Optional Crop Button */}
            {/* <button className="px-4 py-1 bg-gray-300 text-black font-semibold rounded hover:bg-gray-400 transition">Crop</button> */}
          </div>
        )}

        {/* Name & Position/Department */}
        {editingDetails ? (
          <>
            <input
              type="text"
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              className="mt-2 w-40 text-center rounded-lg p-1 text-black font-bold"
            />
            <p className="text-sm mt-1 flex gap-2 justify-center">
              <input
                type="text"
                name="position"
                value={form.position || ""}
                onChange={handleChange}
                className="rounded-lg p-1 text-black w-28"
              />{" "}
              |{" "}
              <input
                type="text"
                name="department"
                value={form.department || ""}
                onChange={handleChange}
                className="rounded-lg p-1 text-black w-28"
              />
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold">{employee.name}</h2>
            <p className="text-sm">{employee.position} | {employee.department}</p>
          </>
        )}
      </div>

      {/* Employee Info */}
      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-col">
          <label className="text-sm text-gray-500 mb-1 font-medium flex items-center gap-2">
            <i className="fas fa-envelope w-4 h-4"></i> Email
          </label>
          {editingDetails ? (
            <input
              type="email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              className="text-gray-700 font-medium p-2 border rounded"
            />
          ) : (
            <span className="text-gray-700 font-medium">{employee.email}</span>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-500 mb-1 font-medium flex items-center gap-2">
            <i className="fas fa-phone w-4 h-4"></i> Phone
          </label>
          {editingDetails ? (
            <input
              type="text"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              className="text-gray-700 font-medium p-2 border rounded"
            />
          ) : (
            <span className="text-gray-700 font-medium">{employee.phone}</span>
          )}
        </div>
      </div>

      {/* Edit / Save Details Buttons */}
      <div className="flex flex-col justify-center gap-3 p-4 sm:flex-row sm:gap-4 sm:p-6">
        {editingDetails ? (
          <>
            <button
              onClick={handleSaveDetails}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-2 text-white sm:w-auto"
            >
              Save
            </button>
            <button
              onClick={() => { setEditingDetails(false); setForm(employee); }}
              className="w-full rounded-lg bg-gray-200 px-6 py-2 sm:w-auto"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditingDetails(true)}
            className="w-full rounded-lg bg-yellow-500 px-6 py-2 text-white hover:bg-yellow-600 sm:w-auto"
          >
            Edit Details
          </button>
        )}
      </div>
    </div>
  );
}
