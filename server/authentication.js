require("dotenv").config()
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken")
const connectDB = require("./db")
const app = express();
  const corsOptions = {
  origin: "http://localhost:5173", 
  credentials: true,              
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Root endpoint
app.get("/", (req, res) => {
  res.send("<h1 style='color: green; width: 100%; height: 70vh; text-align: center; font-size: 5rem; display: flex; justify-content: center; align-items: center;'>Authentication Server is Running...</h1>");
});

// Generate access token
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.userName, role: user.isAdmin ? "admin" : "user" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
}

// Generate refreshToken
function generateRefreshToken(user) {
  const refreshToken = jwt.sign(
    { id: user.id, username: user.userName },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return refreshToken;
}


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}


app.post("/api/login", async (req, res) => {
  const { username, lastname } = req.body;

  if (!username || !lastname) {
    return res.status(400).json({ error: "Something is missing..." });
  }

  try {
    const conn = await connectDB();
    const [results] = await conn.query(
      "SELECT * FROM users WHERE userName = ? AND lastName = ?",
      [username, lastname]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];

    // Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    console.log("accessToken", accessToken);
    console.log("refreshToken: ", refreshToken);
    
    
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      role: user.isAdmin ? "admin" : "user",
      accessToken,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/refreshToken", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const refreshedUser = { id: user.id, username: user.username };
    const accessToken = generateAccessToken(refreshedUser);

    res.json({ accessToken });
  });
});

// Logout (clear cookie)
app.post("/api/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.sendStatus(204);
});


app.listen(5001, () => {
  console.log("Server is running on port 5001");
});
