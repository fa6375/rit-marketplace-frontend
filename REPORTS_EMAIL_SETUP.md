# Report email notifications — setup

When a user submits a report (from the profile menu or a listing page), a
Cloud Function (`onReportCreated` in `functions/index.js`) automatically emails
the admin. The report itself is always saved to Firestore and shown in the
admin panel even if email is not configured — email is an extra notification.

## One-time setup

You need an SMTP account to send from. The easiest is a Gmail account with an
**app password**:

1. Go to your Google Account → Security → 2-Step Verification (must be ON).
2. Search for "App passwords", create one for "Mail", and copy the 16-character
   password.

Then, from the project root, with the Firebase CLI installed and logged in:

```bash
cd functions
npm install

# Store the SMTP password as a secret (paste the app password when prompted)
firebase functions:secrets:set SMTP_PASS

# Deploy — the CLI will prompt you for the string parameters:
#   SMTP_USER   = the Gmail address you send FROM  (e.g. yourbot@gmail.com)
#   ADMIN_EMAIL = the address you want reports sent TO (e.g. faraj@example.com)
#   SMTP_HOST   = press Enter to accept smtp.gmail.com
#   SMTP_PORT   = press Enter to accept 465
firebase deploy --only functions
```

That's it. Submit a test report from a normal user account and check the inbox
(and spam folder) of `ADMIN_EMAIL`.

## Using another provider

Any SMTP provider works (Outlook, SendGrid, Mailgun, your university SMTP…):
set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` and the `SMTP_PASS` secret
accordingly during deploy.

## Troubleshooting

- Check function logs: `firebase functions:log --only onReportCreated`
- "Email not sent — SMTP_USER / SMTP_PASS / ADMIN_EMAIL are not configured"
  means the parameters above were not set during deploy.
- Gmail blocks plain passwords — you must use an app password, not your
  normal account password.
