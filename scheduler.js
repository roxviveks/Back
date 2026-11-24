const cron = require('node-cron');
const db = require('./database');
const { sendEmail } = require('./mailer');

function getTodayISTParts() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.CRON_TIMEZONE || 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const isoDate = fmt.format(now); // YYYY-MM-DD
  return { isoDate, monthDay: isoDate.slice(5, 10) };
}

async function runDailyAutoMailer() {
  const { isoDate, monthDay } = getTodayISTParts();
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  const orgName = settings?.organization_name || 'SAKSHAM BHARTI';
  const motto = settings?.motto || 'अक्षम से सक्षम';

  const results = { date: isoDate, birthdaysSent: 0, occasionsSent: 0, errors: [] };

  // 1. Auto-send Birthday Wishes
  if (settings?.birthday_reminders) {
    const birthdayMembers = db.prepare(`
      SELECT * FROM members
      WHERE status = 'active'
        AND email IS NOT NULL AND email != ''
        AND date_of_birth IS NOT NULL
        AND substr(date_of_birth, 6, 5) = ?
    `).all(monthDay);

    for (const member of birthdayMembers) {
      const subject = `Happy Birthday from ${orgName}!`;
      const body = `Namaste ${member.full_name},\n\n${orgName} (${motto}) wishes you a very Happy Birthday and a bright, successful year ahead!`;
      try {
        await sendEmail({ to: member.email, subject, text: body, orgName, motto });
        db.prepare(`
          INSERT INTO messages (recipient_group, recipient_count, subject, body, channel, status)
          VALUES (?, 1, ?, ?, 'email', 'sent')
        `).run(member.email, subject, body);
        results.birthdaysSent += 1;
      } catch (err) {
        results.errors.push(`Birthday email failed for ${member.email}: ${err.message}`);
      }
    }
  }

  // 2. Auto-send Today's Special Occasion Reminders
  if (settings?.email_updates) {
    const todayOccasions = db.prepare(`
      SELECT * FROM occasions WHERE occasion_date = ?
    `).all(isoDate);

    if (todayOccasions.length > 0) {
      const recipients = db.prepare(`
        SELECT full_name, email FROM members
        WHERE status = 'active' AND email IS NOT NULL AND email != ''
      `).all();

      for (const occ of todayOccasions) {
        for (const r of recipients) {
          const subject = `${orgName}: ${occ.title}`;
          const body = `Namaste ${r.full_name},\n\nToday is ${occ.title} (${occ.occasion_date}).\n${occ.description || ''}`;
          try {
            await sendEmail({ to: r.email, subject, text: body, orgName, motto });
            results.occasionsSent += 1;
          } catch (err) {
            results.errors.push(`Occasion email failed for ${r.email}: ${err.message}`);
          }
        }
        db.prepare(`
          INSERT INTO messages (recipient_group, recipient_count, subject, body, channel, status)
          VALUES ('all', ?, ?, ?, 'email', 'sent')
        `).run(recipients.length, `${orgName}: ${occ.title}`, occ.description || occ.title);
      }
    }
  }

  // 3. Optional Daily Admin Summary
  const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
  if (adminEmail && (results.birthdaysSent > 0 || results.occasionsSent > 0)) {
    try {
      await sendEmail({
        to: adminEmail,
        subject: `${orgName} Daily Auto-Mail Report (${isoDate})`,
        text: `Daily automation completed:\n- Birthday wishes sent: ${results.birthdaysSent}\n- Occasion reminders sent: ${results.occasionsSent}\n- Errors: ${results.errors.length}`,
        orgName,
        motto
      });
    } catch (err) {
      results.errors.push(`Admin summary failed: ${err.message}`);
    }
  }

  return results;
}

function startScheduler() {
  const schedule = process.env.CRON_SCHEDULE || '0 9 * * *';
  const timezone = process.env.CRON_TIMEZONE || 'Asia/Kolkata';

  cron.schedule(schedule, async () => {
    console.log(`[CRON] Running Saksham Bharti daily auto-mailer (${schedule} ${timezone})...`);
    const summary = await runDailyAutoMailer();
    console.log('[CRON] Summary:', summary);
  }, { timezone });

  console.log(`Daily email scheduler active: "${schedule}" (${timezone})`);
}

module.exports = { startScheduler, runDailyAutoMailer };
