const fs = require('fs');
let code = fs.readFileSync('src/server/demoMode.ts', 'utf8');

code = code.replace(
`  return env.VITE_DEMO_MODE === 'true' || env.DEMO_MODE === 'true';`,
`  return env.VITE_DEMO_MODE === 'true' && env.DEMO_MODE === 'true';`
);

fs.writeFileSync('src/server/demoMode.ts', code);
