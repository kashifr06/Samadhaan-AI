import { initializeApp, applicationDefault } from 'firebase-admin/app';
console.log(process.env.FIREBASE_PROJECT_ID);
try {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log("Success");
} catch (e) {
  console.error("Failed:", e);
}
