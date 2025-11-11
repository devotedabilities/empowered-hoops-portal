import { addAuthorizedUser } from './adminUtils';

export const seedInitialUsers = async () => {
  const initialUsers = [
    { email: 'info@devotedabilities.com', name: 'Info Account', role: 'admin' },
    { email: 'david@devotedabilities.com', name: 'David', role: 'admin' },
  ];

  console.log('Seeding initial users...');
  
  for (const user of initialUsers) {
    const result = await addAuthorizedUser(user.email, user.role, user.name);
    if (result.success) {
      console.log(`✅ Added: ${user.email}`);
    } else {
      console.error(`❌ Failed to add ${user.email}:`, result.error);
    }
  }
  
  console.log('Seeding complete!');
};