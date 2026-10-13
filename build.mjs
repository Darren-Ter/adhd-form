// Builds dist/ for static hosting: wraps the artifact page in a full HTML
// document with link-preview tags, plus one page per shareable result at
// /r/<lang>-<score> whose preview image shows that result.
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from "node:fs";

const site = (process.env.SITE_URL || "https://adhd-form.vercel.app").replace(/\/$/, "");
let page = readFileSync("index.html", "utf8");
page = page.replace(/const SHARE_URL = "[^"]*";/, `const SHARE_URL = "${site}";`);

// The artifact source starts with <title>, links and <style>; those stay in <head>.
const split = page.indexOf("</style>") + "</style>".length;
const headPart = page.slice(0, split), bodyPart = page.slice(split).trim();

const esc = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const VERDICT = { zh: ["不太像 ADHD", "很可能有 ADHD"], en: ["Unlikely ADHD", "Likely ADHD"] };
const COPY = {
  home: {
    title: "我是不是 ADHD？30 秒自测 · ADHD 30s Check",
    desc: "基于 WHO 成人 ADHD 自评量表（ASRS v1.1）的 6 题筛查，每题点一下，数据不上传。A 6-question, one-tap ADHD screening based on the WHO ASRS v1.1.",
  },
  zh: n => ({
    title: `测出来：${VERDICT.zh[n >= 4 ? 1 : 0]}（${n}/6）· ADHD 30 秒自测`,
    desc: "6 道题，30 秒，每题点一下，基于 WHO 的 ASRS 筛查量表。轮到你了。",
  }),
  en: n => ({
    title: `Result: ${VERDICT.en[n >= 4 ? 1 : 0]} (${n}/6) · ADHD 30s Check`,
    desc: "6 questions, 30 seconds, one tap each. Based on the WHO ASRS screener. Your turn.",
  }),
};

// The Content-Security-Policy is the privacy guarantee anyone can check: the page loads only from
// this site, and the browser refuses any fetch, beacon, websocket, form post or remote image from it.
function doc({ title, desc, image, url, lang, shared }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ADHD 30s Check">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${image}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='17' fill='%23FF9CCB' stroke='%2317142E' stroke-width='2.4'/%3E%3Ccircle cx='14' cy='18' r='2.4' fill='%2317142E'/%3E%3Ccircle cx='26' cy='18' r='2.4' fill='%2317142E'/%3E%3Cpath d='M14 26 q6 4 12 0' stroke='%2317142E' stroke-width='2.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>
${shared ? `<script>window.__SHARED__ = ${JSON.stringify(shared)};</script>\n` : ""}${headPart}
</head>
<body>
${bodyPart}
</body>
</html>
`;
}

mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", doc({ ...COPY.home, image: `${site}/og/home.png`, url: site, lang: "zh-Hans" }));
let n = 1;
for (const lang of ["zh", "en"]) for (let s = 0; s <= 6; s++) {
  const slug = `${lang}-${s}`;
  mkdirSync(`dist/r/${slug}`, { recursive: true });
  writeFileSync(`dist/r/${slug}/index.html`, doc({ ...COPY[lang](s), image: `${site}/og/${slug}.png`, url: `${site}/r/${slug}`, lang: lang === "zh" ? "zh-Hans" : "en", shared: { lang, n: s } }));
  n++;
}
if (existsSync("og")) cpSync("og", "dist/og", { recursive: true });
cpSync("fonts", "dist/fonts", { recursive: true });
cpSync("licenses", "dist/licenses", { recursive: true });
cpSync("LICENSE", "dist/LICENSE");
cpSync("THIRD_PARTY_NOTICES.md", "dist/THIRD_PARTY_NOTICES.md");
console.log(`built ${n} pages for ${site}`);
