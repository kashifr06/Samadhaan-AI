const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp({ projectId: "demo-project" });
const db = getFirestore(app, "ai-studio-samadhaanai-046be4e0-6c3e-4765-a455-335298adef91");
console.log(db.databaseId || db._settings.databaseId);
