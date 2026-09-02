const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const { contentRouter } = require('./routes/content');
const { externalRouter } = require('./routes/external');
const { authRouter } = require('./routes/auth');
const menu = require('./routes/menu');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use('/api/content', contentRouter);
app.use('/api/external', externalRouter);
app.use('/api/auth', authRouter);
app.use('/api/menu', menu.menuRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'backend is running' });
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
