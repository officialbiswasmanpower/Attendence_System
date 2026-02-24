import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },

    // ✅ NEW FIELDS
    checkIn: {
      type: String,
      default: ""
    },
    checkOut: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// 🔥 Prevent Duplicate Attendance
attendanceSchema.index(
  { date: 1, employee: 1 },
  { unique: true }
);

export default mongoose.model("Attendance", attendanceSchema);
