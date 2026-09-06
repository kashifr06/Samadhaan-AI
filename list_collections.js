import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({
  credential: applicationDefault(),
  projectId: 'cortex-856a1'
});

const db = getFirestore();

async function listCollections() {
  try {
    const collections = await db.listCollections();
    console.log("Collections in cortex-856a1:");
    collections.forEach(collection => {
      console.log(collection.id);
    });
  } catch (error) {
    console.error("Error listing collections:", error);
  }
}

listCollections();
