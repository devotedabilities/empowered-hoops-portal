// helper-scripts.js
// This is the source of truth for Apps Script code that gets deployed to trackers

module.exports = {
  // The main Apps Script code that will be deployed
  scriptContent: `
// Configuration
const SHARED_DRIVE_ID = '0AGCzLr3F1wnvUk9PVA';
const TEMPLATE_ID = '15wTazkxoURaqHk9CTSbBxQr_SUZ38-uJSanPE1PtM0g';

/**
 * Processes all term tracker sheets in the Shared Drive
 * Creates/updates helper tabs with formatted data
 */
function processAllSheets() {
  Logger.log('Starting to process all sheets...');
  
  const query = \`'\${SHARED_DRIVE_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false\`;
  const files = DriveApp.searchFiles(query);
  
  let processed = 0;
  let errors = 0;
  
  while (files.hasNext()) {
    const file = files.next();
    
    // Skip the template itself
    if (file.getId() === TEMPLATE_ID) {
      continue;
    }
    
    try {
      Logger.log(\`Processing: \${file.getName()}\`);
      processSheet(file.getId());
      processed++;
    } catch (error) {
      Logger.log(\`Error processing \${file.getName()}: \${error}\`);
      errors++;
    }
  }
  
  Logger.log(\`Complete! Processed: \${processed}, Errors: \${errors}\`);
}

/**
 * Processes a single sheet - creates/updates helper tab
 */
function processSheet(spreadsheetId) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  
  // Find the main data sheet (first sheet that's not "Helper")
  const sheets = ss.getSheets();
  let dataSheet = null;
  
  for (let sheet of sheets) {
    const name = sheet.getName();
    if (name !== 'Helper') {
      dataSheet = sheet;
      break;
    }
  }
  
  if (!dataSheet) {
    Logger.log('No data sheet found');
    return;
  }
  
  // Get program name from Row 1, Column A
  const programLabel = dataSheet.getRange('A1').getValue() || 'Unknown Program';
  
  // Get term name from Row 2, Column A
  const termName = dataSheet.getRange('A2').getValue() || '';
  
  // Get time range from Row 2, Column C (e.g., "5:00 PM - 6:00 PM")
  const timeRange = dataSheet.getRange('C1').getValue() || '';

  // Calculate duration from time range
  let duration = "1.5"; // default
  if (timeRange && typeof timeRange === 'string' && timeRange.includes('-')) {
    try {
      const times = timeRange.split('-').map(t => t.trim());
      const start = parseTime(times[0]);
      const end = parseTime(times[1]);
      
      if (start && end) {
        let diff = end - start;
        if (diff < 0) diff += 24; // Handle times crossing midnight
        duration = diff.toString();
      }
    } catch (e) {
      Logger.log(\`Could not parse time range: \${timeRange}\`);
    }
  }

  // Get coach name from Row 2, Column B (looks like "Coach: Name")
  const coachCell = dataSheet.getRange('B2').getValue() || '';
  const coachName = coachCell.toString().replace('Coach:', '').trim() || 'Unknown Coach';
  
  // Combine program label (e.g., "EH Academy — Term 1 2026")
  const fullProgramLabel = \`\${programLabel} — \${termName}\`;
  
  // Get session dates from Row 3, columns D to M
  const dateRange = dataSheet.getRange(3, 4, 1, 10).getValues(); // D3:M3
  
  // Get athlete data starting from Row 5
  const lastRow = dataSheet.getLastRow();
  if (lastRow < 5) {
    Logger.log('No athletes yet');
    return;
  }
  
  const numAthletes = lastRow - 4;
  
  // Column A = Athletes, B = Ratio, C = Payment Status
  const athleteNames = dataSheet.getRange(5, 1, numAthletes, 1).getValues(); // A5:A[lastRow]
  const ratios = dataSheet.getRange(5, 2, numAthletes, 1).getValues(); // B5:B[lastRow]
  const paymentStatus = dataSheet.getRange(5, 3, numAthletes, 1).getValues(); // C5:C[lastRow]
  
  // Combine athlete data
  const athleteRange = [];
  for (let i = 0; i < athleteNames.length; i++) {
    athleteRange.push([
      athleteNames[i][0],
      ratios[i][0],
      paymentStatus[i][0]
    ]);
  }
  
  // Get attendance data matrix from D5:M[lastRow]
  const dataRange = dataSheet.getRange(5, 4, numAthletes, 10).getValues(); // D5:M[lastRow]
  
  // Run normalization
  const normalizedData = normalizeAttendance(
    athleteRange,
    dateRange,
    dataRange,
    fullProgramLabel,
    coachName,
    duration
  );
  
  // Get or create Helper sheet
  let helperSheet = ss.getSheetByName('Helper');
  if (!helperSheet) {
    helperSheet = ss.insertSheet('Helper');
  } else {
    helperSheet.clear();
  }
  
  // Write normalized data to Helper sheet
  if (normalizedData.length > 0) {
    helperSheet.getRange(1, 1, normalizedData.length, normalizedData[0].length)
      .setValues(normalizedData);
    
    // Format header row
    helperSheet.getRange(1, 1, 1, normalizedData[0].length)
      .setFontWeight('bold')
      .setBackground('#8b5cf6')
      .setFontColor('#ffffff');
  }
  
  Logger.log(\`Successfully processed: \${dataSheet.getName()}\`);
}

/**
 * Normalizes attendance data into a flat format for master sheet import
 */
function normalizeAttendance(athleteRange, dateRange, dataRange, programLabel, coachName, duration) {
  const DURATION = duration || "1.5"; // Use passed duration or default
  const SESSION_TYPE = "Group";
  const NOTES = "";
  
  const athletes = athleteRange;
  const dates = dateRange[0]; 
  const data = dataRange;
  
  let output = [];

  // Loop through each athlete
  for (let i = 0; i < athletes.length; i++) {
    const athleteRow = athletes[i];
    
    if (!Array.isArray(athleteRow) || !athleteRow[0] || String(athleteRow[0]).trim() === "") {
      continue; 
    }
    
    const athleteName = String(athleteRow[0]).trim();
    const ratio = athleteRow[1] || "N/A";
    const paymentType = athleteRow[2];

    // Loop through each date/session
    for (let j = 0; j < dates.length; j++) {
      const date = dates[j]; 
      let sessionStatus = data[i][j]; 

      // Data validation - only include rows with actual attendance data
      if (!sessionStatus || String(sessionStatus).trim() === '' || String(sessionStatus).trim() === '-') continue;
      if (sessionStatus === true) sessionStatus = "Attended";
      if (sessionStatus === false) sessionStatus = "Did Not Attend";

      // Create normalized row
      output.push([
        date,
        programLabel,
        athleteName,
        sessionStatus,
        SESSION_TYPE,
        coachName,
        DURATION,
        ratio,
        paymentType,
        NOTES
      ]);
    }
  }

  // Add headers
  const headers = ["Date", "Program", "Athlete", "Status", "SessionType", "Coach", "Duration", "Ratio", "PaymentType", "Notes"]; 
  return [headers].concat(output);
}

/**
 * Parse time string to hours (24-hour format)
 * e.g., "5:00 PM" -> 17, "11:30 AM" -> 11.5
 */
function parseTime(timeStr) {
  const match = timeStr.match(/(\\d+):(\\d+)\\s*(AM|PM)/i);
  if (!match) return null;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours + (minutes / 60);
}

/**
 * Manual trigger - run this to test on all sheets
 */
function testProcessing() {
  processAllSheets();
}

/**
 * Process a single specific sheet by ID - useful for testing
 */
function testSingleSheet() {
  // Replace with actual sheet ID to test
  const testSheetId = 'PASTE_SHEET_ID_HERE';
  processSheet(testSheetId);
}
`
};