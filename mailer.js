const nodemailer = require('nodemailer');

function isMailerConfigured() {
  const hasBrevo = Boolean(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_KEY);
  const hasGmail = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
  return hasBrevo || hasGmail;
}

function createTransporter() {
  if (process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_KEY) {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY
      }
    });
  }
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  return null;
}

function wrapHtmlEmail(orgName, motto, subject, bodyText) {
  const safeBody = String(bodyText || '').replace(/\n/g, '<br/>');
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #1e3a8a; color: #ffffff; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 20px;">${orgName}</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #fdba74;">${motto}</p>
      </div>
      <div style="padding: 24px; background: #ffffff; color: #1e293b; font-size: 15px; line-height: 1.6;">
        <h3 style="margin-top: 0; color: #0f172a;">${subject}</h3>
        <p>${safeBody}</p>
      </div>
      <div style="background: #f8fafc; padding: 14px 24px; font-size: 12px; color: #64748b; text-align: center;">
        Sent automatically by ${orgName} (${motto})
      </div>
    </div>
  `;
}

async function sendEmail({ to, subject, text, orgName = 'SAKSHAM BHARTI', motto = 'अक्षम से सक्षम' }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[DRY-RUN EMAIL] To: ${to} | Subject: ${subject}`);
    return { delivered: false, dryRun: true };
  }

  const info = await transporter.sendMail({
    from: `"${orgName}" <${process.env.SENDER_EMAIL || process.env.BREVO_SMTP_USER || process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html: wrapHtmlEmail(orgName, motto, subject, text)
  });

  return { delivered: true, dryRun: false, messageId: info.messageId };
}

module.exports = { isMailerConfigured, sendEmail };
