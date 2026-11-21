#!/usr/bin/env node
/*
 * 静态渠道（GitHub Pages）发布变体生成器。
 *
 * 虎扑自包含版 = 仓库里的 index.html 原样（两张共享精灵图仍以 data: URI 内联）。
 * Pages 外链版 = 本脚本产出的 dist/index.html：只把 .avatar / .avatar.b2 两条规则的
 * background-image 换成 assets/<sha1前10位>.webp，其余字节完全一致。
 * 两份产物来自同一份 index.html，逻辑改动永远只改源头。
 *
 * 用法: node scripts/build-static.mjs [--out dist]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'index.html');

/* 设计文档 2.3 节锁定的两张共享精灵图（内容哈希即文件名） */
const SHEETS = [
  { selector: '.avatar', sha256: 'fba3bdfd02d80a7d61d43f8e28124f3c550295eb487856f3c52cd0208e0c2773' },
  { selector: '.avatar.b2', sha256: '193e037e0ff342c6a6a517e7678a4cc4af4d920d88fae2728419b4e3e830a378' },
];

const outArg = process.argv.indexOf('--out');
const OUT = path.resolve(ROOT, outArg > -1 ? process.argv[outArg + 1] : 'dist');

const sha = (buf, alg) => crypto.createHash(alg).update(buf).digest('hex');
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let html = fs.readFileSync(SRC, 'utf8');
let removed = 0;
const emitted = [];

for (const { selector, sha256 } of SHEETS) {
  const m = new RegExp(`(^|\\n)${escRe(selector)} \\{`).exec(html);
  if (!m) throw new Error(`找不到 CSS 规则: ${selector}`);
  const start = m.index + m[1].length;
  const end = html.indexOf('}', start);
  const rule = html.slice(start, end);

  const um = /url\("\s*(data:image\/webp;base64,[A-Za-z0-9+/=]+)\s*"\)/.exec(rule);
  if (!um) throw new Error(`${selector} 内没有内联 WebP，可能已经外置过`);
  const dataUri = um[1];
  const buf = Buffer.from(dataUri.slice(dataUri.indexOf(',') + 1), 'base64');

  const got = sha(buf, 'sha256');
  if (got !== sha256) throw new Error(`${selector} SHA-256 不符: ${got} != ${sha256}`);
  const name = sha(buf, 'sha1').slice(0, 10) + '.webp';
  const assetPath = path.join(ROOT, 'assets', name);
  if (!fs.existsSync(assetPath)) throw new Error(`缺少资产文件 assets/${name}，请先按内容哈希落盘`);
  if (!fs.readFileSync(assetPath).equals(buf)) throw new Error(`assets/${name} 与内联字节不一致`);

  const extUrl = `assets/${name}`;
  const newRule = rule.replace(um[0], `url("${extUrl}")`);
  html = html.slice(0, start) + newRule + html.slice(end);
  removed += um[0].length - `url("${extUrl}")`.length;
  emitted.push({ selector, name, srcBytes: buf.length, sha256 });
}

fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
for (const e of emitted) fs.copyFileSync(path.join(ROOT, 'assets', e.name), path.join(OUT, 'assets', e.name));
fs.writeFileSync(path.join(OUT, 'index.html'), html);

const before = fs.statSync(SRC).size;
const after = fs.statSync(path.join(OUT, 'index.html')).size;
console.log(`源 (虎扑内联版)      : index.html ${(before / 1048576).toFixed(2)} MiB`);
console.log(`产物 (Pages 外链版)  : ${path.relative(ROOT, path.join(OUT, 'index.html'))} ${(after / 1048576).toFixed(2)} MiB`);
console.log(`HTML 减少            : ${(removed / 1024).toFixed(0)} KiB`);
for (const e of emitted) console.log(`  ${e.selector} -> assets/${e.name} (${e.srcBytes} B, sha256 ${e.sha256.slice(0, 16)}…)`);
