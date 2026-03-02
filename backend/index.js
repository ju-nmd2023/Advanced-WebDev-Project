import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Creates the connection to MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 1) Testing the server
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend code running successfully" });
});

// 2) Testing the database
app.get("/api/health/db", async (req, res) => {
  const [rows] = await pool.query("SELECT 1 AS ok");
  res.json(rows[0]); // should return { ok: 1 }
});

// 3) Fetching stuff from the venues table
app.get("/api/venues", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM venues ORDER BY id ASC");
  res.json(rows);
});

app.post("/api/venues", async (req, res) => {
  const { name, category, address, description, website } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  await pool.query(
    "INSERT INTO venues (name, category, address, description, website) VALUES (?, ?, ?, ?, ?)",
    [name, category, address, description, website]
  );

  res.json({ message: "Venue created" });
});

async function addVenue() {
  const name = document.getElementById("name").value;

  if (!name) {
    alert("Name is required");
    return;
  }

  await fetch("http://localhost:3000/api/venues", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      category: document.getElementById("category").value,
      address: document.getElementById("address").value,
      website: document.getElementById("website").value,
    }),
  });

  loadVenues();
}

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Backend code running at http://localhost:${port}`);
});
