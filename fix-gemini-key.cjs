const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });`,
`const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });`
);

fs.writeFileSync('server.ts', code);
