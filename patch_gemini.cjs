const fs = require('fs');
let code = fs.readFileSync('src/server/actions.ts', 'utf8');

code = code.replace(
`        const text = response.text();
        analysisData = JSON.parse(text || '{}');
    } catch (e) {
        analysisData = {`,
`        const text = response.text();
        analysisData = JSON.parse(text || '{}');
        
        // Strict validation
        if (typeof analysisData.confidence !== 'number' || 
            !isFinite(analysisData.confidence) || 
            analysisData.confidence < 0 || 
            analysisData.confidence > 100) {
            throw new Error('Invalid confidence score');
        }
        
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        if (!validPriorities.includes(analysisData.priority)) {
            throw new Error('Invalid priority');
        }
    } catch (e) {
        analysisData = {`
);

fs.writeFileSync('src/server/actions.ts', code);
