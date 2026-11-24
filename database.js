const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(process.env.DB_PATH || './data/saksham_bharti.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'volunteer')),
      email TEXT,
      phone TEXT,
      program TEXT,
      date_of_birth TEXT,
      joined_date TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS occasions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      occasion_date TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Event',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER REFERENCES templates(id) ON DELETE SET NULL,
      recipient_group TEXT NOT NULL,
      recipient_count INTEGER NOT NULL DEFAULT 0,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      channel TEXT NOT NULL DEFAULT 'email',
      status TEXT NOT NULL DEFAULT 'sent',
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      organization_name TEXT NOT NULL DEFAULT 'SAKSHAM BHARTI',
      motto TEXT NOT NULL DEFAULT 'अक्षम से सक्षम',
      registration_number TEXT DEFAULT '',
      primary_email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      location TEXT DEFAULT '',
      about TEXT DEFAULT '',
      email_updates INTEGER NOT NULL DEFAULT 1,
      birthday_reminders INTEGER NOT NULL DEFAULT 1,
      weekly_summary INTEGER NOT NULL DEFAULT 1,
      campaign_delivery_alerts INTEGER NOT NULL DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const existingSettings = db.prepare('SELECT id FROM settings WHERE id = 1').get();
  if (!existingSettings) {
    db.prepare(`
      INSERT INTO settings (id, organization_name, motto, primary_email, location, about)
      VALUES (1, 'SAKSHAM BHARTI', 'अक्षम से सक्षम', 'admin@sakshambharti.org', 'Patna, Bihar, India', 'Empowering students, teachers, and communities through education and mentorship.')
    `).run();
  }
}

initializeDatabase();

module.exports = db;
