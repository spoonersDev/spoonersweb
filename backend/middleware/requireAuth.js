const jwt = require('jsonwebtoken');


// backend/middleware/requireAuth.js
function validateLogin(req, res, next) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Benutzername und Passwort erforderlich'
    });
  }

  return next();
}

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

function requireRole(allowedRoles) {
	return (req, res, next) => {
		if (!req.user || !allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ success: false, message: 'Zugriff verweigert' });
		}
		return next();
	};
}

module.exports = { validateLogin, requireAuth, requireRole };
