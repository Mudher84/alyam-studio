const fs = require('fs');
let content = fs.readFileSync('app/applet/src/pages/Home.tsx', 'utf8');
console.log('Read Home.tsx successfully, length:', content.length);
