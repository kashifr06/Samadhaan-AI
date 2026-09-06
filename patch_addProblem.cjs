const fs = require('fs');
let code = fs.readFileSync('src/server/actions.ts', 'utf8');

code = code.replace(
`    if (payload.status && payload.status !== ProblemStatus.SUBMITTED) throw new Error('Invalid status');

    const newProblem = {
        status: ProblemStatus.SUBMITTED,
        title: String(payload.title || '').trim(),
        description: String(payload.description || '').trim(),
        category: String(payload.category || '').trim(),
        location: String(payload.location || '').trim(),
        submittedBy: user.uid,
        submittedAt: payload.submittedAt || new Date().toISOString(),
    };`,
`    if (payload.status && payload.status !== ProblemStatus.SUBMITTED) throw new Error('Invalid status');

    const title = String(payload.title || '').trim();
    const description = String(payload.description || '').trim();
    const category = String(payload.category || '').trim();
    const location = String(payload.location || '').trim();
    
    if (!title) throw new Error('Missing title');
    if (!description) throw new Error('Missing description');
    if (!category) throw new Error('Missing category');
    if (!location) throw new Error('Missing location');

    const newProblem = {
        status: ProblemStatus.SUBMITTED,
        title,
        description,
        category,
        location,
        submittedBy: user.uid,
        submittedAt: payload.submittedAt || new Date().toISOString(),
    };`
);

fs.writeFileSync('src/server/actions.ts', code);
