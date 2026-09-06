const fs = require('fs');
let code = fs.readFileSync('src/server/Backend.test.ts', 'utf8');

code = code.replace("const badAiConf =", "const badAiConf: any =");
code = code.replace("const badAiPri =", "const badAiPri: any =");
code = code.replace("const goodAi =", "const goodAi: any =");

fs.writeFileSync('src/server/Backend.test.ts', code);
