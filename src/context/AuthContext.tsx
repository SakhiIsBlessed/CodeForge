import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, EditorPreferences } from '../types';

const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'root',
  'system',
  'support',
  'api',
  'dashboard',
  'settings',
  'editor',
  'shared',
  'auth',
  'login',
  'signup',
  'terms',
  'privacy',
  'codeforge',
  'official',
  'help',
]);

const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  theme: 'vs-dark',
  fontSize: 14,
  fontFamily: 'JetBrains Mono',
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  autoSave: true,
  autoSaveDelay: 1500,
};

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  isOnline: boolean;
  signInWithEmail: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  signUpWithEmail: (fullName: string, username: string, email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendResetEmail: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
  reloadCurrentUser: () => Promise<User | null>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserPassword: (currentPass: string, newPass: string) => Promise<void>;
  deleteUserAccount: (passwordOrConfirm: string) => Promise<void>;
  isUsernameAvailable: (username: string) => Promise<{ available: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Monitor online / offline network state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check username uniqueness
  const isUsernameAvailable = async (username: string): Promise<{ available: boolean; message?: string }> => {
    const clean = username.trim().toLowerCase();
    if (clean.length < 3 || clean.length > 30) {
      return { available: false, message: 'Username must be 3 to 30 characters.' };
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(clean)) {
      return { available: false, message: 'Only letters, numbers, and underscores are allowed.' };
    }
    if (RESERVED_USERNAMES.has(clean)) {
      return { available: false, message: 'This username is reserved.' };
    }

    try {
      const claimRef = doc(db, 'usernames', clean);
      const snapshot = await getDoc(claimRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (currentUser && data.userId === currentUser.uid) {
          return { available: true };
        }
        return { available: false, message: 'Username is already taken.' };
      }
      return { available: true };
    } catch {
      // In case rules or offline, fallback safely
      return { available: true };
    }
  };

  // Helper to fetch or bootstrap profile
  const fetchProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      // Check admin status
      const adminEmail = 'tapresakhii@gmail.com';
      let adminState = user.email?.toLowerCase() === adminEmail.toLowerCase();
      if (!adminState) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            adminState = true;
          }
        } catch {
          // ignore admin check failure
        }
      }
      setIsAdmin(adminState);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setProfile(data);
        // Sync emailVerified if changed
        if (data.emailVerified !== user.emailVerified) {
          await updateDoc(userRef, {
            emailVerified: user.emailVerified,
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
        }
      } else {
        // Create initial profile if missing (e.g. Google Sign-In)
        const baseUsername = (user.email?.split('@')[0] || 'dev')
          .replace(/[^a-zA-Z0-9_]/g, '_')
          .slice(0, 20);
        let finalUsername = baseUsername;
        let suffix = 1;
        while (suffix < 50) {
          const check = await isUsernameAvailable(finalUsername);
          if (check.available) break;
          finalUsername = `${baseUsername}${suffix}`;
          suffix++;
        }

        const now = new Date().toISOString();
        const newProfile: UserProfile = {
          uid: user.uid,
          fullName: user.displayName || user.email?.split('@')[0] || 'Developer',
          username: finalUsername,
          email: user.email || '',
          photoURL: user.photoURL || '',
          bio: 'Passionate software engineer building on CodeForge.',
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
          emailVerified: user.emailVerified,
          theme: 'dark',
          editorPreferences: DEFAULT_EDITOR_PREFERENCES,
          defaultLanguage: 'javascript',
          isPublic: true,
        };

        try {
          await setDoc(userRef, newProfile);
          // Claim username
          await setDoc(doc(db, 'usernames', finalUsername), {
            username: finalUsername,
            userId: user.uid,
            createdAt: now,
          });
          setProfile(newProfile);
        } catch (err) {
          console.error('Failed to create user profile document:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string, rememberMe = true) => {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    if (credential.user) {
      await fetchProfile(credential.user);
    }
  };

  const signUpWithEmail = async (fullName: string, username: string, email: string, pass: string) => {
    const cleanUser = username.trim().toLowerCase();
    const availability = await isUsernameAvailable(cleanUser);
    if (!availability.available) {
      throw new Error(availability.message || 'Username is not available');
    }

    const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = credential.user;

    // Send verification email right away
    try {
      await sendEmailVerification(user);
    } catch (e) {
      console.warn('Could not send initial verification email:', e);
    }

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      uid: user.uid,
      fullName: fullName.trim(),
      username: cleanUser,
      email: user.email || email.trim(),
      photoURL: '',
      bio: '',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      emailVerified: user.emailVerified,
      theme: 'dark',
      editorPreferences: DEFAULT_EDITOR_PREFERENCES,
      defaultLanguage: 'javascript',
      isPublic: true,
    };

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      await setDoc(doc(db, 'usernames', cleanUser), {
        username: cleanUser,
        userId: user.uid,
        createdAt: now,
      });
      setProfile(newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      await fetchProfile(result.user);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const sendResetEmail = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const sendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const reloadCurrentUser = async (): Promise<User | null> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const updated = auth.currentUser;
      setCurrentUser(updated);
      if (updated && profile) {
        if (updated.emailVerified !== profile.emailVerified) {
          const userRef = doc(db, 'users', updated.uid);
          await updateDoc(userRef, {
            emailVerified: updated.emailVerified,
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
          setProfile({ ...profile, emailVerified: updated.emailVerified });
        }
      }
      return updated;
    }
    return null;
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!currentUser || !profile) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const newUpdates = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If username is changing, handle claim migration
    if (updates.username && updates.username.toLowerCase() !== profile.username.toLowerCase()) {
      const cleanNew = updates.username.trim().toLowerCase();
      const check = await isUsernameAvailable(cleanNew);
      if (!check.available) {
        throw new Error(check.message || 'Username unavailable');
      }
      await setDoc(doc(db, 'usernames', cleanNew), {
        username: cleanNew,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
      });
      // Delete old username claim
      await deleteDoc(doc(db, 'usernames', profile.username.toLowerCase())).catch(() => {});
    }

    try {
      await updateDoc(userRef, newUpdates);
      setProfile({ ...profile, ...newUpdates });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const updateUserPassword = async (currentPass: string, newPass: string) => {
    if (!currentUser || !currentUser.email) {
      throw new Error('No authenticated user session found.');
    }
    const credential = EmailAuthProvider.credential(currentUser.email, currentPass);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPass);
  };

  const deleteUserAccount = async (passwordOrConfirm: string) => {
    if (!currentUser) throw new Error('No user is currently signed in.');

    // Reauthenticate if password provider is linked
    const hasPassword = currentUser.providerData.some((p) => p.providerId === 'password');
    if (hasPassword && currentUser.email) {
      const credential = EmailAuthProvider.credential(currentUser.email, passwordOrConfirm);
      await reauthenticateWithCredential(currentUser, credential);
    }

    const uid = currentUser.uid;
    const currentUsername = profile?.username;

    // Delete Firestore profile and username claim
    if (currentUsername) {
      await deleteDoc(doc(db, 'usernames', currentUsername.toLowerCase())).catch(() => {});
    }
    await deleteDoc(doc(db, 'users', uid)).catch(() => {});

    // Finally delete Firebase Auth User
    await deleteUser(currentUser);
    setCurrentUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        isAdmin,
        loading,
        isOnline,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        sendResetEmail,
        sendVerification,
        reloadCurrentUser,
        updateProfileData,
        updateUserPassword,
        deleteUserAccount,
        isUsernameAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
