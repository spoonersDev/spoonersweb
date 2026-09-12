const pool = require('../config/db');

async function listPages() {
  const result = await pool.query(
    `SELECT id, slug, title, is_published, created_at, updated_at
     FROM pages
     ORDER BY title, id`
  );
  return result.rows;
}

async function findPageBySlug(slug) {
  const result = await pool.query(
    `SELECT id, slug, title, is_published, created_at, updated_at
     FROM pages
     WHERE slug = $1`,
    [slug]
  );
  return result.rows[0] || null;
}

async function createPage({ title, slug }) {
  const result = await pool.query(
    `INSERT INTO pages (title, slug)
     VALUES ($1, $2)
     RETURNING id, slug, title, is_published, created_at, updated_at`,
    [title, slug]
  );
  return result.rows[0];
}

async function updatePage(id, { title, slug }) {
  const result = await pool.query(
    `UPDATE pages
     SET title = $1, slug = $2
     WHERE id = $3
     RETURNING id, slug, title, is_published, created_at, updated_at`,
    [title, slug, id]
  );
  return result.rows[0] || null;
}

module.exports = { listPages, findPageBySlug, createPage, updatePage };
