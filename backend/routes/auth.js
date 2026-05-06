const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendRegistrationOtpEmail } = require("../utils/mailer");

const router = express.Router();

const OTP_TTL_MS = 10 * 60 * 1000;
const REGISTRATION_TOKEN_TTL_MS = 15 * 60 * 1000;

const pendingOtps = new Map();
const verifiedRegistrationTokens = new Map();

function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, error: "Database is not connected" });
  }

  next();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function cleanupExpiredEntries() {
  const now = Date.now();

  for (const [email, entry] of pendingOtps.entries()) {
    if (entry.expiresAt <= now) {
      pendingOtps.delete(email);
    }
  }

  for (const [token, entry] of verifiedRegistrationTokens.entries()) {
    if (entry.expiresAt <= now) {
      verifiedRegistrationTokens.delete(token);
    }
  }
}

async function findExistingUserByEmail(email) {
  return User.findOne({
    $or: [
      { email },
      { username: email }
    ]
  });
}

router.post("/request-otp", requireDatabase, async (req, res) => {
  try {
    cleanupExpiredEntries();

    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existing = await findExistingUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const otp = generateOtp();
    pendingOtps.set(email, {
      otp,
      expiresAt: Date.now() + OTP_TTL_MS
    });

    await sendRegistrationOtpEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent",
      expiresInSeconds: OTP_TTL_MS / 1000
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send OTP", error: err.message });
  }
});

router.post("/verify-otp", (req, res) => {
  cleanupExpiredEntries();

  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || "").trim();

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  const pending = pendingOtps.get(email);

  if (!pending) {
    return res.status(400).json({ success: false, message: "OTP not found or expired" });
  }

  if (pending.expiresAt <= Date.now()) {
    pendingOtps.delete(email);
    return res.status(400).json({ success: false, message: "OTP has expired" });
  }

  if (pending.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  const registrationToken = generateToken();

  verifiedRegistrationTokens.set(registrationToken, {
    email,
    expiresAt: Date.now() + REGISTRATION_TOKEN_TTL_MS
  });
  pendingOtps.delete(email);

  res.json({
    success: true,
    message: "OTP verified",
    registrationToken,
    expiresInSeconds: REGISTRATION_TOKEN_TTL_MS / 1000
  });
});

// REGISTER
router.post("/register", requireDatabase, async (req, res) => {
  try {
    cleanupExpiredEntries();

    const email = normalizeEmail(req.body.email || req.body.username);
    const username = normalizeEmail(req.body.username || email);
    const password = String(req.body.password || "").trim();
    const registrationToken = String(req.body.registrationToken || "").trim();

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!registrationToken) {
      return res.status(403).json({ message: "OTP verification is required before registration" });
    }

    const verified = verifiedRegistrationTokens.get(registrationToken);

    if (!verified || verified.expiresAt <= Date.now() || verified.email !== email) {
      verifiedRegistrationTokens.delete(registrationToken);
      return res.status(403).json({ message: "Invalid or expired registration token" });
    }

    const existing = await findExistingUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    await user.save();

    verifiedRegistrationTokens.delete(registrationToken);

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// LOGIN
router.post("/login", requireDatabase, async (req, res) => {
  try {
    const identifier = normalizeEmail(req.body.email || req.body.username);
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/username and password are required" });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

module.exports = router;
