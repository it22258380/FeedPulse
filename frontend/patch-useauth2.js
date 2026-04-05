const fs = require('fs');
const file = 'd:/FeedPulse/frontend/hooks/useAuth.ts';
let content = fs.readFileSync(file, 'utf8');

const targetSearch = `<{ message?: string; _id: string; email: string; role: string }>`;

const targetReplace = `<{ message?: string; data: { _id: string; email: string; role: string } }>`;

content = content.replace(targetSearch, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log('Patched frontend useAuth types');
