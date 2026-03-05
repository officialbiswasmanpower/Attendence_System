import mongoose from "mongoose";

const incrementSchema = new mongoose.Schema(
  {
    effectiveMonth: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },
    previousSalary: {
      type: Number,
      required: true,
    },
    newSalary: {
      type: Number,
      required: true,
    },
  },
  { _id: false, timestamps: true }
);

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },

  name: { type: String, required: true },
  email: String,
  phone: String,
  department: String,
  position: String,
  salary: { type: Number, required: true },
  initialSalary: { type: Number, default: null },
  increments: {
    type: [incrementSchema],
    default: [],
  },

  password: {
    type: String,
    default: null
  },

  role: {
    type: String,
    enum: ["employee", "admin", "subadmin", "superadmin"],
    default: "employee"
  },

  pages: {
    type: [String],
    default: []
  },

  profileImage: {
    type: String,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Employee", employeeSchema);
