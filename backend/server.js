const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({
  origin: "https://Max0993.github.io/Renand_platform/"
}));
app.use(express.json());

const Record = require("./models/Record");

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.warn("MONGO_URI is not set. Database routes will return 503 until it is configured.");
} else {
  mongoose.connect(mongoUri)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err.message));
}

app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database is not connected" });
  }

  next();
});

const recordsRouter = require("./routes/records");

app.get("/api/data", async (req, res) => {
  try {
    const data = await Record.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/api/records", recordsRouter);
app.use("/api/data", recordsRouter);

app.use("/api/auth", require("./routes/auth"));


const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
