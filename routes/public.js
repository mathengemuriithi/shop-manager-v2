// routes/public.js
// Public-facing storefront — no authentication required.
// Customers can browse all products and services by category.

const express = require('express');
const router  = express.Router();
const { readData } = require('../utils/db');

// GET /shop
router.get('/', (req, res) => {
  const data = readData();
  const { search, category } = req.query;

  let products = data.products;
  if (search)   products = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );
  if (category) products = products.filter(p => p.categoryId === category);

  res.render('shop/index', {
    data,
    products,
    filters: { search: search || '', category: category || '' }
  });
});

// GET /shop/item/:id
router.get('/item/:id', (req, res) => {
  const data    = readData();
  const product = data.products.find(p => p.id === req.params.id);
  if (!product) return res.redirect('/shop');
  const cat = data.categories.find(c => c.id === product.categoryId);
  res.render('shop/item', { data, product, cat });
});

module.exports = router;
