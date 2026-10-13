const fs = require('fs');

const file = 'src/app/admin-portal/sticker/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace window.location.origin with process.env.NEXT_PUBLIC_BASE_URL
content = content.replace(
  'const qrUrl = typeof window !== "undefined" ? `${window.location.origin}/verify?code=${student.secure_hash}` : "";',
  'const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "")}/verify?code=${student.secure_hash}`;'
);

fs.writeFileSync(file, content);
console.log("Updated sticker page URL logic.");
