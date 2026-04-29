const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  transfercode: { type: String, required: true, trim: true },
  opinion: { type: String, required: true, trim: true },
  montan: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Record", recordSchema);
