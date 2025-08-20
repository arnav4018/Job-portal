#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need to be updated
const filesToUpdate = [
  'app/api/referrals/route.ts',
  'app/api/integrations/ats/webhook/route.ts',
  'app/api/applications/route.ts'
];

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace sendEmail calls with dynamic imports
    content = content.replace(
      /(\s+)(await\s+)?sendEmail\(/g,
      '$1const { sendEmail } = await import(\'@/lib/email\')\n$1await sendEmail('
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
});

console.log('Email import fixes applied!');