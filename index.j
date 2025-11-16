
// ============================================================
// GET SESSION NOTES (Basketball & Behaviour) - V2 System
// ============================================================
exports.getSessionNotes = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { spreadsheetId, sheetName, athleteId, sessionNumber } = req.query;

    // Validation
    if (!spreadsheetId || !sheetName || !athleteId) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['spreadsheetId', 'sheetName', 'athleteId']
      });
    }

    // Initialize Google Sheets
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Get the sheet data to find athlete row
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:AC`, // Get columns A through AC (includes basketball and behaviour notes)
    });

    const rows = sheetData.data.values || [];
    let athleteRow = -1;

    // Find athlete row (assuming ID in column A, starting from row 5)
    for (let i = 4; i < rows.length; i++) {
      if (rows[i][0] === athleteId) {
        athleteRow = i;
        break;
      }
    }

    if (athleteRow === -1) {
      return res.status(404).json({ 
        error: `Athlete ${athleteId} not found in sheet ${sheetName}`,
        basketballNotes: '',
        behaviourNotes: ''
      });
    }

    // Column AB is index 27 (0-based), AC is index 28
    const athleteData = rows[athleteRow];
    const basketballNotes = athleteData[27] || ''; // Column AB
    const behaviourNotes = athleteData[28] || '';  // Column AC

    // Parse notes by session if sessionNumber is provided
    let filteredBasketballNotes = basketballNotes;
    let filteredBehaviourNotes = behaviourNotes;

    if (sessionNumber) {
      const sessionPrefix = `S${sessionNumber}:`;
      
      // Filter basketball notes for specific session
      if (basketballNotes) {
        const bbParts = basketballNotes.split(' | ');
        const bbSessionNotes = bbParts.filter(part => part.startsWith(sessionPrefix));
        filteredBasketballNotes = bbSessionNotes.join(' | ');
      }

      // Filter behaviour notes for specific session
      if (behaviourNotes) {
        const behavParts = behaviourNotes.split(' | ');
        const behavSessionNotes = behavParts.filter(part => part.startsWith(sessionPrefix));
        filteredBehaviourNotes = behavSessionNotes.join(' | ');
      }
    }

    // Also get Firestore data for detailed event information if needed
    let firestoreData = null;
    if (sessionNumber) {
      try {
        const basketballDoc = await db
          .doc(`sessionNotes/${spreadsheetId}/sessions/${sessionNumber}/basketball/${athleteId}`)
          .get();
        
        const behaviourDoc = await db
          .doc(`sessionNotes/${spreadsheetId}/sessions/${sessionNumber}/behaviour/${athleteId}`)
          .get();

        firestoreData = {
          basketball: basketballDoc.exists ? basketballDoc.data() : null,
          behaviour: behaviourDoc.exists ? behaviourDoc.data() : null
        };
      } catch (firestoreError) {
        console.warn('Firestore fetch failed (non-critical):', firestoreError.message);
      }
    }

    return res.status(200).json({
      success: true,
      athleteId,
      sheetName,
      sessionNumber: sessionNumber || 'all',
      notes: {
        basketball: filteredBasketballNotes,
        behaviour: filteredBehaviourNotes
      },
      raw: {
        basketball: basketballNotes,
        behaviour: behaviourNotes
      },
      firestoreData
    });

  } catch (error) {
    console.error('Error fetching session notes:', error);
    return res.status(500).json({
      error: 'Failed to fetch session notes',
      details: error.message
    });
  }
});
