const fs = require('fs');

const addLoading = (file, buttonSearch, newButton) => {
    let code = fs.readFileSync(file, 'utf8');
    if (!code.includes('isLoading')) {
        code = code.replace("useAppContext();", "useAppContext();\n  const { isLoading } = useAppContext();");
    }
    code = code.replace(buttonSearch, newButton);
    fs.writeFileSync(file, code);
}

addLoading('src/pages/GovernmentValidation.tsx', 
  '<button \n                onClick={() => validateProblem(problem.id)}',
  '<button \n                onClick={() => validateProblem(problem.id)}\n                disabled={isLoading}'
);
addLoading('src/pages/GovernmentValidation.tsx', 
  '<button \n                onClick={() => rejectProblem(problem.id)}',
  '<button \n                onClick={() => rejectProblem(problem.id)}\n                disabled={isLoading}'
);
addLoading('src/pages/GovernmentValidation.tsx', 
  '<button \n                onClick={() => requestClarification(problem.id)}',
  '<button \n                onClick={() => requestClarification(problem.id)}\n                disabled={isLoading}'
);
addLoading('src/pages/GovernmentValidation.tsx', 
  '<button \n                        onClick={() => inviteUniversity(problem.id, p.id)}',
  '<button \n                        onClick={() => inviteUniversity(problem.id, p.id)}\n                        disabled={isLoading}'
);

addLoading('src/pages/UniversityOpportunities.tsx', 
  '<button \n                    onClick={() => acceptInvitation(inv.id)}',
  '<button \n                    onClick={() => acceptInvitation(inv.id)}\n                    disabled={isLoading}'
);
addLoading('src/pages/UniversityOpportunities.tsx', 
  '<button \n                    onClick={() => declineInvitation(inv.id)}',
  '<button \n                    onClick={() => declineInvitation(inv.id)}\n                    disabled={isLoading}'
);

addLoading('src/pages/ProjectWorkspace.tsx', 
  '<button \n                onClick={() => updateMilestone(project.id, m.id, { status: \'COMPLETED\' })}',
  '<button \n                onClick={() => updateMilestone(project.id, m.id, { status: \'COMPLETED\' })}\n                disabled={isLoading}'
);
addLoading('src/pages/ProjectWorkspace.tsx', 
  '<button \n                onClick={() => deployProject(project.id, { type: \'WEB\', url: \'https://project.local\' })}',
  '<button \n                onClick={() => deployProject(project.id, { type: \'WEB\', url: \'https://project.local\' })}\n                disabled={isLoading}'
);

