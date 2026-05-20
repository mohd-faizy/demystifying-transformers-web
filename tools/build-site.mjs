import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sources = [
  {
    key: "part-1",
    label: "Part 1",
    title: "Foundations and Transformer Components",
    sourceDir: "Transformer-html-P1",
    sourceHtml: "02 - Transformer Components P-1 18f8a6d62b5380bd9939f0d65e005d0f.html",
    imageDir: "assets/images/part-1",
    badge: "Foundation",
    note: "This part introduces the Transformer idea, the NLP timeline, attention, embeddings, positional encoding, multi-head attention, residual connections, feed-forward networks, and normalization.",
  },
  {
    key: "part-2",
    label: "Part 2",
    title: "Encoder and Decoder Architecture Walkthrough",
    sourceDir: "Transformer-html-P2",
    sourceHtml: "03 - Transformer Architecture P-2 19a8a6d62b53803885d7c4144fce4cd7.html",
    imageDir: "assets/images/part-2",
    badge: "Architecture",
    note: "This part contains the architecture notes. It first describes the encoder, then moves into decoder training, masked self-attention, cross-attention, inference, softmax, and autoregressive generation.",
  },
];

const htmlEscape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);

function extractBody(html) {
  const start = html.indexOf('<div class="page-body">');
  const end = html.lastIndexOf("</article>");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Could not find exported Notion page body.");
  }
  return html.slice(start + '<div class="page-body">'.length, end).replace(/<\/div>\s*$/, "");
}

async function copyAndRewriteImages(body, source) {
  const sourceDirAbs = path.join(root, source.sourceDir);
  const imageDirAbs = path.join(root, source.imageDir);
  await fs.mkdir(imageDirAbs, { recursive: true });

  const seen = new Map();
  let index = 1;

  async function mapRef(ref) {
    if (/^(https?:|data:|#|mailto:)/i.test(ref)) return ref;
    const cleanRef = decodeURIComponent(ref).replaceAll("\\", "/");
    const srcAbs = path.join(sourceDirAbs, cleanRef);
    try {
      await fs.access(srcAbs);
    } catch {
      return ref;
    }
    if (!seen.has(cleanRef)) {
      const parsed = path.parse(cleanRef);
      const filename = `${String(index).padStart(2, "0")}-${slugify(parsed.name) || "image"}${parsed.ext.toLowerCase()}`;
      index += 1;
      const destAbs = path.join(imageDirAbs, filename);
      await fs.copyFile(srcAbs, destAbs);
      seen.set(cleanRef, `${source.imageDir.replaceAll("\\", "/")}/${filename}`);
    }
    return seen.get(cleanRef);
  }

  const refs = [...body.matchAll(/\b(src|href)="([^"]+)"/g)];
  const replacements = new Map();
  for (const [, , ref] of refs) {
    if (!replacements.has(ref)) {
      replacements.set(ref, await mapRef(ref));
    }
  }

  for (const [from, to] of replacements) {
    body = body.replaceAll(`src="${from}"`, `src="${to}"`);
    body = body.replaceAll(`href="${from}"`, `href="${to}"`);
  }

  return {
    body,
    images: [...seen.values()],
  };
}

function cleanExport(body) {
  return body
    .replaceAll('style="display:contents"', "")
    .replaceAll('style="white-space:pre-wrap;display:flex"', "")
    .replaceAll('style="text-align:center"', "")
    .replace(/\sstyle="width:[^"]+"/g, "")
    .replace(/<p[^>]*>\s*<\/p>/g, "")
    .replace(/<span class="sans"[^>]*><\/span>/g, "");
}

async function loadSection(source) {
  const html = await fs.readFile(path.join(root, source.sourceDir, source.sourceHtml), "utf8");
  const { body, images } = await copyAndRewriteImages(cleanExport(extractBody(html)), source);
  return { ...source, body, images };
}

const css = String.raw`
:root {
  --ink: #1f2933;
  --muted: #667085;
  --line: #e7edf3;
  --soft: #f7fafc;
  --panel: #ffffff;
  --accent: #0f766e;
  --accent-2: #b45309;
  --accent-3: #334155;
  --shadow: 0 18px 45px rgba(31, 41, 51, 0.08);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  color: var(--ink);
  background: #ffffff;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  line-height: 1.65;
}
a { color: inherit; }
.shell {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
  min-height: 100vh;
}
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 28px 20px;
  border-right: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  overflow-y: auto;
}
.brand {
  display: grid;
  gap: 10px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line);
}
.brand-kicker,
.eyebrow {
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.brand-title {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.2;
}
.nav {
  display: grid;
  gap: 6px;
  margin-top: 22px;
}
.nav a {
  display: block;
  padding: 9px 10px;
  border-radius: 6px;
  color: var(--muted);
  font-size: 0.94rem;
  text-decoration: none;
}
.nav a:hover,
.nav a:focus {
  color: var(--ink);
  background: var(--soft);
}
.content {
  min-width: 0;
}
.hero,
.section,
.footer {
  max-width: 1120px;
  margin: 0 auto;
  padding: 52px clamp(20px, 5vw, 68px);
}
.hero {
  display: grid;
  gap: 28px;
  border-bottom: 1px solid var(--line);
}
.hero h1 {
  max-width: 900px;
  margin: 0;
  font-size: clamp(2.25rem, 6vw, 5.5rem);
  line-height: 0.96;
  letter-spacing: 0;
}
.hero p {
  max-width: 760px;
  margin: 0;
  color: var(--muted);
  font-size: 1.08rem;
}
.quick-grid,
.path-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.quick-card,
.path-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  padding: 18px;
}
.quick-card strong,
.path-card strong {
  display: block;
  margin-bottom: 6px;
}
.quick-card span,
.path-card span {
  color: var(--muted);
  font-size: 0.95rem;
}
.section-header {
  display: grid;
  gap: 10px;
  margin-bottom: 22px;
}
.section-header h2 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 3rem);
  line-height: 1.05;
  letter-spacing: 0;
}
.section-header p {
  max-width: 820px;
  margin: 0;
  color: var(--muted);
}
.note-shell {
  border-top: 1px solid var(--line);
  padding-top: 18px;
}
.source-note {
  border: 1px solid var(--line);
  border-left: 4px solid var(--accent);
  border-radius: 8px;
  padding: 16px 18px;
  margin-bottom: 20px;
  background: #fbfdfd;
}
.source-note strong {
  color: var(--accent-3);
}
.note-content {
  max-width: 100%;
  color: var(--ink);
}
.note-content .indented {
  padding-left: clamp(10px, 2vw, 22px);
  border-left: 1px solid #eef2f6;
}
.note-content h1,
.note-content h2,
.note-content h3,
.note-content summary {
  letter-spacing: 0;
}
.note-content h1 {
  margin: 32px 0 14px;
  font-size: clamp(1.45rem, 2.6vw, 2.15rem);
  line-height: 1.15;
}
.note-content h2 {
  margin: 28px 0 12px;
  font-size: 1.45rem;
}
.note-content h3 {
  margin: 22px 0 8px;
  font-size: 1.12rem;
}
.note-content p,
.note-content ul,
.note-content ol {
  margin-top: 0.45rem;
  margin-bottom: 0.75rem;
}
.note-content li {
  margin-bottom: 0.4rem;
}
.note-content details {
  margin: 16px 0;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(31, 41, 51, 0.04);
}
.note-content details details {
  box-shadow: none;
  margin: 10px 0;
}
.note-content summary {
  cursor: pointer;
  padding: 14px 16px;
  color: #162032;
  font-weight: 800 !important;
  line-height: 1.3 !important;
}
.note-content details > .indented,
.note-content details > div {
  padding: 0 16px 16px;
}
.note-content mark {
  color: inherit !important;
  background: linear-gradient(180deg, transparent 58%, #fff0b3 58%);
}
.note-content code {
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  padding: 0.08em 0.35em;
  color: #a43f00;
  background: #fff8ed;
  font-size: 0.9em;
}
.note-content figure {
  max-width: 100%;
  margin: 22px auto;
  text-align: center;
}
.note-content figure.image,
.note-content .callout {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 12px;
}
.note-content figcaption {
  margin-top: 8px;
  color: var(--muted);
  font-size: 0.9rem;
}
.note-content img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
  border-radius: 4px;
}
.note-content .callout {
  display: flex;
  gap: 12px;
  text-align: left;
  background: #f8fafc;
}
.note-content .bookmark {
  display: block;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 12px;
  text-decoration: none;
  background: #fff;
}
.equation-container,
.katex-display {
  overflow-x: auto;
}
.decoder-marker {
  margin: 28px 0 18px;
  border: 1px solid #dbeafe;
  border-left: 4px solid #2563eb;
  border-radius: 8px;
  background: #f8fbff;
  padding: 16px 18px;
}
.decoder-marker h3 {
  margin: 0 0 6px;
  font-size: 1.1rem;
}
.decoder-marker p {
  margin: 0;
  color: var(--muted);
}
.footer {
  color: var(--muted);
  border-top: 1px solid var(--line);
}
@media (max-width: 980px) {
  .shell { display: block; }
  .sidebar {
    position: relative;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  .nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .quick-grid,
  .path-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .hero,
  .section,
  .footer {
    padding: 34px 18px;
  }
  .nav {
    grid-template-columns: 1fr;
  }
  .note-content .indented {
    padding-left: 8px;
  }
  .note-content details > .indented,
  .note-content details > div {
    padding: 0 10px 12px;
  }
}
`;

const sections = await Promise.all(sources.map(loadSection));

const part2 = sections.find((section) => section.key === "part-2");
part2.body = part2.body.replace(
  /(<details open=""><summary[^>]*>(?:<[^>]+>)*Decoder:(?:<\/[^>]+>)*<\/summary>)/,
  `<div class="decoder-marker" id="decoder"><h3>Decoder Notes Start Here</h3><p>The decoder material begins after the encoder stack. These notes cover masked self-attention, decoder training/inference, cross-attention, linear projection, softmax, and autoregressive prediction.</p></div>$1`
);

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Transformer Architecture Notes</title>
  <meta name="description" content="Clean, systematic notes for learning Transformer architecture from components to encoder and decoder flow.">
  <style>${css}</style>
</head>
<body>
  <div class="shell">
    <aside class="sidebar" aria-label="Study navigation">
      <div class="brand">
        <span class="brand-kicker">Transformer Notes</span>
        <h1 class="brand-title">Architecture Learning Path</h1>
      </div>
      <nav class="nav">
        <a href="#overview">Overview</a>
        <a href="#learning-path">Learning Path</a>
        <a href="#part-1">Part 1: Components</a>
        <a href="#part-2">Part 2: Encoder</a>
        <a href="#decoder">Decoder Notes</a>
        <a href="#asset-structure">Image Structure</a>
      </nav>
    </aside>
    <main class="content">
      <section class="hero" id="overview">
        <span class="eyebrow">From components to full architecture</span>
        <h1>Transformer Architecture Notes</h1>
        <p>A clean white-theme study page that merges both exported HTML note folders into one systematic walkthrough. The image assets are copied into chronological folders so the page stays organized and easy to publish.</p>
        <div class="quick-grid">
          <div class="quick-card"><strong>Part 1 explains components</strong><span>Use it first for intuition: attention, embeddings, positional encoding, multi-head attention, residual paths, FFN, and normalization.</span></div>
          <div class="quick-card"><strong>Part 2 explains encoder and decoder</strong><span>The architecture notes identify the encoder first, then continue into decoder training and inference behavior.</span></div>
          <div class="quick-card"><strong>White theme for image-heavy notes</strong><span>The layout keeps diagrams on white panels so existing white-background images blend naturally.</span></div>
        </div>
      </section>

      <section class="section" id="learning-path">
        <div class="section-header">
          <span class="eyebrow">Recommended order</span>
          <h2>Study Path</h2>
          <p>Read in this order if you want the architecture to feel connected instead of scattered.</p>
        </div>
        <div class="path-grid">
          <div class="path-card"><strong>1. Foundation</strong><span>Understand why Transformers replaced recurrent sequence models and why attention matters.</span></div>
          <div class="path-card"><strong>2. Core Components</strong><span>Learn embeddings, positional encoding, self-attention, multi-head attention, Add & Norm, FFN, and layer normalization.</span></div>
          <div class="path-card"><strong>3. Full Architecture</strong><span>Follow the encoder stack first, then the decoder stack with masking, cross-attention, and autoregressive output generation.</span></div>
        </div>
      </section>

      ${sections
        .map(
          (section) => `
      <section class="section" id="${section.key}">
        <div class="section-header">
          <span class="eyebrow">${htmlEscape(section.label)} · ${htmlEscape(section.badge)}</span>
          <h2>${htmlEscape(section.title)}</h2>
          <p>${htmlEscape(section.note)}</p>
        </div>
        <div class="source-note"><strong>Source:</strong> ${htmlEscape(section.sourceDir)} / ${htmlEscape(section.sourceHtml)}</div>
        <article class="note-shell note-content">
          ${section.body}
        </article>
      </section>`
        )
        .join("\n")}

      <section class="section" id="asset-structure">
        <div class="section-header">
          <span class="eyebrow">Publishing hygiene</span>
          <h2>Image Asset Structure</h2>
          <p>Images are now linked from clean folders: <code>assets/images/part-1</code> for component notes and <code>assets/images/part-2</code> for architecture notes. Filenames are numbered in their first-use order to keep the learning flow chronological.</p>
        </div>
      </section>

      <footer class="footer">
        Built from the two Transformer HTML exports by Mohd Faizy. Ready to publish as a static webpage.
      </footer>
    </main>
  </div>
</body>
</html>`;

await fs.writeFile(path.join(root, "index.html"), page, "utf8");
console.log(`Built index.html with ${sections.reduce((sum, section) => sum + section.images.length, 0)} copied images.`);
