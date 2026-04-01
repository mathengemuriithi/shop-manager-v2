// utils/db.js
// Simple JSON file read/write helpers for data persistence.
// All data is stored in /data/data.json — no external DB required.

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/data.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data.json:', err.message);
    return { categories: [], products: [], settings: {} };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing data.json:', err.message);
    return false;
  }
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

module.exports = { readData, writeData, generateId };
