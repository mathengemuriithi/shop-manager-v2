// server.js — TechPoint Shop Manager
// ─────────────────────────────────────────────────────────────────────────────
// Main Express application entry point.
// Future deployment: set PORT and SESSION_SECRET as environment variables.
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const publicRoutes = require("./routes/public");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── VIEW ENGINE ─────────────────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(express.static(path.join(__dirname, "public")));

// ─── BODY PARSING ────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── SESSION ─────────────────────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "techpoint-super-secret-key-2025",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 8, // 8-hour session
    },
  }),
);

// ─── FLASH MESSAGES ──────────────────────────────────────────────────────────
app.use(flash());

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/shop", publicRoutes);

// ===== ADD SETUP ROUTE HERE (BEFORE app.listen) =====
//const setupRouter = require("./routes/setup");
//app.use("/setup", setupRouter);

// ─── ROOT REDIRECT ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  // If admin is logged in, go to admin panel
  if (req.session.isAdmin) return res.redirect("/admin");
  // Otherwise, show the shop
  res.redirect("/shop"); // ← Now visitors see products
});

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send(`
    <html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#94a3b8;">
      <div style="text-align:center;">
        <h1 style="font-size:5rem;color:#38bdf8;margin:0">404</h1>
        <p style="font-size:1.25rem;">Page not found.</p>
        <a href="/admin" style="color:#38bdf8;">← Back to Dashboard</a>
      </div>
    </body></html>
  `);
});

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║   🖥️  TechPoint- Shop Manager Running    ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`\n  → App:   http://localhost:${PORT}`);
  console.log(`  → Login: http://localhost:${PORT}/login`);
  console.log("\n  Credentials: admin / techpoint2025");
  console.log("  (Change in routes/auth.js before deploying)\n");
});
const setupRouter = require("./routes/setup");
app.use("/setup", setupRouter);
