const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.send("<h1 style='color: green; width: 100%; height: 70vh; text-align: center; font-size: 5rem; display: flex; justify-content: center; align-items: center;'>Server is Running...</h1>");
});

app.get("/api/getUsers", async (req, res) => {
  try {
    const conn = await connectDB();
    const [results] = await conn.query("SELECT * FROM users");
    res.json({ message: "users", results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/addUser", async (req, res) => {
  try {
    const { userName, lastName } = req.body;
    const conn = await connectDB();
    const [result] = await conn.query(
      "INSERT INTO users (userName, lastName) VALUES (?, ?)",
      [userName, lastName]
    );
    res.json({ message: "User added successfully", userID: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/deleteUser", async (req, res) => {
  try {
    const { userID } = req.body; // match your column name

    if (!userID) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const conn = await connectDB();
    const [result] = await conn.query("DELETE FROM users WHERE useID = ?", [userID]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    res.json({ message: "Something went wrong" })
  }
});

app.patch("/api/editUser", async (req, res) => {
  try {
    console.log("Incoming body:", req.body);
    const { newUserName, newLastName, userID } = req.body;
    if (!userID || !newUserName || !newLastName) {
      return res.status(400).json({ error: "Something is missing" });
    }

    const conn = await connectDB();
    const [result] = await conn.query(
      "UPDATE users SET userName = ?, lastName = ? WHERE useID = ?",
      [newUserName, newLastName, userID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
