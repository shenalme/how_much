/**
 * Set the site's domain in both places it is needed:
 *   src/config/site.ts  (canonical URLs, sitemap, robots.txt, social tags)
 *   public/CNAME        (GitHub Pages custom domain file)
 *
 * Usage: npm run set-domain example.com
 *        npm run set-domain www.example.com
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = (process.argv[2] ?? '').trim();
const domain = input
  .replace(/^https?:\/\//i, '')
  .replace(/\/+$/, '')
  .toLowerCase();

if (!/^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
  console.error(
    'Usage: npm run set-domain example.com\n(Use the bare host name, e.g. example.com or www.example.com.)',
  );
  process.exit(1);
}

const configPath = path.join(root, 'src', 'config', 'site.ts');
const config = fs.readFileSync(configPath, 'utf8');
const pattern = /export const DOMAIN = '[^']*';/;
if (!pattern.test(config)) {
  console.error(`Could not find "export const DOMAIN = '...';" in ${configPath}`);
  process.exit(1);
}
fs.writeFileSync(configPath, config.replace(pattern, `export const DOMAIN = '${domain}';`));
fs.writeFileSync(path.join(root, 'public', 'CNAME'), `${domain}\n`);

console.log(`✔ Domain set to ${domain}`);
console.log('  Updated src/config/site.ts and public/CNAME.');
console.log(
  '  Next: commit, push, then set the same domain under Settings → Pages → Custom domain.',
);
