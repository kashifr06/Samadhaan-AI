const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
`  const missing = REQUIRED_FIREBASE_CLIENT_KEYS.filter(key => !env[key]);
  const isProduction = env.PROD === true || env.MODE === 'production';
  if (isProduction && missing.length > 0) {
    throw new Error(\`Missing Firebase client configuration: \${missing.join(', ')}\`);
  }
  return {
    apiKey: String(env.VITE_FIREBASE_API_KEY || 'demo-api-key'),
    authDomain: String(env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com'),
    projectId: String(env.VITE_FIREBASE_PROJECT_ID || 'demo-project'),
    storageBucket: String(env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com'),
    messagingSenderId: String(env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000'),
    appId: String(env.VITE_FIREBASE_APP_ID || 'demo-app-id'),
  };`,
`  const missing = REQUIRED_FIREBASE_CLIENT_KEYS.filter(key => !env[key]);
  if (missing.length > 0) {
    // If we're missing keys, let's still return the environment values as they are, but if any are missing, Firebase init might fail.
    // We shouldn't use fake fallbacks. Let Firebase SDK crash explicitly if it misses essential ones like apiKey.
    console.warn(\`Missing Firebase client configuration keys: \${missing.join(', ')}\`);
  }
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };`
);

fs.writeFileSync('src/lib/firebase.ts', code);
