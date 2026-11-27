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
    dueDate: {
      type: Date,
      default: null,
    },
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
