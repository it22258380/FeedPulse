const fs = require('fs');
const file = 'd:/FeedPulse/frontend/app/admin/feedback/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetSearch = `      setData(result);`;

const targetReplace = `      setData({
        data: result.data || [],
        ...result.pagination
      });`;

content = content.replace(targetSearch, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log('Patched frontend feedback list page');
