const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../seed-data/candidates.json');

  fs.readFile(filePath, 'utf8', (err, jsonData) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read candidates file' });
    }
    try {
      const data = JSON.parse(jsonData);
      res.json(data);
    } catch (parseErr) {
      res.status(500).json({ error: 'Failed to parse JSON' });
    }
  });
});

module.exports = router;
