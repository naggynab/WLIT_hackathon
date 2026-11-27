import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.mjs";
import { requireAuth } from "../middleware/requireAuth.mjs";

const router = Router();
const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  phone: user.phone,
  dueDate: user.dueDate,
  preferredLanguage: user.preferredLanguage,
});

function normalizePhone(value) {
  const phone = String(value || "").trim().replace(/[\s()-]/g, "");
  if (/^9\d{9}$/.test(phone)) return `+977${phone}`;
  if (/^9779\d{9}$/.test(phone)) return `+${phone}`;
  if (/^\+[1-9]\d{7,14}$/.test(phone)) return phone;
  return null;
}

function issueToken(userId) {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) return null;
  return jwt.sign({}, secret, {
    subject: String(userId),
    issuer: "aamacare",
    expiresIn: "12h",
  });
}

router.post("/signup", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const phone = normalizePhone(req.body?.phone);
  const password = String(req.body?.password || "");
  const dueDate = req.body?.dueDate ? new Date(req.body.dueDate) : null;
  const preferredLanguage = req.body?.preferredLanguage === "en" ? "en" : "ne";

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: "Enter a name between 2 and 100 characters." });
  }
  if (!phone) return res.status(400).json({ error: "Enter a valid mobile number." });
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Use a password between 8 and 128 characters." });
  }
  if (req.body?.dueDate && Number.isNaN(dueDate.getTime())) {
    return res.status(400).json({ error: "Enter a valid estimated due date." });
  }
  if (!process.env.JWT_SECRET?.trim() || Buffer.byteLength(process.env.JWT_SECRET.trim(), "utf8") < 32) {
    return res.status(503).json({ error: "Authentication is not configured." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, phone, passwordHash, dueDate, preferredLanguage });
    const token = issueToken(user._id);
    return res.status(201).json({ token, user: safeUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "An account already uses this mobile number." });
    if (error.name === "ValidationError") return res.status(400).json({ error: "Please check the account details and try again." });
    console.error("Signup failed:", error);
    return res.status(500).json({ error: "Could not create the account right now." });
  }
});

router.post("/login", async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  const password = String(req.body?.password || "");
  if (!phone || !password) return res.status(400).json({ error: "Enter your mobile number and password." });
  if (!process.env.JWT_SECRET?.trim() || Buffer.byteLength(process.env.JWT_SECRET.trim(), "utf8") < 32) {
    return res.status(503).json({ error: "Authentication is not configured." });
  }

  try {
    const user = await User.findOne({ phone }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Mobile number or password is incorrect." });
    }
    const token = issueToken(user._id);
    return res.json({ token, user: safeUser(user) });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ error: "Could not sign in right now." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "Account not found." });
    return res.json({ user: safeUser(user) });
  } catch (error) {
    console.error("Profile lookup failed:", error);
    return res.status(500).json({ error: "Could not load the account right now." });
  }
});

export default router;
