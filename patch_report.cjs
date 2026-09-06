const fs = require('fs');
let code = fs.readFileSync('src/pages/ReportProblem.tsx', 'utf8');

code = code.replace(
`        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Supporting Image (Optional)</label>
          <div className="border border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 hover:bg-slate-900 transition-colors cursor-pointer">
            <FileText className="w-6 h-6 mb-2 opacity-50" />
            <span className="text-sm font-bold">Click to upload or drag & drop</span>
            <span className="text-[10px] uppercase tracking-widest mt-1">JPG, PNG up to 5MB</span>
          </div>
        </div>`,
`        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Supporting Image (Optional)</label>
          <div className="border border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50">
            <FileText className="w-6 h-6 mb-2 opacity-50" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Firebase Storage / evidence upload is deferred to a future phase.</span>
          </div>
        </div>`
);

fs.writeFileSync('src/pages/ReportProblem.tsx', code);
