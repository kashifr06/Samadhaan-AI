const fs = require('fs');
let code = fs.readFileSync('src/server/actions.ts', 'utf8');

code = code.replace(
`        const text = response.text();
        analysisData = JSON.parse(text);`,
`        const text = response.text || '{}';
        analysisData = JSON.parse(text);`
);

fs.writeFileSync('src/server/actions.ts', code);

let testCode = fs.readFileSync('src/server/Backend.test.ts', 'utf8');
testCode = testCode.replace(/text: \(\) =>/g, "text:");
fs.writeFileSync('src/server/Backend.test.ts', testCode);

