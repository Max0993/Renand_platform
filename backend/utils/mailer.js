const nodemailer = require("nodemailer");

const ADMIN_EMAIL = "maximemarcelin09@gmail.com";

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set to send emails");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

async function sendMail({ to = ADMIN_EMAIL, subject, text, html }) {
  const transporter = createTransporter();

  return transporter.sendMail({
    from: `"Renand Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  });
}

function formatRecord(record) {
  return [
    `Name: ${record.name || ""}`,
    `Phone: ${record.phone || ""}`,
    `Transfer code: ${record.transfercode || ""}`,
    `Opinion: ${record.opinion || ""}`,
    `Montan: ${record.montan || ""}`,
    `Company: ${record.company || ""}`,
    `Submitted at: ${record.createdAt || new Date().toISOString()}`
  ].join("\n");
}

async function sendOtpEmail(otp) {
  return sendMail({
    subject: "Renand admin OTP code",
    text: `Your admin OTP code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your admin OTP code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`
  });
}

async function sendRegistrationOtpEmail(email, otp) {
  return sendMail({
    to: email,
    subject: "Renand registration OTP code",
    text: `Your Renand registration OTP code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your Renand registration OTP code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`
  });
}

async function sendRecordNotification(record) {
  const text = `A new customer submission was received:\n\n${formatRecord(record)}`;

  return sendMail({
    subject: "New Renand customer submission",
    text,
    html: `
      <p>A new customer submission was received:</p>
      <ul>
        <li><strong>Name:</strong> ${record.name || ""}</li>
        <li><strong>Phone:</strong> ${record.phone || ""}</li>
        <li><strong>Transfer code:</strong> ${record.transfercode || ""}</li>
        <li><strong>Opinion:</strong> ${record.opinion || ""}</li>
        <li><strong>Montan:</strong> ${record.montan || ""}</li>
        <li><strong>Company:</strong> ${record.company || ""}</li>
        <li><strong>Submitted at:</strong> ${record.createdAt || new Date().toISOString()}</li>
      </ul>
    `
  });
}

module.exports = {
  ADMIN_EMAIL,
  sendOtpEmail,
  sendRegistrationOtpEmail,
  sendRecordNotification
};
