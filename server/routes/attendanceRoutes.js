import express from "express";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";

const router = express.Router();

// ===== MARK ATTENDANCE =====
router.post("/", async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !records.length) {
      return res.status(400).json({ error: "Date and records are required" });
    }

    const [year, month, day] = date.split("-");
    const finalDate = new Date(Date.UTC(year, month - 1, day));
    const normalizedDate = `${String(year)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const blockedEmployees = [];

    for (const record of records) {
      const emp = await Employee.findOne({ employeeId: record.employeeId });
      if (!emp) {
        return res.status(404).json({ error: `Employee not found: ${record.employeeId}` });
      }

      const approvedLeave = await LeaveApplication.findOne({
        employee: emp._id,
        leaveDate: normalizedDate,
        status: "Approved",
      }).lean();

      if (approvedLeave) {
        blockedEmployees.push(record.employeeId);
        continue;
      }

      await Attendance.findOneAndUpdate(
        { date: finalDate, employee: emp._id },
        {
          date: finalDate,
          employee: emp._id,
          status: record.status,
          checkIn: record.checkIn || "",
          checkOut: record.checkOut || "",
        },
        { upsert: true, new: true }
      );
    }

    if (blockedEmployees.length && blockedEmployees.length === records.length) {
      return res.status(400).json({
        error: "Attendance cannot be marked on approved leave date",
        blockedEmployees,
      });
    }

    res.json({ message: "Attendance saved/updated successfully", blockedEmployees });
  } catch (error) {
    console.error("POST /attendance error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===== GET ATTENDANCE BY DATE =====
router.get("/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const [year, month, day] = date.split("-");
    const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const attendance = await Attendance.find({
      date: { $gte: start, $lte: end },
    })
      .populate("employee", "name _id")
      .lean();

    res.json(attendance || []);
  } catch (error) {
    console.error("GET /attendance/:date error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===== GET ATTENDANCE BY EMPLOYEE + MONTH =====
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: "Month is required" });

    const emp = await Employee.findOne({ employeeId });
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const [year, mon] = month.split("-");
    const start = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, mon, 0, 23, 59, 59, 999));

    const attendance = await Attendance.find({
      employee: emp._id,
      date: { $gte: start, $lte: end },
    })
      .sort({ date: 1 })
      .lean();

    const cleaned = attendance.map((a) => ({
      date: new Date(a.date).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
      status: a.status,
      checkIn: a.checkIn || "",
      checkOut: a.checkOut || "",
    }));

    res.json(cleaned);
  } catch (error) {
    console.error("GET /attendance/employee/:employeeId error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
