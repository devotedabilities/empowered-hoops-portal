import { collection, doc, setDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const AUTHORIZED_USERS_COLLECTION = 'authorizedUsers';

// Add a user to authorized list
export const addAuthorizedUser = async (email, role = 'coach', name = '') => {
  try {
    const userRef = doc(db, AUTHORIZED_USERS_COLLECTION, email);
    await setDoc(userRef, {
      email,
      role,
      name,
      addedAt: new Date().toISOString(),
      active: true
    });
    
    // Send welcome email via Cloud Function
    try {
      const response = await fetch(
  'https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/sendWelcomeEmail',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, role })
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Welcome email sent to:', email);
      } else {
        console.warn('⚠️ Welcome email failed:', result.error);
      }
    } catch (emailError) {
      console.warn('⚠️ Email service error:', emailError.message);
      // Don't fail user creation if email fails
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding user:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is authorized
export const isUserAuthorized = async (email) => {
  try {
    const userRef = doc(db, AUTHORIZED_USERS_COLLECTION, email);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.active === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking authorization:', error);
    return false;
  }
};

// Get all authorized users
export const getAllAuthorizedUsers = async () => {
  try {
    const usersRef = collection(db, AUTHORIZED_USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

// Remove a user
export const removeAuthorizedUser = async (email) => {
  try {
    const userRef = doc(db, AUTHORIZED_USERS_COLLECTION, email);
    await deleteDoc(userRef);
    return { success: true };
  } catch (error) {
    console.error('Error removing user:', error);
    return { success: false, error: error.message };
  }
};

// Toggle user active status
export const toggleUserStatus = async (email, active) => {
  try {
    const userRef = doc(db, AUTHORIZED_USERS_COLLECTION, email);
    await setDoc(userRef, { active }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error toggling user status:', error);
    return { success: false, error: error.message };
  }
};