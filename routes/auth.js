// routes/auth.js
const express = require("express");
const router = express.Router();

// ─── ADMIN CREDENTIALS ─────────────────────────────────────────────────────
// Change these before deploying to a live server!
const ADMIN_USERNAME = "adminecs";
const ADMIN_PASSWORD = "techpoint2025";

// GET /login
router.get("/login", (req, res) => {
  if (req.session.isAdmin) return res.redirect("/admin");
  res.render("login", {
    error: req.flash("error"),
    success: req.flash("success"),
    shopName: "TechPoint",
  });
});

// POST /login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    req.session.username = username;
    res.redirect("/admin");
  } else {
    req.flash("error", "Invalid username or password.");
    res.redirect("/login");
  }
});

// GET /logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
