const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
code = code.replace(
`      if (res.ok) {
        const data = await res.json();
        setRoleState(data.user?.role || 'Citizen');
        setProblems(data.problems);
        setProjects(data.projects);
        setUniversities(data.universities);
        setIndustryPartners(data.industryPartners);
      }
    } catch (e) {
      setError('Failed to fetch state from backend.');
    }
  };`,
`      if (res.ok) {
        const data = await res.json();
        setRoleState(data.user?.role || 'Citizen');
        setProblems(data.problems);
        setProjects(data.projects);
        setUniversities(data.universities);
        setIndustryPartners(data.industryPartners);
      }
    } catch (e) {
      setError('Failed to fetch state from backend.');
    } finally {
      setIsLoading(false);
    }
  };`
);
fs.writeFileSync('src/context/AppContext.tsx', code);
