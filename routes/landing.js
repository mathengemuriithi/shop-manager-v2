// routes/landing.js
const express = require("express");
const router = express.Router();
const { readData } = require("../utils/db");

// GET / — Landing page
router.get("/", (req, res) => {
  const data = readData();

  // Featured products (first 4 for the hero/bestsellers section)
  const featuredProducts = data.products
    .filter(p => p.type === "product" && p.stock > 0)
    .slice(0, 4);

  res.render("landing", {
    data,
    featuredProducts,
    categories: data.categories,
  });
});

module.exports = router;
