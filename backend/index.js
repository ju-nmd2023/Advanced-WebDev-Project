import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/venues", async (req, res) => {
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
});

app.post("/api/venues", async (req, res) => {
  try {
    console.log("Incoming venue:", req.body);

    const {
      name,
      category,
      location,
      address,
      website,
      rating,
      opening_hours,
      maps_link,
    } = req.body;

    await pool.query(
      `INSERT INTO venues
      (name, category, location, address, website, rating, opening_hours, maps_link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category,
        location,
        address,
        website,
        rating,
        opening_hours,
        maps_link,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
