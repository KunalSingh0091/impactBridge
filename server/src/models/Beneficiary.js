import mongoose from "mongoose";

const beneficiarySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  age: { type: Number, required: true, min: 3, max: 100 },
  district: { type: String, required: true, trim: true, maxlength: 80 },
  programme: { type: String, required: true, trim: true, maxlength: 100 },
  attendance: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ["Active", "Needs support", "Completed"], default: "Active" }
}, { timestamps: true });

export default mongoose.model("Beneficiary", beneficiarySchema);
