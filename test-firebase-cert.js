import { initializeApp, cert } from 'firebase-admin/app';
try {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) throw new Error("no key");
  privateKey = privateKey.replace(/\\n/g, '\n');
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log("Success cert");
} catch (e) {
  console.error("Failed cert:", e);
}
