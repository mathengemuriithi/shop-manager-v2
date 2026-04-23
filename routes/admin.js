// routes/admin.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getAnalytics } = require("../utils/analytics");
const { readData, writeData, generateId } = require("../utils/db");
const { isAuthenticated } = require("../middleware/auth");

// ─── MULTER CONFIG ──────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `img_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok =
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error("Only image files are allowed!"));
  },
});

// ─── APPLY AUTH TO ALL ADMIN ROUTES ────────────────────────────────────────
router.use(isAuthenticated);

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  const data = readData();
  const totalProducts = data.products.filter(
    (p) => p.type === "product",
  ).length;
  const totalServices = data.products.filter(
    (p) => p.type === "service",
  ).length;
  const lowStock = data.products.filter(
    (p) => p.type === "product" && p.stock !== null && p.stock <= 3,
  );
  const totalValue = data.products
    .filter((p) => p.type === "product")
    .reduce((sum, p) => sum + p.price * (p.stock || 0), 0);

  res.render("admin/dashboard", {
    data,
    stats: { totalProducts, totalServices, lowStock, totalValue },
    username: req.session.username,
    messages: { error: req.flash("error"), success: req.flash("success") },
  });
});

// ─── PRODUCTS LIST ──────────────────────────────────────────────────────────
router.get("/products", (req, res) => {
  const data = readData();
  const { search, category, type } = req.query;
  let items = data.products;

  if (search)
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())),
    );
  if (category) items = items.filter((p) => p.categoryId === category);
  if (type) items = items.filter((p) => p.type === type);

  res.render("admin/products", {
    data,
    items,
    filters: { search, category, type },
    username: req.session.username,
    messages: { error: req.flash("error"), success: req.flash("success") },
  });
});

// ─── ADD PRODUCT FORM ────────────────────────────────────────────────────────
router.get("/products/add", (req, res) => {
  const data = readData();
  res.render("admin/product-form", {
    data,
    product: null,
    isEdit: false,
    username: req.session.username,
    messages: { error: req.flash("error"), success: req.flash("success") },
  });
});

// ─── ADD PRODUCT POST ────────────────────────────────────────────────────────
router.post("/products/add", upload.single("image"), (req, res) => {
  const data = readData();
  const { name, categoryId, type, price, stock, sku, description } = req.body;

  const newProduct = {
    id: generateId("prod"),
    name: name.trim(),
    categoryId,
    type,
    price: parseFloat(price) || 0,
    stock: type === "service" ? null : parseInt(stock) || 0,
    sku: sku ? sku.trim() : "",
    description: description ? description.trim() : "",
    image: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: new Date().toISOString(),
  };

  data.products.push(newProduct);
  writeData(data);
  req.flash("success", `"${newProduct.name}" added successfully!`);
  res.redirect("/admin/products");
});

// ─── EDIT PRODUCT FORM ───────────────────────────────────────────────────────
router.get("/products/edit/:id", (req, res) => {
  const data = readData();
  const product = data.products.find((p) => p.id === req.params.id);
  if (!product) {
    req.flash("error", "Product not found.");
    return res.redirect("/admin/products");
  }

  res.render("admin/product-form", {
    data,
    product,
    isEdit: true,
    username: req.session.username,
    messages: { error: req.flash("error"), success: req.flash("success") },
  });
});

// ─── EDIT PRODUCT POST ───────────────────────────────────────────────────────
router.post("/products/edit/:id", upload.single("image"), (req, res) => {
  const data = readData();
  const index = data.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    req.flash("error", "Product not found.");
    return res.redirect("/admin/products");
  }

  const existing = data.products[index];
  const { name, categoryId, type, price, stock, sku, description } = req.body;
  // In routes/admin.js, before any delete operation
  const { execSync } = require("child_process");
  execSync("node utils/backup.js");
  // If new image uploaded, delete old one
  if (req.file && existing.image) {
    const oldPath = path.join(__dirname, "../public", existing.image);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  data.products[index] = {
    ...existing,
    name: name.trim(),
    categoryId,
    type,
    price: parseFloat(price) || 0,
    stock: type === "service" ? null : parseInt(stock) || 0,
    sku: sku ? sku.trim() : "",
    description: description ? description.trim() : "",
    image: req.file ? `/uploads/${req.file.filename}` : existing.image,
    updatedAt: new Date().toISOString(),
  };

  writeData(data);
  req.flash("success", `"${name}" updated successfully!`);
  res.redirect("/admin/products");
});

// ─── DELETE PRODUCT ──────────────────────────────────────────────────────────
router.post("/products/delete/:id", (req, res) => {
  const data = readData();
  const product = data.products.find((p) => p.id === req.params.id);
  if (!product) {
    req.flash("error", "Product not found.");
    return res.redirect("/admin/products");
  }

  // Remove image file if exists
  if (product.image) {
    const imgPath = path.join(__dirname, "../public", product.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  data.products = data.products.filter((p) => p.id !== req.params.id);
  writeData(data);
  req.flash("success", `"${product.name}" deleted.`);
  res.redirect("/admin/products");
});
// Add this route for the analytics
router.get("/analytics", (req, res) => {
  const data = readData();
  const analytics = getAnalytics();
  const monthlyData = Object.entries(analytics.monthlyData)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12);

  res.render("admin/analytics", {
    data,
    analytics,
    monthlyData,
    topProducts: analytics.topProducts,
    username: req.session.username,
    messages: { error: req.flash("error"), success: req.flash("success") },
  });
});
// ─── CATEGORIES ──────────────────────────────────────────────────────────────
router.get("/categories", (req, res) => {
  const data = readData();
  res.render("admin/categories", {
    data,
    username: req.session.username,
    messages: { error: req.flash("error"), success: req.flash("success") },
  });
});

router.post("/categories/add", (req, res) => {
  const data = readData();
  const { name, icon } = req.body;
  if (!name || !name.trim()) {
    req.flash("error", "Category name is required.");
    return res.redirect("/admin/categories");
  }

  const exists = data.categories.find(
    (c) => c.name.toLowerCase() === name.trim().toLowerCase(),
  );
  if (exists) {
    req.flash("error", "Category already exists.");
    return res.redirect("/admin/categories");
  }

  data.categories.push({
    id: generateId("cat"),
    name: name.trim(),
    icon: icon ? icon.trim() : "📦",
  });
  writeData(data);
  req.flash("success", `Category "${name.trim()}" created.`);
  res.redirect("/admin/categories");
});

router.post("/categories/delete/:id", (req, res) => {
  const data = readData();
  const cat = data.categories.find((c) => c.id === req.params.id);
  if (!cat) {
    req.flash("error", "Category not found.");
    return res.redirect("/admin/categories");
  }

  const inUse = data.products.some((p) => p.categoryId === req.params.id);
  if (inUse) {
    req.flash(
      "error",
      `Cannot delete "${cat.name}" — it has products assigned to it.`,
    );
    return res.redirect("/admin/categories");
  }

  data.categories = data.categories.filter((c) => c.id !== req.params.id);
  writeData(data);
  req.flash("success", `Category "${cat.name}" deleted.`);
  res.redirect("/admin/categories");
});

// ─── SETTINGS ────────────────────────────────────────────────────────────────
router.get("/settings", (req, res) => {
  const data = readData();
  res.render("admin/settings", {
    data,
    username: req.session.username,
    messages: { error: req.flash("error"), success: req.flash("success") },
  });
});

router.post("/settings", (req, res) => {
  const data = readData();
  const { shopName, currency, currencySymbol } = req.body;
  data.settings = { shopName, currency, currencySymbol };
  writeData(data);
  req.flash("success", "Settings saved.");
  res.redirect("/admin/settings");
});

module.exports = router;
