// test.js - Local test script

const testData = {
  termConfig: {
    programType: 'EH Academy',
    termName: 'Test Term - DELETE ME',
    coachName: 'Test Coach',
    sessionDay: 'Monday',
    sessionTime: '4:00 PM',
    startDate: '2025-11-10',
    numberOfSessions: 10
  },
  athletes: [
    {
      name: 'Test Athlete 1',
      ratio: '1:2',
      paidStatus: 'Paid',
      guardianName: 'Test Parent',
      guardianRelationship: 'Mother',
      phone: '0400 123 456',
      email: 'test@example.com'
    },
    {
      name: 'Test Athlete 2',
      ratio: '1:3',
      paidStatus: 'Pending',
      guardianName: 'Another Parent',
      guardianRelationship: 'Father',
      phone: '0400 789 012',
      email: 'test2@example.com'
    }
  ],
  createdBy: 'info@devotedabilities.com'  // FIXED: Use real email
};

async function runTest() {
  console.log('🧪 Testing term tracker creation...\n');
  
  try {
    const response = await fetch('http://localhost:8080/createTermTracker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ SUCCESS!\n');
      console.log('Sheet ID:', result.sheetId);
      console.log('Sheet URL:', result.sheetUrl);
      console.log('\n👉 Open the sheet and verify it looks correct');
      console.log('👉 Then delete the test sheet from Google Drive');
    } else {
      console.log('❌ FAILED\n');
      console.log('Errors:', result.errors);
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

runTest();