const fs = require('fs');

let testCode = fs.readFileSync('src/DeploymentTests.test.ts', 'utf8');
testCode = testCode.replace(
`    expect(config.apiKey).toBeUndefined();
    expect(config.projectId).toBeUndefined();`,
`    expect(config.apiKey).toBe('');
    expect(config.projectId).toBe('');`
);
fs.writeFileSync('src/DeploymentTests.test.ts', testCode);

