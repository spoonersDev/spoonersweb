const pool = require('../config/db');

async function getMenuHierarchy() {
  const result = await pool.query(
    `SELECT id, parent_id, label, path, sort_order
     FROM menu_items
     WHERE is_active = true
     ORDER BY parent_id NULLS FIRST, sort_order, id`
  );

  const menuItems = result.rows;
  const menuHierarchy = [];
  const menuItemsById  = {};

  menuItems.forEach(item => {
    menuItemsById[item.id] = { ...item, children: [] };
  });

  menuItems.forEach(item => {
    if (item.parent_id) {
      menuItemsById[item.parent_id].children.push(menuItemsById[item.id]);
    } else {
      menuHierarchy.push(menuItemsById[item.id]);
    }
  });

  return menuHierarchy;
}

async function createMenuItem({ label, path, parentId = null, sortOrder = 0, isActive = true}) {
  const result = await pool.query(
    `INSERT INTO menu_items (label, path, parent_id, sort_order, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, label, path, parent_id, sort_order, is_active`,
    [label, path, parentId, sortOrder, isActive]
  );

  return result.rows[0];
} 

async function updateMenuItem(id, { label, path, parentId, sortOrder, isActive }) {
  const result = await pool.query(
    `UPDATE menu_items
     SET label = $1, path = $2, parent_id = $3, sort_order = $4, is_active = $5
     WHERE id = $6
     RETURNING id, label, path, parent_id, sort_order, is_active`,
    [label, path, parentId, sortOrder, isActive, id]
  );

    return result.rows[0] || null;
}

async function deleteMenuItem(id) {
  const result = await pool.query(
    `DELETE FROM menu_items
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = { getMenuHierarchy, createMenuItem, updateMenuItem, deleteMenuItem };