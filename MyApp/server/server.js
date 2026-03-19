// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

dotenv.config();

const userRoutes = require('./routes/userRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const historyRoutes = require('./routes/historyRoutes');
const evacRoutes = require('./routes/EvacRoutes');
const authRoutes = require('./routes/authRoutes');
const barangayRoutes = require('./routes/barangayRoutes');
const drrmoRoutes = require('./routes/drrmoRoutes');
const reliefTrackingRoutes = require('./routes/reliefTrackingRoutes');
const auditRoutes = require('./routes/auditRoutes');
const guidelineRoutes = require("./routes/GuidelineRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const timeInOutRoutes = require('./routes/timeInOutRoutes');
const editRoutes = require('./routes/editRoutes');

const app = express();


// --------------------
// Ensure uploads folders exist
// --------------------
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const guidelinesDir = path.join(uploadDir, "guidelines");
if (!fs.existsSync(guidelinesDir)) fs.mkdirSync(guidelinesDir, { recursive: true });


// --------------------
// Body parsers
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --------------------
// CORS (FIXED)
// --------------------
const FRONTEND_URLS = [
  'http://localhost:3000',
  'http://localhost:8081',
  'https://sagipbayan.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || FRONTEND_URLS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


// --------------------
// Session (FIXED)
// --------------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,          // REQUIRED for Render (HTTPS)
    httpOnly: true,
    sameSite: 'none',      // REQUIRED for cross-origin cookies
    maxAge: 1000 * 60 * 60 * 24
  }
}));


// --------------------
// DEBUG (MUST BE BEFORE ROUTES)
// --------------------
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

app.get("/api/debug-express", (req, res) => {
  console.log("SESSION DEBUG:", req.session);
  res.json({
    message: "EXPRESS WORKING",
    session: req.session
  });
});


// --------------------
// Serve uploads
// --------------------
app.use("/uploads", express.static(uploadDir));
app.use("/uploads/guidelines", express.static(guidelinesDir));


// --------------------
// API Routes
// --------------------
app.use("/api/guidelines", guidelineRoutes);
app.use("/user", userRoutes);
app.use("/incident", incidentRoutes);
app.use("/history", historyRoutes);
app.use("/evacs", evacRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/barangays", barangayRoutes);
app.use("/api/drrmo", drrmoRoutes);
app.use("/api/relief-tracking", reliefTrackingRoutes);
app.use("/api/audit", auditRoutes);
app.use("/connection", connectionRoutes);
app.use('/api/timeinout', timeInOutRoutes);
app.use('/api/edit', editRoutes);


// --------------------
// Test route
// --------------------
app.get("/api/tryserver", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.get("/", (req, res) => {
  res.send("ROOT WORKING");
});


// --------------------
// React frontend (FIXED ORDER)
// --------------------
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..", "tests", "build");

  app.use(express.static(buildPath));

  // IMPORTANT: only catch NON-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next(); // don't touch API
    res.sendFile(path.join(buildPath, "index.html"));
  });
}


// --------------------
// MongoDB
// --------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error("MongoDB connection error:", err));


// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});