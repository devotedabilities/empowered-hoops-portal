
// ============================================================
// SAVE SESSION NOTES (Basketball & Behaviour) - V2 System
// ============================================================
exports.saveSessionNotes = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const {
      type,              // 'basketball' or 'behaviour'
      spreadsheetId,
      sheetName,
      sessionNumber,
      athleteId,
      athleteName,
      coachId,
      events,
      hasChallengeMoment  // Required for behaviour notes
    } = req.body;

    // Validation
    if (!type || !spreadsheetId || !sheetName || !sessionNumber || !athleteId || !events) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['type', 'spreadsheetId', 'sheetName', 'sessionNumber', 'athleteId', 'events']
      });
    }

    if (!['basketball', 'behaviour'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be "basketball" or "behaviour"' });
    }

    // Validate at least one event exists
    if (!events || events.length === 0) {
      return res.status(400).json({
        error: 'Must add at least one moment before saving'
      });
    }

    // Validate behaviour notes have at least one challenge moment
    if (type === 'behaviour' && !hasChallengeMoment) {
      return res.status(400).json({
        error: 'Behaviour notes must include at least one Challenge moment'
      });
    }

    // Column mapping for notes
    const columnMap = {
      'basketball': 'AB', // Basketball Notes column
      'behaviour': 'AC'   // Behaviour Notes column
    };

    const noteColumn = columnMap[type];

    // Initialize Google Sheets
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Get the sheet data to find athlete row
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = sheetData.data.values || [];
    let athleteRow = -1;

    // Find athlete row (assuming ID in column A, starting from row 5)
    for (let i = 4; i < rows.length; i++) {
      if (rows[i][0] === athleteId) {
        athleteRow = i + 1; // Sheets uses 1-based indexing
        break;
      }
    }

    if (athleteRow === -1) {
      return res.status(404).json({ error: `Athlete ${athleteId} not found in sheet ${sheetName}` });
    }

    // Format the note based on type
    let noteText = '';
    
    if (type === 'basketball') {
      // Basketball note format: "Dribbling: Improved - comment | Shooting: Struggled - comment"
      const skillLabels = {
        'dribbling': 'Dribbling',
        'shooting': 'Shooting',
        'passing': 'Passing',
        'spacing': 'Spacing/Positioning',
        'defence': 'Defence'
      };

      const outcomeLabels = {
        'improved': 'Improved',
        'struggled': 'Struggled',
        'stable': 'Same as last',
        'notTested': 'Not tested'
      };

      const moments = events.map(event => {
        const skill = skillLabels[event.skillId] || event.skillId;
        const outcome = outcomeLabels[event.outcomeId] || event.outcomeId;
        const comment = event.comment ? ` - ${event.comment}` : '';
        return `${skill}: ${outcome}${comment}`;
      });

      noteText = moments.join(' | ');

    } else if (type === 'behaviour') {
      // Behaviour note format: "🟢 Helping peers - was supportive | 🔴 Threw equipment - needed break"
      const momentTypeLabels = {
        'positive': '🟢',
        'challenge': '🔴',
        'standard': '⚪'
      };

      const moments = events.map(event => {
        const icon = momentTypeLabels[event.momentTypeId] || '';
        const summary = event.summary || event.momentOptionId;
        return `${icon} ${summary}`.trim();
      });

      noteText = moments.join(' | ');
    }

    // Validate 500 character limit per session
    const sessionPrefix = `S${sessionNumber}: `;
    const fullSessionNote = `${sessionPrefix}${noteText}`;
    
    if (fullSessionNote.length > 500) {
      return res.status(400).json({
        error: 'Session note exceeds 500 character limit',
        currentLength: fullSessionNote.length,
        limit: 500,
        message: 'Please shorten your comments or reduce the number of moments'
      });
    }

    // Get existing notes from the cell
    const existingNotesRange = `${sheetName}!${noteColumn}${athleteRow}`;
    const existingNotesData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: existingNotesRange,
    });

    const existingNotes = existingNotesData.data.values?.[0]?.[0] || '';

    // Append new notes with session prefix (already validated above)
    const newNoteEntry = fullSessionNote;
    
    const updatedNotes = existingNotes
      ? `${existingNotes} | ${newNoteEntry}`
      : newNoteEntry;

    // Write to Google Sheets
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: existingNotesRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[updatedNotes]],
      },
    });

    // Save to Firestore for tracking/analytics
    const firestorePath = `sessionNotes/${spreadsheetId}/sessions/${sessionNumber}/${type}/${athleteId}`;
    await db.doc(firestorePath).set({
      athleteId,
      athleteName,
      sessionNumber: parseInt(sessionNumber),
      type,
      events,
      formattedNote: noteText,
      coachId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      sheetName,
      hasChallengeMoment: type === 'behaviour' ? hasChallengeMoment : null
    });

    console.log(`✅ ${type} notes saved for athlete ${athleteId} in session ${sessionNumber}`);

    return res.status(200).json({
      success: true,
      message: `${type} notes saved successfully`,
      athleteRow,
      noteColumn,
      formattedNote: noteText,
      updatedNotes
    });

  } catch (error) {
    console.error('Error saving session notes:', error);
    return res.status(500).json({
      error: 'Failed to save session notes',
      details: error.message
    });
  }
});
