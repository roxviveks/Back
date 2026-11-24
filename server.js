require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { authenticateToken } = require('./authMiddleware');
const { isMailerConfigured } = require('./mailer');
const { startScheduler } = require('./scheduler');

const authRoutes = require('./authRoutes');
const membersRoutes = require('./membersRoutes');
const occasionsRoutes = require('./occasionsRoutes');
const templatesRoutes = require('./templatesRoutes');
const messagesRoutes = require('./messagesRoutes');
const reportsRoutes = require('./reportsRoutes');
const settingsRoutes = require('./settingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'saksham-bharti-backend',
    emailConfigured: isMailerConfigured()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/members', authenticateToken, membersRoutes);
app.use('/api/occasions', authenticateToken, occasionsRoutes);
app.use('/api/templates', authenticateToken, templatesRoutes);
app.use('/api/messages', authenticateToken, messagesRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Saksham Bharti backend running on port ${PORT}`);
  startScheduler();
});
