const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/data.json');

router.get('/setup', (req, res) => {
  // Read current data
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // Add users if not exists
  if (!data.users) {
    data.users = [
      {
        id: "user_1",
        username: "admin",
        password: "admin123",
        role: "admin"
      }
    ];
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.send('Admin user created! Username: admin, Password: admin123');
  } else {
    res.send('Users already exist: ' + JSON.stringify(data.users));
  }
});

module.exports = router;