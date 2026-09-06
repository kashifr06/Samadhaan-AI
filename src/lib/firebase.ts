import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';

type FirebaseClientEnv = Partial<Record<
  'VITE_FIREBASE_API_KEY' |
  'VITE_FIREBASE_AUTH_DOMAIN' |
  'VITE_FIREBASE_PROJECT_ID' |
  'VITE_FIREBASE_STORAGE_BUCKET' |
  'VITE_FIREBASE_MESSAGING_SENDER_ID' |
  'VITE_FIREBASE_APP_ID' |
  'PROD' |
  'MODE',
  string | boolean | undefined
>>;

const REQUIRED_FIREBASE_CLIENT_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export function createFirebaseClientConfig(env: FirebaseClientEnv = (import.meta as any).env) {
  const missing = REQUIRED_FIREBASE_CLIENT_KEYS.filter(key => !env[key]);
  const isProduction = env.PROD === true || env.MODE === 'production';

  if (isProduction && missing.length > 0) {
    throw new Error(`Missing Firebase client configuration: ${missing.join(', ')}`);
  }

  return {
    apiKey: String(env.VITE_FIREBASE_API_KEY || ''),
    authDomain: String(env.VITE_FIREBASE_AUTH_DOMAIN || ''),
    projectId: String(env.VITE_FIREBASE_PROJECT_ID || ''),
    storageBucket: String(env.VITE_FIREBASE_STORAGE_BUCKET || ''),
    messagingSenderId: String(env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''),
    appId: String(env.VITE_FIREBASE_APP_ID || ''),
  };
}

const firebaseConfig = createFirebaseClientConfig();

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signIn = () => signInWithPopup(auth, googleProvider);
export const signOut = () => firebaseSignOut(auth);
