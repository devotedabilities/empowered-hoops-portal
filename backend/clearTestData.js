/**
 * Script to clear test data from Firestore
 *
 * Usage:
 *   node clearTestData.js --all              (delete all attendance records)
 *   node clearTestData.js --test             (delete only test records with "Test 123")
 *   node clearTestData.js --before 2025-11-13 (delete records before date)
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

async function deleteCollection(collectionRef, batchSize = 100) {
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // No more documents to delete
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  console.log(`Deleted ${batchSize} documents`);

  // Recurse on the next batch
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function deleteAllAttendance() {
  console.log('🗑️  Deleting ALL attendance records...');
  const collectionRef = db.collection('attendance');
  await deleteCollection(collectionRef);
  console.log('✅ All attendance records deleted');
}

async function deleteTestRecords() {
  console.log('🗑️  Deleting test records (athlete = "Test 123")...');
  const collectionRef = db.collection('attendance').where('athlete', '==', 'Test 123');

  const snapshot = await collectionRef.get();
  console.log(`Found ${snapshot.size} test records`);

  if (snapshot.empty) {
    console.log('No test records found');
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log('✅ Test records deleted');
}

async function deleteBeforeDate(dateString) {
  console.log(`🗑️  Deleting records before ${dateString}...`);

  // Convert date string to timestamp
  const targetDate = new Date(dateString);

  const collectionRef = db.collection('attendance')
    .where('timestamp', '<', admin.firestore.Timestamp.fromDate(targetDate));

  const snapshot = await collectionRef.get();
  console.log(`Found ${snapshot.size} records before ${dateString}`);

  if (snapshot.empty) {
    console.log('No records found');
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log('✅ Old records deleted');
}

async function showStats() {
  console.log('\n📊 Current Database Stats:');

  const snapshot = await db.collection('attendance').get();
  console.log(`Total attendance records: ${snapshot.size}`);

  // Group by athlete
  const athletes = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    athletes[data.athlete] = (athletes[data.athlete] || 0) + 1;
  });

  console.log('\nRecords by athlete:');
  Object.entries(athletes).forEach(([athlete, count]) => {
    console.log(`  ${athlete}: ${count} records`);
  });

  console.log('\n');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node clearTestData.js --all              (delete all attendance records)');
    console.log('  node clearTestData.js --test             (delete only test records)');
    console.log('  node clearTestData.js --before YYYY-MM-DD (delete records before date)');
    console.log('  node clearTestData.js --stats            (show current stats)');
    process.exit(1);
  }

  try {
    const command = args[0];

    switch (command) {
      case '--all':
        await showStats();
        console.log('⚠️  WARNING: This will delete ALL attendance records!');
        console.log('Press Ctrl+C within 5 seconds to cancel...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await deleteAllAttendance();
        break;

      case '--test':
        await showStats();
        await deleteTestRecords();
        break;

      case '--before':
        if (!args[1]) {
          console.error('Error: Please provide a date (YYYY-MM-DD)');
          process.exit(1);
        }
        await showStats();
        await deleteBeforeDate(args[1]);
        break;

      case '--stats':
        await showStats();
        break;

      default:
        console.error('Unknown command:', command);
        process.exit(1);
    }

    // Show updated stats
    if (command !== '--stats') {
      await showStats();
    }

    console.log('✅ Done!');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
