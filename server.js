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
const { trackPageView, readAnalytics } = require("./utils/analytics");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── REQUEST IP ──────────────────────────────────────────────────────────────
const requestIp = require("request-ip");
app.use(requestIp.mw());

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

// ─── ANALYTICS MIDDLEWARE ────────────────────────────────────────────────────
app.use((req, res, next) => {
  // Skip tracking for admin routes and static files
  const isAdminRoute =
    req.path.startsWith("/admin") ||
    req.path === "/login" ||
    req.path === "/logout";
  const isStaticFile = req.path.match(/\.(css|js|jpg|jpeg|png|gif|webp|ico)$/);

  if (!isAdminRoute && !isStaticFile) {
    const isAdmin = req.session.isAdmin === true;
    trackPageView(req, isAdmin);
  }
  next();
});

// ─── MAKE ANALYTICS AVAILABLE TO ALL VIEWS ───────────────────────────────────
app.use((req, res, next) => {
  const analytics = readAnalytics();
  res.locals.totalViews = analytics.lifetime.totalViews;
  res.locals.uniqueVisitors = analytics.lifetime.uniqueVisitors;
  next();
});

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/shop", publicRoutes);

// Setup route (only uncomment if you have routes/setup.js)
// const setupRouter = require("./routes/setup");
// app.use("/setup", setupRouter);

// ─── ROOT REDIRECT ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  // If admin is logged in, go to admin panel
  if (req.session.isAdmin) return res.redirect("/admin");
  // Otherwise, show the shop
  res.redirect("/shop");
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
