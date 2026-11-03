# Shop Manager v2

A full-stack e-commerce and service management system for a computer retail and cyber café business. Built with Node.js, Express, EJS, and file-based JSON storage, featuring a modern customer storefront, a powerful admin panel, and built-in visitor analytics.

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

### Customer Storefront & Landing Page
- **SEO-Optimized Landing Page** — Targets local search for "Cyber Services in Wang'uru, Mwea" with LocalBusiness JSON-LD schema, Open Graph tags, and canonical URLs.
- **Service Pricing Tables** — Transparent pricing for printing, laptop repair, government applications, and training.
- **Live Status Indicator** — JavaScript-driven "Open/Closed" badge based on Nairobi time zone business hours.
- **Product Catalogue** — Browse products and services in a responsive grid.
- **Search & Filtering** — Find products by name or description, filtered by category.
- **Pagination** — 12 products per page with smart navigation.
- **Dynamic Badges** — "Bestseller" and "Last Chance" (low stock) indicators.
- **WhatsApp Integration** — Direct inquiry with pre-filled product details and contact forms.

### Admin Panel
- **Secure Authentication** — Session-based admin login.
- **Dashboard** — Revenue, profit, low stock alerts, and 7-day chart.
- **Product Management** — Add, edit, and delete products with image upload.
- **Category Management** — Create and organize categories.
- **Shop Settings** — Manage store name, currency, and contact details.
- **Analytics Dashboard** — Total views, unique visitors, top products.

### Analytics & Tracking
- **Page View Tracking** — Every page load counted (excluding admin).
- **Unique Visitor Tracking** — IP-based visitor counting.
- **Product View Tracking** — Per-product popularity metrics.
- **Monthly Breakdown** — Lifetime and monthly statistics.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **Templating** | EJS (Embedded JavaScript) |
| **Styling** | Tailwind CSS (via CDN) + custom CSS |
| **File Uploads** | Multer |
| **Sessions** | express-session |
| **Flash Messages** | connect-flash |
| **Storage** | File-based JSON (`data.json`, `analytics.json`) |
| **Deployment** | Render.com (auto-deploy from GitHub) |

---

## Project Structure
