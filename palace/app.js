/* 《后宫生存法则》· 宫廷版 —— app.js
 * 流程：首页 → 设定（路线+出身）→ 习技 → 揭幕 → 十二章（事件穿插）→ 结局 → 海报
 * 依《开发任务书 v1.1》§1/§3/§4/§7/§8/§9 实现。纯静态、无存档。 */

/* ---------- 工具 ---------- */
const $ = id => document.getElementById(id);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const round10 = v => Math.round(v / 10) * 10;

/* ---------- 状态 ---------- */
const S = {
  route: null, origin: null,
  attrs: {}, lockedFrom: {}, claimed: new Set(), swapsLeft: 3, picks: 0,
  faction: null, person: null, poolAttrs: {}, batch: [],
  ovr: 0, deBuPei: 0, title: '', startFaction: '',
  ch: 0, health: 100, troops: 0,
  sec: { fame:0, network:0, loyalty:0, ambition:0, controversy:0 },
  flags: [], taunts: 0, personalFail: 0, merit: 0, scenes: 0,
  bios: [], eventsUsed: [], eventsFired: 0,
  finalChoice: null, deadPending: false, endingId: null, score: 0,
  gamble: false, selfStreak: 0, fate: null
};

const TIER_POINTS = { '大胜':3, '胜':2, '僵持':1, '败':0 };
const EVENT_AFTER_CHAPTERS = [2, 4, 6, 8, 10];

/* ---------- 屏幕 ---------- */
function showScreen(name) {
  window.__curScreen = name;
  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  $('screen-' + name).classList.remove('hidden');
  const label = { home:'《后宫生存法则》', setup:'设定', draft:'习技', unveil:'揭幕', chapter:'宫中十二章', ending:'结局', poster:'命运判词', records:'我的纪事榜', gallery:'人物录 · 成就' }[name];
  $('progress').textContent = label || '';
  window.scrollTo(0, 0);
}

/* ---------- 设定 ---------- */
function renderSetup() {
  $('route-list').innerHTML = ROUTE_ORDER.map(r =>
    `<button class="pick-card" data-route="${r}"><div class="pick-name">${r}</div>
     <div class="pick-desc">${ATTR_KEYS.map(k => ATTR_NAMES[k] + ' ' + ROUTE_TEMPLATES[r][k]).join(' · ')}</div></button>`).join('');
  $('origin-list').innerHTML = ORIGINS.map((o, i) =>
    `<button class="pick-card" data-origin="${i}"><div class="pick-name">${o.name}</div>
     <div class="pick-desc">${o.desc}｜修正：${Object.entries(o.initFix).map(([k,v]) => ATTR_NAMES[k] + '+' + v).join('、')}</div></button>`).join('');
  document.querySelectorAll('[data-route]').forEach(b => b.onclick = () => {
    S.route = b.dataset.route;
    document.querySelectorAll('[data-route]').forEach(x => x.classList.toggle('active', x === b));
    syncSetupBtn();
  });
  document.querySelectorAll('[data-origin]').forEach(b => b.onclick = () => {
    S.origin = ORIGINS[+b.dataset.origin];
    document.querySelectorAll('[data-origin]').forEach(x => x.classList.toggle('active', x === b));
    syncSetupBtn();
  });
}
function syncSetupBtn() { $('btn-to-draft').disabled = !(S.route && S.origin); }

/* ---------- 习技 ---------- */
function factionExhausted(f) { return f.people.every(p => S.claimed.has(f.name + '-' + p.name)); }
function rollFaction() {
  const avail = FACTIONS.filter(f => !factionExhausted(f));
  S.faction = pick(avail);
  S.person = null;
  S.poolAttrs = {};
  const unclaimed = S.faction.people.filter(p => !S.claimed.has(S.faction.name + '-' + p.name));
  S.batch = drawBatch(unclaimed, tianmingBoost);
  tianmingBoost = false;
  S.batch.forEach(p => { S.poolAttrs[p.name] = genPlayerAttr(p.route, p.tier, p.special, p.name); });
}
/* 按稀有度权重不放回抽取一批（每批 5 人）：S 权重最低、D 最高，顶配人物明显更稀有 */
function drawBatch(people, boostS) {
  const wOf = p => (TIER_WEIGHT[p.tier] || 1) * (boostS && p.tier === 'S' ? 4 : 1);
  const pool = people.slice(), out = [];
  /* v5.10：时运临身改为保底——本批必含 1 名 S 与 1 名 A（池中尚有时），其余再按权重抽。
     原仅 S 权重 ×4，实测约 3/4 的批次一个 S 都没有，看广告换个 B 名不副实。 */
  if (boostS) {
    for (const tier of ['S', 'A']) {
      const cand = pool.filter(p => p.tier === tier);
      if (cand.length) out.push(pool.splice(pool.indexOf(pick(cand)), 1)[0]);
    }
  }
  while (pool.length && out.length < 5) {
    let total = 0;
    for (const p of pool) total += wOf(p);
    let r = Math.random() * total, idx = pool.length - 1;
    for (let i = 0; i < pool.length; i++) { r -= wOf(pool[i]); if (r <= 0) { idx = i; break; } }
    out.push(pool.splice(idx, 1)[0]);
  }
  if (boostS) { /* 保底位洗牌，避免 S/A 永远排在最前 */
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  }
  return out;
}
function startDraft() {
  clearSave();  /* v5.5：开新局清旧存档 */
  S.__recorded = false;  /* v5.7：新局重置记账标记 */
  S.__collected = false;  /* v5.8：新局重置收集标记 */
  S.attrs = {}; S.lockedFrom = {}; S.claimed = new Set(); S.swapsLeft = 3; S.picks = 0;
  rollFaction();
  showScreen('draft');
  renderDraft();
  refreshAdState();
}
let __mineSig = '';
function renderMinePanel() {
  const el = $('draft-mine');
  if (!el) return;
  /* 性能：面板内容只随 picks/attrs/route 变，未变时跳过重渲染（选人时不再整块重绘） */
  const sig = S.picks + '|' + S.route + '|' + ATTR_KEYS.map(k => S.attrs[k] || '').join(',');
  if (sig === __mineSig) return;
  __mineSig = sig;
  const filled = {};
  for (const k of ATTR_KEYS) filled[k] = (k in S.attrs) ? S.attrs[k] : ROUTE_TEMPLATES[S.route][k];
  const est = computeOVR(S.route, filled);
  el.innerHTML = `<div class="mine-title">🌸 我的班底（已锁定 ${S.picks} / 8）｜预估总评 <b style="color:#E62B1E;">${est} / 100</b><span class="grade">${attrGrade(est)}</span>（未习项按${S.route}底子估）</div>
    <div class="attr-grid">${ATTR_KEYS.map(k => (k in S.attrs)
      ? `<div class="attr-cell"><div class="a-name">${ATTR_NAMES[k]}</div><div class="a-val">${S.attrs[k]}</div><div class="a-grade">${attrGrade(S.attrs[k])}</div></div>`
      : `<div class="attr-cell empty"><div class="a-name">${ATTR_NAMES[k]}</div><div class="a-val">—</div></div>`).join('')}</div>`;
}
/* 一期头像（S/A 21 人）精灵图位置：7 列 × 3 行，行序见 v4-assets */
const CH_ART = {"1": "./assets/ch-art-1.webp", "2": "./assets/ch-art-2.webp", "3": "./assets/ch-art-3.webp", "4": "./assets/ch-art-4.webp", "5": "./assets/ch-art-5.webp", "6": "./assets/ch-art-6.webp", "7": "./assets/ch-art-7.webp", "8": "./assets/ch-art-8.webp", "9": "./assets/ch-art-9.webp", "10": "./assets/ch-art-10.webp", "11": "./assets/ch-art-11.webp", "12": "./assets/ch-art-12.webp"};
const AVATAR_POS = {};
const AVATAR_POS2 = {"陆挽真": "0.0% 0.0%", "沈静姝": "20.0% 0.0%", "苏锦瑟": "40.0% 0.0%", "赵明仪": "60.0% 0.0%", "程又青": "80.0% 0.0%", "贺兰敏": "100.0% 0.0%", "温叙白": "0.0% 25.0%", "林晚照": "20.0% 25.0%", "许清晏": "40.0% 25.0%", "秦望舒": "60.0% 25.0%", "柳新雁": "80.0% 25.0%", "方绮罗": "100.0% 25.0%", "郑含章": "0.0% 50.0%", "白露未": "20.0% 50.0%", "高福宁": "40.0% 50.0%", "陶夭夭": "60.0% 50.0%", "孟姜梨": "80.0% 50.0%", "罗绛仙": "100.0% 50.0%", "豆蔻": "0.0% 75.0%", "韩玉簪": "20.0% 75.0%", "卫明珠": "40.0% 75.0%", "春桃": "60.0% 75.0%", "阿箬": "80.0% 75.0%", "孙巧姐": "100.0% 75.0%", "钱宝珠": "0.0% 100.0%", "杜若": "20.0% 100.0%", "姜蜜儿": "40.0% 100.0%", "胡三姐": "60.0% 100.0%", "田穗儿": "80.0% 100.0%", "莫问秋": "100.0% 100.0%"};
function avatarHTML(name, cls) {
  const pos = AVATAR_POS[name];
  if (pos) return `<span class="avatar ${cls || ''}" style="background-position:${pos}"></span>`;
  const pos2 = AVATAR_POS2[name];
  if (pos2) return `<span class="avatar b2 ${cls || ''}" style="background-position:${pos2}"></span>`;
  return '';
}
function renderDraft() {
  renderMinePanel();
  $('draft-count').textContent = `已习 ${S.picks} / 8`;
  $('btn-swap').textContent = `🔀 换一批（剩 ${S.swapsLeft} 次）`;
  $('btn-swap').disabled = S.swapsLeft <= 0 || !!S.person;
  const stage = $('draft-stage');
  if (!S.person) {
    const remain = S.faction.people.filter(p => !S.claimed.has(S.faction.name + '-' + p.name)).length;
    stage.innerHTML = `<div class="faction-name">🌸 本批宫室：${S.faction.name}（选 1 名人物 · 本宫室库中尚余 ${remain} 人）</div>
      <div class="people-grid">${S.batch.map(p => {
        const decay = routeDecay(S.route, p.route);
        const all = S.poolAttrs[p.name];
        const povr = computeOVR(p.route, all);
        const top3 = ATTR_KEYS.slice().sort((a, b) => all[b] - all[a]).slice(0, 3)
          .map(k => `${ATTR_NAMES[k]} ${all[k]}<span class="grade">${attrGrade(all[k])}</span>`).join(' · ');
        return `<button class="person-card tier-${p.tier.toLowerCase()}${p.tier === 'S' ? ' tier-top' : ''}" data-person="${p.name}">
          ${avatarHTML(p.name)}
          <div class="person-name">${p.name}<span class="grade">${attrGrade(povr)}</span></div>
          <div class="person-meta">${p.route} · ${RARITY_LABEL[p.tier]} · 总评 ${povr} / 100 · 衰减 ×${decay.toFixed(2)}</div>
          <div class="person-top">${top3}</div>${p.trait ? `<div style="font-size:11px;color:#a07c20;margin-top:2px;">绝活「${p.trait}」</div>` : ''}</button>`;
      }).join('')}</div>`;
    stage.querySelectorAll('[data-person]').forEach(b => b.onclick = () => {
      S.person = S.faction.people.find(p => p.name === b.dataset.person);
      renderDraft();
    });
  } else {
    const p = S.person, all = S.poolAttrs[p.name], decay = routeDecay(S.route, p.route);
    stage.innerHTML = `<span class="tier-${p.tier.toLowerCase()}" style="display:inline-block;">${avatarHTML(p.name, 'med')}</span><div class="faction-name">${S.faction.name} · ${p.name}（${p.route}）——夺走哪一项？</div>
      <div class="hint" style="margin:0 0 8px;">${RARITY_LABEL[p.tier]}人物 · ${decay < 1 ? `跨路线衰减 ×${decay.toFixed(2)}（下方为衰减后数值，绝活标注原值）` : '与你同路线，无衰减'}</div>
      <div class="attr-grid">${ATTR_KEYS.map(k => {
        const locked = k in S.attrs;
        const val = Math.max(30, Math.floor(all[k] * decay));
        const over = val > ( (S.poolAttrs[p.name].tipo + S.poolAttrs[p.name].xinji) / 2 + 30 );
        const origTag = (k === p.special && !locked && decay < 1) ? ` · 原 ${all[k]}` : '';
        return `<button class="attr-btn" data-attr="${k}" ${locked ? 'disabled' : ''}>
          <div class="a-name">${ATTR_NAMES[k]}</div><div class="a-val">${locked ? S.attrs[k] : val}</div><div class="a-grade">${attrGrade(locked ? S.attrs[k] : val)}${origTag}</div></button>`;
      }).join('')}</div>
      <p class="hint" style="margin-top:10px;">点一项即锁定为你的最终属性（已含衰减）。</p>`;
    stage.querySelectorAll('[data-attr]').forEach(b => b.onclick = () => lockAttr(b.dataset.attr));
  }
  const lockedKeys = Object.keys(S.attrs);
  $('draft-locked').innerHTML = lockedKeys.length
    ? '已锁定：' + lockedKeys.map(k => `${ATTR_NAMES[k]} ${S.attrs[k]}（${S.lockedFrom[k]}）`).join(' · ')
    : '尚未锁定任何属性。';
  syncAllAdBtns();
  if (S.route && S.picks < 12) saveGame('draft');  /* v5.5 存档点：习技每次渲染后落盘 */
}
function lockAttr(key) {
  const p = S.person, all = S.poolAttrs[p.name], decay = routeDecay(S.route, p.route);
  S.attrs[key] = Math.max(30, Math.floor(all[key] * decay));
  S.lockedFrom[key] = p.name;
  S.claimed.add(S.faction.name + '-' + p.name);
  collectPerson(p);  /* v5.8：宫中人物录点亮 + 累计习技计数 */
  if (p.tier === 'S') unlockAch('firstS');
  S.picks++;
  S.person = null;
  if (S.picks >= 8) { finishDraft(); return; }
  rollFaction();
  renderDraft();
}

/* ---------- 揭幕结算（任务书 §1 顺序：锁定 → 出身修正 → 钳上限 99 → 重算根基尚浅） ---------- */
function computeDeBuPei(attrs) {
  const th = (attrs.tipo + attrs.xinji) / 2 + 30;
  return ATTR_KEYS.filter(k => attrs[k] > th).length;
}
function computeTitle() {
  const sorted = ATTR_KEYS.slice().sort((a, b) => S.attrs[b] - S.attrs[a]);
  const top2 = [sorted[0], sorted[1]];
  let t = null;
  for (const pair of TITLE_PAIRS) {
    if (top2.includes(pair.attrs[0]) && top2.includes(pair.attrs[1])) { t = pair.title; break; }
  }
  if (!t) t = (sorted[0] === 'tipo') ? '沉稳如山' : ('无名' + S.route);
  if (S.deBuPei >= 4) t = '根基未稳的' + t;
  return t;
}
function roleRank(ovr) {
  if (ovr >= 84) return '凤仪之相';
  if (ovr >= 76) return '得力之人';
  if (ovr >= 68) return '小有名气';
  return '无名新人';
}
function finishDraft() {
  for (const k in S.origin.initFix) S.attrs[k] += S.origin.initFix[k];
  for (const k of ATTR_KEYS) S.attrs[k] = Math.min(99, S.attrs[k]);
  for (const k of SEC_KEYS) S.sec[k] = 0;
  for (const k in (S.origin.initSec || {})) S.sec[k] = S.origin.initSec[k];
  S.deBuPei = computeDeBuPei(S.attrs);
  S.ovr = computeOVR(S.route, S.attrs);
  S.title = computeTitle();
  S.troops = round10(200 + S.attrs.jiaoji * 15);
  S.health = 100;
  $('unveil-title').textContent = S.title;
  $('unveil-lines').innerHTML =
    `路线 ${S.route} ｜ 总评 <b>${S.ovr} / 100</b><span class="grade">${attrGrade(S.ovr)}</span> ｜ 根基尚浅 <b>${S.deBuPei}</b> 项<br>` +
    `角色定位：${roleRank(S.ovr)} ｜ 初始人脉值 ${S.troops} ｜ 出身：${S.origin.name}`;
  $('unveil-attrs').innerHTML = ATTR_KEYS.map(k => {
    const th = (S.attrs.tipo + S.attrs.xinji) / 2 + 30;
    return `<div class="attr-cell"><div class="a-name">${ATTR_NAMES[k]}${S.attrs[k] > th ? ' ⚠️' : ''}</div><div class="a-val">${S.attrs[k]}</div><div class="a-grade">${attrGrade(S.attrs[k])}</div></div>`;
  }).join('');
  if (S.deBuPei === 0) unlockAch('noDeBuPei');  /* v5.8 成就：德才兼备 */
  showScreen('unveil');
}

/* ---------- 掷骰（任务书 §4.3） ---------- */
/* ---------- 本局时运（v5.6 反固定：每局开局随机一条全局规则） ---------- */
const FATES = [
  { id:'clear', name:'天朗气清', desc:'所有判定成功率 +4', rateAll:4 },
  { id:'grace', name:'贵人提携', desc:'交际判定 +8 · 心计判定 +4', rateKeys:{ jiaoji:8, xinji:4 } },
  { id:'arts',  name:'才情焕发', desc:'才艺判定 +8 · 交际判定 +4 · 体魄判定 −4', rateKeys:{ caiyi:8, jiaoji:4, tipo:-4 } },
  { id:'house', name:'门第生辉', desc:'家世判定 +8 · 心计判定 +4', rateKeys:{ jiashi:8, xinji:4 } },
  { id:'night', name:'夜长梦多', desc:'心计判定 +8 · 交际判定 +4', rateKeys:{ xinji:8, jiaoji:4 } },
  { id:'miasma',name:'暑气蒸郁', desc:'才艺、心计判定 +8 · 每章章首多扣 2 点恩宠', rateKeys:{ caiyi:8, xinji:8 }, chapterHealth:-2 },
  { id:'hearts',name:'人心思安', desc:'声望收益 +50%', fameMul:1.5 },
  { id:'grain', name:'份例丰足', desc:'人脉收益 +30%', troopsMul:1.3 },
  { id:'plague',name:'流言四起', desc:'所有判定 +6 · 每章章首多扣 3 点恩宠', rateAll:6, chapterHealth:-3 },
  { id:'fair',  name:'顺风顺水', desc:'每章章首回复 2 点恩宠', chapterHealth:2 }
];
function fateRateDelta(key) {
  const f = S.fate;
  if (!f) return 0;
  return (f.rateAll || 0) + ((f.rateKeys && f.rateKeys[key]) || 0);
}

function successRate(checkKey) {
  return clamp(Math.round(35 + (S.attrs[checkKey] - 60) * 0.8 - S.deBuPei * 3) + fateRateDelta(checkKey), 10, 90);
}

/* ---------- 后果结算（任务书 §4.4） ---------- */
function applyEffects(eff) {
  if (!eff) return;
  for (const k of Object.keys(eff)) {
    const v = eff[k];
    if (k === 'health') S.health = clamp(S.health + v, 0, 100);
    else if (k === 'troops') {
      let gain = 0;
      if (v === 'recruit') gain = round10(S.attrs.charisma * 10);
      else if (v === 'recruit60') gain = round10(S.attrs.charisma * 10 * 0.6);
      else gain = v;
      if (gain > 0 && S.fate && S.fate.troopsMul) gain = Math.round(gain * S.fate.troopsMul);  /* v5.6 时运：人脉收益 */
      S.troops += gain;
      S.troops = Math.max(0, S.troops);
    }
    else if (k === 'perm') { for (const pk of Object.keys(v)) S.attrs[pk] = clamp(S.attrs[pk] + v[pk], 40, 99); }
    else if (k === 'flag') { if (!S.flags.includes(v)) S.flags.push(v); }
    else if (SEC_KEYS.includes(k)) {
      let val = v;
      if (k === 'fame' && val > 0 && S.fate && S.fate.fameMul) val = Math.round(val * S.fate.fameMul);  /* v5.6 时运：声望收益 */
      if (k === 'fame' && val > 0 && S.origin.fameGrowBonus) val += 1;
      if (k === 'network' && val > 0 && S.origin.secGrowBonus) val = Math.ceil(val * 1.5);
      S.sec[k] = clamp(S.sec[k] + val, -10, 20);
    }
  }
}

/* 后果预览（v2：选项点之前先标明赌注） */
function effectSummary(eff) {
  if (!eff) return '无';
  const parts = [];
  for (const k of Object.keys(eff)) {
    const v = eff[k];
    if (k === 'health') parts.push(`恩宠${v > 0 ? '+' : ''}${v}`);
    else if (k === 'troops') {
      if (v === 'recruit') parts.push('人脉+招募');
      else if (v === 'recruit60') parts.push('人脉+招募六成');
      else parts.push(`人脉${v > 0 ? '+' : ''}${v}`);
    }
    else if (k === 'perm') { for (const pk of Object.keys(v)) parts.push(`${ATTR_NAMES[pk]}永久${v[pk] > 0 ? '+' : ''}${v[pk]}`); }
    else if (k === 'flag') { /* 标记不在预览里剧透 */ }
    else if (SEC_KEYS.includes(k)) parts.push(`${SEC_NAMES[k]}${v > 0 ? '+' : ''}${v}`);
  }
  return parts.length ? parts.join('·') : '无得失';
}

/* 效果缩放（赌一把：数值翻倍；招募类先按当前魅力折算为数值再翻倍，标记不翻倍） */
function scaleEffects(eff, mult) {
  if (!eff) return eff;
  const out = {};
  for (const k of Object.keys(eff)) {
    const v = eff[k];
    if (k === 'troops' && v === 'recruit') out[k] = round10(S.attrs.charisma * 10) * mult;
    else if (k === 'troops' && v === 'recruit60') out[k] = round10(S.attrs.charisma * 10 * 0.6) * mult;
    else if (k === 'perm') { out[k] = {}; for (const pk of Object.keys(v)) out[k][pk] = v[pk] * mult; }
    else if (typeof v === 'number') out[k] = v * mult;
    else out[k] = v;
  }
  return out;
}

/* 自保连罚（正式规则）：连续选「自保」逐级加重，按连选次数查表；
 * 连选满 10 次累计：声望 -16 · 人脉 -1150 · 争议 +7 */
const SELF_PENALTY = [
  null, null, null,
  { fame:-1, troops:-50 },
  { fame:-1, troops:-80, controversy:1 },
  { fame:-2, troops:-120, controversy:1 },
  { fame:-2, troops:-150, controversy:1 },
  { fame:-2, troops:-170, controversy:1 },
  { fame:-2, troops:-190, controversy:1 },
  { fame:-3, troops:-190, controversy:1 },
  { fame:-3, troops:-200, controversy:1 }
];
function selfPenalty(streak) {
  if (streak < 3) return null;
  return SELF_PENALTY[Math.min(streak, SELF_PENALTY.length - 1)];
}

/* ---------- 章节备套（v5.9 双简报：同章第二套简报+选项，结构与原套同构，每局随机抽） ---------- */
const CHAPTER_ALTS = {"1": "分派的旨意晌午才到，你们在宫门口站了半日，鞋底都站热了。管事姑姑展开名册，一个名字一个名字往下念。同批的白露未缀在队尾，包袱带子忽然断了，东西撒了一地，前头的人，一个也没回头。", "10": "那日你替贵妃宫里送一匣首饰回去，顺手替沈静姝归置妆匣。指尖碰到匣底一块松动的木片，底下压着一封信，字迹是男子的，没有落款，第一行就是个亲昵得过了分的称呼。你只看了一行，就把木片按回去，站起来时，腿有点软。", "11": "万寿宴开席前夜，宫里静得反常。该送的礼送了，该递的话递了，每个人都回到了自己的位置上。你坐在灯下把这一年的人和事捋了一遍，捋到最后发现：棋盘上只剩你这一子，还没落下。", "12": "尘埃落定的那天早上，你醒得很早。这一程的是非恩怨，都有了说法，只剩你自己的去处还没定。往前，是接着争一条路；靠着，是寻个安稳；再不然，转身出这道宫门——三条路，都不回头。", "2": "天没亮透，请安的队伍已经跪满了院子。程又青站在廊下，声音不高，一字一字都砸在人心上：昨儿的错，今儿得有个说法。她环顾一周，目光最后落在你们新人身上：谁来说，错在哪儿？", "3": "领差事这日，针线房、茶水房、库房三处的人都来了，站在院里由着你们打量。程又青把三块木牌往桌上一扣：差事自己挑，挑中了，是好是歹都自己担着，往后别哭。", "4": "菊花开得正盛，贵妃的赏菊宴摆在临水亭子里，酒过两巡，丝竹声渐渐低下去。沈静姝忽然搁了筷子，笑着说新人里头多的是才艺好的，叫出来亮一亮，也给宴上添点意思。满席的眼睛，一齐往你们这边转。", "5": "那句闲话你是从两个小宫女的窃笑里听全的：深夜、御花园、侍卫，连衣裳的颜色都给你编派好了。偏这日你领了往冷宫送东西的差，刚走到门口，就见孟姜梨坐在门槛上晒太阳，她抬眼看你：这话头，我当年也听过。", "6": "年前最冷的一天，皇后宫里先送来一套赤金头面，未时刚过，贵妃宫里的人又捧着一匣南珠进了门。送礼的两个姑姑在院里打了个照面，笑得都十分客气。屋里只剩你和这两份礼，大眼瞪小眼。", "7": "你刚起身，院门就被叩响了。搜宫的来了三个人，话不多，径直奔着箱笼去。翻到最底层，主事的拈出一包东西，掂了掂，回头看你：这是什么，你自己心里清楚。满屋子的人，都在等你开口。", "8": "慈宁宫的药味，隔着两进院子都闻得见。太后这一病，六宫都得轮着去跟前尽孝，排班的单子贴出来，苦的、夜的几班没人认领。管事的把笔一搁：总得有人去，谁去？屋里静得听得见炭盆的响。", "9": "捎口信来的是个上了年纪的嬷嬷，她说冷宫那位如今查到了当年的下文，只差一个肯跑腿的人，把一封信送到该看的人手里。嬷嬷把话说得很慢：这忙帮是不帮，她不强求，就是怕你不知道干系。"};
CHAPTERS.forEach((ch, i) => { const a = CHAPTER_ALTS[i + 1]; if (a) ch.alt = { brief: a, options: ch.options }; });

/* ---------- 章节引擎（任务书 §4.2） ---------- */
function startChapters() {
  S.ch = 0; S.flags = []; S.taunts = 0; S.personalFail = 0; S.merit = 0; S.scenes = 0;
  S.gamble = false; S.selfStreak = 0;
  S.bios = []; S.eventsUsed = []; S.eventsFired = 0; S.finalChoice = null; S.deadPending = false;
  S.jinnang = false; S.rewindLeft = 2;
  S.fate = pick(FATES);  /* v5.6：本局时运开局抽定，整局生效 */
  S.altSet = {};  /* v5.9 双简报：每章五五开抽备套 */
  for (const n of Object.keys(CHAPTER_ALTS)) if (Math.random() < 0.5) S.altSet[n] = true;
  {  /* v5.8：时运见闻收集 */
    const collF = loadCollection();
    if (S.fate && !collF.fates[S.fate.id]) { collF.fates[S.fate.id] = Date.now(); saveCollection(collF); }
    if (Object.keys(collF.fates).length >= 6) unlockAch('fates6');
  }
  rewindSnapshot = null; rewindChapterUsed = 0; rewindAvailable = false;
  showScreen('chapter');
  refreshAdState();
  enterChapter(1);
}
/* 按第 3 章站队 flag 解析本章实际简报与选项组（v4 剧情分支） */
function curChapterOf(n) {
  const ch = CHAPTERS[n - 1];
  if (ch.flagVariants) {
    for (const flag of Object.keys(ch.flagVariants)) {
      if (S.flags.includes(flag)) {
        const fv = ch.flagVariants[flag];
        return Object.assign({}, ch, { brief: fv.brief, options: fv.options });
      }
    }
  }
  if (ch.variants) {
    const key = S.flags.includes('proDong') ? 'proDong' : (S.flags.includes('antiDong') ? 'antiDong' : 'neutral');
    const v = ch.variants[key];
    if (v) return Object.assign({}, ch, { brief: v.brief, options: v.options });
  }
  /* v5.9 双简报：本局抽中备套时用备套（站队/标记变体优先于备套） */
  if (ch.alt && S.altSet && S.altSet[n]) {
    return Object.assign({}, ch, { brief: ch.alt.brief, options: ch.alt.options });
  }
  return ch;
}
function curChapter() { return curChapterOf(S.ch); }
function enterChapter(n) {
  S.ch = n;
  S.gamble = false;
  const ch = curChapterOf(n);
  let note = '';
  if (n === 12) {
    S.health = clamp(S.health + 8, 0, 100);
    note = '终局章：不扣恩宠，休养 +8';
  } else {
    const deduct = S.deBuPei * 2 + randInt(0, 3);
    S.health = clamp(S.health - deduct, 0, 100);
    note = `章首扣恩宠 ${deduct}（根基尚浅 ${S.deBuPei} 项）`;
    if (n === 4 || n === 8) { S.health = clamp(S.health + 8, 0, 100); note += `，休养 +8`; }
  }
  if (S.fate && S.fate.chapterHealth) {  /* v5.6 时运：章首恩宠修正（在存档点之前结算，恢复不重扣） */
    S.health = clamp(S.health + S.fate.chapterHealth, 0, 100);
    note += S.fate.chapterHealth > 0 ? `，时运「${S.fate.name}」+${S.fate.chapterHealth}` : `，时运「${S.fate.name}」${S.fate.chapterHealth}`;
  }
  if (S.health <= 0) { finishEnding('disease'); return; }
  let brief = ch.brief;
  if (n === 2 && S.flags.includes('used_bailu')) brief += '白露未见了你，绕道走了。';
  if (n === 3 && S.flags.includes('helped_bailu')) brief += '白露未听说你领了差事，把攒的点心塞了你一袖子，说：姐姐，饿了就吃。';
  if (n === 5 && S.flags.includes('intel_liu')) brief += '柳新雁替你留了心：传话的路径，她已经摸了个大概。';
  if (n === 6 && S.flags.includes('noticed_shen')) brief += '贵妃宫里的人见了你，笑得比往日甜了三分。';
  if (n === 6 && S.flags.includes('intel_liu')) brief += '柳新雁替你数过了：这个月往皇后宫里跑的人，比上个月多了一倍。';
  if (n === 7 && S.flags.includes('knew_truth')) brief += '当年传闲话的人和今日告发的人，你心里已经对上了号。';
  if (n === 11 && S.flags.includes('helped_bailu')) brief += '白露未把攒了半年的月钱塞给你，说：姐姐，要打点就用这个，我的命都是你给的。';
  if (n === 11 && S.flags.includes('used_bailu')) brief += '白露未远远见了你，退到廊子那头去了。有些人情，欠下了是还不清的。';
  if (n === 11 && S.flags.includes('helped_meng')) brief += '冷宫的门开了一条缝，孟姜梨站在门里，只对你点了点头。';
  if (n === 11 && S.flags.includes('shen_trust')) brief += '沈静姝遣人送来一句话：放心，你的事，就是我的事。';
  if (n === 11 && S.flags.includes('offended_cheng')) brief += '程又青还是那副铁面，只是这一次，她替你把最难走的路先趟了一遍。';
  if (n === 11 && S.flags.includes('allied_lin')) brief += '林晚照在人群里站到了你这一边，什么话都没说，就是站着。';
  if (n === 11 && S.flags.includes('shen_enemy')) brief += '贵妃看你的眼神不一样了。那封信的事，她到底还是知道了。';
  const checkKeys = [...new Set(ch.options.filter(o => o.check).map(o => o.check))];
  const checksLine = checkKeys.length
    ? `<span class="ch-checks">本章看你的：${checkKeys.map(k => `${ATTR_NAMES[k]} ${S.attrs[k]}<span class="grade">${attrGrade(S.attrs[k])}</span>`).join(' · ')}</span>` : '';
  const artEl = $('ch-art');
  if (typeof CH_ART !== 'undefined' && CH_ART[n]) { artEl.style.backgroundImage = `url("${CH_ART[n]}")`; artEl.classList.remove('hidden'); }
  else artEl.classList.add('hidden');
  $('ch-num').textContent = `第 ${n} / 12 章`;
  $('ch-name').textContent = ch.name;
  $('ch-brief').innerHTML = `${brief}<span class="deduct">（${note}，当前恩宠 ${S.health}）</span>${checksLine}`;
  $('ch-result').classList.add('hidden');
  $('btn-chapter-next').classList.remove('on');
  renderChapterOptions(ch);
  refreshChapterUI();
  saveGame('chapter');  /* v5.5 存档点：章首状态（恩宠已结算）落盘，恢复时不再重复扣减 */
}
/* 选项渲染独立成函数：赌一把开关只重渲染选项，不重复扣章首恩宠 */
function gambleRate(rate) { return Math.max(5, Math.floor(rate / 2)); }
function renderChapterOptions(ch) {
  syncAllAdBtns();
  const gBtn = $('btn-gamble');
  const hasCheck = ch.options.some(o => o.check);
  gBtn.classList.toggle('hidden', !hasCheck);
  gBtn.classList.toggle('on', S.gamble);
  gBtn.textContent = S.gamble
    ? '♟ 险棋：开（成功率减半 · 收益与功绩翻倍 · 失败代价加倍）'
    : '♟ 险棋：关（点此开启，走一步险棋）';
  gBtn.onclick = () => { S.gamble = !S.gamble; renderChapterOptions(ch); };
  const box = $('ch-options');
  box.classList.remove('hidden');
  box.innerHTML = ch.options.map((o, i) => {
    let sub = o.kind;
    if (o.check) {
      const r = successRate(o.check);
      sub += ` · 判定${ATTR_NAMES[o.check]} ${S.attrs[o.check]} · 成功率 ${S.gamble ? gambleRate(r) + '%（赌）' : r + '%'}`;
    }
    if (o.taunt) sub += ' · 任性';
    let preview = '';
    if (o.check) {
      const wEff = S.gamble ? scaleEffects(o.win.effects, 2) : o.win.effects;
      const lEff = S.gamble ? scaleEffects(o.lose.effects, 2) : o.lose.effects;
      preview = `<span class="opt-preview">成 → ${effectSummary(wEff)} ｜ 败 → ${effectSummary(lEff)}（判定失败另扣 恩宠-3 · 人脉-50）</span>`;
    } else if (o.fixed) {
      preview = `<span class="opt-preview">后果 → ${effectSummary(o.fixed.effects)}</span>`;
      if (o.kind === '自保') {
        const pen = selfPenalty(S.selfStreak + 1);
        if (pen) preview += `<span class="opt-preview" style="color:#E62B1E;">⚠️ 已连选自保 ${S.selfStreak} 次，再选触发连罚：${effectSummary(pen)}</span>`;
      }
    }
    return `<button class="opt-btn" data-opt="${i}"><b>${o.label}.</b> ${o.text}<span class="opt-sub">${sub}</span>${preview}</button>`;
  }).join('');
  box.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => chooseChapterOption(ch.options[+b.dataset.opt]));
}
function refreshChapterUI() {
  const fateEl = $('ch-fate');
  if (fateEl) {
    fateEl.textContent = S.fate ? `🌌 本局时运：${S.fate.name} —— ${S.fate.desc}` : '';
    fateEl.classList.toggle('hidden', !S.fate);
  }
  $('ch-resbar').innerHTML =
    `<span class="res ${S.health < 30 ? 'warn' : ''}">❤ 恩宠 ${S.health}</span>` +
    `<span class="res">👥 人脉值 ${S.troops}</span>` +
    `<span class="res">声望 ${Math.max(0, S.sec.fame)}</span>` +
    `<span class="res">功绩 ${S.merit}</span>` +
    `<span class="res">名场面 ${S.scenes}</span>` +
    `<span class="res">任性 ${S.taunts}</span>` +
    (S.selfStreak >= 2 ? `<span class="res warn">自保连选 ${S.selfStreak}</span>` : '') +
    (S.personalFail >= 2 ? `<span class="res warn">亲征受挫 ${S.personalFail} 次</span>` : '');
  $('ch-biogs').innerHTML = S.bios.map((b, i) => `<p><b>第${i + 1}章·</b>${b}</p>`).join('') || '<p>尚无。</p>';
}
function chooseChapterOption(opt) {
  const ch = curChapter();
  if (opt.check) {
    rewindSnapshot = {
      health: S.health, troops: S.troops, sec: Object.assign({}, S.sec), merit: S.merit,
      scenes: S.scenes, taunts: S.taunts, personalFail: S.personalFail, selfStreak: S.selfStreak,
      bios: S.bios.slice(), flags: S.flags.slice(), attrs: Object.assign({}, S.attrs)
    };
  }
  if (opt.taunt) S.taunts++;
  let branch, head = '', extraNote = '';
  const gambling = S.gamble && !!opt.check;
  let success = null;
  if (opt.check) {
    const baseRate = successRate(opt.check);
    let rate = gambling ? gambleRate(baseRate) : baseRate;
    let jinnangUsed = false;
    if (S.jinnang) { rate = clamp(rate + 12, 10, 95); jinnangUsed = true; S.jinnang = false; }
    const roll = randInt(1, 100);
    success = roll <= rate;
    const raw = success ? opt.win : opt.lose;
    branch = gambling ? Object.assign({}, raw, { effects: scaleEffects(raw.effects, 2) }) : raw;
    head = `掷骰 ${roll}（成功率 ${rate}%${gambling ? ' · 险棋' : ''}${jinnangUsed ? ' · 香囊护体' : ''}）——${success ? '成了' : '败了'}`;
    if (gambling && success) unlockAch('gambleWin');  /* v5.8 成就：赌徒本色 */
    if (opt.kind === '亲为') {
      if (success && S.attrs[opt.check] >= 85) { S.scenes++; head += ' · 名场面！'; }
      if (!success) S.personalFail++;
    }
    if (opt.scene && success && S.attrs[opt.check] >= 85 && opt.kind !== '亲为') S.scenes++;
  } else {
    branch = opt.fixed;
    head = ch.isFinal ? `终局表态：${opt.text}` : `你选了：${opt.text}`;
  }
  if (opt.finalChoice) S.finalChoice = opt.finalChoice;
  applyEffects(branch.effects);
  /* 判定失败统一另扣（章节与事件通用规则） */
  if (success === false) {
    applyEffects({ health:-3, troops:-50 });
    extraNote = '判定失败另扣：恩宠-3 · 人脉-50';
  }
  /* 自保连选计数与连罚：选非自保即清零 */
  if (opt.kind === '自保') {
    S.selfStreak++;
    const pen = selfPenalty(S.selfStreak);
    if (pen) {
      applyEffects(pen);
      extraNote = (extraNote ? extraNote + '｜' : '') + `自保连选第 ${S.selfStreak} 次，连罚：${effectSummary(pen)}`;
    }
  } else { S.selfStreak = 0; }
  S.gamble = false;
  if (!ch.noMerit && branch.tier) S.merit += (TIER_POINTS[branch.tier] || 0) * (gambling && success ? 2 : 1);
  const bio = (branch.bio || '').replace(/\{人脉\}/g, String(S.troops));
  if (bio) S.bios.push(bio);
  if (S.health <= 0) S.deadPending = true;
  $('ch-options').classList.add('hidden');
  const res = $('ch-result');
  res.classList.remove('hidden');
  /* v2：战报分段揭示——先结果、再得失、最后判词句，继续按钮最后出现 */
  $('ch-result-text').innerHTML =
    `<div class="r-head reveal" id="rv-1">${head}${branch.tier && !ch.noMerit ? ` · 功绩档：${branch.tier}` : ''}</div>` +
    `<div class="r-after reveal" id="rv-2">本章得失：${effectSummary(branch.effects)}${extraNote ? '｜' + extraNote : ''}｜当前 恩宠 ${S.health} · 人脉值 ${S.troops} · 声望 ${Math.max(0, S.sec.fame)} · 功绩 ${S.merit} · 任性 ${S.taunts}</div>` +
    (bio ? `<div class="r-bio reveal" id="rv-3">判词添一句：「${bio}」</div>` : '');
  rewindAvailable = success === false && !!rewindSnapshot && S.rewindLeft > 0 && rewindChapterUsed !== S.ch;
  syncAllAdBtns();
  const nextBtn = $('btn-chapter-next');
  nextBtn.classList.add('reveal');
  nextBtn.textContent = S.deadPending ? '查看结局 →' : '继续 →';
  nextBtn.onclick = afterChapter;
  requestAnimationFrame(() => { const e = $('rv-1'); if (e) e.classList.add('on'); });
  setTimeout(() => { const e = $('rv-2'); if (e) e.classList.add('on'); }, 550);
  setTimeout(() => { const e = $('rv-3'); if (e) e.classList.add('on'); nextBtn.classList.add('on'); }, 1100);
  refreshChapterUI();
}
/* 章末：先判事件（触发则停在弹窗，关窗后走 proceedAfterChapter，不重复判定），再判推进 */
function afterChapter() {
  rewindAvailable = false; rewindSnapshot = null; syncAllAdBtns();
  if (S.deadPending) { finishEnding('disease'); return; }
  if (EVENT_AFTER_CHAPTERS.includes(S.ch) && S.eventsFired < MAX_EVENTS_GAME) {
    const ev = drawEvent();
    if (ev) { openEvent(ev); return; }
  }
  proceedAfterChapter();
}
function proceedAfterChapter() {
  if (S.ch === 11 && (S.personalFail >= 4 || (S.personalFail >= 3 && S.health < 35))) { finishEnding('diedWar'); return; }
  if (S.ch >= 12) { finishEnding(determineEnding()); return; }
  enterChapter(S.ch + 1);
}

/* ---------- 事件（任务书 §4.2-5 / §6） ---------- */
function drawEvent() {
  let pool = REGULAR_POOL.filter(e => !S.eventsUsed.includes(e.id));
  if (!pool.length) return null;
  const total = pool.reduce((s, e) => s + (e.weight > 0 ? e.weight : 50), 0);
  let r = Math.random() * total, pickedEv = pool[pool.length - 1];
  for (const e of pool) { r -= (e.weight > 0 ? e.weight : 50); if (r <= 0) { pickedEv = e; break; } }
  S.eventsUsed.push(pickedEv.id);
  S.eventsFired++;
  return pickedEv;
}
let curEvent = null;
function openEvent(ev) {
  curEvent = ev;
  $('ev-title').textContent = ev.title;
  $('ev-story').textContent = ev.story;
  $('ev-focus').textContent = ev.focus || '';
  $('ev-result').classList.add('hidden');
  $('btn-ev-close').classList.add('hidden');
  const box = $('ev-options');
  box.classList.remove('hidden');
  box.innerHTML = ev.options.map((o, i) => {
    let sub = '';
    if (o.check) sub = `判定${ATTR_NAMES[o.check]} · 成功率 ${successRate(o.check)}%`;
    if (o.taunt) sub += (sub ? ' · ' : '') + '任性';
    return `<button class="opt-btn" data-ev-opt="${i}"><b>${o.label}.</b> ${o.text}${sub ? `<span class="opt-sub">${sub}</span>` : ''}</button>`;
  }).join('');
  box.querySelectorAll('[data-ev-opt]').forEach(b => b.onclick = () => chooseEventOption(ev.options[+b.dataset.evOpt]));
  $('event-modal').classList.remove('hidden');
}
function chooseEventOption(opt) {
  if (opt.taunt) S.taunts++;
  let result = '';
  if (opt.check) {
    const rate = successRate(opt.check);
    const roll = randInt(1, 100);
    const success = roll <= rate;
    const branch = success ? opt.win : opt.lose;
    if (opt.scene && success && S.attrs[opt.check] >= 85) S.scenes++;
    applyEffects(branch.effects);
    result = `掷骰 ${roll}（成功率 ${rate}%）——${success ? '成了' : '败了'}\n${branch.result}`;
    if (!success) {
      applyEffects({ health:-3, troops:-50 });
      result += '\n判定失败另扣：恩宠-3 · 人脉-50';
    }
  } else {
    applyEffects(opt.effects);
    result = opt.result;
  }
  if (S.health <= 0) S.deadPending = true;
  $('ev-options').classList.add('hidden');
  const res = $('ev-result');
  res.classList.remove('hidden');
  res.textContent = result + `\n（恩宠 ${S.health} · 人脉值 ${S.troops} · 声望 ${Math.max(0, S.sec.fame)}）`;
  const closeBtn = $('btn-ev-close');
  closeBtn.classList.remove('hidden');
  closeBtn.textContent = S.deadPending ? '查看结局 →' : '继续 →';
  closeBtn.onclick = () => {
    $('event-modal').classList.add('hidden');
    if (S.deadPending) { finishEnding('disease'); return; }
    proceedAfterChapter();
  };
  refreshChapterUI();
}

/* ---------- 结局（任务书 §7，顺序 1→2→3→6→4→5→7） ---------- */
const ENDING_DEFS = {
  disease:  { name:'失宠幽居', quote:'恩宠耗尽的那天，连请安的资格都没有了。', bonus:0 },
  diedWar:  { name:'香消玉殒', quote:'你替别人挡的刀太多了。', bonus:0 },
  fengyi:   { name:'凤仪六宫', quote:'六宫的账，从此由你来算。', bonus:1.2 },
  chuilian: { name:'垂帘听政', quote:'帘子后面的人，从不说废话。', bonus:1.0 },
  rongchong:{ name:'盛世荣宠', quote:'盛宠不是运气，是你把每一步都走对了。', bonus:0.8 },
  chugong:  { name:'平安出宫', quote:'宫门在身后合上时，你听见了风声——是自由的。', bonus:0.7 },
  qingke:   { name:'宫中清客', quote:'不争的人，最后什么也没输。', bonus:0.3 },
  guiren:   { name:'贵人相助', quote:'你帮过的人，最后都成了你的路。', bonus:0.6 },
  youju:    { name:'幽居冷宫', quote:'冷宫的桂花开了，没有人来看。', bonus:0 },
  shengshuai:{ name:'盛宠难久', quote:'爬得太快的人，脚下都是空的。', bonus:0.2 },
  beipan:   { name:'众叛亲离', quote:'你回头的时候，身后一个人也没有。', bonus:0 },
  xiaotan:  { name:'宫闱笑谈', quote:'你的故事，是六宫茶余饭后最爱讲的那一段。', bonus:0.4 },
  wuming:   { name:'无名而终', quote:'深宫埋了多少人，不多你一个。', bonus:0 },
  poju:     { name:'破局之人', quote:'所有人都以为你在棋盘里，只有你知道，棋盘是你摆的。', bonus:1.5 }
};
function determineEnding() {
  /* 2026-10-31 Monte Carlo 校准定版（N=20000×3 策略，见生产-数值校准报告.md） */
  const F = S.flags;
  const has = f => F.includes(f);
  if (S.finalChoice === 'zheng' && (has('shenSecret') || has('clearHeart')) && S.sec.fame >= 7 && S.merit >= 14) return 'poju';
  if (S.finalChoice === 'zheng') {
    if (S.sec.fame >= 9 && S.troops >= 1650) return 'fengyi';
    if (has('taihou_favor') && S.merit >= 16 && S.sec.fame >= 6) return 'chuilian';
    if (S.health >= 70 && S.sec.fame >= 6) return 'rongchong';
    if (S.troops < 800) return 'beipan';
    return 'shengshuai';
  }
  if (S.finalChoice === 'yi') {
    if (S.health >= 65 && S.sec.fame >= 6) return 'rongchong';
    if ((has('bailu_proved') || has('meng_delivered') || has('taihou_favor')) && S.troops >= 1100) return 'guiren';
    if (S.taunts >= 2) return 'xiaotan';
    if (S.sec.fame <= 4 && S.health >= 30) return 'qingke';
    return 'wuming';
  }
  if (S.finalChoice === 'li') {
    if (S.taunts >= 2) return 'xiaotan';
    if (S.health < 25 && S.sec.fame < 5) return 'youju';
    if (S.sec.fame >= 3) return 'chugong';
    return 'wuming';
  }
  return 'wuming';
}
/* ---------- 评分（任务书 §8） ---------- */
function computeScore(endingId) {
  let s = 5.0;
  s += clamp((S.merit - 18) * 0.09, -1.6, 1.6);
  s += clamp((S.ovr - 72) * 0.05, -1.0, 1.0);
  s += clamp(S.scenes * 0.3, 0, 1.2);
  s += clamp((S.sec.fame + S.sec.network) * 0.04, -0.8, 0.8);
  s -= clamp(S.sec.controversy * 0.06, 0, 1.2);
  s += ENDING_DEFS[endingId].bonus || 0;
  return Math.round(clamp(s, 1.0, 10.0) * 10);  /* v4 P1：百分制（原 10 分公式等比放大取整） */
}
function postText() {
  const def = ENDING_DEFS[S.endingId];
  return `我入宫这一局，是个${S.title}，结局${def.name}，声望${Math.max(0, S.sec.fame)}，命运评分${S.score}分，判词在此。你来评评？`;
}
function finishEnding(endingId) {
  clearSave();  /* v5.5：本局结束，存档作废 */
  S.endingId = endingId;
  S.score = computeScore(endingId);
  const def = ENDING_DEFS[endingId];
  $('ending-name').textContent = def.name;
  $('ending-quote').textContent = def.quote ? `「${def.quote}」` : '';
  $('ending-stats').innerHTML =
    `${S.title} · ${S.route} ｜ 命运值 ${S.ovr} ｜ 根基尚浅 ${S.deBuPei} 项<br>` +
    `终局人脉值 ${S.troops} ｜ 声望 ${Math.max(0, S.sec.fame)} ｜ 功绩分 ${S.merit} ｜ 名场面 ${S.scenes} ｜ 任性 ${S.taunts} 次`;
  $('ending-score').textContent = `命运评分 ${S.score} 分`;
  pushRecord(endingId);  /* v5.7：本局成绩记入本地纪事榜 */
  collectEnding(endingId);  /* v5.8：结局谱点亮 + 终局系成就判定 */
  showScreen('ending');
}
function renderPoster() {
  const def = ENDING_DEFS[S.endingId];
  $('poster-sub').textContent = `${S.title} + ${S.route} ｜ 命运值 ${S.ovr} ｜ 根基尚浅 ${S.deBuPei} 项 ｜ 终局人脉值 ${S.troops} ｜ 声望 ${Math.max(0, S.sec.fame)}`;
  $('poster-biogs').innerHTML = S.bios.map(b => `<p>${b}</p>`).join('');
  $('poster-ending').textContent = def.quote ? `${def.name}：「${def.quote}」` : def.name;
  $('poster-score').textContent = `命运评分 ${S.score} 分`;
  $('poster-share').textContent = postText();
  showScreen('poster');
  drawPosterCanvas();
  /* v5.9：虎扑昵称上海报（App 内取到才显示，站外/未登录自动跳过） */
  fetchNickname().then(n => {
    if (n) {
      const el = $('poster-nick');
      el.textContent = `虎扑主公：${n}`;
      el.classList.remove('hidden');
      drawPosterCanvas();
    }
  });
}

/* ---------- 启动绑定 ---------- */
/* 全屏顶部安全适配（colorbox-fullscreen-safe-top）：启动时读一次宿主安全距离，
   只给最外层 .wrap 加一次顶部避让（原顶距 16px），避免状态栏/刘海遮挡；宿主外返回 0、不加。 */
(function applyFullscreenSafeTop() {
  let done = false;
  const apply = () => {
    if (done) return;
    try {
      if (window.ColorboxAI && typeof window.ColorboxAI.getFullscreenSafeTop === 'function') {
        const h = window.ColorboxAI.getFullscreenSafeTop();
        if (typeof h === 'number' && h > 0) {
          const wrap = document.querySelector('.wrap');
          if (wrap) wrap.style.paddingTop = (16 + h) + 'px';
        }
        done = true;
      }
    } catch (e) { /* 宿主环境外忽略 */ }
  };
  apply();
  window.addEventListener('load', apply);
})();

/* 资源预热：提前解码前三章插图，降低首次进入章节时的绘制延迟 */
try { Object.values(CH_ART).slice(0, 3).forEach(u => { const im = new Image(); im.src = u; }); } catch (e) {}
/* v5.11：其余章节插图与海报底图改空闲逐张解码（每 350ms 一张，玩家习技期间在后台完成），
   首次进入后续章节/打开海报时不再现付解码成本；全部 best-effort，失败静默。 */
try {
  const __preheatQueue = Object.values(CH_ART).slice(3);
  const __preheatStep = () => {
    const u = __preheatQueue.shift();
    if (u) {
      const im = new Image();
      im.src = u;
      if (im.decode) im.decode().catch(() => {});
      setTimeout(__preheatStep, 350);
    } else {
      const bgEl = document.getElementById('poster-bg-img');
      if (bgEl && bgEl.decode) bgEl.decode().catch(() => {});
    }
  };
  setTimeout(__preheatStep, 1200);
} catch (e) {}

$('btn-start').onclick = () => { renderSetup(); showScreen('setup'); };
$('btn-to-draft').onclick = startDraft;
$('btn-swap').onclick = () => { if (S.swapsLeft > 0 && !S.person) { S.swapsLeft--; rollFaction(); renderDraft(); } };
/* ---------- 激励广告（vatask）：换一批 / 时运 / 香囊 / 改命，共用一套状态 ---------- */
/* ---------- 本地存档（v5.5）：看广告/误退导致页面重载时恢复进度 ---------- */
const SAVE_KEY = 'gongting_save_v1', PENDING_AD_KEY = 'gongting_pending_ad';
let __restoring = false;
function saveGame(phase) {
  if (__restoring) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 1, ts: Date.now(), phase,
      S: Object.assign({}, S, { claimed: [...S.claimed] }),
      tianmingBoost: !!tianmingBoost, rewindChapterUsed: rewindChapterUsed || 0
    }));
  } catch (e) {}
}
function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(PENDING_AD_KEY); } catch (e) {}
}
function readSave() {
  try { const d = JSON.parse(localStorage.getItem(SAVE_KEY)); return (d && d.S && d.S.route) ? d : null; }
  catch (e) { return null; }
}
function refreshContinueBtn() {
  const btn = $('btn-continue'), info = $('save-info');
  if (!btn) return;
  const d = readSave();
  btn.classList.toggle('hidden', !d);
  if (info) {
    info.classList.toggle('hidden', !d);
    if (d) {
      const t = new Date(d.ts);
      const hh = String(t.getHours()).padStart(2, '0'), mm = String(t.getMinutes()).padStart(2, '0');
      info.textContent = d.phase === 'chapter'
        ? `上局进度：第 ${d.S.ch} / 12 章 · ${hh}:${mm} 存档`
        : `上局进度：习技 ${d.S.picks} / 8 · ${hh}:${mm} 存档`;
    }
  }
}
/* 恢复章节界面：只重渲染，不重跑 enterChapter 的章首扣恩宠结算 */
function restoreChapterView() {
  const n = S.ch, ch = curChapterOf(n);
  let brief = ch.brief;

  const checkKeys = [...new Set(ch.options.filter(o => o.check).map(o => o.check))];
  const checksLine = checkKeys.length
    ? `<span class="ch-checks">本章看你的：${checkKeys.map(k => `${ATTR_NAMES[k]} ${S.attrs[k]}<span class="grade">${attrGrade(S.attrs[k])}</span>`).join(' · ')}</span>` : '';
  const artEl = $('ch-art');
  if (typeof CH_ART !== 'undefined' && CH_ART[n]) { artEl.style.backgroundImage = `url("${CH_ART[n]}")`; artEl.classList.remove('hidden'); }
  else artEl.classList.add('hidden');
  $('ch-num').textContent = `第 ${n} / 12 章`;
  $('ch-name').textContent = ch.name;
  $('ch-brief').innerHTML = `${brief}<span class="deduct">（进度已恢复 · 当前恩宠 ${S.health}）</span>${checksLine}`;
  $('ch-result').classList.add('hidden');
  $('btn-chapter-next').classList.remove('on');
  renderChapterOptions(ch);
  refreshChapterUI();
  syncAllAdBtns();
}
async function restoreGame() {
  const d = readSave();
  if (!d) return;
  __restoring = true;
  Object.assign(S, d.S);
  S.claimed = new Set(d.S.claimed || []);
  tianmingBoost = !!d.tianmingBoost;
  rewindChapterUsed = d.rewindChapterUsed || 0;
  rewindSnapshot = null; rewindAvailable = false;
  /* v5.10：读待发奖励标记（v5.5 的纯时间戳标记无 type，解析后自然落入「仅恢复进度」分支） */
  let adInterrupted = false, pendingAd = null;
  try {
    const raw = localStorage.getItem(PENDING_AD_KEY);
    localStorage.removeItem(PENDING_AD_KEY);
    if (raw) {
      adInterrupted = true;
      const j = JSON.parse(raw);
      if (j && j.type && Date.now() - (j.ts || 0) < 30 * 60 * 1000) pendingAd = j;
    }
  } catch (e) { adInterrupted = adInterrupted || false; }
  const toChapter = d.phase === 'chapter' && S.ch >= 1;
  /* 先向平台核对任务状态：平台记录为已完成，才补发待发奖励（不凭本地标记自行发放） */
  let grantedMsg = '';
  if (pendingAd) {
    await refreshAdState();
    if (adRewardDone) {
      if (!toChapter && pendingAd.type === 'swap') {
        S.swapsLeft++;
        grantedMsg = '广告奖励已补发：换一批 +1 次';
      } else if (!toChapter && pendingAd.type === 'tianming') {
        tianmingBoost = true;
        rollFaction();
        grantedMsg = '广告奖励已补发：时运临身——本批贵人云集';
      } else if (toChapter && pendingAd.type === 'jinnang') {
        S.jinnang = true;
        grantedMsg = '广告奖励已补发：香囊已备下';
      } else if (toChapter && pendingAd.type === 'rewind' && pendingAd.snap) {
        const snap = pendingAd.snap;
        S.health = snap.health; S.troops = snap.troops; S.sec = snap.sec; S.merit = snap.merit;
        S.scenes = snap.scenes; S.taunts = snap.taunts; S.personalFail = snap.personalFail;
        S.selfStreak = snap.selfStreak; S.bios = snap.bios; S.flags = snap.flags; S.attrs = snap.attrs;
        S.deadPending = false; S.gamble = false;
        S.rewindLeft = Math.max(0, (S.rewindLeft || 0) - 1);
        rewindChapterUsed = S.ch;
        grantedMsg = '广告奖励已补发：改命成功——回到抉择之前';
      }
    }
  }
  if (toChapter) {
    showScreen('chapter');
    restoreChapterView();
    if (!pendingAd) refreshAdState();
    if (grantedMsg) chAdToast(grantedMsg);
    else if (adInterrupted) chAdToast('上次广告中断了，进度已恢复到看广告之前');
  } else {
    showScreen('draft');
    renderDraft();
    if (!pendingAd) refreshAdState();
    if (grantedMsg) adToast(grantedMsg);
    else if (adInterrupted) adToast('上次广告中断了，进度已恢复到看广告之前');
  }
  __restoring = false;
  saveGame(toChapter ? 'chapter' : 'draft');
}
window.addEventListener('pagehide', () => {
  if (window.__curScreen === 'draft' && S.route && S.picks < 12) saveGame('draft');
  else if (window.__curScreen === 'chapter') saveGame('chapter');
});
$('btn-continue').onclick = restoreGame;
refreshContinueBtn();

/* ---------- 本地纪事榜（v5.7）：每局结局自动记一笔，按命运评分排名 ---------- */
const RECORDS_KEY = 'gongting_records_v1';
function loadRecords() {
  try { const a = JSON.parse(localStorage.getItem(RECORDS_KEY)); return Array.isArray(a) ? a : []; }
  catch (e) { return []; }
}
function saveRecords(list) {
  try { localStorage.setItem(RECORDS_KEY, JSON.stringify(list)); } catch (e) {}
  cloudPush(RECORDS_KEY, JSON.stringify(list));  /* v5.10：云端镜像 */
}
function pushRecord(endingId) {
  if (S.__recorded) return;  /* 同一局只记一次 */
  S.__recorded = true;
  try {
    const def = ENDING_DEFS[endingId] || {};
    const list = loadRecords();
    list.push({
      ts: Date.now(), score: S.score, ending: def.name || endingId, endingId,
      title: S.title, route: S.route, ovr: S.ovr, merit: S.merit, scenes: S.scenes,
      troops: S.troops, fame: S.sec.fame, fate: S.fate ? S.fate.name : ''
    });
    list.sort((a, b) => (b.score - a.score) || (a.ts - b.ts));
    saveRecords(list.slice(0, 100));
  } catch (e) {}
}
function fmtRecTime(ts) {
  const t = new Date(ts);
  const p = n => String(n).padStart(2, '0');
  return `${t.getMonth() + 1}-${p(t.getDate())} ${p(t.getHours())}:${p(t.getMinutes())}`;
}
function renderRecords() {
  const list = loadRecords();
  const sum = $('records-summary'), box = $('records-list');
  if (!list.length) {
    sum.textContent = '还没有纪事。打完一局，成绩就会记到这里，按命运评分排座次。';
    box.innerHTML = '';
    return;
  }
  const best = list[0];
  sum.textContent = `共 ${list.length} 局 · 最高 ${best.score} 分（${best.ending}）`;
  const medal = ['🥇', '🥈', '🥉'];
  box.innerHTML = list.map((r, i) => `
    <div style="display:flex;gap:10px;align-items:baseline;padding:8px 2px;border-bottom:1px dashed rgba(120,96,40,.35);">
      <div style="min-width:34px;font-weight:700;">${medal[i] || (i + 1) + '.'}</div>
      <div style="flex:1;">
        <div><b>${r.score} 分</b> · ${r.ending}${r.title ? ` · ${r.title}` : ''}</div>
        <div class="hint" style="margin:2px 0 0;">${r.route || ''}线 · 功绩 ${r.merit} · 名场面 ${r.scenes}${r.fate ? ` · 时运「${r.fate}」` : ''} · ${fmtRecTime(r.ts)}</div>
      </div>
    </div>`).join('');
}
function openRecords() { renderRecords(); showScreen('records'); }
$('btn-records').onclick = openRecords;
$('btn-records-ending').onclick = openRecords;
$('btn-records-poster').onclick = openRecords;
$('btn-records-back').onclick = () => showScreen('home');
let __clearArm = false;
$('btn-records-clear').onclick = () => {
  const btn = $('btn-records-clear');
  if (!__clearArm) {
    __clearArm = true;
    btn.textContent = '再点一次，确认清空全部记录';
    setTimeout(() => { __clearArm = false; btn.textContent = '清空全部记录'; }, 3000);
    return;
  }
  try { localStorage.removeItem(RECORDS_KEY); } catch (e) {}
  cloudPush(RECORDS_KEY, '[]');  /* v5.10：云端一并清空，防止下次启动合并时复活 */
  __clearArm = false;
  btn.textContent = '清空全部记录';
  renderRecords();
};

/* ---------- 收集层（v5.8）：结局谱 / 宫中人物录 / 成就 ---------- */
const COLLECTION_KEY = 'gongting_collection_v1';
function loadCollection() {
  try {
    const c = JSON.parse(localStorage.getItem(COLLECTION_KEY));
    if (c && typeof c === 'object') return Object.assign({ endings:{}, people:{}, ach:{}, fates:{}, locks:0, runs:0 }, c);
  } catch (e) {}
  return { endings:{}, people:{}, ach:{}, fates:{}, locks:0, runs:0 };
}
function saveCollection(c) { try { localStorage.setItem(COLLECTION_KEY, JSON.stringify(c)); } catch (e) {} cloudPush(COLLECTION_KEY, JSON.stringify(c)); /* v5.10：云端镜像（站外无 SDK 时静默跳过） */ }
let __toastTimer = null;
function showGameToast(msg) {
  const t = $('g-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(__toastTimer);
  __toastTimer = setTimeout(() => t.classList.add('hidden'), 2400);
}
const ACHIEVEMENTS = [
  { id:'firstRun',  icon:'🌱', name:'初入宫闱', desc:'完成第一局' },
  { id:'runs10',    icon:'🪭', name:'宫中老人', desc:'累计完成 10 局' },
  { id:'firstS',    icon:'👑', name:'首见凤仪', desc:'第一次结识 S 级人物的本事' },
  { id:'locks50',   icon:'🔍', name:'阅人无数', desc:'累计习技 50 次' },
  { id:'locks150',  icon:'🎣', name:'人心尽在掌握', desc:'累计习技 150 次' },
  { id:'noDeBuPei', icon:'⚖️', name:'根基稳固', desc:'一局习技结束时根基尚浅为 0 项' },
  { id:'gambleWin', icon:'♟', name:'险棋得手', desc:'「险棋」判定获胜一次' },
  { id:'scenes3',   icon:'🎬', name:'名场面制造机', desc:'单局打出 3 个名场面' },
  { id:'taunts5',   icon:'📣', name:'任性妄为', desc:'单局任性 5 次' },
  { id:'events5',   icon:'🌀', name:'奇遇连连', desc:'单局触发 5 次随机事件' },
  { id:'healthy',   icon:'💪', name:'圣眷正浓', desc:'以 80+ 恩宠打到终局结局' },
  { id:'rich',      icon:'🌿', name:'人脉通达', desc:'终局人脉达到 2400' },
  { id:'saveLuBu',  icon:'🕯', name:'雪中送炭', desc:'在搜宫风波中被白露未作证相救' },
  { id:'fates6',    icon:'🌌', name:'时运见证者', desc:'见过 6 种不同的本局时运' },
  { id:'legendEnd', icon:'🏯', name:'破局达成', desc:'达成隐藏结局（破局之人）' },
  { id:'score85',   icon:'🔥', name:'命运滔天', desc:'单局命运评分达到 85' },
  { id:'endings10', icon:'📜', name:'命运多舛', desc:'收集 10 种不同结局' }
];
function unlockAch(id) {
  const c = loadCollection();
  if (c.ach[id]) return;
  c.ach[id] = Date.now();
  saveCollection(c);
  const def = ACHIEVEMENTS.find(a => a.id === id);
  if (def) showGameToast(`🏆 成就达成：${def.name}`);
}
function collectPerson(p) {
  const c = loadCollection();
  if (!c.people[p.name]) c.people[p.name] = Date.now();
  c.locks = (c.locks || 0) + 1;
  saveCollection(c);
  if (c.locks >= 50) unlockAch('locks50');
  if (c.locks >= 150) unlockAch('locks150');
}
function collectEnding(endingId) {
  if (S.__collected) return;
  S.__collected = true;
  const c = loadCollection();
  const prev = c.endings[endingId];
  if (!prev || S.score > prev.score) c.endings[endingId] = { ts: prev ? prev.ts : Date.now(), score: S.score };
  c.runs = (c.runs || 0) + 1;
  saveCollection(c);
  unlockAch('firstRun');
  if (c.runs >= 10) unlockAch('runs10');
  if (Object.keys(c.endings).length >= 10) unlockAch('endings10');
  if (['legend', 'pillarPrime', 'fisherKing'].includes(endingId)) unlockAch('legendEnd');
  if (S.scenes >= 3) unlockAch('scenes3');
  if (S.taunts >= 5) unlockAch('taunts5');
  if (S.eventsFired >= 5) unlockAch('events5');
  if (S.troops >= 2400) unlockAch('rich');
  if (S.flags.includes('bailu_proved')) unlockAch('saveLuBu');
  if (S.score >= 85) unlockAch('score85');
  if (S.flags.includes('luBuSaved')) unlockAch('saveLuBu');
  if (endingId !== 'disease' && endingId !== 'diedWar' && S.health >= 80) unlockAch('healthy');
}

/* ---------- v5.10：纪事/人物录云端镜像（ColorboxAI.cloudSave，按用户+活动隔离） ----------
 * 本地 localStorage 仍是主存；虎扑容器可能清理 webview 存储（已有玩家反馈纪事/成就丢失），
 * 故同步一份到云端：写入走节流推送（同 key ≥3.2s 合并），启动时拉取合并——
 * 纪事按 ts 并集、人物录结局取高分/人物成就时运取并集/计数取大。本地独有数据自动补传。
 * 站外无 SDK 时 cloudReady() 为 false，全部静默跳过，不影响本地功能。 */
function cloudReady() {
  return !!(window.ColorboxAI && window.ColorboxAI.cloudSave &&
    typeof window.ColorboxAI.cloudSave.getValue === 'function' &&
    typeof window.ColorboxAI.cloudSave.setValue === 'function');
}
const __cloudLast = {}, __cloudTimer = {}, __cloudVal = {};
function cloudPush(key, value) {
  if (!cloudReady()) return;
  __cloudVal[key] = value;
  const wait = Math.max(0, 3200 - (Date.now() - (__cloudLast[key] || 0)));
  clearTimeout(__cloudTimer[key]);
  __cloudTimer[key] = setTimeout(async () => {
    __cloudLast[key] = Date.now();
    try { await window.ColorboxAI.cloudSave.setValue({ key, value: __cloudVal[key] }); } catch (e) {}
  }, wait);
}
async function cloudPull(key) {
  if (!cloudReady()) return null;
  try {
    const r = await window.ColorboxAI.cloudSave.getValue({ key });
    if (r && r.code === 200 && typeof r.data === 'string' && r.data) return r.data;
  } catch (e) {}
  return null;
}
function mergeRecords(local, remote) {
  const byTs = new Map();
  for (const r of [...(remote || []), ...(local || [])]) { if (r && r.ts) byTs.set(r.ts, r); }
  return [...byTs.values()].sort((a, b) => (b.score - a.score) || (a.ts - b.ts)).slice(0, 100);
}
function mergeCollection(local, remote) {
  const out = { endings: {}, people: {}, ach: {}, fates: {}, locks: 0, runs: 0 };
  for (const src of [remote || {}, local || {}]) {
    for (const [id, v] of Object.entries(src.endings || {})) {
      const cur = out.endings[id];
      if (!cur) out.endings[id] = { ts: v.ts, score: v.score };
      else if ((v.score || 0) > (cur.score || 0)) out.endings[id] = { ts: cur.ts || v.ts, score: v.score };
    }
    for (const k of ['people', 'ach', 'fates']) {
      for (const [id, ts] of Object.entries(src[k] || {})) {
        if (!out[k][id] || ts < out[k][id]) out[k][id] = ts;
      }
    }
    out.locks = Math.max(out.locks, src.locks || 0);
    out.runs = Math.max(out.runs, src.runs || 0);
  }
  return out;
}
async function initCloudSync() {
  if (!cloudReady()) return;
  try {
    const recStr = await cloudPull(RECORDS_KEY);
    if (recStr) {
      let remote = null;
      try { remote = JSON.parse(recStr); } catch (e) {}
      if (Array.isArray(remote)) {
        const merged = mergeRecords(loadRecords(), remote);
        const mStr = JSON.stringify(merged);
        if (mStr !== JSON.stringify(loadRecords())) { try { localStorage.setItem(RECORDS_KEY, mStr); } catch (e) {} }
        if (mStr !== recStr) cloudPush(RECORDS_KEY, mStr);
      }
    } else {
      const l = loadRecords();
      if (l.length) cloudPush(RECORDS_KEY, JSON.stringify(l));
    }
    const colStr = await cloudPull(COLLECTION_KEY);
    if (colStr) {
      let remote = null;
      try { remote = JSON.parse(colStr); } catch (e) {}
      if (remote && typeof remote === 'object') {
        const merged = mergeCollection(loadCollection(), remote);
        const mStr = JSON.stringify(merged);
        if (mStr !== JSON.stringify(loadCollection())) saveCollection(merged);
        else if (mStr !== colStr) cloudPush(COLLECTION_KEY, mStr);
      }
    } else {
      const c = loadCollection();
      if (c.runs || Object.keys(c.endings).length || Object.keys(c.people).length) cloudPush(COLLECTION_KEY, JSON.stringify(c));
    }
  } catch (e) {}
}
initCloudSync();

const ENDING_HINTS = {
  disease:'提示：恩宠先耗尽了', diedWar:'提示：替人挡的刀太多', fengyi:'争位线 · 登顶',
  chuilian:'争位线 · 太后青眼', rongchong:'依附线 · 盛宠', chugong:'离宫线 · 全身而退',
  qingke:'提示：不争不抢', guiren:'提示：善因得善果', youju:'提示：出宫未成，先失了宠',
  shengshuai:'争位线 · 根基未稳', beipan:'提示：人脉散尽', xiaotan:'提示：任性次数太多',
  wuming:'提示：平平无奇', poju:'隐藏结局 · 条件苛刻'
};
function renderGallery() {
  const c = loadCollection();
  const eKeys = Object.keys(ENDING_DEFS);
  $('gal-endings-count').textContent = `${Object.keys(c.endings).length} / ${eKeys.length}`;
  $('gal-endings').innerHTML = eKeys.map(id => {
    const def = ENDING_DEFS[id], got = c.endings[id];
    if (got) return `<div style="border:1px solid #C9A227;border-radius:10px;padding:8px;background:linear-gradient(180deg,#fdf6dd,#f7ecd0);">
      <div style="font-weight:700;">${def.name}</div>
      ${def.quote ? `<div class="hint" style="margin:2px 0;">「${def.quote}」</div>` : ''}
      <div class="hint" style="margin:2px 0;">最佳 ${got.score} 分 · ${fmtRecTime(got.ts)} 达成</div></div>`;
    return `<div style="border:1px dashed rgba(120,96,40,.4);border-radius:10px;padding:8px;opacity:.75;">
      <div style="font-weight:700;">？？？</div>
      <div class="hint" style="margin:2px 0;">${ENDING_HINTS[id] || '尚未达成'}</div></div>`;
  }).join('');
  $('gal-ach-count').textContent = `${Object.keys(c.ach).length} / ${ACHIEVEMENTS.length}`;
  $('gal-ach').innerHTML = ACHIEVEMENTS.map(a => {
    const ts = c.ach[a.id];
    return `<div style="display:flex;gap:10px;align-items:baseline;padding:7px 2px;border-bottom:1px dashed rgba(120,96,40,.3);${ts ? '' : 'opacity:.55;'}">
      <div style="font-size:18px;">${a.icon}</div>
      <div style="flex:1;"><b>${a.name}</b><div class="hint" style="margin:1px 0;">${a.desc}</div></div>
      <div class="hint">${ts ? fmtRecTime(ts) + ' 达成' : '未达成'}</div></div>`;
  }).join('');
  let total = 0, got = 0;
  $('gal-people').innerHTML = FACTIONS.map(f => {
    const cells = f.people.map(p => {
      total++;
      const has = !!c.people[p.name];
      if (has) got++;
      return `<button data-gal-person="${p.name}" style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;border:1px solid ${has ? 'rgba(160,124,32,.55)' : 'rgba(120,96,40,.25)'};border-radius:10px;background:${has ? '#fffdf4' : 'transparent'};cursor:pointer;">
        <span style="${has ? '' : 'filter:grayscale(1);opacity:.4;'}">${avatarHTML(p.name)}</span>
        <span style="font-size:12px;${has ? 'font-weight:700;' : 'opacity:.55;'}">${p.name}</span>
        <span style="font-size:10px;color:#a07c20;">${p.tier} 级</span></button>`;
    }).join('');
    return `<div style="margin:10px 0 4px;font-weight:700;">${f.name}</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">${cells}</div>`;
  }).join('');
  $('gal-people-count').textContent = `${got} / ${total}`;
  $('gal-person-detail').innerHTML = '<p class="hint">点任意已点亮的人物，看他的全套属性。</p>';
  document.querySelectorAll('[data-gal-person]').forEach(b => b.onclick = () => showGalPerson(b.dataset.galPerson));
}
function showGalPerson(name) {
  const c = loadCollection();
  const box = $('gal-person-detail');
  if (!c.people[name]) { box.innerHTML = `<p class="hint">「${name}」还没被你夺过技——在习技里选他、锁定任意一项即可点亮。</p>`; return; }
  let person = null, factionName = '';
  for (const f of FACTIONS) { const p = f.people.find(x => x.name === name); if (p) { person = p; factionName = f.name; break; } }
  if (!person) return;
  const attrs = genPlayerAttr(person.route, person.tier, person.special, person.name);
  const ovr = computeOVR(person.route, attrs);
  box.innerHTML = `<div style="border:1px solid #C9A227;border-radius:10px;padding:10px;margin-bottom:8px;background:#fffdf4;">
    <div style="display:flex;gap:10px;align-items:center;">${avatarHTML(name)}
      <div><b style="font-size:17px;">${name}</b> · ${factionName} · ${person.tier} 级 · ${person.route}路线<br>
      <span class="hint">绝活 ${ATTR_NAMES[person.special]} ${attrs[person.special]} ｜ 总评 ${ovr}</span></div></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px;">
      ${ATTR_KEYS.map(k => `<div class="attr-cell"><div class="a-name">${ATTR_NAMES[k]}</div><div class="a-val">${attrs[k]}</div><div class="a-grade">${attrGrade(attrs[k])}</div></div>`).join('')}
    </div>${person.trait ? `<div style="margin-top:8px;font-size:13px;"><b>绝活 · ${person.trait}</b><span style="color:#8a6d1f;"> —— ${person.traitDesc || ''}</span></div>` : ''}${person.bio ? `<p style="margin:6px 0 0;font-size:13px;line-height:1.7;color:#5c4a21;">${person.bio}</p>` : ''}</div>`;
}
function openGallery() { renderGallery(); showScreen('gallery'); }
$('btn-gallery').onclick = openGallery;
$('btn-records-gallery').onclick = openGallery;
$('btn-gallery-back').onclick = () => showScreen('home');

let adBusy = false, adRewardDone = false, lastAdMsg = '';
let tianmingBoost = false;
let rewindSnapshot = null, rewindChapterUsed = 0, rewindAvailable = false;
function vataskReady() {
  return !!(window.ColorboxAI && window.ColorboxAI.vatask && typeof window.ColorboxAI.vatask.completeRewardVideo === 'function');
}
async function playRewardAd(kind, snap) {
  if (adBusy || adRewardDone || !vataskReady()) return false;
  /* v5.5：拉起广告前先落盘并留标记——容器看完广告可能重载页面，回来靠存档恢复进度 */
  /* v5.10：标记升级为 JSON，记下待发奖励类型（改命附带抉择前快照）；
     若页面被容器销毁、回调永不返回，重载后由 restoreGame 凭平台任务状态核对补发 */
  try { localStorage.setItem(PENDING_AD_KEY, JSON.stringify({ type: kind || '', ts: Date.now(), snap: snap || null })); } catch (e) {}
  saveGame(window.__curScreen === 'chapter' ? 'chapter' : 'draft');
  adBusy = true; lastAdMsg = ''; syncAllAdBtns();
  let ok = false;
  try {
    const res = await window.ColorboxAI.vatask.completeRewardVideo();
    ok = !!(res && res.code === 200 && res.data && res.data.rewarded);
    if (!ok) lastAdMsg = (res && res.message) || '未获得奖励';
  } catch (e) { lastAdMsg = '广告拉起失败，请重试'; }
  adBusy = false;
  await refreshAdState();
  try { localStorage.removeItem(PENDING_AD_KEY); } catch (e) {}
  return ok;
}
function syncAllAdBtns() {
  const vis = !!window.__adVisible;
  const swap = $('btn-ad-swap');
  swap.classList.toggle('hidden', !vis);
  swap.disabled = adBusy || adRewardDone || !!S.person;
  swap.textContent = adRewardDone ? '📺 今日广告奖励已领完' : (adBusy ? '📺 广告播放中…' : '📺 看广告换一批');
  const tm = $('btn-ad-tianming');
  tm.classList.toggle('hidden', !vis);
  tm.disabled = adBusy || adRewardDone || !!S.person;
  tm.textContent = adRewardDone ? '📺 今日广告奖励已领完' : (adBusy ? '📺 广告播放中…' : '📺 时运临身（看广告，本批贵人云集）');
  const jn = $('btn-ad-jinnang');
  if (jn) {
    jn.classList.toggle('hidden', !vis);
    jn.disabled = adBusy || adRewardDone || !!S.jinnang;
    jn.textContent = adRewardDone ? '📺 今日广告奖励已领完' : (adBusy ? '📺 广告播放中…' : (S.jinnang ? '🧧 香囊已在囊中（下个判定生效）' : '📺 看广告·请香囊（判定更稳）'));
  }
  const rw = $('btn-ad-rewind');
  if (rw) {
    rw.classList.toggle('hidden', !(vis && rewindAvailable));
    rw.disabled = adBusy || adRewardDone;
    rw.textContent = adBusy ? '📺 广告播放中…' : `📺 看广告·改命（回到这次抉择之前，本局剩 ${S.rewindLeft || 0} 次）`;
  }
}
function adToast(msg) {
  const t = $('ad-toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2200);
}
function chAdToast(msg) {
  const t = $('ch-ad-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2200);
}
async function refreshAdState() {
  if (!window.ColorboxAI || !window.ColorboxAI.vatask || typeof window.ColorboxAI.vatask.getActivityTaskState !== 'function') { window.__adVisible = false; syncAllAdBtns(); return; }
  try {
    const st = await window.ColorboxAI.vatask.getActivityTaskState();
    if (st && st.code === 200 && st.data) {
      const task = (st.data.tasks || []).find(x => x.taskCode === 'reward');
      adRewardDone = !!(task && task.status === 'completed');
      window.__adVisible = true;
    } else {
      window.__adVisible = false;
    }
  } catch (e) { window.__adVisible = false; }
  syncAllAdBtns();
}
$('btn-ad-swap').onclick = async () => {
  if (adBusy || adRewardDone || S.person) return;
  if (await playRewardAd('swap')) {
    S.swapsLeft++;
    adToast('已获得 1 次换一批');
    renderDraft();
  } else if (lastAdMsg) adToast(lastAdMsg);
};
$('btn-ad-tianming').onclick = async () => {
  if (adBusy || adRewardDone || S.person) return;
  if (await playRewardAd('tianming')) {
    tianmingBoost = true;
    rollFaction();
    renderDraft();
    adToast('时运已至——本批贵人云集');
  } else if (lastAdMsg) adToast(lastAdMsg);
};
$('btn-ad-jinnang').onclick = async () => {
  if (adBusy || adRewardDone || S.jinnang) return;
  if (await playRewardAd('jinnang')) {
    S.jinnang = true;
    saveGame('chapter');
    chAdToast('香囊已备下，下个判定成算大增');
    syncAllAdBtns();
  } else if (lastAdMsg) chAdToast(lastAdMsg);
};
$('btn-ad-rewind').onclick = async () => {
  if (adBusy || adRewardDone || !rewindAvailable || !rewindSnapshot) return;
  if (await playRewardAd('rewind', JSON.parse(JSON.stringify(rewindSnapshot)))) {
    const snap = rewindSnapshot;
    S.health = snap.health; S.troops = snap.troops; S.sec = snap.sec; S.merit = snap.merit;
    S.scenes = snap.scenes; S.taunts = snap.taunts; S.personalFail = snap.personalFail;
    S.selfStreak = snap.selfStreak; S.bios = snap.bios; S.flags = snap.flags; S.attrs = snap.attrs;
    S.deadPending = false; S.gamble = false;
    S.rewindLeft--; rewindChapterUsed = S.ch; rewindAvailable = false; rewindSnapshot = null;
    $('ch-result').classList.add('hidden');
    renderChapterOptions(curChapter());
    refreshChapterUI();
    saveGame('chapter');
    chAdToast('改命成功——回到抉择之前');
  } else if (lastAdMsg) chAdToast(lastAdMsg);
};
$('btn-to-chapters').onclick = startChapters;
$('btn-to-poster').onclick = renderPoster;
$('btn-restart').onclick = () => location.reload();
/* ---------- 虎扑昵称（v5.9，auth.getUserInfo：仅取昵称用于海报，不存不用 PUID） ---------- */
let hupuNickname = '';
async function fetchNickname() {
  if (hupuNickname) return hupuNickname;
  try {
    if (window.ColorboxAI && window.ColorboxAI.auth && typeof window.ColorboxAI.auth.getUserInfo === 'function') {
      const res = await window.ColorboxAI.auth.getUserInfo();
      if (res && res.code === 200 && res.data && res.data.islogin === 1 && res.data.nickname) {
        hupuNickname = String(res.data.nickname).slice(0, 24);
      }
    }
  } catch (e) { /* 站外/未登录：无昵称，海报照常 */ }
  return hupuNickname;
}

/* ---------- 结果海报图（v5.9，result-poster-posting：Canvas → OSS → 发帖编辑器） ---------- */
function wrapCanvasLines(ctx, text, maxWidth) {
  const lines = [];
  let cur = '';
  for (const ch of String(text)) {
    if (ctx.measureText(cur + ch).width > maxWidth && cur) { lines.push(cur); cur = ch; }
    else cur += ch;
  }
  if (cur) lines.push(cur);
  return lines;
}
function drawPlaque(ctx, cx, cy, w, text, font, color) {
  const h = 38;
  ctx.strokeStyle = 'rgba(150,110,40,.9)';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  ctx.lineWidth = 0.7;
  ctx.strokeRect(cx - w / 2 + 3.5, cy - h / 2 + 3.5, w - 7, h - 7);
  for (const dx of [-w / 2 - 14, w / 2 + 14]) {
    ctx.save();
    ctx.translate(cx + dx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#C9A227';
    ctx.fillRect(-4.5, -4.5, 9, 9);
    ctx.restore();
  }
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy + 8);
}
function drawCurl(ctx, x, y, dir) {
  ctx.save();
  ctx.strokeStyle = 'rgba(169,124,54,.85)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let a = 0; a <= Math.PI * 4.4; a += 0.22) {
    const r = 1 + a * 0.85;
    const px = x + dir * Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}
let __speckle = null;
function speckleCanvas(W, H) {
  if (__speckle) return __speckle;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  let seed = 20261030;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 5200; i++) {
    x.fillStyle = rnd() > 0.5 ? 'rgba(120,90,40,.06)' : 'rgba(255,252,240,.06)';
    x.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 1.6, 1 + rnd() * 1.6);
  }
  __speckle = c;
  return c;
}
let __posterToken = 0;
async function drawPosterCanvas() {
  /* v5.11：分帧绘制——原同步整图绘制（墨层侵蚀 3000+ 笔触＋纸纹）在低端机上一次卡 1~3 秒，
     拆成四段、段间让一帧，首段（底图＋眉题）立即上屏。__posterToken 防止多次触发交错绘制。 */
  const __tk = ++__posterToken;
  const __yieldFrame = () => new Promise(r => requestAnimationFrame(r));
  const cv = $('poster-canvas');
  if (!cv || !S.endingId) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const W = 720, H = 960, CX = W / 2;
  const def = ENDING_DEFS[S.endingId] || { name: '', quote: '' };
  const SERIF = '"Noto Serif SC","Songti SC",serif';
  const SANS = '"PingFang SC","Microsoft YaHei",sans-serif';
  const BRUSH = '"PosterBrush","Noto Serif SC","Songti SC",serif';
  /* 底图（AI 山水宣纸）；未就绪时纯纸色兜底 */
  const bg = $('poster-bg-img');
  if (bg && bg.complete && bg.naturalWidth) {
    ctx.drawImage(bg, 0, 0, W, H);
  } else {
    const grad0 = ctx.createLinearGradient(0, 0, 0, H);
    grad0.addColorStop(0, '#F9F3E4'); grad0.addColorStop(1, '#EEE0C2');
    ctx.fillStyle = grad0; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#C9A227'; ctx.lineWidth = 3; ctx.strokeRect(18, 18, W - 36, H - 36);
  }
  ctx.textAlign = 'center';
  /* 印章（书法体） */
  ctx.fillStyle = '#B03A1E';
  ctx.fillRect(W - 118, 40, 58, 58);
  ctx.fillStyle = '#FFF6E0';
  ctx.font = `25px ${BRUSH}`;
  ctx.fillText('宫', W - 89, 67);
  ctx.fillText('闱', W - 89, 93);
  /* 眉题＋昵称 */
  ctx.fillStyle = '#8a6d1f';
  ctx.font = `24px ${SANS}`;
  ctx.fillText('后 宫 生 存 法 则 · 命 运 判 词', CX, 88);
  if (hupuNickname) {
    ctx.fillStyle = '#8d7748';
    ctx.font = `21px ${SANS}`;
    ctx.fillText(`虎扑主公：${hupuNickname}`, CX, 122);
  }
  /* 结局名后金粉扫痕 */
  for (const [dx, dy, r, a] of [[-40, 218, 250, 0.15], [70, 232, 190, 0.11], [0, 206, 150, 0.09]]) {
    const rg = ctx.createRadialGradient(CX + dx, dy, 8, CX + dx, dy, r);
    rg.addColorStop(0, `rgba(196,150,44,${a})`);
    rg.addColorStop(1, 'rgba(196,150,44,0)');
    ctx.save();
    ctx.translate(CX + dx, dy);
    ctx.scale(1, 0.34);
    ctx.translate(-(CX + dx), -dy);
    ctx.fillStyle = rg;
    ctx.fillRect(CX + dx - r, dy - r, r * 2, r * 2);
    ctx.restore();
  }
  /* 干笔朱环（评分区，断续飞白） */
  let seed2 = 777;
  const rnd2 = () => { seed2 = (seed2 * 1103515245 + 12345) & 0x7fffffff; return seed2 / 0x7fffffff; };
  ctx.lineCap = 'round';
  for (const [a0, a1] of [[0.25, 2.75], [3.35, 5.75]]) {
    for (let a = a0; a < a1; a += 0.055) {
      ctx.strokeStyle = `rgba(178,84,32,${0.08 + rnd2() * 0.22})`;
      ctx.lineWidth = 2.2 + rnd2() * 4.2;
      ctx.beginPath();
      ctx.arc(CX, 500, 97 + (rnd2() - 0.5) * 6, a, a + 0.045);
      ctx.stroke();
    }
  }
  if (__tk !== __posterToken) return;
  await __yieldFrame();
  /* 英雄字墨层：结局名＋评分（书法体→朱红渐变→干笔侵蚀） */
  const ink = document.createElement('canvas');
  ink.width = W; ink.height = H;
  const ix = ink.getContext('2d');
  ix.textAlign = 'center';
  ix.fillStyle = '#B23A17';
  let ns = 126;
  ix.font = `${ns}px ${BRUSH}`;
  while (ix.measureText(def.name).width > 612 && ns > 54) { ns -= 4; ix.font = `${ns}px ${BRUSH}`; }
  /* 逐字微倾 */
  const chars = [...String(def.name)];
  const cws = chars.map(ch => ix.measureText(ch).width);
  let nx = CX - cws.reduce((a, b) => a + b, 0) / 2;
  const prevAlign = ix.textAlign;
  ix.textAlign = 'left';
  chars.forEach((ch, i) => {
    ix.save();
    ix.translate(nx + cws[i] / 2, 258);
    ix.rotate((i % 2 ? -1 : 1) * 0.02);
    ix.fillText(ch, -cws[i] / 2, 0);
    ix.restore();
    nx += cws[i];
  });
  ix.textAlign = prevAlign;
  /* 评分数字＋分 */
  const num = String(S.score);
  ix.font = `124px ${BRUSH}`;
  const numW = ix.measureText(num).width;
  ix.font = `46px ${BRUSH}`;
  const fenW = ix.measureText('分').width;
  const totW = numW + fenW + 6;
  ix.textAlign = 'left';
  ix.font = `124px ${BRUSH}`;
  ix.fillText(num, CX - totW / 2, 556);
  ix.font = `46px ${BRUSH}`;
  ix.fillText('分', CX - totW / 2 + numW + 6, 556);
  ix.textAlign = 'center';
  /* 渐变上色 */
  ix.globalCompositeOperation = 'source-in';
  const hg = ix.createLinearGradient(0, 130, 0, 570);
  hg.addColorStop(0, '#C2431B');
  hg.addColorStop(0.55, '#A52E12');
  hg.addColorStop(1, '#7E1F0E');
  ix.fillStyle = hg;
  ix.fillRect(0, 120, W, 470);
  /* 干笔侵蚀：斑点＋横向飞白 */
  ix.globalCompositeOperation = 'destination-out';
  let seed3 = 4242;
  const rnd3 = () => { seed3 = (seed3 * 1103515245 + 12345) & 0x7fffffff; return seed3 / 0x7fffffff; };
  const boxes = [[54, 150, 612, 122], [CX - 190, 428, 380, 140]];
  for (const [bx, by, bw, bh] of boxes) {
    for (let i = 0; i < 1500; i++) {
      ix.globalAlpha = 0.05 + rnd3() * 0.4;
      ix.beginPath();
      ix.arc(bx + rnd3() * bw, by + rnd3() * bh, 0.4 + rnd3() * 1.5, 0, 7);
      ix.fill();
    }
    for (let i = 0; i < 42; i++) {
      ix.globalAlpha = 0.04 + rnd3() * 0.1;
      ix.fillRect(bx + rnd3() * bw * 0.85, by + rnd3() * bh, 8 + rnd3() * 42, 1 + rnd3() * 1.6);
    }
  }
  ix.globalAlpha = 1;
  ix.globalCompositeOperation = 'source-over';
  ctx.drawImage(ink, 0, 0);
  if (__tk !== __posterToken) return;
  await __yieldFrame();
  /* 引言 */
  if (def.quote) {
    ctx.fillStyle = '#5d4a26';
    const q = `「${def.quote}」`;
    let qSize = 26;
    ctx.font = `italic ${qSize}px ${SERIF}`;
    while (ctx.measureText(q).width > W - 110 && qSize > 16) {
      qSize -= 1;
      ctx.font = `italic ${qSize}px ${SERIF}`;
    }
    ctx.fillText(q, CX, 326);
  }
  /* 分隔线＋祥云卷须 */
  ctx.strokeStyle = 'rgba(160,124,32,.55)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(110, 356); ctx.lineTo(CX - 18, 356); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(CX + 18, 356); ctx.lineTo(W - 110, 356); ctx.stroke();
  ctx.save();
  ctx.translate(CX, 356); ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#C9A227'; ctx.fillRect(-6, -6, 12, 12);
  ctx.restore();
  drawCurl(ctx, CX - 128, 356, -1);
  drawCurl(ctx, CX + 128, 356, 1);
  /* 评分牌匾 */
  drawPlaque(ctx, CX, 402, 176, '命 运 评 分', `23px ${SANS}`, '#7a5c14');
  /* 数据（宋体） */
  ctx.fillStyle = '#453723';
  ctx.font = `26px ${SERIF}`;
  ctx.fillText(`${S.title} · ${S.route}路线`, CX, 640);
  ctx.fillStyle = '#63502c';
  ctx.font = `24px ${SERIF}`;
  ctx.fillText(`人脉值 ${S.troops} ｜ 声望 ${Math.max(0, S.sec.fame)} ｜ 功绩 ${S.merit}`, CX, 682);
  let bioY = 740;
  if (S.fate) {
    ctx.fillStyle = '#8a6d1f';
    ctx.font = `21px ${SERIF}`;
    ctx.fillText(`时运 · ${S.fate.name}`, CX, 716);
    bioY = 756;
  }
  drawPlaque(ctx, CX, bioY, 128, '判 词', `22px ${SANS}`, '#7a5c14');
  ctx.fillStyle = '#42331b';
  ctx.font = `24px ${SERIF}`;
  let ly = bioY + 48, shown = 0;
  for (const b of S.bios) {
    if (shown >= 3) break;
    let t = String(b);
    while (ctx.measureText(t).width > W - 170 && t.length > 4) t = t.slice(0, -2);
    if (t !== String(b)) t += '…';
    ctx.fillText(t, CX, ly);
    ly += 35; shown++;
  }
  if (!shown) { ctx.fillText('（此局无判词）', CX, ly); }
  /* 页脚 */
  ctx.fillStyle = '#77643a';
  ctx.font = `20px ${SANS}`;
  const dt = new Date();
  ctx.fillText(`作者：lpy ｜ ${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`, CX, H - 40);
  if (__tk !== __posterToken) return;
  await __yieldFrame();
  /* 全图纸纹颗粒（统一印感） */
  ctx.globalAlpha = 0.55;
  ctx.drawImage(speckleCanvas(W, H), 0, 0);
  ctx.globalAlpha = 1;
}
(() => {
  const bi = document.getElementById('poster-bg-img');
  if (bi && !bi.complete) bi.addEventListener('load', () => { if (S.endingId) drawPosterCanvas(); });
  if (document.fonts && document.fonts.load) {
    document.fonts.load('100px PosterBrush').then(() => { if (S.endingId) drawPosterCanvas(); }).catch(() => {});
  }
})();

let sharing = false;
$('btn-copy').onclick = async () => {
  if (sharing) return;
  const toast = (msg) => {
    const t = $('poster-copied');
    t.textContent = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 2600);
  };
  /* 小红书小工具：发帖分享改为带海报图唤起笔记发布页（postNote）；无平台能力时落回原逻辑 */
const xhsMT = window.xhs && window.xhs.miniTool;
if (xhsMT && typeof xhsMT.postNote === 'function') {
sharing = true;
try {
toast('正在生成海报图…');
await drawPosterCanvas();
const dataUrl = $('poster-canvas').toDataURL('image/png');
const defX = ENDING_DEFS[S.endingId];
await xhsMT.postNote({
title: `后宫生存法则｜${defX.name} ${S.score}分`.slice(0, 20),
content: (postText() + '\n\n\n' + S.bios.join('\n') + `\n\n${defX.name}｜命运值 ${S.ovr}｜终局人脉值 ${S.troops}｜声望 ${Math.max(0, S.sec.fame)}`).slice(0, 1000),
pageType: 'photo_publish',
mediaInfo: { image_resources: [{ url: dataUrl}]}
});
} catch (e) {
toast('唤起发笔记失败，请重试');
}
sharing = false;
return;
}
if (xhsMT && typeof xhsMT.saveImageToPhotosAlbum === 'function') {
sharing = true;
try {
await drawPosterCanvas();
await xhsMT.saveImageToPhotosAlbum({ filePath: $('poster-canvas').toDataURL('image/png')});
toast('海报图已保存到相册');
} catch (e) {
toast('保存海报失败，请重试');
}
sharing = false;
return;
}
 const sdk = window.ColorboxAI && window.ColorboxAI.request && window.ColorboxAI.request.bbs && window.ColorboxAI.request.bbs.openPostEditor;
  if (typeof sdk === 'function') {
    sharing = true;
    try {
      const def = ENDING_DEFS[S.endingId];
      const params = {
        title: `入宫一局：${S.title}·${def.name} ${S.score}分`,
        content: postText() + '\n\n【命运判词】\n' + S.bios.join('\n') + `\n\n${def.name}｜命运值 ${S.ovr}｜终局人脉值 ${S.troops}｜声望 ${Math.max(0, S.sec.fame)}`
      };
      /* v5.9 图片版：先把海报图传 OSS，成功才带图发帖；失败明确降级为文字版 */
      const oss = window.ColorboxAI.oss && window.ColorboxAI.oss.uploadFile;
      if (typeof oss === 'function') {
        toast('正在生成海报图…');
        try {
          await drawPosterCanvas();  /* v5.11：分帧绘制，须等整图绘完再取 Blob */
          const blob = await new Promise(r => $('poster-canvas').toBlob(r, 'image/png', 0.92));
          if (!blob) throw new Error('海报生成失败');
          const up = await window.ColorboxAI.oss.uploadFile({ file: blob, filename: `luanshi-poster-${Date.now()}.png` });
          let okUrl = '';
          if (up && up.downloadUrl) {
            try { const u = new URL(up.downloadUrl); if (u.protocol === 'https:' && u.hostname) okUrl = up.downloadUrl; } catch (e) {}
          }
          if (!okUrl) throw new Error('海报上传失败');
          params.imageUrl = okUrl;
        } catch (e) {
          toast('海报图没传上去，已改用文字版发帖');
        }
      }
      const bbs = window.ColorboxAI.bbsConfig && await window.ColorboxAI.bbsConfig.get();
      if (bbs && typeof bbs.bbsTagId === 'string' && bbs.bbsTagId.trim() !== '') {
        params.topicId = bbs.bbsTopicId;
        params.tagId = bbs.bbsTagId;
        params.topicName = bbs.bbsTopicName;
        params.tagName = bbs.bbsTagName;
      }
      const res = await window.ColorboxAI.request.bbs.openPostEditor(params);
      if (!res || res.code !== 200) toast((res && res.message) || '唤起发帖失败，请重试');
    } catch (e) {
      toast('唤起发帖失败，请重试');
    }
    sharing = false;
  } else {
    const el = $('poster-share');
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    toast('已选中文案，长按即可复制');
  }
};
