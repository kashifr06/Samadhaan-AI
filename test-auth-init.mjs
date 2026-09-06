import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const app = initializeApp({
  apiKey: 'test-api-key',
  authDomain: 'test-auth-domain',
  projectId: 'test-project-id',
  storageBucket: 'test-bucket',
  messagingSenderId: 'test-sender-id',
  appId: 'test-app-id'
});

try {
  const auth = getAuth(app);
  console.log('Success:', auth.app.options.apiKey);
} catch (e) {
  console.error('Error:', e);
}
