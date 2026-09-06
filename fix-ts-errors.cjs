const fs = require('fs');

let serverTs = fs.readFileSync('server.ts', 'utf8');
serverTs = serverTs.replace(
`  const PORT = process.env.PORT || 3000;`,
`  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;`
);
fs.writeFileSync('server.ts', serverTs);

let firebaseTs = fs.readFileSync('src/lib/firebase.ts', 'utf8');
firebaseTs = firebaseTs.replace(
`    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,`,
`    apiKey: String(env.VITE_FIREBASE_API_KEY || ''),
    authDomain: String(env.VITE_FIREBASE_AUTH_DOMAIN || ''),
    projectId: String(env.VITE_FIREBASE_PROJECT_ID || ''),
    storageBucket: String(env.VITE_FIREBASE_STORAGE_BUCKET || ''),
    messagingSenderId: String(env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''),
    appId: String(env.VITE_FIREBASE_APP_ID || ''),`
);
fs.writeFileSync('src/lib/firebase.ts', firebaseTs);
