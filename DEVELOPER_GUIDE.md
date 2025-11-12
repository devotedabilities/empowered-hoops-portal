# Empowered Hoops Portal - Developer Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Key Components](#key-components)
6. [Data Flow](#data-flow)
7. [Setup & Deployment](#setup--deployment)
8. [Configuration](#configuration)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

The Empowered Hoops Portal is a web-based attendance and term tracking system for managing basketball programs. It automates the creation of term tracker spreadsheets, enables coaches to mark attendance, and automatically syncs attendance data to a master Google Sheet for reporting and invoicing.

**Key Features:**
- Create term trackers from templates (Google Sheets)
- Mark athlete attendance for sessions
- Automatic sync to master Google Sheet
- Real-time data persistence via Firestore
- Email notifications for new term trackers

---

## Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React/Vite)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Cloud Functions│
│  (Node.js)      │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┐
    ▼         ▼              ▼
┌────────┐ ┌─────────┐ ┌──────────────┐
│Firestore│ │ Google  │ │ Google Drive │
│         │ │ Sheets  │ │              │
└─────────┘ └─────────┘ └──────────────┘
```

**Flow:**
1. User interacts with frontend
2. Frontend calls Cloud Functions (HTTP endpoints)
3. Cloud Functions:
   - Create/read Google Sheets
   - Save data to Firestore
   - Trigger Firestore events
4. Firestore trigger automatically syncs to master sheet

---

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Styling (no framework, custom CSS)

### Backend
- **Firebase Cloud Functions v2** - Serverless backend
- **Node.js 20** - Runtime
- **Google APIs** - Sheets API, Drive API
- **Firestore** - NoSQL database
- **Nodemailer** - Email notifications

### Infrastructure
- **Firebase Hosting** - Frontend hosting
- **Google Cloud Platform** - Function execution
- **Service Accounts** - Authentication for API access

---

## Project Structure

```
empowered-hoops-portal/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CreateTermTracker.jsx    # Create new term trackers
│   │   │   ├── TermTrackerList.jsx      # List all term trackers
│   │   │   └── MarkAttendance.jsx       # Mark attendance interface
│   │   ├── App.jsx                      # Root component with routing
│   │   └── main.jsx                     # Entry point
│   ├── dist/                            # Build output (deployed)
│   └── package.json
├── backend/
│   ├── index.js                         # All Cloud Functions
│   ├── welcomeEmail.js                  # Email template helper
│   └── package.json
├── firebase.json                        # Firebase configuration
├── .firebaserc                          # Firebase project ID
└── .gitignore
```

---

## Key Components

### Frontend Components

#### 1. CreateTermTracker.jsx
**Purpose:** Create new term tracker spreadsheets

**Key Features:**
- Form for term configuration (program type, coach, dates, etc.)
- Dynamic athlete list (add/remove)
- Calls `createTermTracker` Cloud Function
- Copies template spreadsheet and configures it

**State Management:**
```javascript
termConfig: {
  programType,      // e.g., "EH Academy"
  termName,         // e.g., "Term 1"
  coachName,
  sessionDay,
  sessionTime,
  startDate,
  numberOfSessions
}
athletes: [{
  name,
  ratio,
  paidStatus,
  guardianName,
  guardianRelationship,
  phone,
  email,
  address
}]
```

#### 2. TermTrackerList.jsx
**Purpose:** Display list of all term trackers

**Key Features:**
- Fetches from `listTermTrackers` Cloud Function
- Filters by program type
- Navigate to attendance marking

**Data Flow:**
```
Component Mount → API Call → Display List → Click → Navigate to MarkAttendance
```

#### 3. MarkAttendance.jsx
**Purpose:** Mark athlete attendance for sessions

**Key Features:**
- Fetches attendance data from `getAttendanceData`
- Session selector (1-10)
- Checkbox interface for marking attendance
- Saves via `updateAttendance` Cloud Function
- Triggers Firestore sync to master sheet

**Important:** Passes `termConfig` to backend for proper Firestore records

---

### Backend Functions

#### 1. createTermTracker (HTTP)
**Endpoint:** `POST /createTermTracker`

**Purpose:** Create new term tracker spreadsheet

**Process:**
1. Validate request body
2. Authenticate with Google APIs
3. Copy template spreadsheet
4. Configure headers with term info
5. Add athlete rows
6. Set permissions (coach + admin)
7. Send confirmation email
8. Return spreadsheet URL

**Request Body:**
```json
{
  "termConfig": {
    "programType": "EH Academy",
    "termName": "Term 1",
    "coachName": "John Smith",
    "sessionDay": "Wednesday",
    "sessionTime": "4:00 PM - 5:30 PM",
    "startDate": "2025-01-15",
    "numberOfSessions": 10
  },
  "athletes": [
    {
      "name": "Athlete Name",
      "ratio": "1:2",
      "paidStatus": "Pending"
    }
  ],
  "createdBy": "email@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "sheetId": "spreadsheet-id",
  "sheetUrl": "https://docs.google.com/spreadsheets/d/...",
  "message": "Term tracker created successfully"
}
```

#### 2. listTermTrackers (HTTP)
**Endpoint:** `GET /listTermTrackers`

**Purpose:** List all term tracker spreadsheets in folder

**Process:**
1. Authenticate with Google Drive API
2. Query folder for spreadsheets
3. Parse filenames for metadata
4. Return list with URLs

**Response:**
```json
{
  "success": true,
  "trackers": [
    {
      "id": "spreadsheet-id",
      "name": "Term 1 - Attendance & Payment - EH Academy",
      "termName": "Term 1",
      "programType": "EH Academy",
      "createdTime": "2025-01-15T10:00:00Z",
      "url": "https://docs.google.com/spreadsheets/d/..."
    }
  ],
  "count": 5
}
```

#### 3. getAttendanceData (HTTP)
**Endpoint:** `GET /getAttendanceData?spreadsheetId=xxx&sheetName=yyy`

**Purpose:** Fetch athlete and session data from tracker sheet

**Process:**
1. Authenticate with Google Sheets API
2. Read sheet range `A1:M50`
3. Parse header rows (1-3) for term config
4. Parse session dates from row 3
5. Parse athlete rows (4+)
6. Return structured data

**Response:**
```json
{
  "success": true,
  "athletes": [
    { "id": "1", "name": "Athlete Name" }
  ],
  "sessions": [
    { "number": 1, "date": "15/01/2025", "formatted": "15 Jan 2025" }
  ],
  "attendance": {
    "1": { "1": true, "2": false }
  },
  "termConfig": {
    "programType": "EH Academy",
    "programLabel": "EH Academy — Term 1",
    "coachName": "John Smith",
    "duration": 1.5
  }
}
```

#### 4. updateAttendance (HTTP)
**Endpoint:** `POST /updateAttendance`

**Purpose:** Save attendance marks to sheet and Firestore

**Process:**
1. Calculate column for session
2. Update sheet with attendance marks
3. Create Firestore records for attended athletes
4. Firestore trigger fires → syncs to master sheet

**Request Body:**
```json
{
  "spreadsheetId": "spreadsheet-id",
  "sheetName": "EH Academy",
  "sessionNumber": "1",
  "attendance": {
    "1": true,
    "2": false,
    "3": true
  },
  "termConfig": {
    "programLabel": "EH Academy — Term 1",
    "coachName": "John Smith",
    "duration": 1.5
  }
}
```

**Important:** Each attended athlete creates a Firestore document in `attendance` collection

#### 5. syncAttendanceToMaster (Firestore Trigger)
**Trigger:** `onDocumentCreated('attendance/{docId}')`

**Purpose:** Automatically sync attendance to master Google Sheet

**Process:**
1. Firestore document created → trigger fires
2. Extract attendance data from document
3. Format as row: `[date, program, athlete, status, sessionType, coach, duration, ratio, paymentType, notes]`
4. Append to master sheet using Sheets API

**Firestore Document Structure:**
```javascript
{
  date: "15/01/2025",
  program: "EH Academy — Term 1",
  athlete: "Athlete Name",
  status: "Attended",
  sessionType: "Group",
  coach: "John Smith",
  duration: 1.5,
  ratio: "1:2",
  paymentType: "Pending",
  notes: "",
  spreadsheetId: "tracker-sheet-id",
  sessionNumber: 1,
  timestamp: Firestore.Timestamp
}
```

---

## Data Flow

### Complete Attendance Flow

```
1. User marks attendance
   ↓
2. Frontend: updateAttendance()
   ↓
3. Cloud Function: updateAttendance
   ├─→ Update individual tracker sheet (Google Sheets)
   └─→ Write to Firestore (attendance collection)
       ↓
4. Firestore Trigger: syncAttendanceToMaster
   ↓
5. Append row to master sheet (Google Sheets)
   ↓
6. ✅ Complete
```

### Authentication Flow

```
Cloud Function Start
   ↓
getGoogleAuth()
   ├─→ Use default service account credentials
   ├─→ Request scopes:
   │   ├─ drive (copy files, set permissions)
   │   ├─ spreadsheets (read/write sheets)
   │   └─ script.projects (Apps Script updates)
   ↓
Return authenticated client
   ↓
Use with google.sheets() or google.drive()
```

---

## Setup & Deployment

### Prerequisites
- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Google Cloud Project with billing enabled
- Firebase project created

### Initial Setup

1. **Clone repository:**
```bash
git clone <repository-url>
cd empowered-hoops-portal
```

2. **Install dependencies:**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Configure Firebase:**
```bash
firebase login
firebase use empowered-hoops-term-tra-341d5
```

4. **Set environment variables** (backend/.env):
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

### Deployment

**Deploy everything:**
```bash
firebase deploy
```

**Deploy only frontend:**
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

**Deploy only functions:**
```bash
firebase deploy --only functions
```

**Deploy specific function:**
```bash
firebase deploy --only functions:syncAttendanceToMaster
```

### Local Development

**Run frontend locally:**
```bash
cd frontend
npm run dev
# Opens on http://localhost:5173
```

**Update API URLs in frontend for local testing:**
```javascript
// Change from:
https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/...

// To:
http://localhost:8080/...
```

---

## Configuration

### Firebase Configuration (firebase.json)
```json
{
  "functions": [{
    "source": "backend",
    "runtime": "nodejs20",
    "serviceAccount": "term-tracker-service@empowered-hoops-term-tra-341d5.iam.gserviceaccount.com"
  }],
  "hosting": {
    "public": "frontend/dist",
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }]
  }
}
```

### Important IDs (backend/index.js)

**Template Spreadsheet:**
```javascript
TEMPLATE_SPREADSHEET_ID: '15wTazkxoURaqHk9CTSbBxQr_SUZ38-uJSanPE1PtM0g'
```

**Master Sheet:**
```javascript
MASTER_SHEET_ID: '1LQXnQS_KRfwFtNxH6qeKM7nObJgnM6REtT_9YA9f7Tg'
MASTER_SHEET_NAME: 'Attendance & Payments'
```

**Term Trackers Folder:**
```javascript
FOLDER_ID: '18MaTO0Vp9X-kMjeFUDie_Vyq2BnNgruU'
```

**Service Accounts:**
- Custom: `term-tracker-service@empowered-hoops-term-tra-341d5.iam.gserviceaccount.com`
- Compute: `188854971437-compute@developer.gserviceaccount.com`

---

## API Reference

### Base URL
```
https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net
```

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/createTermTracker` | POST | Create new term tracker |
| `/listTermTrackers` | GET | List all term trackers |
| `/getAttendanceData` | GET | Get attendance data for tracker |
| `/updateAttendance` | POST | Save attendance marks |
| `/sendWelcomeEmail` | POST | Send welcome email to new users |

### CORS
All endpoints support:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

## Troubleshooting

### Common Issues

#### 1. "This operation is not supported for this document"
**Cause:** Trying to append to Excel file instead of Google Sheet

**Solution:**
- Verify master sheet is a Google Sheet (not Excel)
- Check `MASTER_SHEET_ID` in backend/index.js

#### 2. "The caller does not have permission" (403)
**Cause:** Service account doesn't have access to sheet

**Solution:**
- Share sheet with both service accounts (Editor access):
  - `term-tracker-service@empowered-hoops-term-tra-341d5.iam.gserviceaccount.com`
  - `188854971437-compute@developer.gserviceaccount.com`

#### 3. "Missing sheetName parameter"
**Cause:** Frontend not passing sheet name correctly

**Solution:**
- Verify `programType` matches exact sheet tab name (case-sensitive)
- Check browser console for API request parameters

#### 4. Functions not updating after deployment
**Cause:** Cached function code or stale deployment

**Solution:**
```bash
# Force redeploy all functions
firebase deploy --only functions --force
```

#### 5. Term trackers not loading
**Cause:** Missing `onRequest()` wrapper for v2 functions

**Solution:**
- Ensure all HTTP functions use: `exports.functionName = onRequest(async (req, res) => { ... });`
- Not: `exports.functionName = async (req, res) => { ... };`

### Debugging

**View function logs:**
```bash
firebase functions:log
firebase functions:log --only syncAttendanceToMaster
```

**Check Firestore data:**
```
https://console.firebase.google.com/project/empowered-hoops-term-tra-341d5/firestore
```

**Check function status:**
```
https://console.firebase.google.com/project/empowered-hoops-term-tra-341d5/functions
```

---

## Security Best Practices

1. **Never commit credentials:**
   - `.env` files are gitignored
   - Service account keys should not be in repository

2. **Service account permissions:**
   - Only grant Editor access to specific folders
   - Don't grant domain-wide delegation unless required

3. **CORS configuration:**
   - Consider restricting origins in production
   - Current: `*` (allows all origins)

4. **Firestore rules:**
   - Currently uses default rules
   - Consider adding authentication requirements

---

## Future Enhancements

### Potential Features
1. **User Authentication:**
   - Add Firebase Auth
   - Role-based access (admin, coach, viewer)

2. **Advanced Reporting:**
   - Dashboard with attendance statistics
   - Export reports (PDF, CSV)

3. **Notifications:**
   - Email reminders for unpaid sessions
   - SMS notifications for coaches

4. **Mobile App:**
   - React Native mobile version
   - Offline attendance marking

5. **Bulk Operations:**
   - Bulk athlete import (CSV)
   - Copy attendance from previous term

6. **Calendar Integration:**
   - Google Calendar sync
   - iCal export

---

## Contact & Support

**Project Repository:** [Add GitHub/GitLab URL here]

**Firebase Project ID:** `empowered-hoops-term-tra-341d5`

**Firebase Console:** https://console.firebase.google.com/project/empowered-hoops-term-tra-341d5

**Deployed Frontend:** https://empowered-hoops-term-tra-341d5.web.app

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 2025 | Initial release |
| 1.1 | Nov 2025 | Fixed Sheets API scope, v2 function wrappers |
| 1.2 | Nov 2025 | Updated master sheet from Excel to Google Sheets |

---

**Last Updated:** November 12, 2025
**Maintained By:** Devoted Abilities
