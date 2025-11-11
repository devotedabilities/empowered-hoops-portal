const { google } = require('googleapis');
const path = require('path');

async function simpleTest() {
  console.log('Testing basic Drive access...\n');
  
  try {
    const credentialsPath = path.resolve(__dirname, '../credentials/term-tracker-credentials.json');
    
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/drive'],
      clientOptions: {
        subject: 'info@devotedabilities.com',  // Replace with YOUR email
      },
    });
    
    const drive = google.drive({ version: 'v3', auth: await auth.getClient() });
    
    // Try to list files
    const res = await drive.files.list({
      pageSize: 5,
      fields: 'files(id, name)',
    });
    
    console.log('✅ Successfully authenticated!');
    console.log('Found files:', res.data.files);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

simpleTest();