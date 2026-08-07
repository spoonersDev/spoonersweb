const express = require('express');

const router = express.Router();

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

router.get('/:slug', (req, res) => {
	const { slug } = req.params;
	const content = pageContentBySlug[slug];

	if (!content) {
		return res.status(404).json({
			success: false,
			message: 'Kein Inhalt für diese Seite gefunden'
		});
	}

	return res.json({
		success: true,
		content
	});
});

module.exports = { contentRouter: router, pageContentBySlug };
