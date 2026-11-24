const express = require('express');
const db = require('./database');

const router = express.Router();

router.get('/', (req, res) => {
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  res.json({
    profile: {
      organization_name: row.organization_name,
      motto: row.motto,
      registration_number: row.registration_number,
      primary_email: row.primary_email,
      phone: row.phone,
      location: row.location,
      about: row.about
    },
    preferences: {
      email_updates: Boolean(row.email_updates),
      birthday_reminders: Boolean(row.birthday_reminders),
      weekly_summary: Boolean(row.weekly_summary),
      campaign_delivery_alerts: Boolean(row.campaign_delivery_alerts)
    }
  });
});

router.put('/profile', (req, res) => {
  const existing = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  const {
    organization_name = existing.organization_name,
    motto = existing.motto,
    registration_number = existing.registration_number,
    primary_email = existing.primary_email,
    phone = existing.phone,
    location = existing.location,
    about = existing.about
  } = req.body;

  db.prepare(`
    UPDATE settings
    SET organization_name = ?, motto = ?, registration_number = ?, primary_email = ?, phone = ?, location = ?, about = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(organization_name, motto, registration_number, primary_email, phone, location, about);

  res.json({ updated: true });
});

router.put('/preferences', (req, res) => {
  const existing = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  const {
    email_updates = Boolean(existing.email_updates),
    birthday_reminders = Boolean(existing.birthday_reminders),
    weekly_summary = Boolean(existing.weekly_summary),
    campaign_delivery_alerts = Boolean(existing.campaign_delivery_alerts)
  } = req.body;

  db.prepare(`
    UPDATE settings
    SET email_updates = ?, birthday_reminders = ?, weekly_summary = ?, campaign_delivery_alerts = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(email_updates ? 1 : 0, birthday_reminders ? 1 : 0, weekly_summary ? 1 : 0, campaign_delivery_alerts ? 1 : 0);

  res.json({ updated: true });
});

module.exports = router;
