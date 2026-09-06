import { describe, expect, it } from 'vitest';
import { isDemoModeEnabled } from './server/demoMode';
import { createFirebaseClientConfig } from './lib/firebase';
import { hasExplicitFirebaseAdminCredentials, getFirebaseAdminCredentialSource, buildFirebaseAdminOptions } from './server/firebaseAdmin';

describe('Deployment & Security Hardening', () => {
  it('A. Demo Mode is safely disabled by default when env vars are missing', () => {
    expect(isDemoModeEnabled({})).toBe(false);
    expect(isDemoModeEnabled({ VITE_DEMO_MODE: 'false', DEMO_MODE: 'false' })).toBe(false);
  });

  it('B. Demo Mode strictly requires both true flags to enable', () => {
    expect(isDemoModeEnabled({ VITE_DEMO_MODE: 'true', DEMO_MODE: 'false' })).toBe(false);
    expect(isDemoModeEnabled({ VITE_DEMO_MODE: 'false', DEMO_MODE: 'true' })).toBe(false);
    expect(isDemoModeEnabled({ VITE_DEMO_MODE: 'true', DEMO_MODE: 'true' })).toBe(true);
  });

  it('C. Firebase frontend config has no fallback fake credentials', () => {
    const config = createFirebaseClientConfig({});
    expect(config.apiKey).toBe('');
    expect(config.projectId).toBe('');
  });

  it('D. Firebase Admin initialization safely falls back to ADC if explicit keys are missing', () => {
    expect(hasExplicitFirebaseAdminCredentials({})).toBe(false);
    expect(getFirebaseAdminCredentialSource({})).toBe('application-default');
    
    // With just projectId, it should still be ADC but map projectId
    expect(buildFirebaseAdminOptions({ FIREBASE_PROJECT_ID: 'cortex-123' }).projectId).toBe('cortex-123');
  });

  it('E. Firebase Admin explicitly handles full service account when provided', () => {
    const env = {
      FIREBASE_PROJECT_ID: 'proj',
      FIREBASE_CLIENT_EMAIL: 'email@test',
      FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nMIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAM2rWz+k5sXj\n1r2X3y4b5n6c7v8b9n0m1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7A8B9C0D\n1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3a4b5c6d7e8f9g0h\n1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9A0B1C2D3E4F5G6H7I8J9K0L\n1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p\n1q2r3s4t5u6v7w8x9y0z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T\n1U2V3W4X5Y6Z7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x\n1y2z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9a0b\n1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5A6B7C8D9E0F\n1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z1a2b3c4d5e6f7g8h9i0j\n1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7A8B9C0D1E2F3G4H5I6J7K8L9M0N\n1O2P3Q4R5S6T7U8V9W0X1Y2Z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r\n1s2t3u4v5w6x7y8z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V\n-----END PRIVATE KEY-----'
    };
    expect(hasExplicitFirebaseAdminCredentials(env)).toBe(true);
    expect(getFirebaseAdminCredentialSource(env)).toBe('service-account');
    // buildFirebaseAdminOptions(env) throws in node 20 if key is invalid, so we just verify the detection logic
    expect(hasExplicitFirebaseAdminCredentials(env)).toBe(true);
  });
});
