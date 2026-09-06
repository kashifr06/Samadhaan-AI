const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
code = code.replace("const isTestMode =", "export const isTestMode =");
fs.writeFileSync('src/context/AppContext.tsx', code);

let header = fs.readFileSync('src/components/Header.tsx', 'utf8');
header = header.replace(
    "import { useAppContext } from '../context/AppContext';",
    "import { useAppContext, isTestMode } from '../context/AppContext';"
);
header = header.replace(
    `<div className="flex items-center gap-2 bg-slate-900 rounded-full px-3 py-1.5 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Demo Role:</span>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
          >
            {roles.map(r => (
              <option key={r} value={r} className="bg-slate-900">{r}</option>
            ))}
          </select>
        </div>`,
    `{isTestMode ? (
          <div className="flex items-center gap-2 bg-slate-900 rounded-full px-3 py-1.5 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Demo Role:</span>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
            >
              {roles.map(r => (
                <option key={r} value={r} className="bg-slate-900">{r}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-900 rounded-full px-3 py-1.5 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role:</span>
            <span className="text-slate-200 text-xs font-bold px-1">{role}</span>
          </div>
        )}`
);
fs.writeFileSync('src/components/Header.tsx', header);
