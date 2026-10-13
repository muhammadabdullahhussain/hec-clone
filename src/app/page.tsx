import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const htmlPath = path.join(process.cwd(), 'public', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
