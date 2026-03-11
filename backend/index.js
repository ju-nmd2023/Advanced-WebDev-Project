// Creating dependencies
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();

// Allows for the frontend to talk with backend
app.use(cors());
app.use(express.json());
// Makes it use the frontend folder
app.use(express.static("../frontend"));

// Connecting to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Verifying that the backend server is running
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Fetching the venues:
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

// Add a new venue to the table
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

    // This inserts the venue into the database:
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

// Login endpoint: Checking the username and password, and if it matches a user in the database
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.json({ success: false, message: "Wrong password" });
    }

    res.json({
      success: true,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Updating a venue
app.put("/api/venues/:id", async (req, res) => {
  const { id } = req.params;

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

  // This updates the venue in the database:
  await pool.query(
    `UPDATE venues
SET name=?, category=?, location=?, address=?, website=?, rating=?, opening_hours=?, maps_link=?
WHERE id=?`,
    [
      name,
      category,
      location,
      address,
      website,
      rating,
      opening_hours,
      maps_link,
      id,
    ]
  );

  res.json({ success: true });
});

// Deleting a venue
app.delete("/api/venues/:id", async (req, res) => {
  const id = req.params.id;

  await pool.query("DELETE FROM venues WHERE id = ?", [id]);

  res.json({ message: "Venue deleted" });
});

// Starting the server on port 3000
const port = Number(process.env.PORT || 3000);

// This starts the backend server:
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
