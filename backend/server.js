const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^https:\/\/[a-z0-9-]+\.github\.io$/i,
  ...((process.env.CORS_ORIGINS || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean))
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }

      return allowedOrigin === origin;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  next(err);
});

const Record = require("./models/Record");
const recordsRouter = require("./routes/records");
const authRouter = require("./routes/auth");
const { router: adminRouter, requireAdminToken } = require("./routes/admin");

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
    endpoints: [
      "GET /test",
      "GET /api/data",
      "GET /api/data/records",
      "POST /api/data/records",
      "POST /api/admin/request-otp",
      "POST /api/admin/verify-otp",
      "POST /api/auth/request-otp",
      "POST /api/auth/verify-otp",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/data/auth/register",
      "POST /api/data/auth/login"
    ]
  });
});

app.get("/test", (req, res) => {
  res.send("OK");
});

app.get("/api/data", requireDatabase, requireAdminToken, async (req, res) => {
  try {
    const data = await Record.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/api/admin", adminRouter);

app.use("/api/records", requireDatabase, recordsRouter);
app.use("/api/data/records", requireDatabase, recordsRouter);

app.use("/api/auth", authRouter);
app.use("/api/data/auth", authRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  connectDatabase();
});
