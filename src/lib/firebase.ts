import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  projectId: "cortex-856a1",
  // In a real app we'd load these from (import.meta as any).env, 
  // but to prevent breaking the build without full env vars, we provide mock/placeholder values for the web SDK
  // We only strictly need projectId for the auth token if we aren't using specific other services client side
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyFakeKeyPlaceholderForBuild",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "cortex-856a1.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signIn = () => signInWithPopup(auth, googleProvider);
export const signOut = () => firebaseSignOut(auth);
