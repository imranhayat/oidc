require('dotenv').config();
const express = require('express');
const { getPool } = require('./db');
const itemsRouter = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.get('/', (_req, res) =>
  res.json({ message: 'OIDC ECS Backend', version: '1.0.0', env: process.env.NODE_ENV })
);

app.use('/items', itemsRouter);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const init = async () => {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS items (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      description TEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  app.listen(PORT, '0.0.0.0', () =>
    console.log(`Server listening on port ${PORT}`)
  );
};

init().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
