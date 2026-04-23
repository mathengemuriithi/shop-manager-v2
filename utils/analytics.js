// utils/analytics.js
const fs = require("fs");
const path = require("path");

const analyticsPath = path.join(__dirname, "../data/analytics.json");
const clientIp = req.clientIp;
// Read analytics data
function readAnalytics() {
  if (!fs.existsSync(analyticsPath)) {
    const defaultData = {
      lifetime: { totalViews: 0, uniqueVisitors: 0 },
      monthly: {},
      productViews: {},
      dailyVisits: [],
    };
    fs.writeFileSync(analyticsPath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(analyticsPath, "utf8"));
}

// Write analytics data
function writeAnalytics(data) {
  fs.writeFileSync(analyticsPath, JSON.stringify(data, null, 2));
}

// Get current month key (YYYY-MM)
function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Get today's date key (YYYY-MM-DD)
function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// Track a page view (call this from middleware)
function trackPageView(req, isAdmin = false) {
  if (isAdmin) return; // Don't track admin visits

  const analytics = readAnalytics();
  const clientIp = req.ip || req.connection.remoteAddress;
  const currentMonth = getCurrentMonth();
  const todayKey = getTodayKey();

  // Track unique visitors (by IP, reset monthly)
  if (!req.session.visitorTracked) {
    req.session.visitorTracked = true;
    analytics.lifetime.uniqueVisitors++;

    // Track monthly unique
    if (!analytics.monthly[currentMonth]) {
      analytics.monthly[currentMonth] = {
        uniqueVisitors: 0,
        totalViews: 0,
        productViews: {},
      };
    }
    analytics.monthly[currentMonth].uniqueVisitors++;
  }

  // Track total views (every page load)
  analytics.lifetime.totalViews++;

  // Track monthly views
  if (!analytics.monthly[currentMonth]) {
    analytics.monthly[currentMonth] = {
      uniqueVisitors: 0,
      totalViews: 0,
      productViews: {},
    };
  }
  analytics.monthly[currentMonth].totalViews++;

  // Track daily visits for chart
  const todayEntry = analytics.dailyVisits.find((d) => d.date === todayKey);
  if (todayEntry) {
    todayEntry.views++;
  } else {
    analytics.dailyVisits.push({ date: todayKey, views: 1 });
    // Keep last 30 days only
    if (analytics.dailyVisits.length > 30) analytics.dailyVisits.shift();
  }

  writeAnalytics(analytics);
  return analytics;
}

// Track product view
function trackProductView(productId, isAdmin = false) {
  if (isAdmin) return;

  const analytics = readAnalytics();
  const currentMonth = getCurrentMonth();

  // Lifetime product views
  if (!analytics.productViews[productId]) {
    analytics.productViews[productId] = 0;
  }
  analytics.productViews[productId]++;

  // Monthly product views
  if (!analytics.monthly[currentMonth]) {
    analytics.monthly[currentMonth] = {
      uniqueVisitors: 0,
      totalViews: 0,
      productViews: {},
    };
  }
  if (!analytics.monthly[currentMonth].productViews[productId]) {
    analytics.monthly[currentMonth].productViews[productId] = 0;
  }
  analytics.monthly[currentMonth].productViews[productId]++;

  writeAnalytics(analytics);
}

// Get analytics for admin dashboard
function getAnalytics(month = null) {
  const analytics = readAnalytics();
  const targetMonth = month || getCurrentMonth();

  return {
    lifetime: analytics.lifetime,
    currentMonth: analytics.monthly[targetMonth] || {
      uniqueVisitors: 0,
      totalViews: 0,
      productViews: {},
    },
    monthlyData: analytics.monthly,
    dailyVisits: analytics.dailyVisits.slice(-30),
    topProducts: Object.entries(analytics.productViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
  };
}

module.exports = {
  trackPageView,
  trackProductView,
  getAnalytics,
  readAnalytics,
};
