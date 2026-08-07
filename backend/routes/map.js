const express = require('express');
const { requireAuth, requirePaidAccess } = require('../middleware/requireAuth');
const { getMapInitConfig } = require('../services/mapService');

const router = express.Router();

router.get('/entdecken/map-init', requireAuth, requirePaidAccess, async (_req, res) => {
	try {
		const config = await getMapInitConfig();

		return res.json({
			success: true,
			map: config
		});
	} catch (error) {
		return res.status(502).json({
			success: false,
			message: 'Map-Konfiguration konnte nicht geladen werden',
			detail: error.message
		});
	}
});

module.exports = { mapRouter: router };