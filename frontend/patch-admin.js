const fs = require('fs');
const file = 'd:/FeedPulse/frontend/app/admin/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The backend returns {success: true, data: {...}}
// So we need to setStats(statsData.data) and setSummary(summaryData.data.summary)
const replaceSearch = `        if (statsData) setStats(statsData);
        if (summaryData?.summary) setSummary(summaryData.summary);`;

const replaceWith = `        if (statsData?.data) setStats(statsData.data);
        if (summaryData?.data) setSummary(summaryData.data.key_insight || summaryData.data.summary || "");`;

content = content.replace(replaceSearch, replaceWith);
fs.writeFileSync(file, content, 'utf8');
console.log('Patched frontend admin page');
