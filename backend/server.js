const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const Record = require("./models/Record");
const recordsRouter = require("./routes/records");

const mongoUri = process.env.MONGO_URI;

function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database is not connected" });
  }

  next();
}

async function connectDatabase() {
  if (!mongoUri) {
    console.warn("MONGO_URI is not set. Database routes will return 503 until it is configured.");
    return;
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
}

app.get("/", (req, res) => {
  res.json({
    message: "Renand backend is running",
    endpoints: ["/test", "/api/data", "/api/records", "/api/auth"]
  });
});

app.get("/test", (req, res) => {
  res.send("OK");
});

app.get("/api/data", requireDatabase, async (req, res) => {
  try {
    const data = await Record.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/api/records", requireDatabase, recordsRouter);

app.use("/api/auth", requireDatabase, require("./routes/auth"));

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  connectDatabase();
});
