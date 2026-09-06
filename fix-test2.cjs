const fs = require('fs');

let testCode = fs.readFileSync('src/DeploymentTests.test.ts', 'utf8');
testCode = testCode.replace(
`      FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...\\n-----END PRIVATE KEY-----'`,
`      FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgR6aC6aL2rO5tqjQc\\nc/8P6L/Q4+5aUo/Nn3ZtT4FmRk6hRANCAARTq1z6fT9+1f41m+X5U69+2f7R/o2A\\nOqF6U6vK29L5rX1+685N6G1A/A31Z9wU8zD8/R+693F3r5+L4v\\n-----END PRIVATE KEY-----'`
);
fs.writeFileSync('src/DeploymentTests.test.ts', testCode);

