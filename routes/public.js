// routes/public.js
// Public-facing storefront — no authentication required.
// Customers can browse all products and services by category.

const express = require("express");
const router = express.Router();
const { readData } = require("../utils/db");
const { trackProductView, getAnalytics } = require("../utils/analytics");

// GET /shop
router.get("/", (req, res) => {
  const data = readData();
  const { search, category, page = 1 } = req.query;

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

  // ===== PAGINATION LOGIC =====
  const itemsPerPage = 12;
  const currentPage = parseInt(page) || 1;
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);
  const productCount = products.length;

  // Get top product ID for bestseller badge (Feature 5)
  let topProductId = null;
  try {
    const analytics = getAnalytics();
    if (analytics.topProducts && analytics.topProducts.length > 0) {
      topProductId = analytics.topProducts[0][0];
    }
  } catch (error) {
    console.error("Analytics error:", error.message);
  }

  res.render("shop/index", {
    data: data,
    products: paginatedProducts,
    categories: data.categories,
    filters: { search: search || "", category: category || "" },
    productCount: productCount,
    topProductId: topProductId, // ← For bestseller badge
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages,
      prevPage: currentPage - 1,
      nextPage: currentPage + 1,
    },
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

  // Track product view (skip if admin)
  if (!req.session.isAdmin) {
    trackProductView(product.id, false);
  }

  // ===== RECENTLY VIEWED LOGIC =====
  let recentlyViewed = req.session.recentlyViewed || [];
  recentlyViewed = recentlyViewed.filter((id) => id !== product.id);
  recentlyViewed.unshift(product.id);
  recentlyViewed = recentlyViewed.slice(0, 5);
  req.session.recentlyViewed = recentlyViewed;

  const recentProducts = recentlyViewed
    .map((id) => data.products.find((p) => p.id === id))
    .filter((p) => p);

  // ===== VISITORS ALSO VIEWED (Feature 2) =====
  let topProducts = [];
  try {
    const analytics = getAnalytics();
    const topProductsIds = analytics.topProducts.map(([id]) => id);
    topProducts = topProductsIds
      .map((id) => data.products.find((p) => p.id === id))
      .filter((p) => p && p.id !== product.id)
      .slice(0, 4);
  } catch (error) {
    console.error("Analytics error:", error.message);
    // Fallback to recently viewed if analytics fails
    topProducts = recentProducts.slice(0, 4);
  }
  // =========================================

  res.render("shop/item", {
    data: data,
    product: product,
    cat: category,
    recentlyViewed: recentProducts,
    topProducts: topProducts, // ← Now defined!
  });
});

module.exports = router;
