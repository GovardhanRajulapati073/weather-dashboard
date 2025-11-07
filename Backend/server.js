// server.js — full backend code
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "../frontend")));

// Weather API route
app.get("/api/weather", async (req, res) => {
  const { city, lat, lon } = req.query;

  if (!city && !(lat && lon)) {
    return res.status(400).json({ error: "Provide ?city=CityName or ?lat=..&lon=.." });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    let currentUrl, forecastUrl;

    if (city) {
      const q = encodeURIComponent(city);
      currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${apiKey}&units=metric`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${q}&appid=${apiKey}&units=metric`;
    } else {
      currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    }

    const [currentResp, forecastResp] = await Promise.all([
      axios.get(currentUrl),
      axios.get(forecastUrl),
    ]);

    const current = currentResp.data;
    const forecast = forecastResp.data;

    res.json({ current, forecast });
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// Handle all other routes — serve frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🌦️ Server running on http://localhost:${PORT}`);
});
