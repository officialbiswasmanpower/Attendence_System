import express from "express";
import LeaveApplication from "../models/LeaveApplication.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import { verifyToken, allowAdminAccess } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const { employeeId, leaveDate, reason } = req.body;
    if (!employeeId || !leaveDate || !reason) {
      return res.status(400).json({ message: "employeeId, leaveDate and reason are required" });
    }

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const existingPending = await LeaveApplication.findOne({
      employeeId,
      leaveDate,
      status: "Pending",
    });

    if (existingPending) {
      return res.status(400).json({ message: "Leave application already pending for this date" });
    }

    const leaveApplication = await LeaveApplication.create({
      employee: employee._id,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      leaveDate,
      reason,
    });

    res.status(201).json(leaveApplication);
  } catch (err) {
    console.error("POST /leaves error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/employee/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const leaves = await LeaveApplication.find({ employeeId }).sort({ createdAt: -1 }).lean();
    res.json(leaves);
  } catch (err) {
    console.error("GET /leaves/employee/:employeeId error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", verifyToken, allowAdminAccess, async (_req, res) => {
  try {
    const leaves = await LeaveApplication.find().sort({ createdAt: -1 }).lean();
    res.json(leaves);
  } catch (err) {
    console.error("GET /leaves error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id", verifyToken, allowAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemark = "" } = req.body;

    if (!["Approved", "Denied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await LeaveApplication.findByIdAndUpdate(
      id,
      { status, adminRemark },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ message: "Leave application not found" });
    }

    if (status === "Approved") {
      const [year, month, day] = String(leave.leaveDate).split("-");
      const start = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0));
      const end = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999));

      // Ensure approved leave day cannot keep a check-in/check-out record.
      await Attendance.deleteMany({
        employee: leave.employee,
        date: { $gte: start, $lte: end },
      });
    }

    res.json(leave);
  } catch (err) {
    console.error("PATCH /leaves/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
