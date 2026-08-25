import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser } from '@playwright/test';

/**
 * Renders the résumé routes to PDF with Chromium's own print engine.
 *
 * No PDF library is involved, and that is the point. Chromium lays the document out
 * with exactly the engine that renders it on screen, so the PDF is the design rather
 * than a reconstruction of it: `<a href>` becomes a real `/Link` annotation with a
 * `/URI`, text stays vector with embedded font subsets (selectable, searchable, and
 * readable by an applicant tracking system), and `preferCSSPageSize` honours the
 * `@page` rule so each sheet is exactly 8.5in × 11in.
 *
 * The alternatives were considered and rejected: jsPDF, pdf-lib and @react-pdf/renderer
 * all require re-authoring the layout in their own model, which forfeits fidelity by
 * construction; html2canvas rasterizes, which loses the text and the links.
 *
 * Output is committed to `public/`, so a deploy needs no browser at build or request
 * time. CI re-runs this and fails on drift, which is what keeps the committed artifact
 * honest — see `pnpm resume:pdf:check`.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const PUBLIC_DIR = join(ROOT, 'public');
const PORT = Number(process.env.RESUME_PDF_PORT ?? 3210);
const ORIGIN = `http://127.0.0.1:${PORT}`;

/**
 * Chromium stamps a creation timestamp and a random file id into every PDF, so two
 * renders of identical input differ in bytes. Both are normalised to fixed values.
 *
 * Without this the artifact could not be committed usefully: every regeneration would
 * show as a diff, and CI's drift check would flag noise instead of change.
 *
 * `/ID` is written as a fixed pair rather than removed — readers use it to recognise a
 * file, and an absent id is less well handled than a stable one.
 */
const STABLE_DATE = "D:20260101000000+00'00'";
const STABLE_ID = '00000000000000000000000000000000';

type Variant = {
  slug: string;
  roleTitle: string;
  route: string;
  pdfPath: string;
};

function normalise(pdf: Buffer): Buffer {
  // Operating on latin1 keeps every byte round-trippable: the replacements are
  // equal-length, so no offset in the cross-reference table moves.
  let raw = pdf.toString('latin1');

  // Chromium writes both a creation and a modification timestamp.
  for (const key of ['CreationDate', 'ModDate']) {
    raw = raw.replace(new RegExp(`/${key}\\s*\\(D:[^)]*\\)`, 'g'), (match) => {
      const replacement = `/${key} (${STABLE_DATE})`;
      return replacement.length === match.length
        ? replacement
        : replacement.padEnd(match.length, ' ').slice(0, match.length);
    });
  }

  raw = raw.replace(/\/ID\s*\[\s*<[0-9a-fA-F]*>\s*<[0-9a-fA-F]*>\s*\]/g, (match) => {
    const replacement = `/ID [<${STABLE_ID}><${STABLE_ID}>]`;
    return replacement.length === match.length ? replacement : match; // Leave it rather than corrupt byte offsets.
  });

  return Buffer.from(raw, 'latin1');
}

/** Starts the production server and resolves once it answers. */
async function startServer(): Promise<() => void> {
  const server = spawn('pnpm', ['exec', 'next', 'start', '--port', String(PORT)], {
    cwd: ROOT,
    stdio: 'ignore',
  });

  const stop = () => {
    server.kill('SIGTERM');
  };

  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${ORIGIN}/resume/print`);
      if (response.ok) return stop;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  stop();
  throw new Error(`next start did not answer on ${ORIGIN} within 120s`);
}

async function renderOne(browser: Browser, route: string, outPath: string) {
  const page = await browser.newPage();
  try {
    const response = await page.goto(`${ORIGIN}${route}`, { waitUntil: 'networkidle' });
    if (!response || !response.ok()) {
      throw new Error(`${route} returned ${response?.status() ?? 'no response'}`);
    }

    // The fonts are self-hosted by next/font, but the faces still resolve
    // asynchronously; printing before they settle would embed fallback metrics and
    // shift every line.
    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf({
      printBackground: true,
      // Honour the stylesheet's `@page { size: 8.5in 11in; margin: 0 }` rather than
      // Chromium's default Letter-with-margins.
      preferCSSPageSize: true,
    });

    await writeFile(outPath, normalise(pdf));
    return pdf.length;
  } finally {
    await page.close();
  }
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });
  const stop = await startServer();
  let browser: Browser | undefined;

  try {
    // The app publishes the variant list, so adding a role lens needs no change here.
    const manifest = await fetch(`${ORIGIN}/resume/manifest.json`);
    if (!manifest.ok) {
      throw new Error(`resume manifest returned ${manifest.status}`);
    }
    const { variants } = (await manifest.json()) as { variants: Variant[] };

    browser = await chromium.launch();
    for (const variant of variants) {
      const out = join(PUBLIC_DIR, variant.pdfPath.replace(/^\//, ''));
      const bytes = await renderOne(browser, variant.route, out);
      console.log(`  ${variant.route.padEnd(38)} → ${variant.pdfPath}  (${bytes} bytes)`);
    }
  } finally {
    await browser?.close();
    stop();
  }
}

await main();
