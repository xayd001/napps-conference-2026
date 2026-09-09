import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ROLES } from '../config/roles';

const AuthContext = createContext(null);

// Developer email lock for exclusive Super Admin access
const SUPER_ADMIN_EMAIL = "zaydibnmukhtar01@gmail.com";

// Custom hook guard with fallback values to prevent destructuring errors
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return { 
      currentUser: null, 
      userRole: null, 
      loading: true, 
      login: async () => {}, 
      logout: async () => {} 
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in function
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign out function
  const logout = () => {
    setUserRole(null);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Enforce Developer email as the sole Super Admin
        if (user.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
          setUserRole(ROLES.SUPER_ADMIN);
        } else {
          // Fetch assigned role from Firestore 'users' collection
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            setUserRole(userSnap.data().role || ROLES.GUEST);
          } else {
            // Default initial role setup for new committee/guest accounts
            const defaultRole = ROLES.GUEST;
            await setDoc(userDocRef, {
              email: user.email,
              role: defaultRole,
              createdAt: new Date().toISOString()
            });
            setUserRole(defaultRole);
          }
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};