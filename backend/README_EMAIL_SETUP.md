# Email Setup for Password Reset

## Configuration

To enable email sending for password reset functionality, you need to configure the following environment variables in your `.env` file:

```bash
# Email Configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=MediFlow

# Frontend URL (for reset links)
FRONTEND_URL=http://localhost:5173
```

## Gmail Setup

If using Gmail, you need to:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `MAIL_PASSWORD`

## Other Email Providers

For other providers, adjust the settings accordingly:

### Outlook/Hotmail
```bash
MAIL_SERVER=smtp-mail.outlook.com
MAIL_PORT=587
```

### Yahoo
```bash
MAIL_SERVER=smtp.mail.yahoo.com
MAIL_PORT=587
```

### Custom SMTP
```bash
MAIL_SERVER=your-smtp-server.com
MAIL_PORT=587
```

## Testing

1. Start the backend server
2. Navigate to the forgot password page
3. Enter a valid email address
4. Check the email inbox for the reset link

## Troubleshooting

- Ensure all environment variables are set correctly
- Check that the email provider allows SMTP access
- Verify that the app password is correct (for Gmail)
- Check server logs for any email sending errors
