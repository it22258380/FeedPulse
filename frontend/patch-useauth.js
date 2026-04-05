const fs = require('fs');
const file = 'd:/FeedPulse/frontend/hooks/useAuth.ts';
let content = fs.readFileSync(file, 'utf8');

const targetSearch = `          "/api/auth/profile",
          { requireAuth: true }
        );
        setUser({ id: data._id, email: data.email, role: data.role });`;

const targetReplace = `          "/api/auth/profile",
          { requireAuth: true }
        );
        setUser({ id: data.data._id, email: data.data.email, role: data.data.role });`;

content = content.replace(targetSearch, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log('Patched frontend useAuth');
