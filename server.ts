import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { handleAction } from './src/server/actions';

// Initialize Firebase Admin
initializeApp({
  credential: applicationDefault(),
  projectId: 'cortex-856a1'
});
const db = getFirestore();
const auth = getAuth();

// Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await auth.verifyIdToken(token);
      (req as any).user = decodedToken;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  app.get('/api/samadhaan/state', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const userRecord = await db.collection('samadhaan_users').doc(user.uid).get();
      const userRole = userRecord.exists ? userRecord.data().role : 'CITIZEN';
      const [problems, projects, teams, industryPartners, universities] = await Promise.all([
        db.collection('samadhaan_problems').get(),
        db.collection('samadhaan_projects').get(),
        db.collection('samadhaan_teams').get(),
        db.collection('samadhaan_industryPartners').get(),
        db.collection('samadhaan_universities').get()
      ]);
      
      res.json({
        problems: problems.docs.map(d => ({ id: d.id, ...d.data() })),
        projects: projects.docs.map(d => ({ id: d.id, ...d.data() })),
        teams: teams.docs.map(d => ({ id: d.id, ...d.data() })),
        industryPartners: industryPartners.docs.map(d => ({ id: d.id, ...d.data() })),
        universities: universities.docs.map(d => ({ id: d.id, ...d.data() })),
        userRole
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal error' });
    }
  });

  
  // Explicit Demo Mode UX: Set role
  app.post('/api/samadhaan/demo/set-role', authenticate, async (req, res) => {
    if (process.env.VITE_DEMO_MODE !== 'true' && process.env.DEMO_MODE !== 'true') {
        return res.status(403).json({ error: 'Demo mode disabled' });
    }
    try {
      const user = (req as any).user;
      const { role, entityId } = req.body;
      await db.collection('samadhaan_users').doc(user.uid).set({
        role,
        entityId: entityId || null
      }, { merge: true });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Internal error' });
    }
  });

  app.post('/api/samadhaan/action', authenticate, async (req, res) => {
    const { action, payload } = req.body;
    const user = (req as any).user;
    
    try {
      const result = await handleAction(db, ai, action, payload, user);
      res.json(result);
    } catch (error: any) {
      console.error('Action error:', error);
      res.status(400).json({ error: error.message || 'Action failed' });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
