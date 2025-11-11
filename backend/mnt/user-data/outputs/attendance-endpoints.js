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

  const { spreadsheetId } = req.query;

  if (!spreadsheetId) {
    return res.status(400).json({
      success: false,
      message: 'Missing spreadsheetId parameter'
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
      range: 'Attendance!A1:M50', // Read enough rows to cover all athletes
    });

    const rows = response.data.values || [];

    if (rows.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet structure - not enough rows'
      });
    }

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

    for (let i = 3; i < rows.length; i++) {
      const row = rows[i];
      const athleteName = row[0];
      
      // Skip empty rows
      if (!athleteName || athleteName.trim() === '') {
        continue;
      }

      const athleteId = String(i - 2); // 1-based athlete ID
      
      athletes.push({
        id: athleteId,
        name: athleteName.trim()
      });

      // Parse attendance for each session
      attendance[athleteId] = {};
      for (let sessionNum = 1; sessionNum <= 10; sessionNum++) {
        const colIndex = sessionNum + 2; // Session 1 = column D (index 3)
        const mark = row[colIndex];
        attendance[athleteId][sessionNum] = mark === '✓' || mark === 'P' || mark === '✔';
      }
    }

    console.log(`Found ${athletes.length} athletes and ${sessions.length} sessions`);

    res.status(200).json({
      success: true,
      athletes: athletes,
      sessions: sessions,
      attendance: attendance
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

  const { spreadsheetId, sessionNumber, attendance } = req.body;

  if (!spreadsheetId || !sessionNumber || !attendance) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: spreadsheetId, sessionNumber, attendance'
    });
  }

  console.log(`Updating attendance for session ${sessionNumber} in ${spreadsheetId}`);

  try {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Calculate column for this session
    // Session 1 = Column D (index 3)
    // Session 2 = Column E (index 4), etc.
    const sessionColIndex = parseInt(sessionNumber) + 2;
    const sessionColLetter = String.fromCharCode(65 + sessionColIndex); // D, E, F, etc.

    // Build update data
    const updates = [];
    
    // attendance is an object like: { "1": true, "2": false, "3": true }
    // where keys are athlete IDs (1-based row numbers - 2)
    for (const [athleteId, isPresent] of Object.entries(attendance)) {
      const rowNumber = parseInt(athleteId) + 3; // Row 4, 5, 6, etc.
      const mark = isPresent ? '✓' : '';
      
      updates.push({
        range: `Attendance!${sessionColLetter}${rowNumber}`,
        values: [[mark]]
      });
    }

    // Batch update all cells
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