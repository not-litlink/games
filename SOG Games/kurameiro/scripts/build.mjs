import { build, createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { readFile, writeFile } from 'node:fs/promises';

await readFile('public/og-image.png');
await build();
const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom'
});
try {
  const { App } = await server.ssrLoadModule('/src/main.tsx');
  const html = await readFile('dist/index.html', 'utf8');
  if (!html.includes('<!--app-html-->')) throw new Error('Missing prerender marker');
  await writeFile('dist/index.html', html.replace('<!--app-html-->', () => renderToString(React.createElement(App))));
  console.log('Prerendered the home screen and game information into dist/index.html');
} finally {
  await server.close();
}
