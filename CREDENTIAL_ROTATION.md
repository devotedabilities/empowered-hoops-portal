# Credential Rotation Guide

## URGENT: Rotating Exposed Credentials

If credentials have been committed to git, follow these steps immediately.

---

## Step 1: Revoke Compromised Service Account

### Via Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: `empowered-hoops-term-tracker`
3. Navigate to: **IAM & Admin** > **Service Accounts**
4. Find: `term-tracker-service@empowered-hoops-term-tracker.iam.gserviceaccount.com`
5. Click the three dots menu > **Delete** (or **Disable** if you need logs first)
6. Confirm deletion

**⚠️ Important**: The exposed service account credentials in git history are:
- Service Account Email: `term-tracker-service@empowered-hoops-term-tracker.iam.gserviceaccount.com`
- Private Key ID: `647e4504e4dec74da360a4b162b3b80bd01086bd`
- Project: `empowered-hoops-term-tracker`

---

## Step 2: Create New Service Account

### Create the Service Account

1. In Google Cloud Console > **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Name: `term-tracker-service-v2` (or use date: `term-tracker-2025-11`)
4. Description: `Service account for term tracker backend (created Nov 2025)`
5. Click **Create and Continue**

### Grant Permissions

Grant these roles (principle of least privilege):

1. **Project-level permissions**:
   - None required (grant specific resource access instead)

2. Click **Continue** and then **Done**

### Download New Credentials

1. Click on the newly created service account
2. Go to **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON**
5. Click **Create** - file will download
6. **Rename** to: `service-account-key.json`
7. **Move** to: `backend/credentials/service-account-key.json`
8. **Verify** it's in `.gitignore`

### Grant Resource-Specific Access

The service account needs access to specific Google Drive resources:

```bash
# You'll need to manually share these resources with the service account email
# Go to each resource and click "Share"
```

**Resources to share**:

1. **Template Spreadsheet** (`15wTazkxoURaqHk9CTSbBxQr_SUZ38-uJSanPE1PtM0g`):
   - Share with: `term-tracker-service-v2@empowered-hoops-term-tracker.iam.gserviceaccount.com`
   - Role: **Editor**

2. **Parent Folder** (`18MaTO0Vp9X-kMjeFUDie_Vyq2BnNgruU`):
   - Share with: `term-tracker-service-v2@empowered-hoops-term-tracker.iam.gserviceaccount.com`
   - Role: **Editor**

3. **Master Sheet** (`1W8vilXx7JcRDTiRJR5qddWzx8NXO7rvO`):
   - Share with: `term-tracker-service-v2@empowered-hoops-term-tracker.iam.gserviceaccount.com`
   - Role: **Editor**

---

## Step 3: Update Environment Variables

Update your `backend/.env` file:

```bash
# Update the service account email
SERVICE_ACCOUNT_EMAIL=term-tracker-service-v2@empowered-hoops-term-tracker.iam.gserviceaccount.com

# Verify the path is correct
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account-key.json
```

**Test the new credentials**:

```bash
cd backend
node -e "console.log(require('./credentials/service-account-key.json').client_email)"
# Should output: term-tracker-service-v2@empowered-hoops-term-tracker.iam.gserviceaccount.com
```

---

## Step 4: Rotate Gmail App Password (Optional but Recommended)

If the `.env` file was ever committed or shared:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Navigate to: **2-Step Verification** > **App passwords**
3. **Revoke** the old app password
4. Click **Generate** new app password
5. Select **Mail** and your device
6. **Copy** the 16-character password
7. Update `EMAIL_APP_PASSWORD` in `backend/.env`

---

## Step 5: Clean Git History

**⚠️ WARNING**: This will rewrite git history. All collaborators must re-clone.

### Option A: Use BFG Repo-Cleaner (Recommended)

1. **Download BFG**:
   ```bash
   # macOS
   brew install bfg

   # Or download from: https://rtyley.github.io/bfg-repo-cleaner/
   ```

2. **Create a fresh clone** (for safety):
   ```bash
   git clone --mirror git@github.com:devotedabilities/empowered-hoops-portal.git
   cd empowered-hoops-portal.git
   ```

3. **Remove the sensitive file**:
   ```bash
   bfg --delete-files term-tracker-credentials.json
   ```

4. **Clean up**:
   ```bash
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

5. **Force push**:
   ```bash
   git push --force
   ```

### Option B: Use git filter-repo (Alternative)

1. **Install filter-repo**:
   ```bash
   pip3 install git-filter-repo
   ```

2. **Remove the file from history**:
   ```bash
   git filter-repo --path backend/credentials/term-tracker-credentials.json --invert-paths
   ```

3. **Force push**:
   ```bash
   git push origin --force --all
   ```

### Option C: Start Fresh Repository (Simplest)

If the repository hasn't been widely shared:

1. **Create a new repository** on GitHub
2. **Copy current clean state**:
   ```bash
   # In your current repo directory
   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit with secure configuration"
   git remote add origin <new-repo-url>
   git push -u origin main
   ```

3. **Update all references** to the new repository
4. **Archive or delete** the old repository

---

## Step 6: Verify Security

### Check Git History

```bash
# Search for any remaining credentials
git log --all --full-history --source --pickaxe-all -S"private_key"
git log --all --full-history --source --pickaxe-all -S"service_account"

# Should return no results
```

### Test Application

```bash
# Test backend locally
cd backend
npm start

# Verify it can:
# - Authenticate with Google APIs
# - Create spreadsheets
# - Send emails
```

### Enable GitHub Security Features

1. Go to: **GitHub Repository** > **Settings** > **Security**
2. Enable:
   - **Dependabot alerts**
   - **Secret scanning alerts** (if available)
   - **Code scanning alerts**

---

## Step 7: Update Production

### Firebase Functions

1. **Update secrets**:
   ```bash
   firebase functions:secrets:set EMAIL_USER
   firebase functions:secrets:set EMAIL_APP_PASSWORD
   ```

2. **Update environment config**:
   ```bash
   firebase functions:config:set \
     config.service_account_email="term-tracker-service-v2@empowered-hoops-term-tracker.iam.gserviceaccount.com"
   ```

3. **Redeploy**:
   ```bash
   firebase deploy --only functions
   ```

### Verify Production

1. Test creating a term tracker from production
2. Check Firebase Functions logs
3. Verify email notifications work

---

## Step 8: Notify Team

Send this message to all collaborators:

```
Subject: URGENT - Repository Security Update

We've rotated credentials due to a security incident. Please take these actions:

1. If you have a local clone, delete it and re-clone:
   git clone <repository-url>

2. Update your backend/.env file with new credentials (check CREDENTIAL_ROTATION.md)

3. Delete any old credential files:
   rm backend/credentials/term-tracker-credentials.json

4. Review SECURITY.md for updated security practices

If you have any questions or need access to the new credentials, contact [admin].
```

---

## Step 9: Audit Access

### Check Google Cloud Audit Logs

1. Go to: **Google Cloud Console** > **Logging** > **Logs Explorer**
2. Run this query:
   ```
   protoPayload.authenticationInfo.principalEmail="term-tracker-service@empowered-hoops-term-tracker.iam.gserviceaccount.com"
   ```
3. Look for:
   - Unusual access times
   - Unexpected API calls
   - Access from unknown IPs

### Check Firebase Usage

1. Go to: **Firebase Console** > **Usage and Billing**
2. Check for:
   - Unusual spikes in function calls
   - Unexpected data transfer
   - Database operations anomalies

---

## Prevention Checklist

After rotation, verify:

- [ ] Old service account is deleted/disabled
- [ ] New credentials are not in git
- [ ] `.gitignore` includes all credential patterns
- [ ] Git history is cleaned
- [ ] Team members are notified
- [ ] Production is updated and tested
- [ ] Audit logs are reviewed
- [ ] Security documentation is updated
- [ ] GitHub security features are enabled
- [ ] Backup of new credentials is stored securely (password manager)

---

## Regular Credential Rotation

**Recommended Schedule**:
- Service accounts: Every 90 days
- Gmail app passwords: Every 6 months
- Review access: Monthly

**Set reminders**:
```bash
# Add to calendar
- Service Account Rotation: Every quarter
- Access Review: First Monday of each month
- Security Policy Review: Every 6 months
```

---

## Questions?

Contact: security@devotedabilities.com

Last Updated: 2025-11-11
