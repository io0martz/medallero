const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// Cambia esto por tu propia contraseña (o define la variable de entorno
// ADMIN_PASSWORD al desplegar, para no dejarla escrita en el código).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'medallero2026';

const db = new Database(path.join(__dirname, 'medallero.db'));

// Crea la tabla si no existe y siembra 8 concursantes la primera vez
db.exec(`
  CREATE TABLE IF NOT EXISTS contestants (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL,
    gold    INTEGER NOT NULL DEFAULT 0,
    silver  INTEGER NOT NULL DEFAULT 0,
    bronze  INTEGER NOT NULL DEFAULT 0
  );
`);
const yaExisten = db.prepare('SELECT COUNT(*) AS n FROM contestants').get().n;
if (yaExisten === 0) {
  const insertar = db.prepare('INSERT INTO contestants (name) VALUES (?)');
  for (let i = 1; i <= 8; i++) insertar.run('Concursante ' + i);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware: solo deja pasar si la contraseña de administrador es correcta
function requiereAdmin(req, res, next) {
  if (req.header('x-admin-password') !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  next();
}

// Ver el medallero — público, cualquiera puede consultarlo sin contraseña
app.get('/api/contestants', (req, res) => {
  const filas = db.prepare(
    'SELECT * FROM contestants ORDER BY gold DESC, silver DESC, bronze DESC, name ASC'
  ).all();
  res.json(filas);
});

// Validar la contraseña de administrador
app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) return res.json({ ok: true });
  res.status(401).json({ ok: false });
});

// Sumar o restar una medalla a un concursante
app.patch('/api/contestants/:id/medal', requiereAdmin, (req, res) => {
  const { field, delta } = req.body || {};
  if (!['gold', 'silver', 'bronze'].includes(field) || typeof delta !== 'number') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  db.prepare(
    `UPDATE contestants SET ${field} = MAX(0, ${field} + ?) WHERE id = ?`
  ).run(delta, req.params.id);
  res.json({ ok: true });
});

// Cambiar el nombre de un concursante
app.put('/api/contestants/:id/name', requiereAdmin, (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nombre vacío' });
  db.prepare('UPDATE contestants SET name = ? WHERE id = ?').run(name.trim(), req.params.id);
  res.json({ ok: true });
});

// Reiniciar todas las medallas a cero
app.post('/api/reset', requiereAdmin, (req, res) => {
  db.prepare('UPDATE contestants SET gold = 0, silver = 0, bronze = 0').run();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Medallero corriendo en http://localhost:${PORT}`);
});
