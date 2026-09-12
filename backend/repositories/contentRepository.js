const pool = require('../config/db');

function contentToBlocks(content) {
  return [
    { blockKey: 'page_title', blockType: 'text', sortOrder: 0, data: { text: content.title } },
    { blockKey: 'page_lead', blockType: 'text', sortOrder: 1, data: { text: content.lead || '' } },
    ...(content.paragraphs || []).map((text, index) => ({
      blockKey: `paragraph_${index + 1}`,
      blockType: 'text',
      sortOrder: index + 2,
      data: { text }
    }))
  ];
}

async function ensurePageContent(slug, legacyContent, userId = null) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const published = await client.query(
      `SELECT id FROM site_revisions WHERE status = 'published' LIMIT 1`
    );
    const publishedId = published.rows[0]?.id;

    if (!publishedId) throw new Error('Keine veröffentlichte Revision vorhanden.');

    const existing = await client.query(
      `SELECT COUNT(*)::int AS count
       FROM content_block_versions
       WHERE revision_id = $1 AND page_slug = $2`,
      [publishedId, slug]
    );

    if (existing.rows[0].count === 0) {
      for (const block of contentToBlocks(legacyContent)) {
        await client.query(
          `INSERT INTO content_block_versions
           (revision_id, page_slug, block_key, block_type, sort_order, data)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [publishedId, slug, block.blockKey, block.blockType, block.sortOrder, block.data]
        );
      }
    }

    const draft = await client.query(
      `SELECT id FROM site_revisions WHERE status = 'draft' LIMIT 1`
    );
    const draftId = draft.rows[0]?.id;

    if (draftId) {
      const draftExisting = await client.query(
        `SELECT COUNT(*)::int AS count
         FROM content_block_versions
         WHERE revision_id = $1 AND page_slug = $2`,
        [draftId, slug]
      );

      if (draftExisting.rows[0].count === 0) {
        await client.query(
          `INSERT INTO content_block_versions
           (revision_id, page_slug, block_key, block_type, sort_order, data)
           SELECT $1, page_slug, block_key, block_type, sort_order, data
           FROM content_block_versions
           WHERE revision_id = $2 AND page_slug = $3`,
          [draftId, publishedId, slug]
        );
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getPageContent({ slug, preview = false, legacyContent, userId = null }) {
  await ensurePageContent(slug, legacyContent, userId);
  const result = await pool.query(
    `SELECT block_key, block_type, sort_order, data
     FROM content_block_versions
     WHERE revision_id = (SELECT id FROM site_revisions WHERE status = $1 LIMIT 1)
       AND page_slug = $2
     ORDER BY sort_order, id`,
    [preview ? 'draft' : 'published', slug]
  );

  const blocks = result.rows.reduce((accumulator, block) => {
    accumulator[block.block_key] = block;
    return accumulator;
  }, {});

  return { slug, blocks };
}

async function updateDraftBlock({ slug, blockKey, blockType = 'text', data, userId = null }) {
  await ensurePageContent(slug, { title: '', lead: '', paragraphs: [] }, userId);
  const result = await pool.query(
    `INSERT INTO content_block_versions
     (revision_id, page_slug, block_key, block_type, sort_order, data)
     VALUES (
       (SELECT id FROM site_revisions WHERE status = 'draft'),
       $1::varchar, $2::varchar, $3::varchar,
       COALESCE((SELECT sort_order FROM content_block_versions
                 WHERE revision_id = (SELECT id FROM site_revisions WHERE status = 'draft')
                   AND page_slug = $1::varchar AND block_key = $2::varchar), 0),
       $4
     )
     ON CONFLICT (revision_id, page_slug, block_key)
     DO UPDATE SET block_type = EXCLUDED.block_type, data = EXCLUDED.data, updated_at = NOW()
     RETURNING block_key, block_type, sort_order, data`,
    [slug, blockKey, blockType, data]
  );

  return result.rows[0];
}

module.exports = { getPageContent, updateDraftBlock };
