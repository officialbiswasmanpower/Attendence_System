import express from "express";
import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// ---------------- Employee CRUD routes ---------------- //

// ADD EMPLOYEE
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, department, position, salary } = req.body;

    const count = await Employee.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(3, "0")}`;

    const employee = await Employee.create({
      employeeId,
      name,
      email,
      phone,
      department,
      position,
      salary,
    });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL EMPLOYEES
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET EMPLOYEE BY EMPLOYEE ID
router.get("/:employeeId", async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE EMPLOYEE
router.put("/:employeeId", async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      req.body,
      { new: true }
    );
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE EMPLOYEE
router.delete("/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Employee Auth Routes ---------------- //

// 1️⃣ Check Employee ID exists (for Sign Up)
router.post("/check-id", async (req, res) => {
  try {
    const { employeeId } = req.body;
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.json({ exists: false });
    const hasPassword = !!employee.password;
    res.json({ exists: true, hasPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Set Employee Password (Sign Up)
router.post("/set-password", async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.password)
      return res.status(400).json({ message: "Password already set" });

    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(password, salt);
    await employee.save();

    res.json({ message: "Password set successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Employee Login
router.post("/login", async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (!employee.password)
      return res.status(400).json({ message: "Password not set. Please Sign Up first." });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: employee._id, employeeId: employee.employeeId },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    res.json({ token, employee: { employeeId: employee.employeeId, name: employee.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4️⃣ Change Password (Employee Side Panel)
router.post("/change-password", async (req, res) => {
  try {
    const { employeeId, oldPassword, newPassword } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    const isMatch = await bcrypt.compare(oldPassword, employee.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(newPassword, salt);
    await employee.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- Profile Image Upload (Cloudinary) ---------------- //

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

router.post("/:employeeId/upload", upload.single("profileImage"), async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "attendance-profiles", public_id: req.params.employeeId, overwrite: true },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.end(req.file.buffer);
    });

    employee.profileImage = result.secure_url;
    await employee.save();

    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;