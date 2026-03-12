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

  const app = express();

  // Ensure uploads folder exists
  const uploadDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Ensure uploads/guidelines folder exists
  const guidelinesDir = path.join(uploadDir, "guidelines");
  if (!fs.existsSync(guidelinesDir)) fs.mkdirSync(guidelinesDir, { recursive: true });

  // CORS
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
  }));

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session
  app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
  }));

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));
  // ✅ Serve guidelines specifically at /uploads/guidelines
  app.use("/uploads/guidelines", express.static(guidelinesDir));

  // Routes
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

  // Hazard proxy route for Pasig City
  app.get("/hazards", async (req, res) => {
    try {
      const citiesRes = await fetch("https://api.mapakalamidad.ph/cities");
      const citiesJson = await citiesRes.json();
      const pasig = citiesJson.result?.find(
        (city) => city.name.toLowerCase().includes("pasig") || city.code.toLowerCase().includes("pasig")
      );
      if (!pasig) return res.status(404).json({ error: "Pasig City not found", cities: citiesJson.result });

      const pasigCode = pasig.code;
      const reportsRes = await fetch(
        `https://api.mapakalamidad.ph/reports?geoformat=geojson&admin=${pasigCode}`,
        { headers: { "User-Agent": "MyHazardMapApp/1.0" } }
      );
      const reportsData = await reportsRes.json();
      res.json(reportsData.result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Test route
  app.get("/api/tryserver", (req, res) => {
    res.json({ message: "Server is working!" });
  });

  // MongoDB
  mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

  // Start server
  app.listen(8000, () => {
    console.log('Server is running at http://localhost:8000');
    console.log('Hazard proxy available at http://localhost:8000/hazards');
  });