import { useEffect, useRef, useState } from "react";
import API from "../api";

const PREVIEW_SIZE = 220;
const MIN_CROP_SIZE = 80;

const loadImageFromDataUrl = (dataUrl) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

export default function EmpDetails({ employeeId, onProfileUpdate }) {
  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState({});
  const [editingDetails, setEditingDetails] = useState(false);
  const [salaryInfo, setSalaryInfo] = useState(null);
  const [salaryMonth, setSalaryMonth] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7)
  );

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [savingImage, setSavingImage] = useState(false);
  const [cropSource, setCropSource] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropSize, setCropSize] = useState(0);
  const [cropMeta, setCropMeta] = useState({
    width: 0,
    height: 0,
    maxCrop: 0,
  });
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    const fetchSalary = async () => {
      if (!employeeId || !salaryMonth) return;
      try {
        const attendanceRes = await API.get(`/attendance/employee/${employeeId}?month=${salaryMonth}`);
        const attendance = attendanceRes.data;
        const leavesRes = await API.get(`/leaves/employee/${employeeId}`);
        const approvedLeaves = leavesRes.data.filter(
          (leave) => leave.status === "Approved" && leave.leaveDate?.startsWith(salaryMonth)
        ).length;

        const present = attendance.filter((a) => a.status === "Present").length;
        const absent = attendance.filter((a) => a.status === "Absent").length;
        const paidLeaves = 2;
        const unpaidLeaves = Math.max(0, absent - paidLeaves);

        const empRes = await API.get(`/employees/${employeeId}`, { params: { month: salaryMonth } });
        const totalSalary = Number(empRes.data.salaryForMonth ?? empRes.data.salary ?? 0);
        const currentSalary = Number(empRes.data.salary || 0);
        const salaryPerDay =
          totalSalary / new Date(salaryMonth.split("-")[0], salaryMonth.split("-")[1], 0).getDate();
        const finalSalary = (totalSalary - salaryPerDay * unpaidLeaves).toFixed(2);

        setSalaryInfo({
          present,
          absent,
          approvedLeaves,
          unpaidLeaves,
          finalSalary,
          totalSalary,
          currentSalary,
        });
      } catch (err) {
        console.log(err);
      }
    };
    fetchSalary();
  }, [employeeId, salaryMonth]);

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const img = await loadImageFromDataUrl(dataUrl);
      const size = Math.min(img.naturalWidth, img.naturalHeight);
      const nextX = Math.max(0, Math.floor((img.naturalWidth - size) / 2));
      const nextY = Math.max(0, Math.floor((img.naturalHeight - size) / 2));

      setCropSource(dataUrl);
      setCropMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        maxCrop: size,
      });
      setCropSize(size);
      setCropX(nextX);
      setCropY(nextY);
      setCropOpen(true);
    } catch (err) {
      console.log(err);
      alert("Unable to open image for cropping.");
    }
  };

  const resetCropState = () => {
    setCropOpen(false);
    setCropSource("");
    setCropX(0);
    setCropY(0);
    setCropSize(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleApplyCrop = async () => {
    if (!cropSource || !cropSize) return;
    try {
      const img = await loadImageFromDataUrl(cropSource);
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropSize,
        cropSize,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );
      if (!blob) {
        alert("Unable to crop image.");
        return;
      }

      const croppedFile = new File([blob], `profile-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setSelectedFile(croppedFile);
      resetCropState();
    } catch (err) {
      console.log(err);
      alert("Unable to crop image.");
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
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const scale = cropSize ? PREVIEW_SIZE / cropSize : 1;
  const maxX = Math.max(0, cropMeta.width - cropSize);
  const maxY = Math.max(0, cropMeta.height - cropSize);
  const previewStyle = {
    width: `${cropMeta.width * scale}px`,
    height: `${cropMeta.height * scale}px`,
    left: `${-cropX * scale}px`,
    top: `${-cropY * scale}px`,
  };

  return (
    <>
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl animate-[fadeIn_0.6s_ease-out]">
        <div className="relative flex flex-col items-center gap-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-5 text-center text-white sm:p-8">
          <div className="relative h-28 w-28">
            <img
              src={preview || employee.profileImage || "/default-avatar.png"}
              alt="Profile"
              className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md"
            />
            <button
              onClick={handleFileClick}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-600 shadow-md transition hover:bg-gray-100"
              title="Change Profile Photo"
            >
              <i className="fas fa-pencil-alt"></i>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {selectedFile && (
            <div className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                onClick={handleSaveImage}
                disabled={savingImage}
                className="rounded bg-white px-4 py-1 font-semibold text-indigo-600 transition hover:bg-gray-100"
              >
                {savingImage ? "Saving..." : "Upload"}
              </button>
              <button
                onClick={handleCancelImage}
                className="rounded bg-gray-200 px-4 py-1 font-semibold text-black transition hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}

          {editingDetails ? (
            <>
              <input
                type="text"
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                className="mt-2 w-40 rounded-lg p-1 text-center font-bold text-black"
              />
              <p className="mt-1 flex justify-center gap-2 text-sm">
                <input
                  type="text"
                  name="position"
                  value={form.position || ""}
                  onChange={handleChange}
                  className="w-28 rounded-lg p-1 text-black"
                />
                |
                <input
                  type="text"
                  name="department"
                  value={form.department || ""}
                  onChange={handleChange}
                  className="w-28 rounded-lg p-1 text-black"
                />
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{employee.name}</h2>
              <p className="text-sm">
                {employee.position} | {employee.department}
              </p>
            </>
          )}
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col">
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-500">
              <i className="fas fa-envelope h-4 w-4"></i> Email
            </label>
            {editingDetails ? (
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                className="rounded border p-2 font-medium text-gray-700"
              />
            ) : (
              <span className="font-medium text-gray-700">{employee.email}</span>
            )}
          </div>

          <div className="flex flex-col">
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-500">
              <i className="fas fa-phone h-4 w-4"></i> Phone
            </label>
            {editingDetails ? (
              <input
                type="text"
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                className="rounded border p-2 font-medium text-gray-700"
              />
            ) : (
              <span className="font-medium text-gray-700">{employee.phone}</span>
            )}
          </div>

          <div className="mt-2 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-indigo-900">Salary Card</h3>
              <input
                type="month"
                value={salaryMonth}
                onChange={(e) => setSalaryMonth(e.target.value)}
                className="w-full rounded-md border border-indigo-200 bg-white p-2 text-sm text-gray-700 sm:w-auto"
              />
            </div>

            {!salaryInfo ? (
              <p className="text-sm text-gray-500">Loading salary...</p>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total Salary</span>
                  <span className="font-semibold text-gray-900">Rs {salaryInfo.totalSalary}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Current Salary</span>
                  <span className="font-semibold text-indigo-700">Rs {salaryInfo.currentSalary}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Present Days</span>
                  <span className="font-semibold text-emerald-700">{salaryInfo.present}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Absent Days</span>
                  <span className="font-semibold text-red-700">{salaryInfo.absent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Approved Leave</span>
                  <span className="font-semibold text-amber-700">{salaryInfo.approvedLeaves}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Unpaid Leaves</span>
                  <span className="font-semibold text-orange-700">{salaryInfo.unpaidLeaves}</span>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 p-2">
                  <span className="font-semibold text-emerald-900">Salary This Month</span>
                  <span className="font-bold text-emerald-700">Rs {salaryInfo.finalSalary}</span>
                </div>
              </div>
            )}
          </div>
        </div>

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
                onClick={() => {
                  setEditingDetails(false);
                  setForm(employee);
                }}
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

      {cropOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={resetCropState}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Crop Profile Image</h3>

            <div className="mb-4 flex justify-center">
              <div
                className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                style={{ width: `${PREVIEW_SIZE}px`, height: `${PREVIEW_SIZE}px` }}
              >
                <img
                  src={cropSource}
                  alt="Crop preview"
                  className="absolute max-w-none"
                  style={previewStyle}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Horizontal</label>
                <input
                  type="range"
                  min={0}
                  max={maxX}
                  value={cropX}
                  onChange={(e) => setCropX(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Vertical</label>
                <input
                  type="range"
                  min={0}
                  max={maxY}
                  value={cropY}
                  onChange={(e) => setCropY(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Crop Size</label>
                <input
                  type="range"
                  min={Math.min(MIN_CROP_SIZE, cropMeta.maxCrop || MIN_CROP_SIZE)}
                  max={cropMeta.maxCrop || MIN_CROP_SIZE}
                  value={cropSize}
                  onChange={(e) => {
                    const nextSize = Number(e.target.value);
                    setCropSize(nextSize);
                    setCropX((prev) => Math.min(prev, Math.max(0, cropMeta.width - nextSize)));
                    setCropY((prev) => Math.min(prev, Math.max(0, cropMeta.height - nextSize)));
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={resetCropState}
                className="w-full rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCrop}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white sm:w-auto"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
