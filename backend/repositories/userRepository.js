const pool = require('../config/db');

async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, password_hash, role, status
     FROM users
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );

  return result.rows[0] || null;
}

async function createUser({ firstName, lastName, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, first_name, last_name, email, role, status`,
    [firstName, lastName, email, passwordHash]
  );

  return result.rows[0];
}

module.exports = { createUser, findUserByEmail };