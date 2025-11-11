const { onRequest } = require("firebase-functions/v2/https");
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const { sendWelcomeEmail: sendWelcomeEmailHelper } = require('./welcomeEmail');
require('dotenv').config();

const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// ============================================
// CONFIGURATION - YOUR SPECIFIC VALUES
// ============================================
const CONFIG = {
  TEMPLATE_SPREADSHEET_ID: '15wTazkxoURaqHk9CTSbBxQr_SUZ38-uJSanPE1PtM0g',
  SERVICE_ACCOUNT_EMAIL: 'term-tracker-service@empowered-hoops-term-tracker.iam.gserviceaccount.com',
  ADMIN_EMAIL: 'info@devotedabilities.com',
};

// ============================================
// GOOGLE AUTHENTICATION
// ============================================
async function getGoogleAuth() {
  const auth = new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/script.projects'
    ],
  });
  return auth.getClient();
}

// ============================================
// MAIN CLOUD FUNCTION
// ============================================
exports.createTermTracker = async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  console.log('Received request:', JSON.stringify(req.body, null, 2));

  try {
    // 1. Validate request
    const validationErrors = validateRequest(req.body);
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    console.log('Validation passed');

    // 2. Authenticate with Google APIs
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    console.log('Authenticated with Google APIs');

    // 3. Create spreadsheet from template
    const spreadsheetId = await createSpreadsheetFromTemplate(
      drive,
      req.body
    );

    console.log('Created spreadsheet:', spreadsheetId);

    // 4. Configure the spreadsheet
    await configureSpreadsheet(sheets, spreadsheetId, req.body);

    console.log('Configured spreadsheet');

    // 5. Set permissions
    await setSpreadsheetPermissions(drive, spreadsheetId, req.body.createdBy);

    console.log('Set permissions');

    // 6. Send confirmation email (optional, can be commented out for testing)
    try {
      await sendConfirmationEmail(req.body, spreadsheetId);
      console.log('Sent confirmation email');
    } catch (emailError) {
      console.error('Email error (non-fatal):', emailError.message);
      // Continue even if email fails
    }

    // 7. Return success response
    const response = {
      success: true,
      sheetId: spreadsheetId,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      message: 'Term tracker created successfully'
    };

    console.log('Success response:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('Error creating term tracker:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message]
    });
  }
};

// ============================================
// VALIDATION
// ============================================
function validateRequest(body) {
  const errors = [];
  
  if (!body.termConfig) {
    errors.push('Missing term configuration');
    return errors;
  }

  const { termConfig } = body;
  
  if (!termConfig.programType) {
    errors.push('Program type is required');
  }
  
  if (!termConfig.termName || termConfig.termName.trim() === '') {
    errors.push('Term name is required');
  }
  
  if (!termConfig.coachName || termConfig.coachName.trim() === '') {
    errors.push('Coach name is required');
  }
  
  if (!termConfig.startDate) {
    errors.push('Start date is required');
  } else {
    const startDate = new Date(termConfig.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date format');
    }
  }
  
  if (!body.athletes || !Array.isArray(body.athletes) || body.athletes.length === 0) {
    errors.push('At least one athlete is required');
  }

  if (!body.createdBy || !body.createdBy.includes('@')) {
    errors.push('Valid creator email is required');
  }
  
  return errors;
}

// ============================================
// SPREADSHEET CREATION
// ============================================
async function createSpreadsheetFromTemplate(drive, data) {
  const { termConfig } = data;
  
  const spreadsheetName = `${termConfig.termName} - Attendance & Payment - ${termConfig.programType}`;
  
  console.log(`Copying template ${CONFIG.TEMPLATE_SPREADSHEET_ID} to create: ${spreadsheetName}`);
  
  // Create copy without specifying folder (will go to root)
  const copy = await drive.files.copy({
    fileId: CONFIG.TEMPLATE_SPREADSHEET_ID,
    requestBody: {
      name: spreadsheetName,
      parents: ['18MaTO0Vp9X-kMjeFUDie_Vyq2BnNgruU'],
    },
    supportsAllDrives: true,
  });
  
  return copy.data.id;
}

// ============================================
// SPREADSHEET CONFIGURATION
// ============================================
async function configureSpreadsheet(sheets, spreadsheetId, data) {
  const { termConfig, athletes } = data;
  
  // 1. Rename the main sheet
  await renameSheet(sheets, spreadsheetId, termConfig.programType);
  
  // 2. Update header information (rows 1-3)
  await updateHeaders(sheets, spreadsheetId, termConfig);
  
  // 3. Add athlete data (starting from row 5)
  await addAthletes(sheets, spreadsheetId, athletes);
}

async function renameSheet(sheets, spreadsheetId, programType) {
  // Get sheet ID (usually 0 for first sheet)
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetId = spreadsheet.data.sheets[0].properties.sheetId;
  
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetId,
              title: programType,
            },
            fields: 'title',
          },
        },
      ],
    },
  });
}

async function updateHeaders(sheets, spreadsheetId, termConfig) {
  const sessionDates = calculateSessionDates(
    termConfig.startDate,
    termConfig.numberOfSessions || 10
  );
  
  const headerValues = [
    // Row 1
    [
      termConfig.programType,
      'Time:',
      termConfig.sessionTime,
      termConfig.sessionDay,
    ],
    // Row 2
    [
      termConfig.termName,
      'Coach:',
      termConfig.coachName,
    ],
    // Row 3 - dates
    [
      null,
      null,
      null,
      ...sessionDates.map(d => formatDate(d)),
    ],
  ];
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'A1:M3',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: headerValues,
    },
  });
}

async function addAthletes(sheets, spreadsheetId, athletes) {
  const athleteRows = athletes.map(athlete => [
    athlete.name,                      // A: Athlete name
    athlete.ratio || '1:2',            // B: Ratio
    athlete.paidStatus || 'Pending',   // C: Paid/Confirmed
    ...Array(10).fill(null),           // D-M: Attendance (empty)
    null,                              // N: Goal
    null,                              // O: Actual
    athlete.paidStatus || 'Pending',   // P: Payment
    null,                              // Q: Post Paid
    null,                              // R: Communication/Status
    null,                              // S: Transport/Training
    null,                              // T: Transport/Games
    athlete.guardianName && athlete.guardianRelationship 
      ? `${athlete.guardianName} (${athlete.guardianRelationship})`
      : athlete.guardianName || '',    // U: Guardian
    athlete.phone || '',               // V: Phone
    athlete.email || '',               // W: Email
    athlete.address || '',             // X: Address
    athlete.planManager || '',         // Y: Plan Manager
    athlete.funded || '',              // Z: Funded
    athlete.cos || '',                 // AA: COS
  ]);
  
  const endRow = 4 + athleteRows.length;
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `A5:AA${endRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: athleteRows,
    },
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function calculateSessionDates(startDate, numberOfSessions) {
  const dates = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < numberOfSessions; i++) {
    const sessionDate = new Date(start);
    sessionDate.setDate(start.getDate() + (i * 7)); // Add 7 days for each week
    dates.push(sessionDate);
  }
  
  return dates;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ============================================
// PERMISSIONS
// ============================================
async function setSpreadsheetPermissions(drive, spreadsheetId, coachEmail) {
  console.log(`Setting permissions for coach: ${coachEmail}`);
  
  // Give coach edit access
  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: {
      type: 'user',
      role: 'writer',
      emailAddress: coachEmail,
    },
    sendNotificationEmail: false,
    supportsAllDrives: true,
  });
  
  // Give admin edit access
  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: {
      type: 'user',
      role: 'writer',
      emailAddress: CONFIG.ADMIN_EMAIL,
    },
    sendNotificationEmail: false,
    supportsAllDrives: true,
  });
}

// ============================================
// EMAIL NOTIFICATION (Optional)
// ============================================
async function sendConfirmationEmail(data, spreadsheetId) {
  const { termConfig } = data;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  // Email content
  const mailOptions = {
    from: `"Empowered Hoops Term Tracker" <${process.env.EMAIL_USER}>`,
    to: 'david@devotedabilities.com, info@empoweredhoops.com.au',
    subject: `New Term Tracker Created - ${termConfig.programType} - ${termConfig.termName} ${termConfig.year || ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">🏀 New Term Tracker Created</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px;">Hi David,</p>
          <p style="font-size: 16px;">A new term tracker has been created:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Program:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${termConfig.programType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Term:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${termConfig.termName} ${termConfig.year || ''}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Coach:</td>
                <td style="padding: 8px 0; color: #1f2937;">${termConfig.coachName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Session:</td>
                <td style="padding: 8px 0; color: #1f2937;">${termConfig.sessionDay}s at ${termConfig.sessionTime}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
            <p style="margin: 0 0 5px 0;"><strong>Sheet ID:</strong> ${spreadsheetId}</p>
            <p style="margin: 0;"><strong>Sheet URL:</strong> <a href="${sheetUrl}">${sheetUrl}</a></p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${sheetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              📊 Open Spreadsheet
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Best regards,<br><strong>Empowered Hoops Term Tracker System</strong>
          </p>
        </div>
      </div>
    `,
  };

  // Send email
  await transporter.sendMail(mailOptions);
  console.log('✅ Email notification sent to management');
}

// ============================================
// LIST TERM TRACKERS ENDPOINT
// ============================================
exports.listTermTrackers = async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  console.log('Listing term trackers...');

  try {
    // 1. Authenticate with Google APIs
    const auth = await getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    console.log('Authenticated with Google APIs');

    // 2. List all files in the Term Trackers folder
    const folderId = '18MaTO0Vp9X-kMjeFUDie_Vyq2BnNgruU'; // Your shared folder ID
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id, name, createdTime, modifiedTime, webViewLink, owners)',
      orderBy: 'createdTime desc',
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = response.data.files || [];
    
    console.log(`Found ${files.length} term trackers`);

    // 3. Parse file names to extract metadata
    // Expected format: "Term 1 - Attendance & Payment - EH Academy"
    const trackers = files.map(file => {
      const parts = file.name.split(' - ');
      
      // Try to parse the filename
      let termName = '';
      let programType = '';
      
      if (parts.length >= 3) {
        termName = parts[0].trim(); // "Term 1"
        programType = parts[2].trim(); // "EH Academy"
      } else {
        // Fallback if format is different
        termName = file.name;
        programType = 'Unknown';
      }

      return {
        id: file.id,
        name: file.name,
        termName: termName,
        programType: programType,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        url: file.webViewLink,
        owner: file.owners && file.owners.length > 0 ? file.owners[0].emailAddress : 'Unknown',
      };
    });

    // 4. Return the list
    res.status(200).json({
      success: true,
      trackers: trackers,
      count: trackers.length,
    });

  } catch (error) {
    console.error('Error listing term trackers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list term trackers',
      error: error.message,
    });
  }
};

// ============================================
// GET ATTENDANCE DATA ENDPOINT
// ============================================
exports.getAttendanceData = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

const { spreadsheetId, sheetName } = req.query;

  if (!spreadsheetId) {
    return res.status(400).json({
      success: false,
      message: 'Missing spreadsheetId parameter'
    });
  }

  if (!sheetName) {
  return res.status(400).json({
    success: false,
    message: 'Missing sheetName parameter'
  });
}

  console.log('Getting attendance data for:', spreadsheetId);

  try {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Read the attendance sheet
    // Structure:
    // Row 1: Headers (Name, Contact, etc.)
    // Row 3: Session dates
    // Row 4+: Athletes with attendance marks
    // Columns: A=Name, D-M=Sessions 1-10

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `'${sheetName}'!A1:M50`, // Read enough rows to cover all athletes
    });

    const rows = response.data.values || [];

    if (rows.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet structure - not enough rows'
      });
    }

    // Parse term config from rows 1-2
    // Row 1: [programType, 'Time:', sessionTime, sessionDay]
    // Row 2: [termName, 'Coach:', coachName]
    const headerRow1 = rows[0] || [];
    const headerRow2 = rows[1] || [];

    const termConfig = {
      programType: headerRow1[0] || sheetName,
      sessionTime: headerRow1[2] || '',
      sessionDay: headerRow1[3] || '',
      termName: headerRow2[0] || '',
      coachName: headerRow2[2] || 'Unknown Coach',
      programLabel: `${headerRow1[0] || sheetName} — ${headerRow2[0] || 'Term'}`,
      duration: 1.5 // Default duration, can be customized if stored in sheet
    };

    // Parse session dates from row 3 (index 2)
    const sessionRow = rows[2] || [];
    const sessions = [];

    for (let i = 3; i <= 12; i++) { // Columns D-M (indices 3-12)
      const dateValue = sessionRow[i];
      if (dateValue) {
        const sessionNumber = i - 2; // D=1, E=2, etc.
        sessions.push({
          number: sessionNumber,
          date: dateValue,
          formatted: formatSessionDate(dateValue)
        });
      }
    }

    // Parse athletes starting from row 4 (index 3)
    const athletes = [];
    const attendance = {};

    for (let i = 4; i < rows.length; i++) {
      const row = rows[i];
      const athleteName = row[0];

      // Skip empty rows
      if (!athleteName || athleteName.trim() === '') {
        continue;
      }

      const athleteId = String(i - 3); // 1-based athlete ID

      athletes.push({
        id: athleteId,
        name: athleteName.trim()
      });

      // Parse attendance for each session
      attendance[athleteId] = {};
      for (let sessionNum = 1; sessionNum <= 10; sessionNum++) {
        const colIndex = sessionNum + 2; // Session 1 = column D (index 3)
        const mark = row[colIndex];
        attendance[athleteId][sessionNum] = mark === 'Attended';
      }
    }

    console.log(`Found ${athletes.length} athletes and ${sessions.length} sessions`);
    console.log('Term config:', termConfig);

    res.status(200).json({
      success: true,
      athletes: athletes,
      sessions: sessions,
      attendance: attendance,
      termConfig: termConfig
    });

  } catch (error) {
    console.error('Error getting attendance data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance data',
      error: error.message
    });
  }
};

// ============================================
// SEND WELCOME EMAIL ENDPOINT
// ============================================
// ============================================
// SEND WELCOME EMAIL ENDPOINT
// ============================================
exports.sendWelcomeEmail = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  console.log('Sending welcome email:', req.body);

  try {
    const { email, name, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await sendWelcomeEmailHelper(email, name, role);

    if (result.success) {
      console.log('✅ Welcome email sent successfully to:', email);
      return res.status(200).json({
        success: true,
        message: 'Welcome email sent successfully',
        messageId: result.messageId
      });
    } else {
      console.error('❌ Failed to send welcome email:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send welcome email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in sendWelcomeEmail function:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ============================================
// UPDATE ATTENDANCE ENDPOINT
// ============================================
exports.updateAttendance = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const { spreadsheetId, sessionNumber, attendance, sheetName, termConfig } = req.body;

  // EMERGENCY DEBUG LOGGING
  console.error('🚨 RAW REQUEST BODY:', JSON.stringify(req.body, null, 2));
  console.error('🚨 ATTENDANCE DATA:', JSON.stringify(attendance, null, 2));
  console.error('🚨 TERM CONFIG:', JSON.stringify(termConfig, null, 2));

  if (!spreadsheetId || !sessionNumber || !attendance) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: spreadsheetId, sessionNumber, attendance'
    });
  }

  if (!sheetName) {
    return res.status(400).json({
      success: false,
      message: 'Missing sheetName parameter'
    });
  }

  console.log(`Updating attendance for session ${sessionNumber} in ${spreadsheetId}`);

  try {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Calculate column for this session
    const sessionColIndex = parseInt(sessionNumber) + 2;
    const sessionColLetter = String.fromCharCode(65 + sessionColIndex);

    // Build update data for the sheet
    const updates = [];
    
    // Get athlete data for Firestore
    const athleteData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `'${sheetName}'!A5:C50`,
    });
    
    const athleteRows = athleteData.data.values || [];
    
    // Get session date from row 3
    const sessionDateData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `'${sheetName}'!${sessionColLetter}3`,
    });
    
    const sessionDate = sessionDateData.data.values?.[0]?.[0] || new Date().toLocaleDateString();
    
    // Batch write to Firestore
    const batch = db.batch();
    let firestoreRecordCount = 0;

    console.log('Processing attendance data:', {
      athleteCount: Object.keys(attendance).length,
      termConfig: termConfig,
      sessionDate: sessionDate
    });

    for (const [athleteId, isPresent] of Object.entries(attendance)) {
      const rowNumber = parseInt(athleteId) + 4;
      const mark = isPresent ? 'Attended' : '';

      console.error(`🔍 Athlete ${athleteId}: isPresent=${isPresent}, type=${typeof isPresent}`);

      // Update sheet
      updates.push({
        range: `'${sheetName}'!${sessionColLetter}${rowNumber}`,
        values: [[mark]]
      });

      // Save to Firestore (only for present athletes)
      const athleteRowIndex = parseInt(athleteId) - 1;
      const athleteRowExists = !!athleteRows[athleteRowIndex];

      console.error(`🔍 Checking Firestore condition: isPresent=${isPresent}, athleteRowExists=${athleteRowExists}, athleteRowIndex=${athleteRowIndex}`);

      if (isPresent && athleteRows[athleteRowIndex]) {
        const athleteRow = athleteRows[parseInt(athleteId) - 1];
        const athleteName = athleteRow[0];
        const ratio = athleteRow[1] || 'N/A';
        const paymentType = athleteRow[2] || 'Private';

        const attendanceRecord = {
          date: sessionDate,
          program: termConfig?.programLabel || sheetName,
          athlete: athleteName,
          status: 'Attended',
          sessionType: 'Group',
          coach: termConfig?.coachName || 'Unknown',
          duration: termConfig?.duration || 1.5,
          ratio: ratio,
          paymentType: paymentType,
          notes: '',
          spreadsheetId: spreadsheetId,
          sessionNumber: parseInt(sessionNumber),
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        };

        console.log('Creating Firestore record:', attendanceRecord);

        const docRef = db.collection('attendance').doc();
        batch.set(docRef, attendanceRecord);
        firestoreRecordCount++;
      }
    }

    // Commit Firestore batch
    console.log(`Committing ${firestoreRecordCount} records to Firestore`);
    await batch.commit();
    console.log(`✅ Successfully saved ${firestoreRecordCount} attendance records to Firestore`);

    // Update the sheet
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log(`Updated ${updates.length} attendance marks`);

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      updated: updates.length
    });

  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance',
      error: error.message
    });
  }
};

// ============================================
// SYNC ATTENDANCE TO MASTER SHEET
// ============================================
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

exports.syncAttendanceToMaster = onDocumentCreated('attendance/{docId}', async (event) => {
  const MASTER_SHEET_ID = '1W8vilXx7JcRDTiRJR5qddWzx8NXO7rvO';
  const MASTER_SHEET_NAME = 'Attendance & Payments';
  
  console.log('Syncing attendance to master sheet...');
  
  try {
    const attendanceData = event.data.data();
    
    // Get Google Auth
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Prepare row data
    const row = [
      attendanceData.date,
      attendanceData.program,
      attendanceData.athlete,
      attendanceData.status,
      attendanceData.sessionType,
      attendanceData.coach,
      attendanceData.duration,
      attendanceData.ratio,
      attendanceData.paymentType,
      attendanceData.notes || ''
    ];
    
    // Append to master sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: MASTER_SHEET_ID,
      range: `'${MASTER_SHEET_NAME}'!A:J`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });
    
    console.log('✅ Successfully synced attendance to master sheet');
    
  } catch (error) {
    console.error('Error syncing to master sheet:', error);
    throw error;
  }
});

// ============================================
// HELPER FUNCTION
// ============================================
function formatSessionDate(dateString) {
  // Input format: "10/11/2025" or similar
  // Output format: "10 Nov 2025"
  
  if (!dateString) return '';
  
  try {
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;
    
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthName = months[parseInt(month) - 1] || month;
    
    return `${day} ${monthName} ${year}`;
  } catch (error) {
    return dateString;
  }
}
// ============================================
// UPDATE HELPER SCRIPTS ENDPOINT
// ============================================
exports.updateHelperScripts = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  console.log('Updating helper scripts...');

  try {
    const { scriptContent } = require('./helper-scripts');
    const auth = await getGoogleAuth();
    const script = google.script({ version: 'v1', auth });
    
    // Your standalone Apps Script project
    const SCRIPT_PROJECT_ID = '1PpUiZc0fnwBhhGV27Me6RDkHyBlCPPJ4Vpeq1At7ckls1aCWcBVT-mZG';
    
    // Update the script content with both code and manifest
    console.log('Updating script content...');
    await script.projects.updateContent({
      scriptId: SCRIPT_PROJECT_ID,
      requestBody: {
        files: [
          {
            name: 'Code',
            type: 'SERVER_JS',
            source: scriptContent
          },
          {
            name: 'appsscript',
            type: 'JSON',
            source: JSON.stringify({
              timeZone: 'Australia/Sydney',
              dependencies: {},
              exceptionLogging: 'STACKDRIVER',
              runtimeVersion: 'V8'
            })
          }
        ]
      }
    });
    
    console.log('✅ Helper scripts updated successfully');
    
    res.status(200).json({
      success: true,
      message: 'Helper scripts updated successfully!',
      scriptUrl: `https://script.google.com/home/projects/${SCRIPT_PROJECT_ID}/edit`
    });

  } catch (error) {
    console.error('Error updating helper scripts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update helper scripts',
      error: error.message
    });
  }
});

// ============================================
// FOR LOCAL TESTING - Update this section
// ============================================
if (require.main === module) {
  const functions = require('@google-cloud/functions-framework');
  functions.http('createTermTracker', exports.createTermTracker);
  functions.http('listTermTrackers', exports.listTermTrackers);
  functions.http('getAttendanceData', exports.getAttendanceData);
  functions.http('updateAttendance', exports.updateAttendance);
  functions.http('sendWelcomeEmail', exports.sendWelcomeEmail);
  functions.http('updateHelperScripts', exports.updateHelperScripts); // ADD THIS LINE
  
  console.log('Starting local server on http://localhost:8080');
  console.log('Endpoints:');
  console.log('  POST http://localhost:8080/createTermTracker');
  console.log('  GET  http://localhost:8080/listTermTrackers');
  console.log('  GET  http://localhost:8080/getAttendanceData');
  console.log('  POST http://localhost:8080/updateAttendance');
  console.log('  POST http://localhost:8080/sendWelcomeEmail');
  console.log('  POST http://localhost:8080/updateHelperScripts'); // ADD THIS LINE
}