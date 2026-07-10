const express = require('express');
const cors = require('cors');
const syncRoutes = require('./routes/sync.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', syncRoutes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload.' });
  }

  return next(err);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
