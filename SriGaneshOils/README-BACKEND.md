Backend for contact form email delivery
=====================================

This repository includes a minimal Node.js Express backend that accepts contact form submissions and sends them as email using SMTP (via Nodemailer).

Setup
-----

1. Install dependencies

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in SMTP credentials and `ADMIN_EMAIL`.

3. Run the server

```bash
npm start
```

By default the server listens on port `3000`. The frontend in this project posts the contact form to `/send-contact`.

Gmail notes
-----------
If you use Gmail as SMTP, create an App Password for the account (recommended) and set `SMTP_USER` to your Gmail address and `SMTP_PASS` to the app password. If using standard Gmail credentials, you may need to enable "less secure apps" which Google no longer recommends.

Security
--------
- Keep SMTP credentials out of source control (`.env` should be in `.gitignore`).
- For production, run the backend behind HTTPS and restrict CORS origin.
