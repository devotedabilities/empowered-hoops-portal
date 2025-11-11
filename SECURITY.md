# Security Guidelines

## Overview

This document outlines security practices and guidelines for the Empowered Hoops Portal project.

## Credential Management

### DO NOT Commit These Files

Never commit the following to git:
- `.env` files (any variant)
- Service account JSON files (`*-credentials.json`)
- Private keys (`.pem`, `.key`, `.p12`)
- API keys or tokens
- Any file containing passwords or secrets

### Environment Variables

All sensitive configuration should be stored in environment variables. See `backend/.env.example` for the template.

**Setup for Development:**

1. Copy the example file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Fill in your actual values in `.env` (never commit this file!)

3. Required variables:
   - `EMAIL_USER` - Gmail address for sending notifications
   - `EMAIL_APP_PASSWORD` - Gmail app password (not your regular password)
   - `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON
   - `TEMPLATE_SPREADSHEET_ID` - Template spreadsheet ID
   - `PARENT_FOLDER_ID` - Google Drive folder ID
   - `MASTER_SHEET_ID` - Master attendance sheet ID
   - `SERVICE_ACCOUNT_EMAIL` - Service account email
   - `ADMIN_EMAIL` - Admin email address
   - `NOTIFICATION_EMAILS` - Comma-separated list of notification recipients

## Google Cloud Service Account

### Creating a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to: IAM & Admin > Service Accounts
3. Click "Create Service Account"
4. Name: `term-tracker-service` (or similar)
5. Grant minimum required permissions:
   - Google Drive API (read/write)
   - Google Sheets API (read/write)
   - Apps Script API (if needed)

### Downloading Credentials

1. Click on the service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose JSON format
5. Save to `backend/credentials/service-account-key.json`
6. **NEVER** commit this file to git

### Service Account Permissions

Grant the service account access to:
- Template spreadsheet (Editor)
- Parent folder in Google Drive (Editor)
- Master attendance sheet (Editor)

## Firebase Configuration

### Frontend Configuration

The Firebase client configuration in `frontend/src/config/firebase.js` is safe to commit. These keys are meant to be public and are protected by Firebase Security Rules.

### Backend Configuration

Firebase Admin SDK uses Application Default Credentials or the service account specified in `GOOGLE_APPLICATION_CREDENTIALS`.

## Email Configuration

### Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to: Google Account > Security > 2-Step Verification > App Passwords
3. Generate an app password for "Mail"
4. Use this in `EMAIL_APP_PASSWORD` environment variable

## Production Deployment

### Firebase Functions Secrets

For production, use Firebase Functions secrets:

```bash
# Set email credentials
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_APP_PASSWORD

# Service account is automatically available in Firebase Functions
# via Application Default Credentials
```

### Environment Variables in Firebase

Configure other variables in `.env` file or use Firebase Functions config:

```bash
firebase functions:config:set \
  config.template_spreadsheet_id="your-id" \
  config.parent_folder_id="your-id" \
  config.master_sheet_id="your-id"
```

## Security Checklist

- [ ] All `.env` files are in `.gitignore`
- [ ] No credentials committed to git
- [ ] Service account has minimum required permissions
- [ ] Firebase Security Rules are properly configured
- [ ] Gmail app password is used (not regular password)
- [ ] Production secrets use Firebase Functions secrets
- [ ] All team members have reviewed this document

## Incident Response

### If Credentials Are Exposed

1. **Immediately revoke the compromised credentials**:
   - Service Account: Delete or disable in Google Cloud Console
   - Gmail: Revoke app password immediately

2. **Rotate all related credentials**:
   - Create new service account
   - Generate new Gmail app password
   - Update all environment variables

3. **Check for unauthorized access**:
   - Review Google Cloud audit logs
   - Check Google Drive activity
   - Review Firebase usage

4. **Clean git history** (if committed):
   - See `CREDENTIAL_ROTATION.md` for detailed steps
   - Consider creating a new repository

5. **Notify the team**:
   - Document what was exposed
   - Update security procedures
   - Review access logs

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@devotedabilities.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

## Updates

This security document should be reviewed and updated:
- When adding new services or integrations
- After any security incident
- Quarterly as part of security review
- When team members join/leave

Last Updated: 2025-11-11
