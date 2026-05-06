const crypto = require("crypto");
const express = require("express");
const { ADMIN_EMAIL, sendOtpEmail } = require("../utils/mailer");

const router = express.Router();

const OTP_TTL_MS = 10 * 60 * 1000;
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

let currentOtp = null;
let currentOtpExpiresAt = 0;
const adminTokens = new Map();

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function cleanupExpiredTokens() {
  const now = Date.now();

  for (const [token, expiresAt] of adminTokens.entries()) {
    if (expiresAt <= now) {
      adminTokens.delete(token);
    }
  }
}

async function issueOtp() {
  const otp = generateOtp();

  currentOtp = otp;
  currentOtpExpiresAt = Date.now() + OTP_TTL_MS;

  await sendOtpEmail(otp);
}

function getTokenFromRequest(req) {
  const header = req.get("Authorization") || "";

  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }

  return req.get("x-admin-token");
}

async function requireAdminToken(req, res, next) {
  cleanupExpiredTokens();

  const token = getTokenFromRequest(req);

  if (token && adminTokens.has(token) && adminTokens.get(token) > Date.now()) {
    return next();
  }

  try {
    await issueOtp();
  } catch (err) {
    return res.status(500).json({
      error: "Admin access requires OTP, but the OTP email could not be sent",
      details: err.message
    });
  }

  return res.status(401).json({
    error: "Admin OTP required",
    message: `A one-time OTP was sent to ${ADMIN_EMAIL}`
  });
}

router.post("/request-otp", async (req, res) => {
  try {
    await issueOtp();
    res.json({ success: true, message: `OTP sent to ${ADMIN_EMAIL}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/verify-otp", (req, res) => {
  cleanupExpiredTokens();

  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ success: false, message: "OTP is required" });
  }

  if (!currentOtp || currentOtpExpiresAt <= Date.now()) {
    return res.status(400).json({ success: false, message: "OTP has expired" });
  }

  if (String(otp).trim() !== currentOtp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  const token = generateToken();
  const expiresAt = Date.now() + TOKEN_TTL_MS;

  adminTokens.set(token, expiresAt);
  currentOtp = null;
  currentOtpExpiresAt = 0;

  res.json({
    success: true,
    token,
    tokenType: "Bearer",
    expiresInSeconds: TOKEN_TTL_MS / 1000
  });
});

module.exports = {
  router,
  requireAdminToken
};
