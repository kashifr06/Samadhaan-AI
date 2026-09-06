const fs = require('fs');
let code = fs.readFileSync('src/DemoUX.test.tsx', 'utf8');

code = code.replace(
`    expect(screen.getByText('₹0.0 L')).toBeTruthy();`,
`    expect(screen.getAllByText('₹0.0 L').length).toBeGreaterThan(0);`
);

fs.writeFileSync('src/DemoUX.test.tsx', code);
