const express = require('express');
const { requireAuth, requireRole } = require('../middleware/requireAuth');
const { getPageContent: getVersionedPageContent, updateDraftBlock } = require('../repositories/contentRepository');
const { findPageBySlug } = require('../repositories/pageRepository');

const router = express.Router();

function withLegacyContentShape(versionedContent) {
	const blocks = versionedContent.blocks || {};
	const paragraphKeys = Object.keys(blocks)
		.filter((key) => key.startsWith('paragraph_'))
		.sort();

	return {
		...versionedContent,
		title: blocks.page_title?.data?.text || '',
		lead: blocks.page_lead?.data?.text || '',
		paragraphs: paragraphKeys.map((key) => blocks[key]?.data?.text || '')
	};
}

const pageContentBySlug = {
	'das-sind-wir-1': {
		slug: 'das-sind-wir-1',
		title: 'Das sind wir',
		lead: 'Unterwegs zwischen Alltag, Offroad und Fernweh.',
		paragraphs: [
			'Wir sind spooners on tour – ein kleines Team mit großer Reiselust und dem Ziel, die Welt Stück für Stück auf unsere Weise zu entdecken.',
			'Auf dieser Seite teilen wir, wer wir sind, was uns antreibt und warum wir so viel Zeit in unser mobiles Zuhause und unsere Abenteuer investieren.',
			'Zwischen Planung, Umbau, langen Strecken und spontanen Umwegen geht es für uns immer um echte Erlebnisse, praktische Learnings und gute Geschichten.',
			'Genau diese Mischung möchten wir hier sichtbar machen: persönlich, ehrlich und mit genug Platz für alles, was auf dem Weg noch dazukommt.'
		]
	}
};

router.get('/:slug', async (req, res) => {
	const { slug } = req.params;
	const storedPage = pageContentBySlug[slug] ? null : await findPageBySlug(slug);
	const content = pageContentBySlug[slug] || (storedPage
		? { slug, title: storedPage.title, lead: '', paragraphs: [] }
		: null);

	if (!content) {
		return res.status(404).json({
			success: false,
			message: 'Kein Inhalt für diese Seite gefunden'
		});
	}

	const preview = req.query.preview === 'draft';

	if (storedPage && !storedPage.is_published && !preview) {
		return res.status(404).json({ success: false, message: 'Diese Seite ist noch nicht veröffentlicht.' });
	}

	if (preview) {
		return requireAuth(req, res, () => {
			requireRole(['admin', 'editor'])(req, res, async () => {
				try {
					  const versionedContent = await getVersionedPageContent({
						slug,
						preview: true,
						legacyContent: content,
						userId: req.user.id
					});
					  return res.json({ success: true, content: withLegacyContentShape(versionedContent) });
				} catch (error) {
					console.error('Draft-Inhalt konnte nicht geladen werden:', error);
					return res.status(500).json({ success: false, message: 'Draft-Inhalt konnte nicht geladen werden' });
				}
			});
		});
	}

	try {
		const versionedContent = await getVersionedPageContent({ slug, legacyContent: content });
		return res.json({ success: true, content: withLegacyContentShape(versionedContent) });
	} catch (error) {
		console.error('Inhalt konnte nicht geladen werden:', error);
		return res.status(500).json({ success: false, message: 'Inhalt konnte nicht geladen werden' });
	}
});

router.put('/blocks/:blockKey', requireAuth, requireRole(['admin', 'editor']), async (req, res) => {
	const { blockKey } = req.params;
	const { slug } = req.body || {};
	const content = pageContentBySlug[slug] || await findPageBySlug(slug);

	if (!content) {
		return res.status(404).json({ success: false, message: 'Seite nicht gefunden' });
	}

	const { blockType = 'text', data } = req.body || {};
	if (blockType !== 'text' || typeof data?.text !== 'string') {
		return res.status(400).json({ success: false, message: 'Ein gültiger Textblock ist erforderlich.' });
	}

	try {
		const block = await updateDraftBlock({
			slug,
			blockKey,
			blockType,
			data: { text: data.text },
			userId: req.user.id
		});
		return res.json({ success: true, block });
	} catch (error) {
		console.error('Draft-Block konnte nicht gespeichert werden:', error);
		return res.status(500).json({ success: false, message: 'Draft-Block konnte nicht gespeichert werden' });
	}
});

module.exports = { contentRouter: router, pageContentBySlug };
