const express = require('express');
const db = require('./database');

const router = express.Router();

router.get('/overview', (req, res) => {
  const roleCounts = db.prepare('SELECT role, COUNT(*) AS count FROM members GROUP BY role').all();
  const counts = { student: 0, teacher: 0, volunteer: 0 };
  for (const row of roleCounts) {
    counts[row.role] = row.count;
  }

  const totalOccasions = db.prepare('SELECT COUNT(*) AS count FROM occasions').get().count;
  const totalMessagesSent = db.prepare('SELECT COUNT(*) AS count FROM messages').get().count;

  res.json({
    overview: {
      students: counts.student,
      teachers: counts.teacher,
      volunteers: counts.volunteer,
      totalOccasions,
      totalMessagesSent
    }
  });
});

module.exports = router;
