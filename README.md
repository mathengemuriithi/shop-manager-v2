# 🖥️ TechPoint Shop Manager

A professional, localhost-based shop management system for computer retail and service businesses. Built with Node.js, Express, EJS, and Tailwind CSS.

---

## ⚡ Quick Start (3 Steps)

### 1. Install Dependencies
```bash
cd shop-manager
npm install
```

### 2. Start the Server
```bash
npm start          # Production start
npm run dev        # Development (auto-restart with nodemon)
```

### 3. Open in Browser
```
http://localhost:3000
```

**Default Login:**
- Username: `admin`
- Password: `techpoint2025`

> ⚠️ Change credentials in `routes/auth.js` before any deployment!

---

## 📁 Folder Structure

```
shop-manager/
├── server.js               # Main Express app entry point
├── package.json
├── .gitignore
│
├── routes/
│   ├── auth.js             # Login / Logout routes
│   └── admin.js            # All CRUD routes (products, categories, settings)
│
├── middleware/
│   └── auth.js             # Session-based admin guard
│
├── utils/
│   └── db.js               # JSON read/write helpers
│
├── data/
│   └── data.json           # ← ALL DATA IS STORED HERE (back this up!)
│
├── views/
│   ├── login.ejs           # Login page
│   ├── partials/
│   │   ├── layout-top.ejs  # Sidebar + header shared layout
│   │   └── layout-bottom.ejs
│   └── admin/
│       ├── dashboard.ejs   # Main dashboard with stats
│       ├── products.ejs    # Searchable/filterable product list
│       ├── product-form.ejs # Add / Edit form (shared)
│       ├── categories.ejs  # Category management
│       └── settings.ejs    # Shop settings
│
└── public/
    └── uploads/            # Product images uploaded here
```

---

## 🔧 Features

| Feature | Description |
|---|---|
| 🔐 Admin Login | Session-based authentication |
| 📦 Products | Add, edit, delete with image upload |
| 🔧 Services | Same CRUD, stock field auto-hidden |
| 🏷️ Categories | Dynamic creation with emoji icons |
| 🔍 Search | Filter by name, SKU, category, type |
| 📊 Dashboard | Stats: item counts, stock value, low stock alerts |
| 🖼️ Images | Multer upload, stored in `/public/uploads/` |
| 💾 Persistence | All data in `data/data.json` — no database needed |

---

## 🚀 Deployment Notes

When moving to a live server (e.g. VPS, Railway, Render):

1. **Set environment variables:**
   ```env
   PORT=3000
   SESSION_SECRET=your-strong-random-secret-here
   ```

2. **Change credentials** in `routes/auth.js` or move them to env vars:
   ```js
   const ADMIN_USERNAME = process.env.ADMIN_USER || 'admin';
   const ADMIN_PASSWORD = process.env.ADMIN_PASS || 'changeme';
   ```

3. **Back up `data/data.json`** — this is your entire database.

4. For production, consider adding:
   - Rate limiting (`express-rate-limit`)
   - HTTPS (via nginx reverse proxy)
   - Automated JSON backups (cron job)

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `express` | Web framework |
| `express-session` | Session management |
| `connect-flash` | Flash messages |
| `ejs` | HTML templating |
| `multer` | Image file uploads |
| `nodemon` (dev) | Auto-restart on save |
