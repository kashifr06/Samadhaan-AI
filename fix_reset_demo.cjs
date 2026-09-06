const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
`  const resetDemo = async () => {
    if (isTestMode) {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/samadhaan/demo/reset', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setProblems(data.problems);
          setProjects(data.projects);
          setTeams(data.teams);
          setIndustryPartners(data.industryPartners);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
      return;
    }`,
`  const resetDemo = async () => {
    if (isTestMode) {
      setProblems(seededProblems);
      setProjects(seededProjects);
      setTeams(seededTeams);
      setIndustryPartners(seededIndustryPartners);
      return;
    }`
);

fs.writeFileSync('src/context/AppContext.tsx', code);
