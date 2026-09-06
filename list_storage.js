import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

const app = initializeApp({
  credential: applicationDefault(),
  projectId: 'cortex-856a1'
});

async function listStorage() {
  try {
    const bucket = getStorage().bucket('cortex-856a1.appspot.com');
    const [files] = await bucket.getFiles({ prefix: '' });
    console.log("Storage files in cortex-856a1.appspot.com:");
    const dirs = new Set();
    files.forEach(file => {
      const parts = file.name.split('/');
      if (parts.length > 1) dirs.add(parts[0]);
    });
    console.log("Top level directories:");
    dirs.forEach(d => console.log(d));
  } catch (error) {
    console.error("Error listing storage:", error);
  }
}

listStorage();
