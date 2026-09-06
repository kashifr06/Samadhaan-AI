const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
`  const login = async () => {
    try { await signIn(); } catch (e) { console.error(e); }
  };`,
`  const login = async () => {
    setIsLoading(true);
    setError(null);
    try { 
      await signIn(); 
    } catch (e: any) { 
      if (e?.code === 'auth/cancelled-popup-request' || e?.code === 'auth/popup-closed-by-user') {
        // User intentionally closed or cancelled, safe to ignore
        console.warn('Sign-in popup closed by user.');
      } else {
        console.error('Login failed:', e);
        setError(e?.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };`
);

fs.writeFileSync('src/context/AppContext.tsx', code);
