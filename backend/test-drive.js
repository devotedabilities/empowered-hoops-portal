const { google } = require('googleapis');
const path = require('path');

async function testDrive() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'credentials', 'term-tracker-credentials.json'),
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
  
  const client = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: client });

  console.log('Testing Drive access...\n');

  console.log('=== ALL FILES (first 20) ===');
  const allFiles = await drive.files.list({
    pageSize: 20,
    fields: 'files(id, name, mimeType, parents)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  console.log(`Found ${allFiles.data.files.length} files total`);
  allFiles.data.files.forEach(f => {
    console.log(`- ${f.name} (${f.mimeType})`);
  });

  console.log('\n=== SPECIFIC FOLDER ===');
  const folderId = '1X52vMVEYQxTS10qufluGmF2NGgsW_R-c';
  try {
    const folder = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType',
      supportsAllDrives: true,
    });
    console.log('✅ Can access folder:', folder.data.name);
    
    console.log('\n=== FILES IN FOLDER ===');
    const folderFiles = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    console.log(`Found ${folderFiles.data.files.length} files in folder`);
    folderFiles.data.files.forEach(f => {
      console.log(`- ${f.name} (${f.mimeType})`);
    });
    
  } catch (error) {
    console.log('❌ Cannot access folder:', error.message);
  }
}

testDrive().catch(console.error);
