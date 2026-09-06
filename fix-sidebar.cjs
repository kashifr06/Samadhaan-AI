const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

code = code.replace(
`import { useAppContext } from '../context/AppContext';`,
`import { useAppContext, isTestMode } from '../context/AppContext';`
);

code = code.replace(
`  const { role } = useAppContext();`,
`  const { role, authUser } = useAppContext();`
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
