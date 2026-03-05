import express from "express";
import OfficeOff from "../models/OfficeOff.js";
import { verifyToken, allowAdminAccess } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const { month } = req.query;
    const filter = month ? { date: { $regex: `^${month}-` } } : {};
    const officeOffs = await OfficeOff.find(filter).sort({ date: 1 }).lean();
    res.json(officeOffs);
  } catch (err) {
    console.error("GET /office-offs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", verifyToken, allowAdminAccess, async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date || !reason?.trim()) {
      return res.status(400).json({ message: "date and reason are required" });
    }

    const normalizedDate = String(date).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const officeOff = await OfficeOff.findOneAndUpdate(
      { date: normalizedDate },
      { date: normalizedDate, reason: reason.trim() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(officeOff);
  } catch (err) {
    console.error("POST /office-offs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:date", verifyToken, allowAdminAccess, async (req, res) => {
  try {
    const date = decodeURIComponent(req.params.date);
    const deleted = await OfficeOff.findOneAndDelete({ date });
    if (!deleted) {
      return res.status(404).json({ message: "Office off not found" });
    }
    res.json({ message: "Office off removed" });
  } catch (err) {
    console.error("DELETE /office-offs/:date error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
