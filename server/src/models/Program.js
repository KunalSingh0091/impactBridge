import mongoose from "mongoose";

const programSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, enum: ["Education", "Livelihoods", "Public Health"], default: "Education" },
  district: { type: String, required: true, trim: true, maxlength: 80 },
  participants: { type: Number, default: 0, min: 0 },
  target: { type: Number, default: 100, min: 1 },
  status: { type: String, enum: ["On track", "Needs attention", "Completed"], default: "On track" }
}, { timestamps: true });

export default mongoose.model("Program", programSchema);
