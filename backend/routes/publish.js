const express = require('express');
const { requireAuth, requireRole } = require('../middleware/requireAuth');
const { publishMenu } = require('../repositories/menuRepository');

const router = express.Router();

router.post(
  '/',
  requireAuth,
  requireRole(['admin', 'editor']),
  async (req, res) => {
    try {
      await publishMenu(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Änderungen veröffentlicht.'
      });
    } catch (error) {
      console.error('Änderungen konnten nicht veröffentlicht werden:', error);
      return res.status(500).json({
        success: false,
        message: 'Änderungen konnten nicht veröffentlicht werden.'
      });
    }
  }
);

module.exports = { publishRouter: router };