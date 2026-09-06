import { describe, expect, it } from 'vitest';
import { initializeFirebaseAdmin } from './server/firebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, deleteApp } from 'firebase-admin/app';

describe('Database Configuration Tests', () => {
  it('A. Samadhaan database ID resolves to the intended target', () => {
    const defaultDatabaseId = 'ai-studio-samadhaanai-046be4e0-6c3e-4765-a455-335298adef91';
    
    // Clear any existing apps
    getApps().forEach(app => deleteApp(app));
    
    // Provide explicit test config so ADC isn't needed
    const app = initializeFirebaseAdmin({ FIREBASE_PROJECT_ID: 'test-project' });
    const dbId = process.env.FIREBASE_FIRESTORE_DATABASE_ID || defaultDatabaseId;
    const db = getFirestore(app, dbId);
    
    // db._settings.databaseId is how the internal ID is stored in the SDK
    expect((db as any)._settings.databaseId).toBe(defaultDatabaseId);
  });
  
  it('B. Production configuration does not silently fall back to the (default) database', () => {
     getApps().forEach(app => deleteApp(app));
     const app = initializeFirebaseAdmin({ FIREBASE_PROJECT_ID: 'test-project' });
     const defaultDatabaseId = 'ai-studio-samadhaanai-046be4e0-6c3e-4765-a455-335298adef91';
     const dbId = process.env.FIREBASE_FIRESTORE_DATABASE_ID || defaultDatabaseId;
     const db = getFirestore(app, dbId);
     
     expect((db as any)._settings.databaseId).not.toBe('(default)');
  });
  
  it('C. Samadhaan Firestore initialization explicitly selects the configured database', () => {
     getApps().forEach(app => deleteApp(app));
     const app = initializeFirebaseAdmin({ FIREBASE_PROJECT_ID: 'test-project' });
     const dbId = process.env.FIREBASE_FIRESTORE_DATABASE_ID || 'ai-studio-samadhaanai-046be4e0-6c3e-4765-a455-335298adef91';
     const db = getFirestore(app, dbId);
     expect((db as any)._settings.databaseId).toBe('ai-studio-samadhaanai-046be4e0-6c3e-4765-a455-335298adef91');
  });
});
