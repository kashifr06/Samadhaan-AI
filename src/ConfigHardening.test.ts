import { describe, expect, it } from 'vitest';
import { createFirebaseClientConfig } from './lib/firebase';
import { getFirebaseAdminCredentialSource, hasExplicitFirebaseAdminCredentials, normalizeFirebasePrivateKey } from './server/firebaseAdmin';
import { isDemoModeEnabled, parseDemoRoleRequest } from './server/demoMode';

describe('Firebase client configuration', () => {
  it('uses VITE Firebase web values without hardcoded project fallback', () => {
    const config = createFirebaseClientConfig({
      VITE_FIREBASE_API_KEY: 'web-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'samadhaan.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'samadhaan-prod',
      VITE_FIREBASE_STORAGE_BUCKET: 'samadhaan.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
      VITE_FIREBASE_APP_ID: 'app-id',
      PROD: true,
    });

    expect(config).toEqual({
      apiKey: 'web-api-key',
      authDomain: 'samadhaan.firebaseapp.com',
      projectId: 'samadhaan-prod',
      storageBucket: 'samadhaan.appspot.com',
      messagingSenderId: '123456789',
      appId: 'app-id',
    });
  });

  it('fails clearly when production Firebase web config is incomplete', () => {
    expect(() => createFirebaseClientConfig({ PROD: true })).toThrow('Missing Firebase client configuration');
  });
});

describe('Firebase Admin configuration', () => {
  it('supports explicit service-account environment credentials', () => {
    const env = {
      FIREBASE_PROJECT_ID: 'samadhaan-prod',
      FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk@example.iam.gserviceaccount.com',
      FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nsecret\\n-----END PRIVATE KEY-----\\n',
    };

    expect(hasExplicitFirebaseAdminCredentials(env)).toBe(true);
    expect(getFirebaseAdminCredentialSource(env)).toBe('service-account');
    expect(normalizeFirebasePrivateKey(env.FIREBASE_PRIVATE_KEY)).toContain('\nsecret\n');
  });

  it('preserves Application Default Credentials support when explicit credentials are omitted', () => {
    expect(getFirebaseAdminCredentialSource({ FIREBASE_PROJECT_ID: 'samadhaan-prod' })).toBe('application-default');
  });
});

describe('Demo Mode hardening', () => {
  it('rejects the demo role endpoint path when Demo Mode is disabled', () => {
    expect(isDemoModeEnabled({ VITE_DEMO_MODE: 'false', DEMO_MODE: 'false' })).toBe(false);
  });

  it('accepts only canonical demo roles when Demo Mode is enabled', () => {
    expect(parseDemoRoleRequest({ role: 'GOVERNMENT', entityId: 'gov-1' })).toEqual({ role: 'GOVERNMENT', entityId: 'gov-1' });
    expect(parseDemoRoleRequest({ role: 'SUPER_ADMIN' })).toBeNull();
  });
});
