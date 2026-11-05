// Runs after `expo export -p web`. In single-page mode Expo ignores +html.tsx, so the head tags that
// iPhone Safari needs ("Add to Home Screen" icon, title, full-screen mode) are added to dist/index.html here.
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../dist/index.html', import.meta.url);
let html = readFileSync(file, 'utf8');

const tags = [
  '<meta name="theme-color" content="#6C47E0">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-title" content="OctoLearn">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
];

if (!html.includes('apple-touch-icon')) html = html.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`);
// Let the page use the whole screen on iPhones with a notch (safe areas are handled in the app).
html = html.replace('shrink-to-fit=no"', 'shrink-to-fit=no, viewport-fit=cover"');

writeFileSync(file, html);
console.log('patched dist/index.html');
