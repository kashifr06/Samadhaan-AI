const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "const [industryPartners, setIndustryPartners] = useState<IndustryPartner[]>(seededIndustryPartners);",
  "const [industryPartners, setIndustryPartners] = useState<IndustryPartner[]>(seededIndustryPartners);\n  const [isLoading, setIsLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);"
);

code = code.replace(
  "interface AppContextType {",
  "interface AppContextType {\n  isLoading: boolean;\n  error: string | null;\n  clearError: () => void;"
);

code = code.replace(
  "const clearError = () => setError(null);",
  ""
);

code = code.replace(
  "  return (\n    <AppContext.Provider",
  "  const clearError = () => setError(null);\n  return (\n    <AppContext.Provider"
);

code = code.replace(
  "value={{",
  "value={{\n      isLoading,\n      error,\n      clearError,"
);

code = code.replace(
  "  const fetchState = async () => {\n    if (isTestMode) return;",
  "  const fetchState = async () => {\n    if (isTestMode) return;\n    setIsLoading(true);\n    setError(null);"
);

code = code.replace(
  "        setIndustryPartners(data.industryPartners);\n      }\n    } catch (e) {",
  "        setIndustryPartners(data.industryPartners);\n      }\n    } catch (e) {\n      setError('Failed to fetch state from backend.');"
);

code = code.replace(
  "  const executeBackendAction = async (action: string, payload: any) => {\n    if (isTestMode) return true;\n    try {",
  "  const executeBackendAction = async (action: string, payload: any) => {\n    if (isTestMode) return true;\n    setIsLoading(true);\n    setError(null);\n    try {"
);

code = code.replace(
  "      const res = await fetch('/api/samadhaan/action', {",
  "      const res = await fetch('/api/samadhaan/action', {"
);

code = code.replace(
`      if (!res.ok) {
        console.error('Action failed', res.status);
        return false;
      }`,
`      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        setError(errBody.error || \`Action failed (\${res.status})\`);
        setIsLoading(false);
        return false;
      }`
);

code = code.replace(
`      return true;
    } catch (e) {`,
`      setIsLoading(false);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error communicating with backend');
      setIsLoading(false);`
);

code = code.replace(
`      if (res.ok) {
        fetchState();
      } else {
        console.error('Failed to set role');
      }
    } catch (e) {`,
`      if (res.ok) {
        await fetchState();
      } else {
        setError('Failed to set role');
      }
    } catch (e) {
      setError('Error setting role');`
);

fs.writeFileSync('src/context/AppContext.tsx', code);
