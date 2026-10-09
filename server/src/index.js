import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Beneficiary from "./models/Beneficiary.js";
import Program from "./models/Program.js";
import { demoBeneficiaries, demoPrograms } from "./data/demo.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));
const PORT = process.env.PORT || 5000;
let dbConnected = false;
let localBeneficiaries = [...demoBeneficiaries];
let localPrograms = [...demoPrograms];

const safeText = (v) => typeof v === "string" ? v.trim() : "";
app.get("/api/health", (_req, res) => res.json({ status: "ok", database: dbConnected ? "connected" : "demo-mode" }));

app.get("/api/stats", async (_req, res) => {
  try {
    const [beneficiaries, programs] = dbConnected
      ? await Promise.all([Beneficiary.find().lean(), Program.find().lean()])
      : [localBeneficiaries, localPrograms];
    const active = beneficiaries.filter(b => b.status === "Active").length;
    const attendance = beneficiaries.length ? Math.round(beneficiaries.reduce((s, b) => s + (Number(b.attendance) || 0), 0) / beneficiaries.length) : 0;
    res.json({
      beneficiaries: beneficiaries.length,
      activePrograms: programs.filter(p => p.status !== "Completed").length,
      completionRate: programs.length ? Math.round(programs.reduce((s, p) => s + Math.min(100, Math.round((p.participants / (p.target || 1)) * 100)), 0) / programs.length) : 0,
      attendance, activeBeneficiaries: active
    });
  } catch { res.status(500).json({ message: "Could not calculate impact stats." }); }
});

app.get("/api/programs", async (_req, res) => {
  try { res.json(dbConnected ? await Program.find().sort({ createdAt: -1 }).lean() : localPrograms); }
  catch { res.status(500).json({ message: "Could not load programmes." }); }
});
app.post("/api/programs", async (req, res) => {
  const name = safeText(req.body.name), district = safeText(req.body.district);
  const category = ["Education", "Livelihoods", "Public Health"].includes(req.body.category) ? req.body.category : "Education";
  const target = Number(req.body.target);
  if (!name || !district || !Number.isFinite(target) || target < 1) return res.status(400).json({ message: "Provide a programme name, district and positive target." });
  const record = { name, district, category, target, participants: 0, status: "On track" };
  try {
    const created = dbConnected ? await Program.create(record) : { _id: `p${Date.now()}`, ...record };
    if (!dbConnected) localPrograms = [created, ...localPrograms];
    res.status(201).json(created);
  } catch { res.status(500).json({ message: "Could not create programme." }); }
});

app.get("/api/beneficiaries", async (req, res) => {
  const q = safeText(req.query.q).toLowerCase();
  const status = safeText(req.query.status);
  try {
    let records = dbConnected ? await Beneficiary.find().sort({ createdAt: -1 }).lean() : localBeneficiaries;
    if (q) records = records.filter(b => [b.name, b.district, b.programme].some(v => String(v).toLowerCase().includes(q)));
    if (status && status !== "All") records = records.filter(b => b.status === status);
    res.json(records);
  } catch { res.status(500).json({ message: "Could not load beneficiaries." }); }
});
app.post("/api/beneficiaries", async (req, res) => {
  const name = safeText(req.body.name), district = safeText(req.body.district), programme = safeText(req.body.programme);
  const age = Number(req.body.age);
  if (!name || !district || !programme || !Number.isInteger(age) || age < 3 || age > 100)
    return res.status(400).json({ message: "Enter a name, district, programme and valid age (3–100)." });
  const record = { name, district, programme, age, attendance: 0, status: "Active" };
  try {
    const created = dbConnected ? await Beneficiary.create(record) : { _id: `b${Date.now()}`, ...record };
    if (!dbConnected) localBeneficiaries = [created, ...localBeneficiaries];
    res.status(201).json(created);
  } catch { res.status(500).json({ message: "Could not create beneficiary." }); }
});
app.patch("/api/beneficiaries/:id", async (req, res) => {
  const status = req.body.status;
  if (!["Active", "Needs support", "Completed"].includes(status)) return res.status(400).json({ message: "Invalid status." });
  try {
    if (dbConnected) {
      const updated = await Beneficiary.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ message: "Beneficiary not found." });
      return res.json(updated);
    }
    const index = localBeneficiaries.findIndex(b => b._id === req.params.id);
    if (index < 0) return res.status(404).json({ message: "Beneficiary not found." });
    localBeneficiaries[index] = { ...localBeneficiaries[index], status };
    res.json(localBeneficiaries[index]);
  } catch { res.status(500).json({ message: "Could not update beneficiary." }); }
});
app.put("/api/beneficiaries/:id", async (req, res) => {
  const name = safeText(req.body.name);
  const district = safeText(req.body.district);
  const programme = safeText(req.body.programme);
  const age = Number(req.body.age);
  const attendance = Number(req.body.attendance ?? 0);
  const status = req.body.status ?? "Active";

  if (!name || !district || !programme || !Number.isInteger(age) || age < 3 || age > 100) {
    return res.status(400).json({ message: "Enter a name, district, programme and valid age (3–100)." });
  }
  if (!Number.isFinite(attendance) || attendance < 0 || attendance > 100) {
    return res.status(400).json({ message: "Attendance must be between 0 and 100." });
  }
  if (!["Active", "Needs support", "Completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid beneficiary status." });
  }

  const changes = { name, district, programme, age, attendance, status };
  try {
    if (dbConnected) {
      const updated = await Beneficiary.findByIdAndUpdate(req.params.id, changes, {
        new: true,
        runValidators: true
      });
      if (!updated) return res.status(404).json({ message: "Beneficiary not found." });
      return res.json(updated);
    }
    const index = localBeneficiaries.findIndex(b => b._id === req.params.id);
    if (index < 0) return res.status(404).json({ message: "Beneficiary not found." });
    localBeneficiaries[index] = { ...localBeneficiaries[index], ...changes };
    return res.json(localBeneficiaries[index]);
  } catch (error) {
    if (error?.name === "CastError") return res.status(400).json({ message: "Invalid beneficiary ID." });
    console.error("Update beneficiary failed:", error);
    return res.status(500).json({ message: "Could not update beneficiary." });
  }
});

app.delete("/api/beneficiaries/:id", async (req, res) => {
  try {
    if (dbConnected) {
      const deleted = await Beneficiary.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Beneficiary not found." });
      return res.json({ message: "Beneficiary deleted.", id: String(deleted._id) });
    }
    const index = localBeneficiaries.findIndex(b => b._id === req.params.id);
    if (index < 0) return res.status(404).json({ message: "Beneficiary not found." });
    localBeneficiaries.splice(index, 1);
    return res.json({ message: "Beneficiary deleted.", id: req.params.id });
  } catch (error) {
    if (error?.name === "CastError") return res.status(400).json({ message: "Invalid beneficiary ID." });
    console.error("Delete beneficiary failed:", error);
    return res.status(500).json({ message: "Could not delete beneficiary." });
  }
});

app.get("/api/reports/beneficiaries.csv", async (_req, res) => {
  try {
    const records = dbConnected ? await Beneficiary.find().lean() : localBeneficiaries;
    const escape = v => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const rows = [["Name", "Age", "District", "Programme", "Attendance", "Status"], ...records.map(b => [b.name, b.age, b.district, b.programme, b.attendance, b.status])];
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="impactbridge-beneficiaries.csv"');
    res.send(rows.map(r => r.map(escape).join(",")).join("\r\n"));
  } catch { res.status(500).json({ message: "Could not export report." }); }
});
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ message: "Unexpected server error." }); });

try {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2500 });
    dbConnected = true;
    console.log("MongoDB connected.");
  } else console.log("MONGODB_URI not set; using in-memory demo data.");
} catch { console.log("MongoDB unavailable; using in-memory demo data."); }
app.listen(PORT, () => console.log(`ImpactBridge API listening on http://localhost:${PORT}`));
