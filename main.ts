// Entry program for the make.fun frontend bounty (Node 22, standard library
// only). The frontend is the plain static files in app/ beside this file.
// This program hands them in: it copies app/ and screenshots/ to /output
// and writes /output/dossier.json with buildDossier from the vendored
// make.fun library. vendor/makefun-frontend.ts stays as the kit shipped it:
// the scorer rebuilds the dossier with its own copy and compares byte for
// byte, so the dossier must be exactly what the library writes.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
rmSync(join(out, 'app'), { recursive: true, force: true });
rmSync(join(out, 'screenshots'), { recursive: true, force: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse (more than 3 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 16 MiB of
// app files, which count beside /output's own 1000-entry cap).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 3, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);

// A small local check: report the dossier size so a bad build is obvious.
console.log('dossier.json bytes:', statSync(join(out, 'dossier.json')).size);
