/* Only allowlisted public assets enter the deployment artifact. */
const fs = require('node:fs');
const path = require('node:path');
const { pages, sitemap, robots } = require('./build-pages.cjs');
const root = path.resolve(__dirname, '..');
const destination = path.resolve(root, '.astro-public');
if (destination !== path.join(root, '.astro-public')) throw new Error('Invalid public build destination.');
// This exact, ignored directory is owned by this build; never clear the workspace
// or follow a link supplied at the generated asset destination.
if (fs.existsSync(destination)) {
  if (!fs.lstatSync(destination).isDirectory() || fs.lstatSync(destination).isSymbolicLink()) throw new Error('Public build destination must be a real directory.');
  fs.rmSync(destination, { recursive: true });
}
fs.mkdirSync(destination, { recursive: true });
for (const directory of ['assets', 'css', 'js']) {
  fs.cpSync(path.join(root, directory), path.join(destination, directory), { recursive: true });
}
fs.writeFileSync(path.join(destination, 'robots.txt'), robots);
fs.writeFileSync(path.join(destination, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(destination, '.nojekyll'), '');
console.log(`Public assets prepared for ${pages.length} Astro routes. No source, credentials or customer submissions are copied.`);
