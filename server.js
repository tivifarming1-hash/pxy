const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ENV VARIABLES (set these in Render dashboard)
const API_KEY = process.env.API_KEY;
const SERVER_ID = process.env.SERVER_ID;
const BASE_URL = process.env.BASE_URL;

// Start server
app.post("/start-server", async (req, res) => {
  try {
    await axios.post(
      `${BASE_URL}/${SERVER_ID}/power`,
      { signal: "start" },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false });
  }
});

// Get server status
app.get("/status", async (req, res) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/${SERVER_ID}/resources`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json"
        }
      }
    );

    const state = response.data.attributes.current_state;
    res.json({ status: state });
  } catch (err) {
    console.error(err.message);
    res.json({ status: "unknown" });
  }
});

// UI (served at /)
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Turn ON</title>
<style>
body {
  margin:0;
  height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  background:#0f172a;
  color:white;
  font-family:Arial;
}
.card {
  background:#111827;
  padding:30px;
  border-radius:15px;
  text-align:center;
}
button {
  padding:10px 20px;
  margin:5px;
  border:none;
  border-radius:8px;
  cursor:pointer;
  color:white;
}
.start { background:#22c55e; }
.refresh { background:#3b82f6; }
.dot {
  height:10px;
  width:10px;
  border-radius:50%;
  display:inline-block;
  margin-right:8px;
}
</style>
</head>
<body>

<div class="card">
  <h2>Server Panel</h2>
  <p><span id="dot" class="dot"></span>Status: <span id="status">Loading...</span></p>

  <button class="start" onclick="startServer()">Start</button>
  <button class="refresh" onclick="getStatus()">Refresh</button>
</div>

<script>
async function getStatus() {
  const res = await fetch("/status");
  const data = await res.json();

  document.getElementById("status").innerText = data.status;
  const dot = document.getElementById("dot");

  if (data.status === "running") dot.style.background = "#22c55e";
  else if (data.status === "starting") dot.style.background = "#facc15";
  else dot.style.background = "#ef4444";
}

async function startServer() {
  await fetch("/start-server", { method: "POST" });
  getStatus();
}

setInterval(getStatus, 5000);
getStatus();
</script>

</body>
</html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on port " + PORT));
