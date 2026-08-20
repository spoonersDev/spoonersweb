const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/external-data', async (_req, res) => {
  try {
    const response = await axios.get('https://api.example.com/data');
    return res.json(response.data);
  } catch (_error) {
    return res.status(500).json({ error: 'Failed to fetch external data' });
  }
});

module.exports = { externalRouter: router };

