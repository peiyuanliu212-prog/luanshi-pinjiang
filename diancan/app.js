/* ============================================================
   灶边 · 渝湘赣家常菜 · 线上点餐
   数据 + 交互（原生 JS，无依赖）
   ============================================================ */

/* ----------------------------- 菜品数据 ----------------------------- */
/* n 名称 · c 菜系 · p 价格 · d 描述 · s 辣度 · sig 招牌 */
const RAW_DISHES = [
  /* ---------------- 重庆菜 33 道 ---------------- */
  { n: '重庆毛血旺', c: '重庆菜', p: 48, d: '鸭血毛肚黄喉，红油翻滚', s: '特辣', sig: true },
  { n: '歌乐山辣子鸡', c: '重庆菜', p: 52, d: '干辣椒里找鸡丁，越嚼越香', s: '特辣', sig: true },
  { n: '万州烤鱼', c: '重庆菜', p: 68, d: '炭火现烤，麻辣汤汁咕嘟', s: '中辣', sig: true },
  { n: '来凤鱼', c: '重庆菜', p: 58, d: '璧山非遗做法，鲜辣过瘾', s: '特辣' },
  { n: '水煮鱼', c: '重庆菜', p: 56, d: '鱼片滑嫩，花椒铺满一层', s: '特辣', sig: true },
  { n: '水煮肉片', c: '重庆菜', p: 42, d: '里脊薄片，刀口辣椒喷香', s: '特辣' },
  { n: '酸菜鱼', c: '重庆菜', p: 52, d: '老坛酸菜，酸辣开胃', s: '中辣' },
  { n: '重庆火锅（牛油锅底）', c: '重庆菜', p: 88, d: '牛油九宫格，涮什么都香', s: '特辣', sig: true },
  { n: '重庆小面', c: '重庆菜', p: 12, d: '二两小面，麻辣鲜香', s: '中辣' },
  { n: '红油抄手', c: '重庆菜', p: 14, d: '皮薄馅大，红油微甜', s: '微辣' },
  { n: '酸辣粉', c: '重庆菜', p: 10, d: '红薯粉劲道，酸辣够味', s: '中辣' },
  { n: '夫妻肺片', c: '重庆菜', p: 38, d: '牛肉牛杂，红油麻辣', s: '中辣', sig: true },
  { n: '黔江鸡杂', c: '重庆菜', p: 46, d: '鸡杂脆嫩，泡椒酸辣', s: '特辣' },
  { n: '蒜泥白肉', c: '重庆菜', p: 32, d: '薄如纸，蒜香红油', s: '微辣' },
  { n: '泡椒腰花', c: '重庆菜', p: 36, d: '泡椒爆炒，脆嫩无腥', s: '特辣' },
  { n: '干煸四季豆', c: '重庆菜', p: 22, d: '干香入味，下饭神器', s: '微辣' },
  { n: '鱼香肉丝', c: '重庆菜', p: 28, d: '酸甜微辣，其实没有鱼', s: '微辣' },
  { n: '回锅肉', c: '重庆菜', p: 32, d: '二刀肉煸出灯盏窝', s: '微辣', sig: true },
  { n: '粉蒸肉', c: '重庆菜', p: 30, d: '米粉裹肉，软糯咸香', s: '不辣' },
  { n: '梅菜扣肉（烧白）', c: '重庆菜', p: 34, d: '芽菜打底，肥而不腻', s: '不辣' },
  { n: '尖椒鸡', c: '重庆菜', p: 46, d: '青尖椒猛火，鸡丁鲜辣', s: '特辣' },
  { n: '干锅肥肠', c: '重庆菜', p: 48, d: '肥肠焦香，配菜吸汁', s: '特辣' },
  { n: '干锅花菜', c: '重庆菜', p: 26, d: '花菜干香，越吃越上瘾', s: '中辣' },
  { n: '干锅土豆片', c: '重庆菜', p: 22, d: '外焦里糯，孜然麻辣', s: '中辣' },
  { n: '石锅鱼', c: '重庆菜', p: 58, d: '石锅锁温，鱼片嫩滑', s: '特辣' },
  { n: '泉水鸡', c: '重庆菜', p: 56, d: '南山泉水，麻辣鲜香', s: '特辣' },
  { n: '邮亭鲫鱼', c: '重庆菜', p: 48, d: '大足老味，豆瓣红亮', s: '特辣' },
  { n: '泡椒牛蛙', c: '重庆菜', p: 52, d: '牛蛙弹嫩，泡椒够劲', s: '特辣' },
  { n: '蒜香排骨', c: '重庆菜', p: 42, d: '蒜香酥脆，外焦里嫩', s: '不辣' },
  { n: '红糖糍粑', c: '重庆菜', p: 16, d: '外脆内糯，红糖拉丝', s: '不辣' },
  { n: '手工冰粉', c: '重庆菜', p: 10, d: '手搓冰粉，红糖醪糟', s: '不辣' },
  { n: '重庆凉糕', c: '重庆菜', p: 10, d: '米香清甜，解辣首选', s: '不辣' },
  { n: '老麻抄手', c: '重庆菜', p: 15, d: '花椒够麻，汤鲜皮滑', s: '中辣' },

  /* ---------------- 湘菜 30 道 ---------------- */
  { n: '剁椒鱼头', c: '湘菜', p: 68, d: '坛子剁椒，鱼头肥美', s: '特辣', sig: true },
  { n: '小炒黄牛肉', c: '湘菜', p: 56, d: '黄牛肉快炒，青椒喷香', s: '特辣', sig: true },
  { n: '辣椒炒肉', c: '湘菜', p: 38, d: '螺丝椒配五花，湘菜之魂', s: '特辣', sig: true },
  { n: '农家小炒肉', c: '湘菜', p: 36, d: '土猪肉煸香，米饭杀手', s: '中辣' },
  { n: '湘西外婆菜', c: '湘菜', p: 26, d: '干菜肉末，咸香下饭', s: '中辣' },
  { n: '干锅茶树菇', c: '湘菜', p: 32, d: '菌香浓郁，越煮越香', s: '中辣' },
  { n: '毛氏红烧肉', c: '湘菜', p: 48, d: '不放酱油，糖色红亮', s: '不辣', sig: true },
  { n: '长沙口味虾', c: '湘菜', p: 78, d: '夜宵顶流，香辣过瘾', s: '特辣', sig: true },
  { n: '长沙臭豆腐', c: '湘菜', p: 18, d: '外焦里嫩，汤汁灌满', s: '中辣', sig: true },
  { n: '糖油粑粑', c: '湘菜', p: 12, d: '糖油裹身，软糯香甜', s: '不辣' },
  { n: '剁椒蒸腊肉', c: '湘菜', p: 42, d: '烟熏腊肉，剁椒提鲜', s: '中辣' },
  { n: '爆炒腰花', c: '湘菜', p: 36, d: '麦穗刀工，大火爆炒', s: '特辣' },
  { n: '湘味蒸鱼', c: '湘菜', p: 48, d: '豉油剁椒，鲜嫩不腥', s: '中辣' },
  { n: '双椒鱼头', c: '湘菜', p: 72, d: '红绿剁椒，双倍鲜辣', s: '特辣' },
  { n: '酸豆角肉末', c: '湘菜', p: 26, d: '酸脆开胃，拌饭一绝', s: '中辣' },
  { n: '擂辣椒皮蛋', c: '湘菜', p: 22, d: '炭烤辣椒，擂出焦香', s: '特辣' },
  { n: '永州血鸭', c: '湘菜', p: 46, d: '鸭血裹肉，香辣浓厚', s: '特辣' },
  { n: '东安子鸡', c: '湘菜', p: 52, d: '酸辣鲜香，国宴名菜', s: '中辣', sig: true },
  { n: '腊味合蒸', c: '湘菜', p: 48, d: '腊肉腊鱼腊鸡，一笼香', s: '微辣' },
  { n: '湘西土匪鸡', c: '湘菜', p: 58, d: '土鸡慢炖，辣得过瘾', s: '特辣' },
  { n: '香辣蟹', c: '湘菜', p: 88, d: '肉蟹饱满，香辣入味', s: '特辣' },
  { n: '手撕包菜', c: '湘菜', p: 20, d: '手撕更入味，锅气十足', s: '微辣' },
  { n: '擂钵茄子', c: '湘菜', p: 22, d: '炭火烤茄，擂碎拌辣', s: '中辣' },
  { n: '常德牛肉粉', c: '湘菜', p: 18, d: '圆粉爽滑，牛肉大块', s: '中辣' },
  { n: '湘潭米粉', c: '湘菜', p: 16, d: '骨汤打底，码子丰富', s: '微辣' },
  { n: '猪血丸子炒腊肉', c: '湘菜', p: 42, d: '邵阳特产，熏香扑鼻', s: '中辣' },
  { n: '紫苏煎黄瓜', c: '湘菜', p: 20, d: '紫苏清香，黄瓜爽脆', s: '微辣' },
  { n: '酸辣鸡杂', c: '湘菜', p: 32, d: '鸡杂脆爽，酸辣带劲', s: '特辣' },
  { n: '剁椒蒸排骨', c: '湘菜', p: 38, d: '排骨软烂，剁椒咸鲜', s: '中辣' },
  { n: '湘式蛋炒饭', c: '湘菜', p: 16, d: '粒粒分明，锅气十足', s: '不辣' },

  /* ---------------- 赣菜 22 道 ---------------- */
  { n: '井冈烟笋炒肉', c: '赣菜', p: 38, d: '烟笋脆嫩，腊肉咸香', s: '中辣', sig: true },
  { n: '宁都三杯鸡', c: '赣菜', p: 46, d: '一杯酒一杯油一杯酱油', s: '微辣', sig: true },
  { n: '南昌瓦罐汤', c: '赣菜', p: 16, d: '炭火煨足七小时', s: '不辣', sig: true },
  { n: '藜蒿炒腊肉', c: '赣菜', p: 42, d: '鄱阳湖藜蒿，清香脆嫩', s: '微辣', sig: true },
  { n: '荷包红鲤鱼', c: '赣菜', p: 58, d: '婺源贡鱼，肉嫩汤鲜', s: '不辣' },
  { n: '江西粉蒸肉', c: '赣菜', p: 32, d: '五香米粉，肥而不腻', s: '微辣' },
  { n: '兴国米粉鱼', c: '赣菜', p: 38, d: '米粉裹鱼，鲜辣软糯', s: '中辣' },
  { n: '九江鱼块', c: '赣菜', p: 42, d: '鄱阳湖鲜鱼，家常烧法', s: '中辣' },
  { n: '赣南小炒鱼', c: '赣菜', p: 44, d: '客家做法，酸辣鲜嫩', s: '特辣' },
  { n: '瑞金牛肉汤', c: '赣菜', p: 28, d: '汤清味浓，牛肉滑嫩', s: '微辣' },
  { n: '江西炒粉', c: '赣菜', p: 14, d: '米粉根根分明，锅气足', s: '中辣' },
  { n: '南昌拌粉', c: '赣菜', p: 12, d: '萝卜干花生，酱香浓郁', s: '微辣' },
  { n: '白糖糕', c: '赣菜', p: 12, d: '外酥内软，甜而不腻', s: '不辣' },
  { n: '婺源糊豆腐', c: '赣菜', p: 26, d: '米糊裹豆腐，暖胃鲜美', s: '不辣' },
  { n: '竹筒粉蒸排骨', c: '赣菜', p: 38, d: '竹香入肉，软糯脱骨', s: '微辣' },
  { n: '辣椒饼', c: '赣菜', p: 18, d: '糯米裹辣，煎得焦香', s: '中辣' },
  { n: '铜鼓包圆', c: '赣菜', p: 32, d: '薯粉包馅，客家风味', s: '不辣' },
  { n: '石鱼炒蛋', c: '赣菜', p: 28, d: '庐山石鱼，鲜香下饭', s: '微辣' },
  { n: '鄱阳湖胖鱼头', c: '赣菜', p: 68, d: '大鱼头炖汤，鲜掉眉毛', s: '中辣' },
  { n: '莲花血鸭', c: '赣菜', p: 46, d: '萍乡名菜，香辣浓稠', s: '特辣' },
  { n: '客家酿豆腐', c: '赣菜', p: 32, d: '豆腐酿肉，汤汁拌饭', s: '不辣' },
  { n: '砂锅板鸭', c: '赣菜', p: 48, d: '南安板鸭，砂锅焖香', s: '微辣' },

  /* ---------------- 家常菜 15 道 ---------------- */
  { n: '番茄炒蛋', c: '家常菜', p: 16, d: '酸甜下饭，国民第一菜', s: '不辣' },
  { n: '青椒土豆丝', c: '家常菜', p: 14, d: '酸辣脆爽，镬气十足', s: '微辣' },
  { n: '红烧茄子', c: '家常菜', p: 18, d: '软糯入味，酱香浓郁', s: '不辣' },
  { n: '可乐鸡翅', c: '家常菜', p: 26, d: '甜咸适口，老少皆宜', s: '不辣' },
  { n: '宫保鸡丁', c: '家常菜', p: 28, d: '糊辣荔枝味，花生酥脆', s: '中辣' },
  { n: '麻婆豆腐', c: '家常菜', p: 18, d: '麻辣烫嫩，拌饭无敌', s: '中辣' },
  { n: '清炒时蔬', c: '家常菜', p: 12, d: '当日鲜蔬，清爽解腻', s: '不辣' },
  { n: '紫菜蛋花汤', c: '家常菜', p: 10, d: '清淡暖胃，饭后一碗', s: '不辣' },
  { n: '蒜蓉西兰花', c: '家常菜', p: 18, d: '蒜香清甜，少油健康', s: '不辣' },
  { n: '糖醋里脊', c: '家常菜', p: 32, d: '外酥里嫩，酸甜可口', s: '不辣' },
  { n: '京酱肉丝', c: '家常菜', p: 28, d: '甜面酱炒肉，葱丝卷饼', s: '不辣' },
  { n: '玉米排骨汤', c: '家常菜', p: 26, d: '慢炖一小时，清甜滋润', s: '不辣' },
  { n: '蛋炒饭', c: '家常菜', p: 12, d: '鸡蛋裹饭，粒粒金黄', s: '不辣' },
  { n: '韭菜炒鸡蛋', c: '家常菜', p: 16, d: '韭香扑鼻，简单好吃', s: '不辣' },
  { n: '香菇滑鸡', c: '家常菜', p: 28, d: '香菇入味，鸡肉滑嫩', s: '不辣' }
];

const CUISINES = [
  { key: '重庆菜', tag: '渝', en: 'CHONGQING', desc: '麻辣鲜香，一口江湖气' },
  { key: '湘菜', tag: '湘', en: 'HUNAN', desc: '香辣浓烈，名副其实的米饭杀手' },
  { key: '赣菜', tag: '赣', en: 'JIANGXI', desc: '咸香鲜辣，瓦罐慢煨出的家常味' },
  { key: '家常菜', tag: '家', en: 'HOMESTYLE', desc: '一日三餐，最抚凡人心的那一口' }
];

const DISHES = RAW_DISHES.map((item, i) => ({
  ...item,
  id: 'd' + i,
  img: `assets/dish-${String(i).padStart(2, '0')}.jpg`,
  sales: 180 + ((i * 173) % 2300),
  rating: (4.6 + ((i * 37) % 4) / 10).toFixed(1)
}));

const DISH_MAP = new Map(DISHES.map((d) => [d.id, d]));

/* ----------------------------- 状态 ----------------------------- */
const state = { cuisine: '全部', keyword: '', sigOnly: false, sort: 'recommend' };
const cart = new Map(); // id -> qty

const $ = (sel, root = document) => root.querySelector(sel);

const chipsEl = $('#chips');
const menuEl = $('#menuList');
const cartBtn = $('#cartBtn');
const cartCountEl = $('#cartCount');
const drawer = $('#cartDrawer');
const overlay = $('#overlay');
const drawerBody = $('#drawerBody');
const drawerFoot = $('#drawerFoot');
const mobileBar = $('#mobileBar');
const toastEl = $('#toast');
const modalWrap = $('#modalWrap');
const resultTip = $('#resultTip');

/* ----------------------------- 工具 ----------------------------- */
const money = (n) => (Number.isInteger(n) ? n : n.toFixed(2));
const dishImage = (d) => d.img;

const cartCount = () => [...cart.values()].reduce((a, b) => a + b, 0);
const subtotal = () =>
  [...cart.entries()].reduce((sum, [id, q]) => sum + DISH_MAP.get(id).p * q, 0);
const deliveryFee = () => (cart.size === 0 ? 0 : subtotal() >= 88 ? 0 : 6);

/* ----------------------------- 筛选与排序 ----------------------------- */
function sortDishes(list) {
  const arr = [...list];
  if (state.sort === 'sales') arr.sort((a, b) => b.sales - a.sales);
  if (state.sort === 'priceAsc') arr.sort((a, b) => a.p - b.p);
  if (state.sort === 'priceDesc') arr.sort((a, b) => b.p - a.p);
  return arr;
}

function matchDish(d) {
  const kw = state.keyword.trim();
  if (!kw) return true;
  return (d.n + d.d + d.c).toLowerCase().includes(kw.toLowerCase());
}

/* ----------------------------- 渲染：分类芯片 ----------------------------- */
function renderChips() {
  const counts = {};
  DISHES.forEach((d) => (counts[d.c] = (counts[d.c] || 0) + 1));
  const keys = ['全部', ...CUISINES.map((c) => c.key)];
  chipsEl.innerHTML = keys
    .map((k) => {
      const n = k === '全部' ? DISHES.length : counts[k];
      return `<button type="button" class="chip${state.cuisine === k ? ' active' : ''}" data-cuisine="${k}">
        ${k}<b>${n}</b>
      </button>`;
    })
    .join('');
}

/* ----------------------------- 渲染：菜品 ----------------------------- */
const spiceClass = (s) => ({ 不辣: 'mild', 微辣: 'low', 中辣: 'mid', 特辣: 'hot' }[s] || 'mild');

function footHTML(d) {
  const q = cart.get(d.id) || 0;
  const price = `<div class="price"><small>¥</small><span>${money(d.p)}</span></div>`;
  if (!q) {
    return `${price}<button type="button" class="add" data-add="${d.id}" aria-label="把${d.n}加入购物车">+</button>`;
  }
  return `${price}<div class="stepper">
      <button type="button" data-dec="${d.id}" aria-label="减少${d.n}">−</button>
      <span>${q}</span>
      <button type="button" data-inc="${d.id}" aria-label="增加${d.n}">+</button>
    </div>`;
}

function cardHTML(d) {
  return `<article class="dish" data-id="${d.id}">
    <div class="thumb" data-initial="${d.n.slice(0, 1)}">
      <img loading="lazy" decoding="async" alt="${d.n}" src="${dishImage(d)}">
      ${d.sig ? '<span class="badge">招牌</span>' : ''}
      <span class="spice ${spiceClass(d.s)}">${d.s}</span>
    </div>
    <div class="body">
      <h3>${d.n}</h3>
      <p class="desc">${d.d}</p>
      <p class="meta">月售 ${d.sales.toLocaleString('zh-CN')} · ${d.rating} 分</p>
      <div class="foot">${footHTML(d)}</div>
    </div>
  </article>`;
}

function bindImageFallback() {
  menuEl.querySelectorAll('.thumb img').forEach((img) => {
    const done = () => img.classList.add('ok');
    if (img.complete && img.naturalWidth > 0) done();
    else img.addEventListener('load', done, { once: true });
    img.addEventListener(
      'error',
      () => {
        img.remove();
        img.closest('.thumb').classList.add('fail');
      },
      { once: true }
    );
  });
}

function renderMenu() {
  const sections = CUISINES.filter((c) => state.cuisine === '全部' || c.key === state.cuisine)
    .map((c, idx) => {
      let items = DISHES.filter((d) => d.c === c.key && matchDish(d));
      if (state.sigOnly) items = items.filter((d) => d.sig);
      items = sortDishes(items);
      return { c, idx: CUISINES.indexOf(c), items };
    })
    .filter((s) => s.items.length > 0);

  const total = sections.reduce((n, s) => n + s.items.length, 0);

  if (resultTip) {
    const kw = state.keyword.trim();
    resultTip.textContent = kw
      ? `「${kw}」共找到 ${total} 道菜`
      : state.sigOnly
        ? `招牌菜共 ${total} 道`
        : '';
    resultTip.hidden = !resultTip.textContent;
  }

  if (!total) {
    menuEl.innerHTML = `<div class="empty">
        <div class="empty-mark">空</div>
        <h3>没找到这道菜</h3>
        <p>换个关键词试试，或者看看今日的招牌菜。</p>
        <button type="button" class="btn primary" id="resetFilter">重置筛选</button>
      </div>`;
    return;
  }

  menuEl.innerHTML = sections
    .map(
      ({ c, idx, items }) => `
      <section class="cuisine-section" id="sec-${c.key}">
        <header class="section-head">
          <span class="section-index">${String(idx + 1).padStart(2, '0')}</span>
          <div class="section-title">
            <h2>${c.key}<em>${c.tag}</em></h2>
            <p>${c.desc}</p>
          </div>
          <span class="section-count">${items.length} 道</span>
        </header>
        <div class="dish-grid">${items.map(cardHTML).join('')}</div>
      </section>`
    )
    .join('');

  bindImageFallback();
}

/* ----------------------------- 购物车 ----------------------------- */
function updateCartUI() {
  const count = cartCount();
  const total = subtotal() + deliveryFee();

  cartCountEl.textContent = count;
  cartBtn.classList.toggle('has-items', count > 0);
  cartBtn.setAttribute('aria-label', `购物车，共 ${count} 件`);

  mobileBar.classList.toggle('show', count > 0);
  $('#mobileCount').textContent = count;
  $('#mobileTotal').textContent = '¥' + money(total);

  renderDrawer();
}

function stepperSmall(id, q) {
  return `<div class="stepper small">
      <button type="button" data-dec="${id}" aria-label="减少">−</button>
      <span>${q}</span>
      <button type="button" data-inc="${id}" aria-label="增加">+</button>
    </div>`;
}

function renderDrawer() {
  const count = cartCount();
  const sub = subtotal();
  const fee = deliveryFee();

  $('#drawerTitle').textContent = count ? `已点 ${count} 件` : '购物车';
  $('#clearCart').hidden = !count;

  if (!count) {
    drawerBody.innerHTML = `<div class="cart-empty">
        <div class="cart-empty-mark">灶</div>
        <h3>还没点菜</h3>
        <p>渝湘赣一百道家常菜，总有一道对你的胃口。</p>
      </div>`;
    drawerFoot.innerHTML = '';
    return;
  }

  drawerBody.innerHTML = [...cart.entries()]
    .map(([id, q]) => {
      const d = DISH_MAP.get(id);
      return `<div class="cart-item">
        <img src="${dishImage(d)}" alt="${d.n}" loading="lazy">
        <div class="ci-info">
          <h4>${d.n}</h4>
          <p>${d.c} · ${d.s}</p>
          <span class="ci-price">¥${money(d.p * q)}</span>
        </div>
        ${stepperSmall(id, q)}
      </div>`;
    })
    .join('');

  drawerFoot.innerHTML = `
    <div class="fee-line"><span>商品小计</span><b>¥${money(sub)}</b></div>
    <div class="fee-line"><span>配送费${fee === 0 ? '（已免）' : ''}</span><b>¥${money(fee)}</b></div>
    ${sub < 88 ? `<p class="fee-hint">再点 ¥${money(88 - sub)} 免配送费</p>` : ''}
    <div class="fee-total"><span>合计</span><b>¥${money(sub + fee)}</b></div>
    <button type="button" class="btn primary block" id="checkoutBtn">去结算</button>`;
}

function setQty(id, delta, fromDrawer = false) {
  const q = (cart.get(id) || 0) + delta;
  if (q <= 0) cart.delete(id);
  else cart.set(id, q);

  updateCartUI();

  const foot = document.querySelector(`.dish[data-id="${id}"] .foot`);
  if (foot) foot.innerHTML = footHTML(DISH_MAP.get(id));
  if (fromDrawer) renderDrawer();
}

let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

/* ----------------------------- 抽屉 / 弹窗 ----------------------------- */
function openDrawer() {
  drawer.classList.add('open');
  overlay.classList.add('show');
  document.body.classList.add('lock');
  drawer.setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  drawer.classList.remove('open');
  overlay.classList.remove('show');
  document.body.classList.remove('lock');
  drawer.setAttribute('aria-hidden', 'true');
}

function openModal() {
  modalWrap.classList.add('show');
  document.body.classList.add('lock');
}

function closeModal() {
  modalWrap.classList.remove('show');
  document.body.classList.remove('lock');
}

/* ----------------------------- 事件 ----------------------------- */
chipsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-cuisine]');
  if (!btn) return;
  state.cuisine = btn.dataset.cuisine;
  renderChips();
  renderMenu();
  const top = $('#menu').getBoundingClientRect().top + window.scrollY - 76;
  window.scrollTo({ top, behavior: 'smooth' });
});

$('#signatureToggle').addEventListener('click', (e) => {
  state.sigOnly = !state.sigOnly;
  e.currentTarget.classList.toggle('on', state.sigOnly);
  e.currentTarget.setAttribute('aria-pressed', String(state.sigOnly));
  renderMenu();
});

$('#sortSelect').addEventListener('change', (e) => {
  state.sort = e.target.value;
  renderMenu();
});

let searchTimer;
$('#searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  const val = e.target.value;
  searchTimer = setTimeout(() => {
    state.keyword = val;
    renderMenu();
  }, 160);
});

/* 全局点击委托 */
document.addEventListener('click', (e) => {
  const t = e.target;

  const add = t.closest('[data-add]');
  if (add) {
    setQty(add.dataset.add, 1);
    toast(`已加入 · ${DISH_MAP.get(add.dataset.add).n}`);
    return;
  }
  const inc = t.closest('[data-inc]');
  if (inc) return setQty(inc.dataset.inc, 1, true);
  const dec = t.closest('[data-dec]');
  if (dec) return setQty(dec.dataset.dec, -1, true);

  if (t.closest('#resetFilter')) {
    state.cuisine = '全部';
    state.keyword = '';
    state.sigOnly = false;
    $('#searchInput').value = '';
    $('#signatureToggle').classList.remove('on');
    renderChips();
    renderMenu();
    return;
  }

  if (t.closest('#cartBtn') || t.closest('#mobileBar')) return openDrawer();
  if (t.closest('#drawerClose') || t.closest('#overlay')) return closeDrawer();
  if (t.closest('#continueBtn') || t.closest('#modalClose')) return closeModal();

  if (t.closest('#clearCart')) {
    cart.clear();
    updateCartUI();
    renderMenu();
    toast('购物车已清空');
    return;
  }

  if (t.closest('#checkoutBtn')) {
    if (!cart.size) return;
    const paid = subtotal() + deliveryFee();
    const items = cartCount();
    const no = 'ZB' + String(Date.now()).slice(-8);
    $('#orderNo').textContent = no;
    $('#orderItems').textContent = `${items} 件菜品`;
    $('#orderAmount').textContent = '¥' + money(paid);
    closeDrawer();
    openModal();
    cart.clear();
    updateCartUI();
    renderMenu();
    return;
  }

  if (t.closest('#heroOrder')) {
    const top = $('#menu').getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: 'smooth' });
    setTimeout(() => $('#searchInput').focus({ preventScroll: true }), 400);
  }
});

overlay.addEventListener('click', closeDrawer);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDrawer();
    closeModal();
  }
  if (e.key === '/' && document.activeElement !== $('#searchInput')) {
    e.preventDefault();
    $('#searchInput').focus();
  }
});

/* ----------------------------- 启动 ----------------------------- */
$('#statTotal').textContent = DISHES.length;
$('#year').textContent = new Date().getFullYear();

renderChips();
renderMenu();
updateCartUI();
