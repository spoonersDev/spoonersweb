const express = require('express');
const router = express.Router();
const { getMenuHierarchy, createMenuItem, updateMenuItem, deleteMenuItem } = require('../repositories/menuRepository');
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

router.put(
    '/:id',
    requireAuth,
    requireRole(['admin', 'editor']),
    async (req, res) => {
        const { label, path, parentId, sortOrder, isActive } = req.body || {};
        const menuId = Number(req.params.id);
        const normalizedLabel = typeof label === 'string' ? label.trim() : '';
        const normalizedPath = typeof path === 'string' ? path.trim() : '';
        const normalizedParentId = parentId === '' || parentId === null || parentId === undefined ? null : Number(parentId);
        const normalizedSortOrder = Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0;
        const normalizedIsActive = typeof isActive === 'boolean' ? isActive : true;

        // Überprüfen der MenüID, parentID die vom Client gelifert wird
        // bevor dies in die weitere Verarbeitung für die Aktuallisierung
        // verwendet wir
        if (!Number.isInteger(menuId)) {
            return res.status(400).json({
            success: false,
            message: 'Ungültige Menü-ID.'
            });
        }

        if (parentId !== null && parentId !== undefined && parentId !== '' && !Number.isInteger(Number(parentId))) {
            return res.status(400).json({
            success: false,
            message: 'Ungültige übergeordnete Menü-ID.'
            });
        }

        //Prüfen der Benutzereingaben
        if (!normalizedLabel || !normalizedPath || !normalizedPath.startsWith('/')) {
            return res.status(400).json({
                success: false,
                message: 'Label und ein gültiger Pfad, beginnend mit „/“, sind erforderlich.'
              });
        }

        try {
            const updatedItem = await updateMenuItem(menuId, {
                label: normalizedLabel,
                path: normalizedPath,
                parentId: normalizedParentId,
                sortOrder: normalizedSortOrder,
                isActive: normalizedIsActive
            });

        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: 'Menüeintrag nicht gefunden.' }
            );
        }

        return res.status(200).json({
            success: true,
            item: updatedItem }
        );

        } catch (error) {
            if (error.code === '23514') { // Check constraint violation
                return res.status(400).json({
                    success: false,
                    message: error.message});
            }

        console.error('Menüeintrag konnte nicht aktualisiert werden:', error);
        return res.status(500).json({
        success: false,
        message: 'Menüeintrag konnte nicht aktualisiert werden.'
      });
    }
  }
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(['admin', 'editor']),
  async (req, res) => {
    const menuId = Number(req.params.id);

    if (!Number.isInteger(menuId)) {
      return res.status(400).json({
        success: false,
        message: 'Ungültige Menü-ID.'
      });
    }

    try {
      const deletedItem = await deleteMenuItem(menuId);

      if (!deletedItem) {
        return res.status(404).json({
          success: false,
          message: 'Menüeintrag nicht gefunden.'
        });
      }

      return res.status(200).json({
        success: true,
        item: deletedItem
      });
    } catch (error) {
      console.error('Menüeintrag konnte nicht gelöscht werden:', error);
      return res.status(500).json({
        success: false,
        message: 'Menüeintrag konnte nicht gelöscht werden.'
      });
    }
  }
);

module.exports = { menuRouter: router };     