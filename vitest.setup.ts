import { vi } from 'vitest';

// Mock Firebase app to prevent validation of missing API keys during tests
vi.mock('firebase/app', () => {
  return {
    initializeApp: vi.fn(() => ({
      name: '[DEFAULT]',
      options: {},
      automaticDataCollectionEnabled: false
    })),
    getApp: vi.fn(),
    getApps: vi.fn(() => []),
  };
});

// Mock Firebase auth to prevent initialization errors and provide stub implementations
vi.mock('firebase/auth', () => {
  return {
    getAuth: vi.fn(() => ({
      currentUser: null,
      updateCurrentUser: vi.fn(),
      useDeviceLanguage: vi.fn(),
    })),
    GoogleAuthProvider: class GoogleAuthProvider {},
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(() => () => {}),
  };
});
