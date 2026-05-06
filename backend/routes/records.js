const express = require("express");
const router = express.Router();
const Record = require("../models/Record");
const { sendRecordNotification } = require("../utils/mailer");

function getRangeStart(range) {
  const now = new Date();
  const start = new Date(now);

  if (range === "day") {
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "week") {
    const day = start.getDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - daysSinceMonday);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (range === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }

  return null;
}

router.post("/", async (req, res) => {
  try {
    const { name, phone, transfercode, opinion, montan, company } = req.body;

    const record = await Record.create({
      name,
      phone,
      transfercode,
      opinion,
      montan,
      company
    });

    let notificationSent = true;

    try {
      await sendRecordNotification(record);
    } catch (emailErr) {
      notificationSent = false;
      console.error("Record notification email failed:", emailErr.message);
    }

    res.status(201).json({ record, notificationSent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const start = getRangeStart(req.query.range);
    const filter = start ? { createdAt: { $gte: start, $lte: new Date() } } : {};
    const records = await Record.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
