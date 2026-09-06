const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
`  const setRole = async (newRole: Role) => {
    setRoleState(newRole);
    if (!isTestMode && authUser) {
        const token = await authUser.getIdToken();
        await fetch('/api/samadhaan/demo/set-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
            body: JSON.stringify({ role: newRole.toUpperCase() })
        });
    }
  };`,
`  const setRole = async (newRole: Role) => {
    if (isTestMode) {
      setRoleState(newRole);
      return;
    }
    if (!authUser) return;
    try {
      const token = await authUser.getIdToken();
      const res = await fetch('/api/samadhaan/demo/set-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
          body: JSON.stringify({ role: newRole.toUpperCase() })
      });
      if (res.ok) {
        fetchState();
      } else {
        console.error('Failed to set role');
      }
    } catch (e) {
      console.error('Error setting role', e);
    }
  };`
);

fs.writeFileSync('src/context/AppContext.tsx', code);
