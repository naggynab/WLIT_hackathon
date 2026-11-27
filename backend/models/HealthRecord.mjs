import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema(
  {
    bloodPressureSystolic: { type: Number, min: 0, max: 300 },
    bloodPressureDiastolic: { type: Number, min: 0, max: 300 },
    weightKg: { type: Number, min: 0, max: 500 },
    heightCm: { type: Number, min: 0, max: 300 },
  },
  { _id: false }
);

const healthRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // `visit`, `test`, and `note` match the current health-record form.
    type: {
      type: String,
      required: true,
      enum: [
        "visit",
        "measurement",
        "test",
        "ultrasound",
        "medication",
        "symptom",
        "note",
        "other",
      ],
    },
    title: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    recordedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    facilityName: { type: String, trim: true, maxlength: 160 },
    healthWorkerName: { type: String, trim: true, maxlength: 120 },
    notes: { type: String, trim: true, maxlength: 5000 },
    measurements: { type: measurementSchema, default: undefined },
  },
  {
    timestamps: true,
    collection: "health_records",
  }
);

healthRecordSchema.index({ userId: 1, recordedAt: -1 });
healthRecordSchema.index({ userId: 1, type: 1, recordedAt: -1 });

export const HealthRecord = mongoose.models.HealthRecord || mongoose.model("HealthRecord", healthRecordSchema);
export default HealthRecord;
