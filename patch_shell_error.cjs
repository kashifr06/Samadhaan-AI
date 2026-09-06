const fs = require('fs');
let code = fs.readFileSync('src/components/Shell.tsx', 'utf8');

code = code.replace(
  "import { Header } from './Header';",
  "import { Header } from './Header';\nimport { useAppContext } from '../context/AppContext';\nimport { AlertCircle, X, Loader2 } from 'lucide-react';"
);

code = code.replace(
  "export function Shell() {",
  "export function Shell() {\n  const { error, clearError, isLoading } = useAppContext();"
);

code = code.replace(
  "        <Header />",
  "        <Header />\n        {isLoading && (\n          <div className=\"h-1 bg-[#0B0E14] w-full overflow-hidden\">\n            <div className=\"h-full bg-cyan-500 w-1/3 animate-[slide_1.5s_ease-in-out_infinite]\"></div>\n          </div>\n        )}\n        {error && (\n          <div className=\"bg-red-500/10 border-l-4 border-red-500 p-4 m-8 mb-0 flex items-start justify-between rounded-r-lg\">\n            <div className=\"flex items-center gap-3\">\n              <AlertCircle className=\"w-5 h-5 text-red-500 shrink-0\" />\n              <p className=\"text-sm text-red-200 font-medium\">{error}</p>\n            </div>\n            <button onClick={clearError} className=\"text-red-400 hover:text-red-300 p-1\">\n              <X className=\"w-4 h-4\" />\n            </button>\n          </div>\n        )}"
);

fs.writeFileSync('src/components/Shell.tsx', code);
