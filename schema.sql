-- Esquema del medallero.
-- Funciona tal cual en SQLite (el motor que usa server.js).
-- Si usas MySQL o PostgreSQL, ver las notas al final.

CREATE TABLE IF NOT EXISTS contestants (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  name    TEXT NOT NULL,
  gold    INTEGER NOT NULL DEFAULT 0,
  silver  INTEGER NOT NULL DEFAULT 0,
  bronze  INTEGER NOT NULL DEFAULT 0
);

-- Siembra inicial: 8 concursantes con nombres genéricos.
-- El administrador puede renombrarlos desde la página, no hace falta editar esto.
INSERT INTO contestants (name) VALUES
  ('Concursante 1'),
  ('Concursante 2'),
  ('Concursante 3'),
  ('Concursante 4'),
  ('Concursante 5'),
  ('Concursante 6'),
  ('Concursante 7'),
  ('Concursante 8');

-- ------------------------------------------------------------------
-- Notas para adaptar a otro motor:
--
-- MySQL:
--   Cambia AUTOINCREMENT por AUTO_INCREMENT, y agrega
--   ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; al final de la tabla.
--
-- PostgreSQL:
--   Cambia "INTEGER PRIMARY KEY AUTOINCREMENT" por
--   "SERIAL PRIMARY KEY".
-- ------------------------------------------------------------------
