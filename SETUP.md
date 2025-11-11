# Setup Guide

## Prerequisites

- Node.js 20.x or later
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud project with APIs enabled
- Git

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd empowered-hoops-portal
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in your values:

```bash
# Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password

# Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account-key.json

# Google Drive & Sheets IDs
TEMPLATE_SPREADSHEET_ID=your-template-id
PARENT_FOLDER_ID=your-folder-id
MASTER_SHEET_ID=your-master-sheet-id

# Service Account
SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com

# Admin
ADMIN_EMAIL=admin@example.com
NOTIFICATION_EMAILS=admin1@example.com, admin2@example.com

# Environment
NODE_ENV=development
```

### 4. Set Up Service Account

1. Create a Google Cloud service account (see `CREDENTIAL_ROTATION.md` Step 2)
2. Download the JSON key file
3. Save to `backend/credentials/service-account-key.json`
4. Share required Google Drive resources with the service account email

### 5. Firebase Configuration

```bash
# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init

# Select:
# - Functions (Firebase Functions)
# - Hosting (Firebase Hosting)
```

---

## Development

### Run Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Run Backend Locally

```bash
cd backend
npm start
```

Backend functions will be available at: `http://localhost:8080`

**Endpoints**:
- `POST http://localhost:8080/createTermTracker`
- `GET  http://localhost:8080/listTermTrackers`
- `GET  http://localhost:8080/getAttendanceData`
- `POST http://localhost:8080/updateAttendance`
- `POST http://localhost:8080/sendWelcomeEmail`

### Run Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

---

## Building for Production

### Build Frontend

```bash
cd frontend
npm run build
```

Built files will be in `frontend/dist/`

### Deploy to Firebase

```bash
# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
```

---

## Google Cloud Setup

### Required APIs

Enable these APIs in Google Cloud Console:

1. Google Drive API
2. Google Sheets API
3. Apps Script API (if using)
4. Cloud Firestore API
5. Cloud Functions API

### Service Account Permissions

The service account needs access to:

1. **Template Spreadsheet** (Editor)
2. **Parent Folder** (Editor)
3. **Master Attendance Sheet** (Editor)

Share each resource:
1. Open the resource in Google Drive/Sheets
2. Click "Share"
3. Add service account email
4. Set role to "Editor"

---

## Firebase Setup

### Firestore Database

1. Go to Firebase Console > Firestore Database
2. Create database in production mode
3. Update security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /attendance/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Firebase Authentication

1. Go to Firebase Console > Authentication
2. Enable sign-in methods:
   - Google
   - Email/Password (if needed)

### Firebase Hosting

Already configured via `firebase.json`

---

## Gmail Setup

### Create App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to 2-Step Verification > App Passwords
4. Select "Mail" and your device
5. Generate password
6. Copy the 16-character password to `EMAIL_APP_PASSWORD` in `.env`

**Never use your regular Gmail password!**

---

## Troubleshooting

### "Permission denied" from Google APIs

- Verify service account has access to resources
- Check that `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Ensure APIs are enabled in Google Cloud Console

### Email not sending

- Verify `EMAIL_USER` and `EMAIL_APP_PASSWORD` are correct
- Check that 2FA is enabled on Gmail account
- Ensure you're using an app password, not regular password
- Check Firebase Functions logs for error messages

### Firebase deployment fails

```bash
# Check Firebase CLI version
firebase --version

# Update if needed
npm install -g firebase-tools@latest

# Re-authenticate
firebase logout
firebase login
```

### Firestore connection issues

- Verify Firebase project ID is correct
- Check Firestore security rules
- Ensure Firebase Admin SDK is initialized

### Local development issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 20.x or later
```

---

## Security Notes

🔒 **Never commit these files**:
- `.env`
- `credentials/*.json`
- `*-credentials.json`
- `.pem`, `.key` files

🔒 **Always verify** `.gitignore` before committing

🔒 **Review** `SECURITY.md` for detailed security guidelines

🔒 **Rotate credentials** regularly (see `CREDENTIAL_ROTATION.md`)

---

## Getting Help

- Security issues: security@devotedabilities.com
- General questions: info@devotedabilities.com
- Documentation: See `SECURITY.md`, `CREDENTIAL_ROTATION.md`

---

## Next Steps

After setup:

1. ✅ Test creating a term tracker
2. ✅ Verify email notifications work
3. ✅ Check attendance tracking
4. ✅ Review security settings
5. ✅ Set up monitoring/alerts
6. ✅ Configure backups

---

Last Updated: 2025-11-11
