# E-Voting App Setup Instructions (React + Node + MySQL)

This guide provides the full code and instructions to recreate the E-Voting app in a new workspace (`S:\sand\e-voting`).

## 1. Project Initialization

Create a new folder `S:\sand\e-voting`. Inside it, create two folders: `server` (Backend) and `client` (Frontend).

### Command:

```bash
mkdir "S:\sand\e-voting"
cd "S:\sand\e-voting"
mkdir server client
```

---

## 2. Backend Setup (`server`)

### 2.1 Initialize & Install Dependencies

Run these commands inside `server/`:

```bash
cd server
npm init -y
npm install express mysql2 cors dotenv nodemon body-parser
```

### 2.2 Create `server/index.js` (Main Server)

```javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");
const authRoutes = require("./routes/auth");
const candidateRoutes = require("./routes/candidates");
const voteRoutes = require("./routes/vote");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes); // Use this for fetching candidates
app.use("/api/vote", voteRoutes);

app.get("/", (req, res) => {
  res.send("E-Voting API Running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### 2.3 Create `server/db.js` (Database Connection)

```javascript
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "u1782496_osim",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise();
```

### 2.4 Create `server/.env`

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=u1782496_osim
JWT_SECRET=rahasia_negara_123
```

### 2.5 Create Routes

Create a folder `server/routes` and add these files:

#### `server/routes/auth.js`

```javascript
const express = require("express");
const router = express.Router();
const db = require("../db");

// Login with Token
router.post("/login", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token is required" });

  try {
    const [rows] = await db.query("SELECT * FROM pemilih WHERE token = ?", [
      token,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Token tidak valid" });
    }

    const user = rows[0];
    // Return user info sans sensitive data if any
    res.json({
      id: user.id,
      nama: user.nama,
      role_id: user.role_id,
      has_voted: user.jumlah_suara_sah > 0, // Assuming >0 means voted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
```

#### `server/routes/candidates.js`

```javascript
const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all candidates
router.get("/", async (req, res) => {
  try {
    // Basic query, join with Wakil table if needed
    const [rows] = await db.query(`
      SELECT k.*, w.nama_wakil as wakil_nama 
      FROM kandidat k 
      LEFT JOIN wakil_kandidat w ON k.id = w.id_kandidat 
      ORDER BY k.nomor_urut ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
```

#### `server/routes/vote.js`

```javascript
const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { token, votes } = req.body; // votes is object { putra: ID, putri: ID }

  if (!token || !votes) return res.status(400).json({ error: "Invalid data" });

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Verify Token & Status Again
    const [userCheck] = await connection.query(
      "SELECT id, jumlah_suara_sah FROM pemilih WHERE token = ? FOR UPDATE",
      [token],
    );

    if (userCheck.length === 0) throw new Error("Token invalid");
    if (userCheck[0].jumlah_suara_sah > 0)
      throw new Error("Anda sudah memilih!");

    const userId = userCheck[0].id;

    // 2. Insert Votes
    const voteEntries = Object.values(votes); // Array of candidate IDs
    for (const candidateId of voteEntries) {
      if (candidateId) {
        await connection.query(
          "INSERT INTO suara (id_kandidat, id_pemilih, waktu) VALUES (?, ?, NOW())",
          [candidateId, userId],
        );
      }
    }

    // 3. Update Voter Status
    await connection.query(
      "UPDATE pemilih SET jumlah_suara_sah = ? WHERE id = ?",
      [voteEntries.length, userId],
    );

    await connection.commit();
    res.json({ success: true, message: "Voting berhasil!" });
  } catch (err) {
    await connection.rollback();
    res.status(400).json({ error: err.message || "Voting failed" });
  } finally {
    connection.release();
  }
});

module.exports = router;
```

---

## 3. Frontend Setup (`client`)

### 3.1 Initialize React

Run these commands inside `client/`:

```bash
cd client
npm create vite@latest . -- --template react
npm install axios react-router-dom framer-motion lucide-react
```

### 3.2 Key Components

#### `client/src/App.jsx`

```javascript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import VotingPage from "./pages/VotingPage";
import SuccessPage from "./pages/SuccessPage";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/vote" element={<VotingPage />} />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

#### `client/src/context/AuthContext.jsx` (Minimal)

```javascript
import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (token) => {
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        token,
      });
      if (res.data.has_voted) {
        throw new Error("Anda sudah menggunakan hak pilih.");
      }
      setUser({ ...res.data, token });
      return true;
    } catch (e) {
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 4. Running the App

### Start Backend

In `server/`:

```bash
npm start
# or
npx nodemon index.js
```

### Start Frontend

In `client/`:

```bash
npm run dev
```

Visit `http://localhost:5173` to start voting!
