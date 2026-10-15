import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let html = await readFile(resolve(root, 'dist/index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)];
if (scripts.length !== 1) throw new Error('Expected one bundled entry script');
for (const match of scripts) {
  const js = await readFile(resolve(root, 'dist', match[1].replace(/^\//, '')), 'utf8');
  html = html.replace(match[0], () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);
}
for (const match of [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)]) {
  const css = await readFile(resolve(root, 'dist', match[1].replace(/^\//, '')), 'utf8');
  html = html.replace(match[0], () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
}
const icon = await readFile(resolve(root, 'public/favicon.svg'), 'utf8');
html = html.replace(/href="\.?\/favicon\.svg"/, () => `href="data:image/svg+xml,${encodeURIComponent(icon)}"`);
if (/<(?:script|link)\b[^>]*(?:src|href)="(?!data:)/i.test(html)) throw new Error('External asset reference remains');
await writeFile(resolve(root, 'PromptAtelier.html'), html);
await writeFile(resolve(root, 'dist/index.html'), html);
console.log('Standalone HTML ready: PromptAtelier.html');
