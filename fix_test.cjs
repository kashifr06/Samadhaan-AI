const fs = require('fs');
let code = fs.readFileSync('src/server/Backend.test.ts', 'utf8');

// Remove the wrongly appended text
code = code.split("  it('14. addProblem")[0];

// Insert it before the last `});`
const inject = `
  it('14. addProblem rejects missing/whitespace fields', async () => {
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p2', title: '  ', description: 'desc', category: 'cat', location: 'loc' }, getCit())).rejects.toThrow('Missing title');
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p2', title: 'title', description: '   ', category: 'cat', location: 'loc' }, getCit())).rejects.toThrow('Missing description');
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p2', title: 'title', description: 'desc', category: '', location: 'loc' }, getCit())).rejects.toThrow('Missing category');
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p2', title: 'title', description: 'desc', category: 'cat', location: '   \\n ' }, getCit())).rejects.toThrow('Missing location');
  });
});`;

code = code.replace(/}\);\s*$/, inject);

fs.writeFileSync('src/server/Backend.test.ts', code);
