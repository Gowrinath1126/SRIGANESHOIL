# Deploying Sri Ganesh Oils

## Deploy on Render

1. Push your code to GitHub.
2. Create a new Web Service in Render.
3. Connect your GitHub repository.
4. Set the service to use the root of this repository.
5. Set Build Command: `npm install`
6. Set Start Command: `npm start`
7. Add environment variables in Render:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `ADMIN_EMAIL`
   - `ADMIN_USER`
   - `ADMIN_PASS`
   - `DB_PATH=customers.db`
8. Deploy the service.

## Deploy on Heroku

1. Install Heroku CLI.
2. Run `heroku login`.
3. Run `heroku create`.
4. Push your repository to Heroku: `git push heroku main`.
5. Set config vars:
   ```bash
   heroku config:set SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_SECURE=false SMTP_USER=you@example.com SMTP_PASS=yourpassword ADMIN_EMAIL=sriganeshoils@gmail.com ADMIN_USER=admin ADMIN_PASS=strongpassword DB_PATH=customers.db
   ```
6. Open your app with `heroku open`.

## Notes

- If using Gmail SMTP, use an App Password.
- The contact form posts to `/send-contact`.
- Admin routes are protected by HTTP Basic Auth.
- You can use `docker build -t sriganeshoils .` and `docker run -p 3000:3000 --env-file .env sriganeshoils` for local Docker testing.
