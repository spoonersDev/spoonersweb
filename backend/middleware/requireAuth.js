const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
	const authorization = req.headers.authorization || '';
	const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

	if (!token) {
		return res.status(401).json({ success: false, message: 'Nicht autorisiert' });
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
		req.user = payload;
		return next();
	} catch (_error) {
		return res.status(401).json({ success: false, message: 'Token ungültig oder abgelaufen' });
	}
}

function requirePaidAccess(req, res, next) {
	if (!req.user) {
		return res.status(401).json({ success: false, message: 'Nicht autorisiert' });
	}

	if (!req.user.subscriptionActive) {
		return res.status(403).json({ success: false, message: 'Abo erforderlich' });
	}

	return next();
}

module.exports = { requireAuth, requirePaidAccess };
