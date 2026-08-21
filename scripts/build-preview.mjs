import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, '_site');
const previewOrigin = 'https://michaelbernhardt.github.io/smarta-website-preview';

const files = [
  '.nojekyll',
  '404.html',
  'index.html',
  'llms-full.txt',
  'llms.txt',
  'robots.txt',
  'script.js',
  'site.webmanifest',
  'sitemap.xml',
  'styles.css',
];
const directories = ['documents', 'images', 'privacy', 'resources'];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await Promise.all([
  ...files.map((file) => cp(path.join(projectRoot, file), path.join(outputDirectory, file))),
  ...directories.map((directory) =>
    cp(path.join(projectRoot, directory), path.join(outputDirectory, directory), { recursive: true }),
  ),
]);

const homepagePath = path.join(outputDirectory, 'index.html');
const homepage = await readFile(homepagePath, 'utf8');
const previewHomepage = homepage
  .replace(
    '<meta property="og:url" content="https://smarta.co.za/">',
    `<meta property="og:url" content="${previewOrigin}/">`,
  )
  .replaceAll(
    'https://smarta.co.za/images/social/smarta-og.jpg',
    `${previewOrigin}/images/social/smarta-og.jpg`,
  );

await writeFile(homepagePath, previewHomepage);

console.log(`Preview assembled at ${outputDirectory}`);
