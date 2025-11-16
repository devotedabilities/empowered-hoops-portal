import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'authorizedUsers', user.email));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);
            
            // Format and store coach display name
            if (userData.name) {
              const nameParts = userData.name.trim().split(' ');
              const firstName = nameParts[0];
              const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) : '';
              const displayName = lastInitial ? `${firstName} ${lastInitial}` : firstName;
              localStorage.setItem('coachDisplayName', displayName);
            }
            
            // Save coach email for backward compatibility
            localStorage.setItem('coachEmail', user.email);
            
            // Add role to user object
            setCurrentUser({ ...user, role: userData.role });
          } else {
            setCurrentUser(user);
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setCurrentUser(user);
          setUserRole(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        // Clear localStorage on logout
        localStorage.removeItem('coachEmail');
        localStorage.removeItem('coachDisplayName');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = () => {
    return userRole === 'admin';
  };

  const value = {
    currentUser,
    userRole,
    isAdmin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}