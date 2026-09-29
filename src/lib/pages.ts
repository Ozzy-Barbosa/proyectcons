import { createRequire } from 'node:module';
import path from 'node:path';

// The content adapter intentionally stays in Node at build time. Keeping it
// external also preserves its filesystem paths when Astro bundles its renderer.
const loadContent = createRequire(path.resolve(process.cwd(), 'package.json'));
const legacy = loadContent('./scripts/build-pages.cjs');

export type Language = 'es' | 'en';

/** Build-time snapshots: legacy templates never mutate while Astro renders. */
export interface SitePage {
  file: string;
  key: string;
  lang: Language;
  indexable: boolean;
  headHtml: string;
  headerHtml: string;
  footerHtml: string;
  contentHtml: string;
  formHtml: string;
  assetPrefix: string;
  gallery: boolean;
}

export const pages = legacy.pages as readonly SitePage[];

export function pageByFile(file: string): SitePage {
  const page = pages.find((candidate) => candidate.file === file);
  if (!page) throw new Error(`Unknown page: ${file}`);
  return page;
}
