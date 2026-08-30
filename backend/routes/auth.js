const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const router = express.Router();
const { validateLogin } = require('../middleware/requireAuth');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, emailConfirmation, password, passwordConfirmation } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!firstName?.trim() || !lastName?.trim() || !normalizedEmail || !password) {
    return res.status(400).json({ success: false, message: 'Bitte alle Pflichtfelder ausfüllen.' });
  }

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({ success: false, message: 'Bitte eine gültige E-Mail-Adresse angeben.' });
  }

  if (normalizedEmail !== emailConfirmation?.trim().toLowerCase()) {
    return res.status(400).json({ success: false, message: 'Die E-Mail-Adressen stimmen nicht überein.' });
  }

  if (password.length < 10) {
    return res.status(400).json({ success: false, message: 'Das Passwort muss mindestens 10 Zeichen lang sein.' });
  }

  if (password !== passwordConfirmation) {
    return res.status(400).json({ success: false, message: 'Die Passwörter stimmen nicht überein.' });
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [normalizedEmail]);

    if (existingUser.rowCount > 0) {
      return res.status(409).json({ success: false, message: 'Diese E-Mail-Adresse ist bereits registriert.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [firstName.trim(), lastName.trim(), normalizedEmail, passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: 'Danke! Deine Registrierung wurde übermittelt.'
    });
  } catch (error) {
    console.error('Registrierung fehlgeschlagen:', error);
    return res.status(500).json({ success: false, message: 'Registrierung konnte nicht gespeichert werden.' });
  }
});

router.post('/login', validateLogin, (req, res) => {
  const { username } = req.body || {};

  const user = {
    username,
    role: 'admin',
    subscriptionActive: true
  };

  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  return res.json({
    success: true,
    message: 'Anmeldung erfolgt',
    token,
    user
  });
});

module.exports = { authRouter: router };