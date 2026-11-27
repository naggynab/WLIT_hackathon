import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    // Store a normalized E.164 number, for example +97798XXXXXXXX.
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^\+[1-9]\d{7,14}$/,
    },
    // Store only a one-way password hash here, never the submitted password.
    passwordHash: {
      type: String,
      required: true,
      select: false,
      minlength: 20,
      maxlength: 255,
    },
    role: { type: String, enum: ["user", "health_worker"], default: "user", required: true },
    facilityName: { type: String, trim: true, maxlength: 120, default: "" },
    dueDate: {
      type: Date,
      default: null,
    },
    age: { type: Number, min: 10, max: 60, required: function requiredForUser() { return this.role === "user"; } },
    weightKg: { type: Number, min: 20, max: 300, required: function requiredForUser() { return this.role === "user"; } },
    height: { type: Number, min: 80, max: 250, required: function requiredForUser() { return this.role === "user"; } },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      required: function requiredForUser() { return this.role === "user"; },
    },
    healthNotes: { type: String, trim: true, maxlength: 500, default: "" },
    preferredLanguage: {
      type: String,
      enum: ["en", "ne"],
      default: "ne",
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
