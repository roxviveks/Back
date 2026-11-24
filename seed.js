require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./database');

function seed() {
  const passwordHash = bcrypt.hashSync('password123', 10);

  db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run('Saksham Bharti Admin', 'admin@sakshambharti.org', passwordHash, 'admin');

  const memberCount = db.prepare('SELECT COUNT(*) AS count FROM members').get().count;
  if (memberCount === 0) {
    const insertMember = db.prepare(`
      INSERT INTO members (full_name, role, email, phone, program, date_of_birth, joined_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const todayMD = new Date().toISOString().slice(5, 10);
    const sampleMembers = [
      ['Aarav Verma', 'student', 'aarav@example.org', '+919876543210', 'Digital Literacy', `2011-${todayMD}`, '2025-04-10', 'active', 'Regular attendee'],
      ['Priya Kumari', 'student', 'priya@example.org', '+919876543211', 'STEM Mentorship', '2012-03-14', '2025-06-01', 'active', 'Interested in science projects'],
      ['Ananya Sharma', 'teacher', 'ananya@sakshambharti.org', '+919876543212', 'Digital Literacy', '1994-11-25', '2024-01-15', 'active', 'Lead instructor'],
      ['Rohan Das', 'volunteer', 'rohan@sakshambharti.org', '+919876543213', 'Community Outreach', '1998-08-19', '2025-02-20', 'active', 'Weekend coordinator']
    ];

    for (const m of sampleMembers) {
      insertMember.run(...m);
    }
  }

  const occasionCount = db.prepare('SELECT COUNT(*) AS count FROM occasions').get().count;
  if (occasionCount === 0) {
    const insertOccasion = db.prepare(`
      INSERT INTO occasions (title, occasion_date, category, description)
      VALUES (?, ?, ?, ?)
    `);
    insertOccasion.run('Saksham Bharti Annual Day', '2026-12-15', 'Celebration', 'Year-end gathering for students, teachers, and volunteers.');
    insertOccasion.run('Winter Book Drive', '2026-12-05', 'Campaign', 'Collecting textbooks and notebooks for partner schools.');
  }

  const templateCount = db.prepare('SELECT COUNT(*) AS count FROM templates').get().count;
  if (templateCount === 0) {
    const insertTemplate = db.prepare(`
      INSERT INTO templates (title, category, subject, body)
      VALUES (?, ?, ?, ?)
    `);
    insertTemplate.run(
      'Birthday Wishes',
      'Birthday',
      'Happy Birthday from Saksham Bharti!',
      'Namaste {{name}}, Saksham Bharti (अक्षम से सक्षम) wishes you a very Happy Birthday and a bright year ahead!'
    );
    insertTemplate.run(
      'Event Reminder',
      'Event',
      'Saksham Bharti Event Reminder',
      'Namaste {{name}}, this is a friendly reminder about our upcoming Saksham Bharti community event.'
    );
  }

  console.log('Saksham Bharti database seeded successfully.');
}

seed();
