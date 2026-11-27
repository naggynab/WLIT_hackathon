import { Router } from "express";
import mongoose from "mongoose";
import HealthRecord from "../models/HealthRecord.mjs";

const router = Router();
const allowedTypes = new Set(HealthRecord.schema.path("type").enumValues);
const editableFields = ["type", "title", "recordedAt", "facilityName", "healthWorkerName", "notes", "measurements"];

function recordInput(body = {}, { partial = false } = {}) {
  const input = {};
  for (const field of editableFields) {
    if (Object.hasOwn(body, field)) input[field] = body[field];
  }
  if (!partial && !input.type) return { error: "Choose a valid health-record type." };
  if (input.type && !allowedTypes.has(input.type)) return { error: "Choose a valid health-record type." };
  if (input.recordedAt && Number.isNaN(new Date(input.recordedAt).getTime())) {
    return { error: "Enter a valid record date." };
  }
  return { input };
}

router.get("/", async (req, res) => {
  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;
  try {
    const records = await HealthRecord.find({ userId: req.userId })
      .sort({ recordedAt: -1 })
      .limit(limit)
      .lean();
    return res.json({ records });
  } catch (error) {
    console.error("Health-record list failed:", error);
    return res.status(500).json({ error: "Could not load health records right now." });
  }
});

router.post("/", async (req, res) => {
  const { input, error: inputError } = recordInput(req.body);
  if (inputError) return res.status(400).json({ error: inputError });
  try {
    const record = await HealthRecord.create({ ...input, userId: req.userId });
    return res.status(201).json({ record });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ error: "Please check the health-record details and try again." });
    }
    console.error("Health-record create failed:", error);
    return res.status(500).json({ error: "Could not save the health record right now." });
  }
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid health-record ID." });
  try {
    const record = await HealthRecord.findOne({ _id: req.params.id, userId: req.userId }).lean();
    if (!record) return res.status(404).json({ error: "Health record not found." });
    return res.json({ record });
  } catch (error) {
    console.error("Health-record lookup failed:", error);
    return res.status(500).json({ error: "Could not load the health record right now." });
  }
});

router.patch("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid health-record ID." });
  const { input, error: inputError } = recordInput(req.body, { partial: true });
  if (inputError) return res.status(400).json({ error: inputError });
  if (!Object.keys(input).length) return res.status(400).json({ error: "Provide at least one field to update." });
  try {
    const record = await HealthRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: input },
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ error: "Health record not found." });
    return res.json({ record });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ error: "Please check the health-record details and try again." });
    }
    console.error("Health-record update failed:", error);
    return res.status(500).json({ error: "Could not update the health record right now." });
  }
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid health-record ID." });
  try {
    const record = await HealthRecord.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!record) return res.status(404).json({ error: "Health record not found." });
    return res.sendStatus(204);
  } catch (error) {
    console.error("Health-record delete failed:", error);
    return res.status(500).json({ error: "Could not delete the health record right now." });
  }
});

export default router;
