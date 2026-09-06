const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Insert a hook for the backend
const backendHook = `
const isTestMode = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

const executeBackendAction = async (action, payload) => {
  if (isTestMode) return false; // Fallback to local
  try {
    const { auth } = await import('../lib/firebase');
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch('/api/samadhaan/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
      body: JSON.stringify({ action, payload })
    });
    if (!res.ok) {
       const err = await res.json();
       console.error("Backend error:", err);
       return false;
    }
    return true; // backend succeeded
  } catch (e) {
    console.error("Fetch error:", e);
    return false;
  }
};
`;

code = code.replace("export const AppProvider", backendHook + "\nexport const AppProvider");

// Now we need to modify functions like `addProblem` to call `executeBackendAction`
// E.g., const addProblem = (problem: Problem) => {
code = code.replace(/const addProblem = \((.*?)\) => {/, "const addProblem = async ($1) => {\n    if (!isTestMode) { await executeBackendAction('addProblem', $1); return; }\n");

// Because we are modifying the AST, doing it with regex is dangerous for 26KB.
// A better way is to do it properly. Let's see if we can just wrap the context value instead!
