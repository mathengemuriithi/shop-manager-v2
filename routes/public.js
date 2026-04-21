// routes/public.js
// Public-facing storefront — no authentication required.
// Customers can browse all products and services by category.

const express = require("express");
const router = express.Router();
const { readData } = require("../utils/db");

// GET /shop
router.get("/", (req, res) => {
  const data = readData();
  const { search, category } = req.query;

  let products = data.products;

  // Apply search filter
  if (search) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(search.toLowerCase())),
    );
  }

  // Apply category filter
  if (category && category !== "all") {
    products = products.filter((p) => p.categoryId === category);
  }

  // Get product count for the badge
  const productCount = products.length;

  res.render("shop/index", {
    data: data,
    products: products,
    categories: data.categories,
    filters: { search: search || "", category: category || "" },
    productCount: productCount, // ← This enables the badge count
  });
});

// GET /shop/item/:id
router.get("/item/:id", (req, res) => {
  const data = readData();
  const product = data.products.find((p) => p.id === req.params.id);

  if (!product) {
    return res.redirect("/shop");
  }

  const category = data.categories.find((c) => c.id === product.categoryId);

  // ===== RECENTLY VIEWED LOGIC =====
  // Get existing recently viewed from session or create empty array
  let recentlyViewed = req.session.recentlyViewed || [];

  // Remove current product if already in list (to move it to front)
  recentlyViewed = recentlyViewed.filter((id) => id !== product.id);

  // Add current product to the beginning
  recentlyViewed.unshift(product.id);

  // Keep only last 5 products
  recentlyViewed = recentlyViewed.slice(0, 5);

  // Save back to session
  req.session.recentlyViewed = recentlyViewed;

  // Get full product objects for the recently viewed IDs
  const recentProducts = recentlyViewed
    .map((id) => data.products.find((p) => p.id === id))
    .filter((p) => p); // Remove any undefined entries
  // =================================

  res.render("shop/item", {
    data: data,
    product: product,
    cat: category,
    recentlyViewed: recentProducts, // ← Add this line
  });
});

module.exports = router;
