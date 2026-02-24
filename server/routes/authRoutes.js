import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";
import { verifyToken, allowSuperAdmin } from "../middleware/roleMiddleware.js";
import Admin from "../models/Admin.js";

const router = express.Router();


// 🔑 LOGIN (Employee Based)
router.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    let user;

    if (role === "employee") {
      user = await Employee.findOne({ employeeId: username });
    } else {
      user = await Admin.findOne({ username });
    }

    if (!user) {
      console.log("User not found:", username, role);
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.password) {
      console.log("No password set for user:", username);
      return res.status(400).json({ message: "No login access" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Invalid password for user:", username);
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
  token,
  role: user.role,
  pages: user.pages || [],
  _id: user._id   // ✅ ADD THIS
});
  } catch (err) {
    console.error("Login route error:", err); // <--- Add this
    res.status(500).json({ message: "Server error" });
  }
});

// 🔐 SUPERADMIN Assign Role To Employee

router.post("/assign-role", verifyToken, allowSuperAdmin, async (req, res) => {
  try {
    const { employeeId, role, pages, password } = req.body;

    if (!["admin", "subadmin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(400).json({ message: "Employee not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    employee.role = role;
    employee.password = hashedPassword;
    employee.pages = pages || [];

    await employee.save();

    res.json({ message: "Role assigned successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
