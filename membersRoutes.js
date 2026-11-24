const express = require('express');
const db = require('./database');

const router = express.Router();

router.get('/', (req, res) => {
  const { role, search, program, status } = req.query;
  const conditions = [];
  const params = [];

  if (role) {
    conditions.push('role = ?');
    params.push(role);
  }
  if (program) {
    conditions.push('program = ?');
    params.push(program);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (search) {
    conditions.push('(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR program LIKE ?)');
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const members = db.prepare(`SELECT * FROM members ${whereClause} ORDER BY created_at DESC`).all(...params);
  res.json({ members });
});

router.get('/birthdays', (req, res) => {
  const { month } = req.query;
  let query = `
    SELECT id, full_name, role, email, phone, program, date_of_birth
    FROM members
    WHERE date_of_birth IS NOT NULL AND date_of_birth != ''
  `;
  const params = [];

  if (month) {
    query += " AND strftime('%m', date_of_birth) = ?";
    params.push(String(month).padStart(2, '0'));
  }

  query += " ORDER BY strftime('%m-%d', date_of_birth) ASC";
  const birthdays = db.prepare(query).all(...params);
  res.json({ birthdays });
});

router.post('/', (req, res) => {
  const { full_name, role, email, phone, program, date_of_birth, joined_date, status = 'active', notes } = req.body;
  if (!full_name || !role) {
    return res.status(400).json({ error: 'full_name and role are required' });
  }
  if (!['student', 'teacher', 'volunteer'].includes(role)) {
    return res.status(400).json({ error: 'role must be student, teacher, or volunteer' });
  }

  const result = db.prepare(`
    INSERT INTO members (full_name, role, email, phone, program, date_of_birth, joined_date, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(full_name.trim(), role, email || null, phone || null, program || null, date_of_birth || null, joined_date || null, status, notes || null);

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json({ member });
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Member not found' });
  }

  const {
    full_name = existing.full_name,
    role = existing.role,
    email = existing.email,
    phone = existing.phone,
    program = existing.program,
    date_of_birth = existing.date_of_birth,
    joined_date = existing.joined_date,
    status = existing.status,
    notes = existing.notes
  } = req.body;

  db.prepare(`
    UPDATE members
    SET full_name = ?, role = ?, email = ?, phone = ?, program = ?, date_of_birth = ?, joined_date = ?, status = ?, notes = ?
    WHERE id = ?
  `).run(full_name, role, email, phone, program, date_of_birth, joined_date, status, notes, req.params.id);

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  return res.json({ member });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Member not found' });
  }
  return res.json({ deleted: true, id: Number(req.params.id) });
});

module.exports = router;
