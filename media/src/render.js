// Renders media/src/who-we-are.html to media/who-we-are.mp4 + poster.
// Usage (from the repo root): node media/src/render.js [wide|portrait]
// Needs Playwright (with Chromium) and ffmpeg on the PATH.
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "media");
const FPS = 30;
const TYPES = { ".html": "text/html", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".js": "text/javascript", ".css": "text/css" };

const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch();
  const only = process.argv[2]; // optional: "wide" or "portrait"
  const VARIANTS = [
    { key: "wide", name: "who-we-are", w: 1280, h: 720, query: "" },
    { key: "portrait", name: "who-we-are-portrait", w: 720, h: 900, query: "?portrait" },
  ].filter((v) => !only || v.key === only);
  for (const v of VARIANTS) {
  const page = await browser.newPage({ viewport: { width: v.w, height: v.h } });
  await page.goto(`http://localhost:${port}/media/src/who-we-are.html${v.query}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.round(duration * FPS);

  const ff = spawn("ffmpeg", [
    "-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", path.join(OUT, `${v.name}.mp4`),
  ], { stdio: ["pipe", "inherit", "inherit"] });

  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.render(t), i / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 150 === 0) console.log(`${v.name}: frame ${i}/${frames}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));

  // Poster frame: the "Beef Roasters" title over the forest
  await page.evaluate(() => window.render(6.5));
  await page.screenshot({ path: path.join(OUT, `${v.name}-poster.jpg`), type: "jpeg", quality: 82 });
  await page.close();
  }

  await browser.close();
  server.close();
  console.log("done");
})();
