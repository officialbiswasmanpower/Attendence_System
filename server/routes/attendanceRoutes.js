import express from "express";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

const router = express.Router();

// ===== MARK ATTENDANCE =====
router.post("/", async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !records.length) {
      return res.status(400).json({ error: "Date and records are required" });
    }

    const [year, month, day] = date.split("-");
    const localDate = new Date(year, month - 1, day, 0, 0, 0);
    const isoDate = localDate.toISOString();

   for (let record of records) {

  // 🔎 Step 1: Find employee by employeeId (EMP002)
  const emp = await Employee.findOne({ employeeId: record.employeeId });

  if (!emp) {
    return res.status(404).json({ error: `Employee not found: ${record.employeeId}` });
  }

  // ✅ Step 2: Use Mongo _id
  const empObjectId = emp._id;

  await Attendance.findOneAndUpdate(
    { date: isoDate, employee: empObjectId },
    {
      date: isoDate,
      employee: empObjectId,
      status: record.status,
      checkIn: record.checkIn || "",
      checkOut: record.checkOut || ""
    },
    { upsert: true, new: true }
  );
}

    res.json({ message: "Attendance saved/updated successfully" });
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
    const start = new Date(year, month - 1, day, 0, 0, 0);
    const end = new Date(year, month - 1, day, 23, 59, 59, 999);

    // Populate employee to always get name, _id
    const attendance = await Attendance.find({
      date: { $gte: start.toISOString(), $lte: end.toISOString() }
    }).populate("employee", "name _id").lean();

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
    const start = new Date(year, mon - 1, 1, 0, 0, 0);
    const end = new Date(year, mon, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      employee: emp._id,
      date: { $gte: start.toISOString(), $lte: end.toISOString() }
    })
      .sort({ date: 1 })
      .lean();

    const cleaned = attendance.map(a => ({
      date: new Date(a.date).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
      status: a.status,
      checkIn: a.checkIn || "",
      checkOut: a.checkOut || ""
    }));

    res.json(cleaned);
  } catch (error) {
    console.error("GET /attendance/employee/:employeeId error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
