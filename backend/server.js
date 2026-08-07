const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { contentRouter } = require('./routes/content');
const { mapRouter } = require('./routes/map');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use('/api/content', contentRouter);
app.use('/api/member', mapRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'backend is running' });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};

  if (username === 'admin' && password === 'admin123') {
    const user = {
      username,
      role: 'admin',
      subscriptionActive: true
    };

    const token = jwt.sign(user, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });

    return res.json({
      success: true,
      message: 'Anmeldung erfolgt',
      token,
      user
    });
  }

  return res.status(401).json({ success: false, message: 'Ungültige Anmeldedaten' });
});

function createServer(port = PORT) {
  return app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
  });
}

if (require.main === module) {
  createServer();
}

module.exports = { app, createServer };
