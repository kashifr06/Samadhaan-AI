const fs = require('fs');
let code = fs.readFileSync('src/pages/ReportProblem.tsx', 'utf8');

code = code.replace(
  "const { addProblem, setRole } = useAppContext();",
  "const { addProblem, setRole, isLoading } = useAppContext();"
);

code = code.replace(
`        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >`,
`        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            disabled={isLoading}
            className={\`bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20 \${isLoading ? 'opacity-50 cursor-not-allowed' : ''}\`}
          >`
);

code = code.replace(
`            Submit for AI Analysis
            <ArrowRight className="w-4 h-4" />
          </button>`,
`            {isLoading ? 'Submitting...' : 'Submit for AI Analysis'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>`
);

fs.writeFileSync('src/pages/ReportProblem.tsx', code);
