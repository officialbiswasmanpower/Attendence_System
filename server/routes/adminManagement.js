import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { verifyToken, allowSuperAdmin } from "../middleware/roleMiddleware.js";

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

export default router;
