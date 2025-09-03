require("dotenv").config();
const mysql = require("mysql2/promise");

let conn;

async function connectDB() {
  if (!conn) {
    try {
      conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false }
      });
      console.log("Server is connected to database.");
    } catch (err) {
      console.error("❌ Database connection failed:", err);
      throw err;
    }
  }
  return conn;
}

module.exports = connectDB;
