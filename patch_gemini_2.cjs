const fs = require('fs');
let code = fs.readFileSync('src/server/actions.ts', 'utf8');

code = code.replace(
`        const text = response.text();
        analysisData = JSON.parse(text);
        
        // Validate structured output
        if (typeof analysisData.category !== 'string') analysisData.category = 'General';
        if (typeof analysisData.subCategory !== 'string') analysisData.subCategory = 'General';
        if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(analysisData.priority)) analysisData.priority = 'MEDIUM';
        if (typeof analysisData.confidence !== 'number') analysisData.confidence = 50;
        if (typeof analysisData.summary !== 'string') analysisData.summary = '';
        if (typeof analysisData.duplicateCheck !== 'boolean') analysisData.duplicateCheck = false;
        if (!Array.isArray(analysisData.suggestedExpertise)) analysisData.suggestedExpertise = [];
        
    } catch (e) {`,
`        const text = response.text();
        analysisData = JSON.parse(text);
        
        // Validate structured output
        if (typeof analysisData.category !== 'string') analysisData.category = 'General';
        if (typeof analysisData.subCategory !== 'string') analysisData.subCategory = 'General';
        if (typeof analysisData.summary !== 'string') analysisData.summary = '';
        if (typeof analysisData.duplicateCheck !== 'boolean') analysisData.duplicateCheck = false;
        if (!Array.isArray(analysisData.suggestedExpertise)) analysisData.suggestedExpertise = [];
        
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
        
    } catch (e) {`
);

fs.writeFileSync('src/server/actions.ts', code);
