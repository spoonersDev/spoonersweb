const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail } = require('../repositories/userRepository');

const router = express.Router();

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
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Diese E-Mail-Adresse ist bereits registriert.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash
    });

    return res.status(201).json({
      success: true,
      message: 'Danke! Deine Registrierung wurde übermittelt.'
    });
  } catch (error) {
    console.error('Registrierung fehlgeschlagen:', error);
    return res.status(500).json({ success: false, message: 'Registrierung konnte nicht gespeichert werden.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail || !password) {
    return res.status(400).json({ success: false, message: 'E-Mail-Adresse und Passwort erforderlich.' });
  }

  try {
    const databaseUser = await findUserByEmail(normalizedEmail);
    const passwordMatches = databaseUser && await bcrypt.compare(password, databaseUser.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Ungültige Anmeldedaten.' });
    }

    if (databaseUser.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Dein Konto wurde noch nicht freigeschaltet.' });
    }

    const user = {
      id: databaseUser.id,
      email: databaseUser.email,
      firstName: databaseUser.first_name,
      lastName: databaseUser.last_name,
      role: databaseUser.role,
      subscriptionActive: true
    };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.json({ success: true, message: 'Anmeldung erfolgt', token, user });
  } catch (error) {
    console.error('Anmeldung fehlgeschlagen:', error);
    return res.status(500).json({ success: false, message: 'Anmeldung konnte nicht verarbeitet werden.' });
  }
});

module.exports = { authRouter: router };