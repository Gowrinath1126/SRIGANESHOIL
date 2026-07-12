# Sri Ganesh Oils Website

This is a static frontend and Node.js backend project for Sri Ganesh Oils.
The website includes:

- Responsive landing page with product, about, gallery, and contact sections
- Contact form sending email and storing customer details locally
- Admin routes for listing customers and downloading CSV
- Shareable website link block

## Deploying

### 1. Install dependencies

```bash
npm install
```

### 2. Create a `.env` file

Copy `.env.example` to `.env` and add your SMTP credentials plus admin credentials.

### 3. Run locally

```bash
npm start
```

Open http://localhost:3000

### 4. Deploy to Render / Railway / Heroku

1. Push this repo to GitHub.
2. Connect the repo to your hosting provider.
3. Set environment variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `ADMIN_EMAIL`
- `ADMIN_USER`
- `ADMIN_PASS`
- `DB_PATH=customers.db`

4. Set build command: `npm install`
5. Set start command: `npm start`

### Admin routes

- `GET /admin/customers`
- `GET /admin/customers.csv`

These routes are protected using HTTP Basic Auth.
