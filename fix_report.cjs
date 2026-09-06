const fs = require('fs');
let code = fs.readFileSync('src/pages/ReportProblem.tsx', 'utf8');

code = code.replace(
  "const { addProblem, analyzeProblem, setRole } = useAppContext();",
  "const { addProblem, analyzeProblem, setRole, isLoading } = useAppContext();"
);

fs.writeFileSync('src/pages/ReportProblem.tsx', code);
