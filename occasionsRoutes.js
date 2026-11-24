const express = require('express');
const db = require('./database');

const router = express.Router();

router.get('/', (req, res) => {
  const occasions = db.prepare('SELECT * FROM occasions ORDER BY occasion_date ASC').all();
  res.json({ occasions });
});

router.post('/', (req, res) => {
  const { title, occasion_date, category = 'Event', description } = req.body;
  if (!title || !occasion_date) {
    return res.status(400).json({ error: 'title and occasion_date are required' });
  }

  const result = db.prepare(`
    INSERT INTO occasions (title, occasion_date, category, description)
    VALUES (?, ?, ?, ?)
  `).run(title.trim(), occasion_date, category, description || null);

  const occasion = db.prepare('SELECT * FROM occasions WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json({ occasion });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM occasions WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Occasion not found' });
  }
  return res.json({ deleted: true, id: Number(req.params.id) });
});

module.exports = router;
