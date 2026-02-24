import mongoose from "mongoose";

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