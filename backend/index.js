import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

// MySQL connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test server
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend running" });
});

// Test database
app.get("/api/health/db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// GET venues with optional filters
app.get("/api/venues", async (req, res) => {
  try {
    const { category, location } = req.query;

    let query = "SELECT * FROM venues WHERE 1=1";
    const params = [];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    if (location) {
      query += " AND location = ?";
      params.push(location);
    }

    query += " ORDER BY id ASC";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch venues" });
  }
});

// Add venue
app.post("/api/venues", async (req, res) => {
  try {
    const { name, category, location, address, website } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    await pool.query(
      `INSERT INTO venues (name, category, location, address, website)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        category || null,
        location || null,
        address || null,
        website || null,
      ]
    );

    res.json({ message: "Venue created" });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Failed to add venue" });
  }
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
