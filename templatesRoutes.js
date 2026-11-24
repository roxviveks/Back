const express = require('express');
const db = require('./database');

const router = express.Router();

router.get('/', (req, res) => {
  const templates = db.prepare('SELECT * FROM templates ORDER BY created_at DESC').all();
  res.json({ templates });
});

router.post('/', (req, res) => {
  const { title, category = 'General', subject, body } = req.body;
  if (!title || !subject || !body) {
    return res.status(400).json({ error: 'title, subject, and body are required' });
  }

  const result = db.prepare(`
    INSERT INTO templates (title, category, subject, body)
    VALUES (?, ?, ?, ?)
  `).run(title.trim(), category, subject.trim(), body);

  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json({ template });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Template not found' });
  }
  return res.json({ deleted: true, id: Number(req.params.id) });
});

module.exports = router;
