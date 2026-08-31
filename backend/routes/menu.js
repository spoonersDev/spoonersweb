const express = require('express');
const router = express.Router();
const { getMenuHierarchy, createMenuItem } = require('../repositories/menuRepository');
const { requireAuth, requireRole } = require('../middleware/requireAuth');

router.get(
        '/',
        async (_req, res) => {
  try {
    const menuItems = await getMenuHierarchy();
    return res.status(200).json({ success: true, items: menuItems });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return res.status(500).json({ success: false, error: 'Menü konnte nicht geladen werden' });
  }
});

router.post(
    '/',
    requireAuth,
    requireRole(['admin', 'editor']),
    async (req, res) => {
        const { label, path, parentId, sortOrder, isActive  } = req.body || {};
        if (!label?.trim() || !path?.trim() || !path.trim().startsWith('/')) {
            return res.status(400).json({ 
                success: false,
                message: 'Label und ein gültiger Pfad, beginnend mit „/“, sind erforderlich.' 
});
        }
        
        try {
            const newItem = await createMenuItem({
                label: label.trim(),
                path: path.trim(),
                parentId,
                sortOrder,
                isActive
            });
            return res.status(201).json({ success: true, item: newItem });
        } catch (error) {
            if (error.code === '23514') { // Check constraint violation
                return res.status(400).json({
                    success: false, message: error.message});
            }  
            
      console.error('Menüeintrag konnte nicht erstellt werden:', error);
      return res.status(500).json({
        success: false,
        message: 'Menüeintrag konnte nicht erstellt werden.'
      });
    }
  }
);

module.exports = { menuRouter: router };     