const fs = require('fs');

// 1. Fix Firebase Client Config (No dummy values!)
let clientConfig = fs.readFileSync('src/lib/firebase.ts', 'utf8');
clientConfig = clientConfig.replace(/String\(env\.VITE_FIREBASE_API_KEY \|\| 'demo-api-key'\)/g, "env.VITE_FIREBASE_API_KEY");
clientConfig = clientConfig.replace(/String\(env\.VITE_FIREBASE_AUTH_DOMAIN \|\| 'demo.firebaseapp.com'\)/g, "env.VITE_FIREBASE_AUTH_DOMAIN");
clientConfig = clientConfig.replace(/String\(env\.VITE_FIREBASE_PROJECT_ID \|\| 'demo-project'\)/g, "env.VITE_FIREBASE_PROJECT_ID");
clientConfig = clientConfig.replace(/String\(env\.VITE_FIREBASE_STORAGE_BUCKET \|\| 'demo.appspot.com'\)/g, "env.VITE_FIREBASE_STORAGE_BUCKET");
clientConfig = clientConfig.replace(/String\(env\.VITE_FIREBASE_MESSAGING_SENDER_ID \|\| '000000000000'\)/g, "env.VITE_FIREBASE_MESSAGING_SENDER_ID");
clientConfig = clientConfig.replace(/String\(env\.VITE_FIREBASE_APP_ID \|\| 'demo-app-id'\)/g, "env.VITE_FIREBASE_APP_ID");
fs.writeFileSync('src/lib/firebase.ts', clientConfig);

// 2. Fix the test assertion for test E
let testCode = fs.readFileSync('src/DeploymentTests.test.ts', 'utf8');
testCode = testCode.replace(
`      FIREBASE_PRIVATE_KEY: 'test_key'`,
`      FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...\\n-----END PRIVATE KEY-----'`
);
fs.writeFileSync('src/DeploymentTests.test.ts', testCode);

