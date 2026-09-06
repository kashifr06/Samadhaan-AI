const fs = require('fs');
let code = fs.readFileSync('src/server/Backend.test.ts', 'utf8');

// Remove everything after the first `14.` to clean it up
code = code.split("  it('14. addProblem")[0];

const inject = `
  it('14. addProblem rejects missing/whitespace fields', async () => {
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p2', title: '  ', description: 'desc', category: 'cat', location: 'loc' }, getCit())).rejects.toThrow('Missing title');
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p2', title: 'title', description: '   ', category: 'cat', location: 'loc' }, getCit())).rejects.toThrow('Missing description');
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p2', title: 'title', description: 'desc', category: '', location: 'loc' }, getCit())).rejects.toThrow('Missing category');
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p2', title: 'title', description: 'desc', category: 'cat', location: '   \\n ' }, getCit())).rejects.toThrow('Missing location');
  });

  it('15. Gemini strict validation (priority and confidence)', async () => {
    // Test invalid confidence
    const badAiConf = { models: { generateContent: async () => ({ text: () => JSON.stringify({ category: 'Test', priority: 'HIGH', confidence: 150 }) }) } };
    memoryDb['samadhaan_problems']['p3'] = { id: 'p3', status: ProblemStatus.SUBMITTED, submittedBy: 'u-cit' };
    await handleAction(mockDb, badAiConf, 'analyzeProblem', { id: 'p3' }, getCit());
    expect(memoryDb['samadhaan_problems']['p3'].aiAnalysis.isFallback).toBe(true);

    // Test invalid priority
    const badAiPri = { models: { generateContent: async () => ({ text: () => JSON.stringify({ category: 'Test', priority: 'SUPER_HIGH', confidence: 90 }) }) } };
    memoryDb['samadhaan_problems']['p4'] = { id: 'p4', status: ProblemStatus.SUBMITTED, submittedBy: 'u-cit' };
    await handleAction(mockDb, badAiPri, 'analyzeProblem', { id: 'p4' }, getCit());
    expect(memoryDb['samadhaan_problems']['p4'].aiAnalysis.isFallback).toBe(true);
    
    // Test valid
    const goodAi = { models: { generateContent: async () => ({ text: () => JSON.stringify({ category: 'Test', priority: 'HIGH', confidence: 90 }) }) } };
    memoryDb['samadhaan_problems']['p5'] = { id: 'p5', status: ProblemStatus.SUBMITTED, submittedBy: 'u-cit' };
    await handleAction(mockDb, goodAi, 'analyzeProblem', { id: 'p5' }, getCit());
    expect(memoryDb['samadhaan_problems']['p5'].aiAnalysis.isFallback).toBeUndefined();
    expect(memoryDb['samadhaan_problems']['p5'].aiAnalysis.confidence).toBe(90);
  });
});`;

fs.writeFileSync('src/server/Backend.test.ts', code + inject);
