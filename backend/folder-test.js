const { google } = require('googleapis');
const path = require('path');

async function testFolderAccess() {
  console.log('Testing if we can create a file in the folder...\n');
  
  try {
    const credentialsPath = path.resolve(__dirname, '../credentials/term-tracker-credentials.json');
    
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
      clientOptions: {
        subject: 'info@devotedabilities.com',
      },
    });
    
    const drive = google.drive({ version: 'v3', auth: await auth.getClient() });
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    
    // Create a brand new spreadsheet (not a copy)
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'TEST - Delete Me'
        }
      }
    });
    
    const newSheetId = createResponse.data.spreadsheetId;
    console.log('✅ Created new sheet:', newSheetId);
    
    // Now move it to the folder
    const folderId = '1EDw3LnT066z_Y_LrdwAfNcD7B7PVwBzJ';
    
    await drive.files.update({
      fileId: newSheetId,
      addParents: folderId,
      fields: 'id, parents'
    });
    
    console.log('✅ Moved to folder!');
    console.log('URL:', `https://docs.google.com/spreadsheets/d/${newSheetId}/edit`);
    console.log('\n👉 Check your "Term Trackers" folder and delete the test file');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFolderAccess();