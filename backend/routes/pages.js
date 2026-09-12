const express = require('express');
const { requireAuth, requireRole } = require('../middleware/requireAuth');
const { listPages, createPage, updatePage } = require('../repositories/pageRepository');
const { updateDraftBlock } = require('../repositories/contentRepository');

const router = express.Router();

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

router.use(requireAuth, requireRole(['admin', 'editor']));

router.get('/', async (_req, res) => {
  try {
    return res.json({ success: true, pages: await listPages() });
  } catch (error) {
    console.error('Seiten konnten nicht geladen werden:', error);
    return res.status(500).json({ success: false, message: 'Seiten konnten nicht geladen werden.' });
  }
});

router.post('/', async (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const slug = normalizeSlug(req.body?.slug || title);

  if (!title || !slug) {
    return res.status(400).json({ success: false, message: 'Titel ist erforderlich.' });
  }

  try {
    const page = await createPage({ title, slug });
    await updateDraftBlock({
      slug,
      blockKey: 'page_title',
      blockType: 'text',
      data: { text: title },
      userId: req.user.id
    });
    return res.status(201).json({ success: true, page });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Dieser Seitenpfad existiert bereits.' });
    }
    console.error('Seite konnte nicht angelegt werden:', error);
    return res.status(500).json({ success: false, message: 'Seite konnte nicht angelegt werden.' });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const slug = normalizeSlug(req.body?.slug || title);

  if (!Number.isInteger(id) || !title || !slug) {
    return res.status(400).json({ success: false, message: 'Gültiger Titel und Seitenpfad sind erforderlich.' });
  }

  try {
    const page = await updatePage(id, { title, slug });
    if (!page) return res.status(404).json({ success: false, message: 'Seite nicht gefunden.' });
    return res.json({ success: true, page });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Dieser Seitenpfad existiert bereits.' });
    }
    console.error('Seite konnte nicht aktualisiert werden:', error);
    return res.status(500).json({ success: false, message: 'Seite konnte nicht aktualisiert werden.' });
  }
});

module.exports = { pagesRouter: router, normalizeSlug };
