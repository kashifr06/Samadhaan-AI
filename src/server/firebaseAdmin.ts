import { applicationDefault, cert, initializeApp, getApps, AppOptions } from 'firebase-admin/app';

type FirebaseAdminEnv = Partial<Record<'FIREBASE_PROJECT_ID' | 'FIREBASE_CLIENT_EMAIL' | 'FIREBASE_PRIVATE_KEY', string | undefined>>;

export function hasExplicitFirebaseAdminCredentials(env: FirebaseAdminEnv): boolean {
  return Boolean(env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY);
}

export function normalizeFirebasePrivateKey(privateKey: string): string {
  let normalized = privateKey.replace(/\\n/g, '\n');
  if (!normalized.includes('-----BEGIN PRIVATE KEY-----')) {
    normalized = `-----BEGIN PRIVATE KEY-----\n${normalized.trim()}\n-----END PRIVATE KEY-----\n`;
  }
  return normalized;
}

export function getFirebaseAdminCredentialSource(env: FirebaseAdminEnv = process.env): 'service-account' | 'application-default' {
  return hasExplicitFirebaseAdminCredentials(env) ? 'service-account' : 'application-default';
}

export function buildFirebaseAdminOptions(env: FirebaseAdminEnv = process.env): AppOptions {
  if (hasExplicitFirebaseAdminCredentials(env)) {
    return {
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizeFirebasePrivateKey(env.FIREBASE_PRIVATE_KEY!),
      }),
      projectId: env.FIREBASE_PROJECT_ID,
    };
  }

  if (env.FIREBASE_PROJECT_ID) {
    return {
      credential: applicationDefault(),
      projectId: env.FIREBASE_PROJECT_ID,
    };
  }

  return {
    credential: applicationDefault(),
  };
}

export function initializeFirebaseAdmin(env: FirebaseAdminEnv = process.env) {
  if (getApps().length > 0) return getApps()[0];

  try {
    return initializeApp(buildFirebaseAdminOptions(env));
  } catch (error) {
    throw new Error('Firebase Admin configuration error: provide FIREBASE_PROJECT_ID with FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY, or configure Google Application Default Credentials.');
  }
}
