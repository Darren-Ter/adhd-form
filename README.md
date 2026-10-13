# ADHD 30s Check · ADHD 30 秒自测

A six-question adult ADHD screening, one tap per question, in Simplified Chinese and English. It is based on the WHO Adult ADHD Self-Report Scale (ASRS v1.1) Part A, with adapted question wording and its standard cut-off: four or more answers in the shaded range is a positive screen. It is a screening, not a diagnosis.

[Try the screening](https://adhd-form.vercel.app) · [Source code](https://github.com/Darren-Ter/adhd-form) · [MIT license](LICENSE)

六道题，中英双语，每题点一下。答案保存在浏览器里，不上传；只有主动分享时，链接才会带上分数。这是筛查，不是诊断。本项目使用改写后的题目和生活化例子，并非官方量表或经过独立验证的中文译本。

The app includes animated SVG cartoons, keyboard answers (1–5), saved progress, and shareable result links. The question wording and examples are adapted for this interface; this adaptation has not been independently validated. See [Screening instrument](#screening-instrument) for the official source and its terms.

## Privacy

Your answers and your result never leave your browser. You don't have to take our word for it:

- **No server code, no analytics.** The site is static files. Answers are kept in `localStorage` so you can resume; "Start over" clears them.
- **The browser enforces it.** Every page ships this Content-Security-Policy (see `build.mjs`):

  ```
  default-src 'none'; script-src 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self';
  img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'
  ```

  `connect-src 'none'` means the browser refuses every `fetch`, XHR, `sendBeacon` and WebSocket from the page, and `img-src data:` stops data from being smuggled out in image URLs. Fonts are served from this site, so no third-party font provider receives a request from your browser.
- **Check it yourself.** View the page source and find the `Content-Security-Policy` tag, or open DevTools → Network, take the test, and watch: after the page and its fonts load, nothing else is requested.

The one exception is sharing, which you choose to do. A shared link such as `/r/zh-5` carries the score in its address, so whoever opens it, and the host's request logs, can see that score.

### 隐私

答案和结果只存在你自己的浏览器里，不会上传。网站是纯静态文件，没有后端，也没有统计代码。每个页面都带有上面的安全策略（Content-Security-Policy），浏览器会拦下这个网页发出的任何数据请求。你可以查看网页源代码找到这条策略，或者打开开发者工具的 Network 面板，做完测试后会看到除了网页和字体，没有任何请求。唯一的例外是你主动分享：分享链接（例如 `/r/zh-5`）里会带上分数。

## Run it locally

You need Node.js 18 or newer and Python 3 for the local server. The fonts and preview images are committed, so a normal build needs no downloads, npm packages, or Chrome.

```sh
git clone https://github.com/Darren-Ter/adhd-form.git
cd adhd-form
node build.mjs                                 # builds dist/
python3 -m http.server 4173 --directory dist   # then open http://localhost:4173
```

Try a shared result at [http://localhost:4173/r/zh-5](http://localhost:4173/r/zh-5) or [http://localhost:4173/r/en-5](http://localhost:4173/r/en-5).

## Project layout

| File or directory | Purpose |
| --- | --- |
| `index.html` | App copy, styles, SVG cartoons, scoring, and behavior; a page fragment wrapped by the build |
| `build.mjs` | Builds 15 pages in `dist/`: the homepage and scores 0–6 in both languages, with preview metadata and the privacy CSP |
| `fonts.mjs`, `fonts/` | Font subset generator and the bundled fonts |
| `og.mjs`, `og/` | Preview image generator and the bundled 1200 × 630 images |
| `licenses/`, `THIRD_PARTY_NOTICES.md` | Font licenses and screening instrument attribution |
| `vercel.json` | Static deployment configuration |

No dependencies and no `package.json`.

## Deploy your own copy

Any static host can serve `dist/`. Set your site's public URL at build time so result links and preview metadata point to your deployment:

```sh
SITE_URL=https://your-site.example node build.mjs
```

For Vercel, import your fork and use the committed `vercel.json`: build command `node build.mjs`, output directory `dist`, no install command. Set `SITE_URL` in the project environment. Pushing to the production branch triggers deployment.

When customizing a fork, also update `SOURCE_URL` in `index.html` and the visible site address in `og.mjs`, then regenerate the assets below.

## Regenerating assets

- `node fonts.mjs` downloads the fonts from Google Fonts into `fonts/`, cut down to the characters the app uses. Rerun it after changing text in `index.html` or `og.mjs` and commit the regenerated fonts. This development command needs internet access; the built site serves fonts locally.
- `node og.mjs` renders all link-preview images in `og/` with headless Chrome. Set `CHROME=/path/to/chrome` if it isn't in the default macOS location. To render one image, use `node og.mjs zh-5`. Regenerate after changing result copy, faces, scenes, or result colors; inspect and commit the images.
- Run `node build.mjs` again after regenerating assets.

## Contributing

Issues and pull requests are welcome. Update Chinese and English together, preserve the ASRS cut-offs and `adhd90:*` storage keys, and keep the app free of analytics and external runtime requests. Preserve the comment markers used by `og.mjs` and the first `</style>` split used by `build.mjs`.

There are no automated tests. Before submitting a change, build and check both languages, the screening flow, saved progress, and shared results in a browser. Check widths of 320, 390, 768, and at least 1280 px, plus a tall window: there must be no sideways scrolling or console errors. Check `prefers-reduced-motion` if you change animation. Leave the bottom-left strip of preview images clear for X's title overlay.

## Screening instrument

The [official ASRS v1.1 six-question screener and translations](https://license.tov.med.nyu.edu/product/asrs6Qscreener) are available from NYU Langone. The screener is derived from the 18-question ASRS v1.1 Symptom Checklist and was developed by Lenard Adler (NYU) and Ronald C. Kessler (Harvard). © New York University and the President and Fellows of Harvard College.

NYU's published terms allow clinical, non-clinical, and commercial use with attribution, and permit electronic versions but prohibit other modifications. This app uses paraphrased questions and additional examples; it is an adaptation, rather than an official validated version. Consult those terms before reusing the screening content. The project's MIT license does not grant rights to the ASRS instrument.

## License

Original project code, artwork, and documentation are available under the [MIT license](LICENSE). Third-party material retains its own terms: the bundled fonts use the SIL Open Font License 1.1, and the ASRS instrument is covered separately as described above. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the license texts in [licenses/](licenses/). The build includes these notices in `dist/`.
