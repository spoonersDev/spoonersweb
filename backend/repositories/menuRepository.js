const pool = require('../config/db');

async function cloneRevision(client, sourceRevisionId, targetRevisionId) {
  const sourceItems = await client.query(
    `SELECT id, parent_id, label, path, sort_order, is_active
     FROM menu_item_versions
     WHERE revision_id = $1
     ORDER BY parent_id NULLS FIRST, sort_order, id`,
    [sourceRevisionId]
  );
  const idMap = new Map();

  for (const item of sourceItems.rows.filter((entry) => entry.parent_id === null)) {
    const result = await client.query(
      `INSERT INTO menu_item_versions
       (revision_id, source_id, label, path, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [targetRevisionId, item.id, item.label, item.path, item.sort_order, item.is_active]
    );
    idMap.set(item.id, result.rows[0].id);
  }

  for (const item of sourceItems.rows.filter((entry) => entry.parent_id !== null)) {
    const result = await client.query(
      `INSERT INTO menu_item_versions
       (revision_id, source_id, parent_id, label, path, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        targetRevisionId,
        item.id,
        idMap.get(item.parent_id) || null,
        item.label,
        item.path,
        item.sort_order,
        item.is_active
      ]
    );
    idMap.set(item.id, result.rows[0].id);
  }
}

async function ensureRevisions(userId = null, createDraft = false) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let published = await client.query(
      `SELECT id FROM site_revisions WHERE status = 'published' LIMIT 1`
    );

    if (published.rows.length === 0) {
      const revision = await client.query(
        `INSERT INTO site_revisions (status, created_by, published_at)
         VALUES ('published', $1, NOW())
         RETURNING id`,
        [userId]
      );
      published = revision;

      const legacyItems = await client.query(
        `SELECT id, parent_id, label, path, sort_order, is_active
         FROM menu_items
         ORDER BY parent_id NULLS FIRST, sort_order, id`
      );
      const idMap = new Map();

      for (const item of legacyItems.rows.filter((entry) => entry.parent_id === null)) {
        const result = await client.query(
          `INSERT INTO menu_item_versions
           (revision_id, source_id, label, path, sort_order, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [published.rows[0].id, item.id, item.label, item.path, item.sort_order, item.is_active]
        );
        idMap.set(item.id, result.rows[0].id);
      }

      for (const item of legacyItems.rows.filter((entry) => entry.parent_id !== null)) {
        const result = await client.query(
          `INSERT INTO menu_item_versions
           (revision_id, source_id, parent_id, label, path, sort_order, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [published.rows[0].id, item.id, idMap.get(item.parent_id) || null, item.label, item.path, item.sort_order, item.is_active]
        );
        idMap.set(item.id, result.rows[0].id);
      }
    }

    if (createDraft) {
      const draft = await client.query(
        `SELECT id FROM site_revisions WHERE status = 'draft' LIMIT 1`
      );

      if (draft.rows.length === 0) {
        const revision = await client.query(
          `INSERT INTO site_revisions (status, created_by)
           VALUES ('draft', $1)
           RETURNING id`,
          [userId]
        );
        await cloneRevision(client, published.rows[0].id, revision.rows[0].id);
      }
    }

    await client.query('COMMIT');
    return published.rows[0].id;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getMenuHierarchy({ includeInactive = false, userId = null } = {}) {
  await ensureRevisions(userId, includeInactive);
  const result = await pool.query(
    `SELECT id, parent_id, label, path, sort_order, is_active
     FROM menu_item_versions
     WHERE revision_id = (SELECT id FROM site_revisions WHERE status = $1 LIMIT 1)
       ${includeInactive ? '' : 'AND is_active = true'}
     ORDER BY parent_id NULLS FIRST, sort_order, id`,
    [includeInactive ? 'draft' : 'published']
  );

  const menuItems = result.rows;
  const menuHierarchy = [];
  const menuItemsById  = {};

  menuItems.forEach(item => {
    menuItemsById[item.id] = { ...item, children: [] };
  });

  menuItems.forEach(item => {
    if (item.parent_id && menuItemsById[item.parent_id]) {
      menuItemsById[item.parent_id].children.push(menuItemsById[item.id]);
    } else if (!item.parent_id) {
      menuHierarchy.push(menuItemsById[item.id]);
    }
  });

  return menuHierarchy;
}

async function createMenuItem({ label, path, parentId = null, sortOrder = 0, isActive = true, userId = null }) {
  await ensureRevisions(userId, true);
  const result = await pool.query(
    `INSERT INTO menu_item_versions
     (revision_id, parent_id, label, path, sort_order, is_active)
     VALUES ((SELECT id FROM site_revisions WHERE status = 'draft'), $1, $2, $3, $4, $5)
     RETURNING id, label, path, parent_id, sort_order, is_active`,
    [parentId, label, path, sortOrder, isActive]
  );

  return result.rows[0];
} 

async function updateMenuItem(id, { label, path, parentId, sortOrder, isActive, userId = null }) {
  await ensureRevisions(userId, true);
  const result = await pool.query(
    `UPDATE menu_item_versions
     SET label = $1, path = $2, parent_id = $3, sort_order = $4, is_active = $5
     WHERE id = $6
       AND revision_id = (SELECT id FROM site_revisions WHERE status = 'draft')
     RETURNING id, label, path, parent_id, sort_order, is_active`,
    [label, path, parentId, sortOrder, isActive, id]
  );

    return result.rows[0] || null;
}

async function deleteMenuItem(id, userId = null) {
  await ensureRevisions(userId, true);
  const result = await pool.query(
    `DELETE FROM menu_item_versions
     WHERE id = $1
       AND revision_id = (SELECT id FROM site_revisions WHERE status = 'draft')
     RETURNING id`,
    [id]
  );

  return result.rows[0] || null;
}

async function publishMenu(userId = null) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await ensureRevisions(userId, true);
    await client.query(
      `UPDATE site_revisions SET status = 'archived' WHERE status = 'published'`
    );
    await client.query(
      `UPDATE site_revisions
       SET status = 'published', published_at = NOW()
       WHERE status = 'draft'`
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { getMenuHierarchy, createMenuItem, updateMenuItem, deleteMenuItem, publishMenu };