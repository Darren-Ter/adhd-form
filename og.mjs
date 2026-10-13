// Renders the link-preview images og/home.png and og/<lang>-<score>.png (1200×630) with headless Chrome.
// Reuses the faces and cartoon scenes from index.html so the cards match the app.
// Run: node og.mjs [home|zh-5|…]   (set CHROME=/path/to/chrome if it isn't in the default macOS spot)
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const src = readFileSync("index.html", "utf8");
const cut = (from, to) => src.slice(src.indexOf(from), src.indexOf(to));
const drawing = cut("// ---------- faces", "// ---------- film player");
const fonts = `<style>${readFileSync("fonts/fonts.css", "utf8").replaceAll("url(/fonts/", `url(file://${process.cwd()}/fonts/`)}</style>`;
const filmCSS = cut("/* film frames */", "/* shared-link banner */") + cut(".f-ink { fill", ".t-z { font") + src.match(/\.t-z \{ font[^}]+\}/)[0];

const COPY = {
  zh: { brand: "ADHD 30 秒自测", pos: ["筛查阳性", "很可能有", "ADHD"], neg: ["筛查阴性", "不太像", "ADHD"], of: n => `6 题中 ${n} 题达到筛查线`, cta: "你也测测", font: `"ZCOOL QingKe HuangYou", "Noto Sans SC"` },
  en: { brand: "ADHD 30s Check", pos: ["Screen positive", "Likely", "ADHD"], neg: ["Screen negative", "Unlikely", "ADHD"], of: n => `${n} of 6 past the screening line`, cta: "Take it", font: `"Bricolage Grotesque"` },
};
// One scene per score, getting more frantic as the score climbs.
const SCENE = [["finish", 0], ["juggle", 1], ["forget", 1], ["avoid", 2], ["fidget", 3], ["wheel", 4], ["juggle", 4]];
const TINT = ["#E6FBF1", "#EAF0FF", "#FFF6CC", "#FFE6D4", "#FFDDEE"];
const WORLD = { pos: { bg: "#FF5FAE", sh: "#FFE14A", tone: "#E8202A" }, neg: { bg: "#1FC77E", sh: "#FF5FAE", tone: "#0E8A52" } };

const head = (w, css) => `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>
:root { --ink: #17142E; --paper: #fff; --yellow: #FFE14A; --hot: #FF3F3F; --mute: #8A86A8; --mis: #FF86C4; --brain: #FF9CCB; --fold: #D2498A; --a: #3D5AFE;
  --bg: ${w.bg}; --sh: ${w.sh}; --tone: ${w.tone}; --f-display: "Bricolage Grotesque", "ZCOOL QingKe HuangYou", "Noto Sans SC", sans-serif; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { position: relative; background: var(--bg); color: var(--ink); font-family: "Atkinson Hyperlegible", "Noto Sans SC", sans-serif; -webkit-font-smoothing: antialiased; }
.tone { position: absolute; width: 760px; height: 760px; border-radius: 50%; background-image: radial-gradient(circle, var(--ink) 26%, transparent 29%); background-size: 16px 16px; opacity: .1; -webkit-mask-image: radial-gradient(circle, #000 0%, transparent 66%); }
.t1 { right: -260px; top: -300px; } .t2 { left: -340px; bottom: -420px; background-image: radial-gradient(circle, var(--sh) 30%, transparent 33%); opacity: .55; }
.grain { position: absolute; inset: 0; opacity: .18; mix-blend-mode: multiply; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
.film { aspect-ratio: 16 / 9; border: 3px solid var(--ink); border-radius: 16px; overflow: hidden; }
.film .mis { opacity: .9; }
${filmCSS}
${css}
</style></head><body><div class="tone t1"></div><div class="tone t2"></div>`;

// The homepage card: the hero on the left, one dealt question card on the right, like the page itself.
function home() {
  const mags = "ADHD".split("").map((c, k) => `<span class="mag" style="background:${["#FF5FAE", "#3D5AFE", "#1FC77E", "#FF7A2F"][k]};${k === 1 ? "color:#fff;" : ""}transform:rotate(${[-7, 5, -4, 8][k]}deg)">${c}</span>`).join("");
  return head({ bg: "#FFE14A", sh: "#FF5FAE", tone: "#17142E" }, `
.left { position: absolute; left: 64px; top: 78px; width: 600px; }
.eyebrow { font-weight: 700; font-size: 20px; letter-spacing: .08em; }
.hero { margin-top: 18px; font-family: "ZCOOL QingKe HuangYou", var(--f-display); font-weight: 800; font-size: 124px; line-height: 1.12; text-shadow: 5px 5px 0 var(--sh); }
.mag { display: inline-block; margin: 0 3px; padding: 0 12px; border: 6px solid var(--ink); border-radius: 20px; font-family: "Bricolage Grotesque"; font-size: 108px; line-height: 1.2; text-shadow: none; box-shadow: 7px 7px 0 var(--ink); }
.tag { margin-top: 26px; font-weight: 700; font-size: 38px; }
.deck { position: absolute; right: 64px; top: 112px; width: 470px; }
.deck::before, .deck::after { content: ""; position: absolute; inset: 0; border: 3.5px solid var(--ink); border-radius: 26px; }
.deck::before { background: var(--a); transform: rotate(6deg) translate(12px, 6px); }
.deck::after { background: var(--sh); transform: rotate(-5deg) translate(-10px, 10px); }
.card { position: relative; z-index: 1; padding: 13px 13px 16px; border: 3.5px solid var(--ink); border-radius: 26px; background: #fff; box-shadow: 9px 9px 0 var(--ink); transform: rotate(-2deg); }
.ntag { position: absolute; top: -17px; left: 22px; padding: 3px 14px; border-radius: 999px; background: var(--ink); color: #fff; font-weight: 700; font-size: 17px; z-index: 2; }
.cap { display: flex; align-items: center; gap: 12px; margin-top: 12px; font-weight: 700; font-size: 21px; }
.cap svg { width: 40px; height: 40px; flex: 0 0 auto; }`) + `
<div class="left">
  <p class="eyebrow">基于 WHO 成人 ADHD 自评量表 ASRS v1.1</p>
  <h1 class="hero">我是不是<br>${mags}?</h1>
  <p class="tag">6 道题，30 秒。</p>
</div>
<div class="deck"><div class="card"><span class="ntag">3 / 6</span><div class="film" style="background:${TINT[3]}">${film("forget", 3)}</div><p class="cap">${face(3)}忘记约好的事，或该做的事</p></div></div>
<div class="grain"></div></body></html>`;
}

function page(lang, n) {
  const L = COPY[lang], pos = n >= 4, [stamp, l1, l2] = pos ? L.pos : L.neg, w = WORLD[pos ? "pos" : "neg"];
  const [scene, lvl] = SCENE[n];
  const cells = Array.from({ length: 6 }, (_, k) => `<i class="${k < n ? "on" : ""}"></i>`).join("");
  return head(w, `
.brand { position: absolute; left: 64px; top: 52px; display: flex; align-items: center; gap: 12px; font-family: "Bricolage Grotesque", "Noto Sans SC", sans-serif; font-weight: 800; font-size: 28px; letter-spacing: -.01em; }
.brand svg { width: 42px; height: 42px; transform: rotate(-8deg); }
.cta { position: absolute; right: 64px; top: 50px; padding: 12px 22px; border-radius: 999px; background: var(--ink); color: #fff; font-weight: 700; font-size: 24px; box-shadow: 0 5px 0 var(--sh); }
.cta b { color: var(--sh); }
.left { position: absolute; left: 64px; top: 128px; width: 560px; }
.stamp { display: inline-block; padding: 6px 18px; border: 4px solid var(--tone); border-radius: 12px; background: #fff; color: var(--tone); font-weight: 700; font-size: 26px; letter-spacing: .08em; text-transform: uppercase; transform: rotate(-4deg); box-shadow: 4px 4px 0 var(--ink); }
.v { margin-top: 16px; font-family: ${L.font}, var(--f-display); font-weight: 800; line-height: .98; letter-spacing: -.035em; text-shadow: 6px 6px 0 var(--sh); }
.v span { display: block; font-size: ${lang === "zh" ? 118 : 122}px; }
.score { display: flex; align-items: center; gap: 22px; margin-top: 22px; }
.n { font-family: var(--f-display); font-weight: 800; font-size: 64px; line-height: 1; }
.n small { font-size: .5em; opacity: .6; }
.meter { position: relative; display: flex; gap: 8px; }
.meter i { width: 38px; height: 24px; border: 3px solid var(--ink); border-radius: 7px; background: #fff; }
.meter i.on { background: var(--ink); }
.meter::after { content: ""; position: absolute; left: calc(4 * 46px - 5px); top: -10px; bottom: -10px; width: 3px; border-radius: 2px; background: var(--ink); }
.of { margin-top: 8px; font-size: 21px; font-weight: 700; opacity: .75; }
.sticker { position: absolute; right: 60px; top: 150px; width: 520px; padding: 14px; border: 3.5px solid var(--ink); border-radius: 28px; background: #fff; box-shadow: 12px 12px 0 var(--ink); transform: rotate(3deg); }
`) + `
<div class="brand">${face(1)}${L.brand}</div>
<div class="cta">${L.cta} <b>→</b> adhd-form.vercel.app</div>
<div class="left">
  <span class="stamp">${stamp}</span>
  <h1 class="v"><span>${l1}</span><span>${l2}</span></h1>
  <div class="score"><span class="n">${n}<small>/6</small></span><div class="meter">${cells}</div></div>
  <p class="of">${L.of(n)}</p>
</div>
<div class="sticker"><div class="film" style="background:${TINT[lvl]}">${film(scene, lvl)}</div></div>
<div class="grain"></div>
</body></html>`;
}

// Pull face() and the scenes out of index.html; the frame time is picked per scene for a good pose.
const { face, SC } = new Function(`${drawing}; return { face, SC };`)();
const POSE = { finish: 1.6, juggle: 1.1, forget: 1.4, avoid: 1.3, fidget: 0.9, wheel: 1.3 };
function film(name, i) {
  const inner = SC[name](POSE[name], i);
  return `<svg viewBox="0 0 320 180" style="display:block;width:100%;height:100%"><defs><filter id="b" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter></defs><g filter="url(#b)"><g class="mis" transform="translate(2.4 1.8)">${inner}</g>${inner}</g></svg>`;
}

const tmp = mkdtempSync(join(tmpdir(), "og-"));
const only = process.argv[2];
const jobs = [["home", home], ...["zh", "en"].flatMap(lang => [0, 1, 2, 3, 4, 5, 6].map(n => [`${lang}-${n}`, () => page(lang, n)]))];
for (const [slug, make] of jobs) {
  if (only && only !== slug) continue;
  const html = join(tmp, `${slug}.html`);
  writeFileSync(html, make());
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1200,630", "--virtual-time-budget=8000", `--screenshot=${join(process.cwd(), "og", slug + ".png")}`, `file://${html}`], { stdio: "ignore" });
  console.log(`og/${slug}.png`);
}
rmSync(tmp, { recursive: true, force: true });
