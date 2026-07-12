require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const upload = multer();
const Database = require('better-sqlite3');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || 'customers.db';

const db = new Database(DB_PATH);

db.prepare(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    sendCopy INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )
`).run();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password';

const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');

  if (!username || !password) {
    return res.status(401).json({ error: 'Invalid authentication format' });
  }

  const safeCompare = (a, b) => {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    return aBuf.length === bBuf.length && crypto.timingSafeEqual(aBuf, bBuf);
  };

  if (!safeCompare(username, ADMIN_USER) || !safeCompare(password, ADMIN_PASS)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  next();
};

// POST /send-contact handles form submissions (multipart/form-data or urlencoded)
app.post('/send-contact', upload.none(), async (req, res) => {
  const { name, email, message, sendCopy } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: (process.env.SMTP_SECURE === 'true'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const admin = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    const mailOptions = {
      from: `"Website Contact" <${process.env.SMTP_USER}>`,
      to: admin,
      subject: `Website contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      replyTo: email
    };

    if (sendCopy === 'yes' || sendCopy === 'on' || sendCopy === true) {
      mailOptions.cc = email;
    }

    await transporter.sendMail(mailOptions);

    const insert = db.prepare(`
      INSERT INTO customers (name, email, message, sendCopy, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    insert.run(name, email, message, sendCopy === 'yes' || sendCopy === 'on' || sendCopy === true ? 1 : 0, new Date().toISOString());

    return res.json({ ok: true });
  } catch (err) {
    console.error('Failed to send email', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

// GET /admin/customers returns the saved customer records
app.get('/admin/customers', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT id, name, email, message, sendCopy, created_at FROM customers ORDER BY created_at DESC').all();
  return res.json({ customers: rows });
});

// GET /admin/customers.csv exports saved customers as CSV
app.get('/admin/customers.csv', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT id, name, email, message, sendCopy, created_at FROM customers ORDER BY created_at DESC').all();
  const csvHeader = 'id,name,email,message,sendCopy,created_at\n';
  const csvRows = rows.map(row => {
    const safe = (value) => {
      if (value == null) return '';
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    };
    return [row.id, row.name, row.email, row.message, row.sendCopy ? 'yes' : 'no', row.created_at].map(safe).join(',');
  }).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
  res.send(csvHeader + csvRows);
});

// Serve static files from project root (so you can run server and view site)
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Contact mail server listening on http://localhost:${PORT}`);
});
