const { google } = require('googleapis');
const path = require('path');

async function testCopy() {
  console.log('Testing template copy...\n');
  
  try {
    const credentialsPath = path.resolve(__dirname, '../credentials/term-tracker-credentials.json');
    
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/drive'],
      clientOptions: {
        subject: 'info@devotedabilities.com',
      },
    });
    
    const drive = google.drive({ version: 'v3', auth: await auth.getClient() });
    
    // Try to copy the template
    const templateId = '15wTazkxoURaqHk9CTSbBxQr_SUZ38-uJSanPE1PtM0g';
    
    console.log('Attempting to copy template:', templateId);
    
    const copy = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: 'TEST COPY - Delete Me',
      },
      supportsAllDrives: true,  // Important!
    });
    
    console.log('✅ SUCCESS! Created copy:', copy.data.id);
    console.log('URL:', `https://docs.google.com/spreadsheets/d/${copy.data.id}/edit`);
    console.log('\n👉 Check your Drive and delete the test copy');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testCopy();