import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";
import { verifyToken, allowSuperAdmin, allowAdminAccess } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create Admin/Subadmin
router.post("/create", verifyToken, allowSuperAdmin, async (req, res) => {
  try {
    const { username, password, role, pages } = req.body;

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Admin.create({
      username,
      password: hashedPassword,
      role,
      pages
    });

    res.json({ message: "User created", newUser });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Change Employee Password (Admin/Superadmin)
router.post("/change-employee-password", verifyToken, allowAdminAccess, async (req, res) => {
  try {
    const { employeeId, newPassword } = req.body;

    if (!employeeId || !newPassword) {
      return res.status(400).json({ message: "Employee ID and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.json({ message: `Password updated for ${employee.name} (${employeeId})` });
  } catch (err) {
    console.error("Change employee password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
