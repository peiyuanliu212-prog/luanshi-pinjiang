/* 《后宫生存法则》· 宫廷版 —— data.js
 * 与《乱世拼将》同引擎换数据：八维（心计/才艺/交际/家世/体魄/容貌/威仪/福运）、三资源（恩宠=health/人脉=troops/声望=sec.fame）。
 * 人物 attrs 为人物矩阵定稿值（显式表优先于模板生成）。 */

const ATTR_KEYS = ['xinji','caiyi','jiaoji','jiashi','tipo','rongmao','weiyi','fuyun'];
const ATTR_NAMES = { xinji:'心计', caiyi:'才艺', jiaoji:'交际', jiashi:'家世', tipo:'体魄', rongmao:'容貌', weiyi:'威仪', fuyun:'福运' };

const ROUTE_ORDER = ['太后','皇后','贵妃','嫔妃','才人','秀女','女官','掌事姑姑','宫女'];
const ROUTE_TEMPLATES = {
  '太后':     { xinji:90, caiyi:60, jiaoji:85, jiashi:92, tipo:42, rongmao:55, weiyi:95, fuyun:80 },
  '皇后':     { xinji:85, caiyi:68, jiaoji:78, jiashi:90, tipo:48, rongmao:80, weiyi:90, fuyun:55 },
  '贵妃':     { xinji:88, caiyi:82, jiaoji:90, jiashi:76, tipo:55, rongmao:93, weiyi:82, fuyun:65 },
  '嫔妃':     { xinji:65, caiyi:70, jiaoji:70, jiashi:75, tipo:55, rongmao:82, weiyi:50, fuyun:60 },
  '才人':     { xinji:58, caiyi:95, jiaoji:70, jiashi:25, tipo:58, rongmao:85, weiyi:35, fuyun:58 },
  '秀女':     { xinji:60, caiyi:68, jiaoji:72, jiashi:55, tipo:58, rongmao:78, weiyi:30, fuyun:62 },
  '女官':     { xinji:75, caiyi:75, jiaoji:55, jiashi:45, tipo:52, rongmao:62, weiyi:60, fuyun:52 },
  '掌事姑姑': { xinji:80, caiyi:45, jiaoji:70, jiashi:28, tipo:62, rongmao:42, weiyi:80, fuyun:50 },
  '宫女':     { xinji:45, caiyi:50, jiaoji:72, jiashi:10, tipo:72, rongmao:65, weiyi:20, fuyun:68 }
};
const ROUTE_WEIGHTS = {
  '太后':     { xinji:0.22, caiyi:0.06, jiaoji:0.16, jiashi:0.21, tipo:0.07 , rongmao:.12, weiyi:.10, fuyun:.06 },
  '皇后':     { xinji:0.2, caiyi:0.09, jiaoji:0.14, jiashi:0.22, tipo:0.07 , rongmao:.12, weiyi:.10, fuyun:.06 },
  '贵妃':     { xinji:0.19, caiyi:0.14, jiaoji:0.2, jiashi:0.12, tipo:0.07 , rongmao:.12, weiyi:.10, fuyun:.06 },
  '嫔妃':     { xinji:0.16, caiyi:0.14, jiaoji:0.17, jiashi:0.16, tipo:0.09 , rongmao:.12, weiyi:.10, fuyun:.06 },
  '才人':     { xinji:0.1, caiyi:0.3, jiaoji:0.14, jiashi:0.06, tipo:0.12 , rongmao:.12, weiyi:.10, fuyun:.06 },
  '秀女':     { xinji:0.14, caiyi:0.14, jiaoji:0.19, jiashi:0.13, tipo:0.12 , rongmao:.12, weiyi:.10, fuyun:.06 },
  '女官':     { xinji:0.19, caiyi:0.19, jiaoji:0.12, jiashi:0.1, tipo:0.12 , rongmao:.12, weiyi:.10, fuyun:.06 },
  '掌事姑姑': { xinji:0.22, caiyi:0.07, jiaoji:0.19, jiashi:0.07, tipo:0.17 , rongmao:.12, weiyi:.10, fuyun:.06 },
  '宫女':     { xinji:0.1, caiyi:0.1, jiaoji:0.22, jiashi:0.03, tipo:0.27 , rongmao:.12, weiyi:.10, fuyun:.06 }
};

const TIER_MOD = { S:14, A:8, B:2, C:-4, D:-8 };
const SPECIAL_MOD = { S:10, A:8, B:5, C:3, D:0 };
const SPECIAL_FLOOR = { S:96, A:90, B:83, C:76, D:0 };
const SPECIAL_CAP = { S:99, A:96, B:90, C:84, D:78 };
const SPECIAL_OVERRIDE = {};
const RARITY_LABEL = { S:'S 级', A:'A 级', B:'B 级', C:'C 级', D:'D 级' };
const TIER_WEIGHT = { S:1, A:3, B:6, C:10, D:15 };

function genPlayerAttr(route, tier, special, name) {
  for (const f of FACTIONS) for (const p of f.people) {
    if (p.name === name && p.attrs) {
      const out = {};
      for (const k of ATTR_KEYS) out[k] = Math.max(8, Math.min(99, p.attrs[k]));
      return out;
    }
  }
  const tpl = ROUTE_TEMPLATES[route];
  const out = {};
  for (const k of ATTR_KEYS) {
    let v = tpl[k] + (TIER_MOD[tier] || 0);
    if (k === special) {
      v += SPECIAL_MOD[tier] || 0;
      v = Math.max(v, SPECIAL_FLOOR[tier] || 0);
      v = Math.min(v, SPECIAL_CAP[tier] || 99);
    }
    out[k] = Math.max(40, Math.min(99, v));
  }
  return out;
}
function routeDecay(fromRoute, toRoute) {
  const d = Math.abs(ROUTE_ORDER.indexOf(fromRoute) - ROUTE_ORDER.indexOf(toRoute));
  return d === 0 ? 1.00 : d === 1 ? 0.95 : d === 2 ? 0.90 : 0.85;
}
function attrGrade(v) {
  if (v >= 97) return 'SS+'; if (v >= 94) return 'SS'; if (v >= 91) return 'SS-';
  if (v >= 88) return 'S+';  if (v >= 85) return 'S';  if (v >= 82) return 'S-';
  if (v >= 79) return 'A+';  if (v >= 76) return 'A';  if (v >= 73) return 'A-';
  if (v >= 70) return 'B+';  if (v >= 66) return 'B';  if (v >= 62) return 'B-';
  if (v >= 58) return 'C+';  if (v >= 54) return 'C';  return 'C-';
}
function computeOVR(route, attrs) {
  const w = ROUTE_WEIGHTS[route];
  let s = 0;
  for (const k of ATTR_KEYS) s += w[k] * attrs[k];
  return Math.round(s);
}

/* ---------- 宫室与人物（30 人：S3 A4 B6 C8 D9；attrs 为矩阵定稿） ---------- */
const FACTIONS = [
  { name:'慈宁宫', people:[
    { name:'陆挽真', route:'太后', tier:'S', special:'xinji',  attrs:{ xinji:96, caiyi:62, jiaoji:88, jiashi:95, tipo:40, rongmao:58, weiyi:97, fuyun:82 } },
    { name:'程又青', route:'掌事姑姑', tier:'A', special:'xinji', attrs:{ xinji:85, caiyi:50, jiaoji:78, jiashi:30, tipo:66, rongmao:45, weiyi:85, fuyun:50 } },
    { name:'高福宁', route:'掌事姑姑', tier:'C', special:'xinji', attrs:{ xinji:74, caiyi:40, jiaoji:50, jiashi:26, tipo:58, rongmao:42, weiyi:68, fuyun:56 } },
    { name:'胡三姐', route:'掌事姑姑', tier:'D', special:'xinji', attrs:{ xinji:64, caiyi:36, jiaoji:58, jiashi:20, tipo:74, rongmao:38, weiyi:70, fuyun:45 } },
    { name:'莫问秋', route:'女官', tier:'D', special:'caiyi', attrs:{ xinji:68, caiyi:74, jiaoji:42, jiashi:38, tipo:36, rongmao:64, weiyi:42, fuyun:44 } } ] },
  { name:'中宫', people:[
    { name:'赵明仪', route:'皇后', tier:'A', special:'xinji', attrs:{ xinji:88, caiyi:70, jiaoji:80, jiashi:92, tipo:48, rongmao:82, weiyi:92, fuyun:58 } },
    { name:'郑含章', route:'女官', tier:'B', special:'xinji', attrs:{ xinji:80, caiyi:76, jiaoji:58, jiashi:50, tipo:44, rongmao:66, weiyi:72, fuyun:54 } },
    { name:'秦望舒', route:'嫔妃', tier:'B', special:'jiashi', attrs:{ xinji:68, caiyi:72, jiaoji:66, jiashi:88, tipo:45, rongmao:80, weiyi:55, fuyun:62 } },
    { name:'韩玉簪', route:'秀女', tier:'C', special:'caiyi', attrs:{ xinji:66, caiyi:80, jiaoji:52, jiashi:35, tipo:42, rongmao:83, weiyi:40, fuyun:38 } },
    { name:'卫明珠', route:'嫔妃', tier:'C', special:'tipo', attrs:{ xinji:62, caiyi:70, jiaoji:68, jiashi:58, tipo:84, rongmao:77, weiyi:52, fuyun:71 } } ] },
  { name:'承乾宫', people:[
    { name:'沈静姝', route:'贵妃', tier:'S', special:'jiaoji', attrs:{ xinji:90, caiyi:85, jiaoji:92, jiashi:78, tipo:55, rongmao:95, weiyi:84, fuyun:66 } },
    { name:'贺兰敏', route:'嫔妃', tier:'A', special:'jiaoji', attrs:{ xinji:60, caiyi:66, jiaoji:84, jiashi:85, tipo:82, rongmao:84, weiyi:62, fuyun:70 } },
    { name:'方绮罗', route:'嫔妃', tier:'B', special:'jiashi', attrs:{ xinji:58, caiyi:64, jiaoji:72, jiashi:80, tipo:52, rongmao:90, weiyi:48, fuyun:72 } },
    { name:'姜蜜儿', route:'秀女', tier:'D', special:'jiaoji', attrs:{ xinji:26, caiyi:54, jiaoji:76, jiashi:42, tipo:66, rongmao:76, weiyi:16, fuyun:73 } },
    { name:'钱宝珠', route:'宫女', tier:'D', special:'xinji', attrs:{ xinji:56, caiyi:38, jiaoji:62, jiashi:11, tipo:60, rongmao:62, weiyi:33, fuyun:78 } } ] },
  { name:'尚宫局', people:[
    { name:'温叙白', route:'女官', tier:'A', special:'caiyi', attrs:{ xinji:78, caiyi:88, jiaoji:60, jiashi:45, tipo:50, rongmao:76, weiyi:38, fuyun:60 } },
    { name:'许清晏', route:'女官', tier:'B', special:'xinji', attrs:{ xinji:72, caiyi:58, jiaoji:55, jiashi:40, tipo:62, rongmao:72, weiyi:36, fuyun:64 } },
    { name:'罗绛仙', route:'女官', tier:'C', special:'caiyi', attrs:{ xinji:52, caiyi:82, jiaoji:46, jiashi:22, tipo:56, rongmao:75, weiyi:28, fuyun:48 } },
    { name:'孙巧姐', route:'宫女', tier:'D', special:'caiyi', attrs:{ xinji:40, caiyi:78, jiaoji:44, jiashi:14, tipo:50, rongmao:60, weiyi:26, fuyun:63 } },
    { name:'春桃', route:'宫女', tier:'D', special:'tipo', attrs:{ xinji:28, caiyi:44, jiaoji:66, jiashi:6, tipo:80, rongmao:55, weiyi:18, fuyun:66 } } ] },
  { name:'储秀宫', people:[
    { name:'苏锦瑟', route:'才人', tier:'S', special:'caiyi', attrs:{ xinji:55, caiyi:98, jiaoji:70, jiashi:18, tipo:60, rongmao:88, weiyi:40, fuyun:74 } },
    { name:'林晚照', route:'秀女', tier:'B', special:'xinji', attrs:{ xinji:82, caiyi:74, jiaoji:76, jiashi:64, tipo:58, rongmao:85, weiyi:44, fuyun:52 } },
    { name:'陶夭夭', route:'秀女', tier:'C', special:'jiaoji', attrs:{ xinji:30, caiyi:68, jiaoji:80, jiashi:55, tipo:64, rongmao:78, weiyi:20, fuyun:76 } },
    { name:'杜若', route:'秀女', tier:'D', special:'caiyi', attrs:{ xinji:58, caiyi:72, jiaoji:40, jiashi:48, tipo:46, rongmao:79, weiyi:35, fuyun:57 } },
    { name:'阿箬', route:'宫女', tier:'D', special:'jiaoji', attrs:{ xinji:34, caiyi:50, jiaoji:70, jiashi:9, tipo:68, rongmao:68, weiyi:15, fuyun:30 } } ] },
  { name:'长乐宫', people:[
    { name:'柳新雁', route:'宫女', tier:'B', special:'jiaoji', attrs:{ xinji:76, caiyi:45, jiaoji:90, jiashi:12, tipo:70, rongmao:74, weiyi:30, fuyun:68 } },
    { name:'白露未', route:'宫女', tier:'C', special:'tipo', attrs:{ xinji:48, caiyi:52, jiaoji:74, jiashi:10, tipo:78, rongmao:70, weiyi:22, fuyun:88 } },
    { name:'孟姜梨', route:'嫔妃', tier:'C', special:'caiyi', attrs:{ xinji:70, caiyi:78, jiaoji:48, jiashi:60, tipo:38, rongmao:81, weiyi:34, fuyun:25 } },
    { name:'豆蔻', route:'宫女', tier:'C', special:'jiaoji', attrs:{ xinji:36, caiyi:48, jiaoji:82, jiashi:8, tipo:72, rongmao:72, weiyi:12, fuyun:80 } },
    { name:'田穗儿', route:'宫女', tier:'D', special:'tipo', attrs:{ xinji:32, caiyi:46, jiaoji:60, jiashi:7, tipo:82, rongmao:52, weiyi:24, fuyun:69 } } ] }
];

/* ---------- 出身（玩家开局四选一） ---------- */
const ORIGINS = [
  { name:'官家小姐', desc:'规矩从小刻进骨头里，就是没人疼', initFix:{ jiashi:4, jiaoji:2 }, initSec:{ fame:1 } },
  { name:'书香门第', desc:'诗书读了满腹，宫里的书更难读', initFix:{ caiyi:4, xinji:2 }, initSec:{} },
  { name:'商户之女', desc:'算盘打得精，人情也算得清', initFix:{ jiaoji:4, xinji:2 }, initSec:{ network:2 }, secGrowBonus:true },
  { name:'农户女儿', desc:'力气是真的，别的都要现学', initFix:{ tipo:4, jiaoji:2 }, initSec:{ fame:-1 }, fameGrowBonus:true }
];

/* ---------- 二级数值 ---------- */
const SEC_KEYS = ['fame','network','loyalty','ambition','controversy'];
const SEC_NAMES = { fame:'声望', network:'门路', loyalty:'恩义', ambition:'心气', controversy:'非议' };

/* ---------- 称号（双维组合优先 → 单维最高 → 兜底） ---------- */
const TITLE_PAIRS = [
  { attrs:['xinji','jiaoji'], title:'八面玲珑' },
  { attrs:['xinji','jiashi'], title:'深藏不露' },
  { attrs:['caiyi','jiaoji'], title:'六宫瞩目' },
  { attrs:['jiashi','tipo'], title:'金枝玉叶' },
  { attrs:['xinji','caiyi'], title:'才貌双全' }
];

/* ---------- 十二章 ---------- */
const CHAPTERS = [
  { n:1, name:'分宫', brief:'选秀过后，你们这一批秀女被领着往各宫分派。管事姑姑念名字像念账本，念到谁，谁就拎起包袱往前走。同住的宫女白露未排在最后，手里的包袱散了，帕子钗子撒了一地，没人停下来等她。', options:[
    { label:'A', text:'蹲下来帮她收拾', kind:'亲为', check:'jiaoji',
      win:{ effects:{ troops:80, flag:'helped_bailu' }, tier:'胜', bio:'你帮她拢好了包袱，她一路小跑跟上队伍，回头看了你三回。' },
      lose:{ effects:{ fame:-1, flag:'helped_bailu' }, tier:'僵持', bio:'你越帮越忙，管事姑姑皱了眉。白露未小声说：姐姐，你人真好，就是手有点笨。' } },
    { label:'B', text:'只当没看见', kind:'自保',
      fixed:{ effects:{ flag:'neutral_bailu' }, tier:'僵持', bio:'你目不斜视地走过去了。宫里第一课：先顾自己。' } },
    { label:'C', text:'抢先替管事姑姑分忧', kind:'谋划', check:'xinji',
      win:{ effects:{ health:2, flag:'used_bailu' }, tier:'胜', bio:'你三言两语把队伍排得齐整，管事姑姑多看了你一眼。白露未抱着散包袱，站在最后。' },
      lose:{ effects:{ fame:-1, flag:'used_bailu' }, tier:'僵持', bio:'你热心过了头，倒像抢人差事。白露未的包袱，还是散着的。' } }
  ]},
  { n:2, name:'请安', brief:'入宫三月，规矩学了七分，看人脸色学了十分。掌事姑姑程又青最重规矩。这日请安，新人里有人迟了半刻，有人衣纹不正，程又青没发火，只让所有人跪着听训。膝盖跪得发麻的时候，她问：谁来说说，错在哪儿？', options:[
    { label:'A', text:'老老实实领罚', kind:'自保',
      fixed:{ effects:{ fame:1, health:-2, flag:'apprentice_cheng' }, tier:'僵持', bio:'你跪足了时辰。程又青路过你身边，脚步顿了顿，什么也没说。' } },
    { label:'B', text:'替迟到的陶夭夭求情', kind:'亲为', check:'jiaoji',
      win:{ effects:{ troops:100, health:-1 }, tier:'胜', bio:'你说她是替你取东西才迟的。程又青看了你一会儿，挥手让陶夭夭起来了。' },
      lose:{ effects:{ health:-3 }, tier:'败', bio:'求情求成了同罪。你陪着陶夭夭一起跪，她哭着说对不起，你说闭嘴，省点力气。' } },
    { label:'C', text:'说这罚不合旧例', kind:'谋划', check:'weiyi',
      win:{ effects:{ fame:2, flag:'offended_cheng' }, tier:'胜', bio:'你引了旧例，程又青挑不出错，只得作罢。只是她看你的眼神，从此多了点东西。' },
      lose:{ effects:{ health:-4, flag:'offended_cheng' }, tier:'败', bio:'旧例没引对，还被她多问了三条。跪着的时候你想，书还是要多读。' } }
  ]},
  { n:3, name:'差事', brief:'转眼已过数月，宫中的新人早已换了一批。熬过学规矩的日子，到了领差事的时候。差事有好有坏：针线房清闲，茶水房长见识，库房苦，却管着实在东西。程又青把三块牌子摆在桌上，说：自己挑，挑了别后悔。', options:[
    { label:'A', text:'去针线房', kind:'谋划', check:'caiyi',
      win:{ effects:{ health:2, troops:60 }, tier:'胜', bio:'你的活计被罗绛仙夸了一句「齐整」。针线房的日子慢，慢有慢的好处。' },
      lose:{ effects:{ fame:-1 }, tier:'僵持', bio:'你扎了三回手。罗绛仙默默替你收了尾，什么也没说。' } },
    { label:'B', text:'去茶水房', kind:'亲为',
      fixed:{ effects:{ troops:120, flag:'intel_liu' }, tier:'胜', bio:'茶水房的柳新雁给你派活前先递了块糖：嘴甜的人，在这儿饿不着。' } },
    { label:'C', text:'去库房', kind:'自保', check:'jiashi',
      win:{ effects:{ fame:2 }, tier:'胜', bio:'库房的账你三天理清了。管事的说，这是个能托付东西的人。' },
      lose:{ effects:{ health:-2 }, tier:'僵持', bio:'库房阴冷，你咳了半个月。账倒是清的，人也是清的——清闲的清。' } }
  ]},
  { n:4, name:'宫宴', brief:'入秋，宫里办起了赏菊宴。赏菊宴是贵妃沈静姝的主场。席间行令，有人提议新人们各献一样才艺，给贵妃助兴。所有人的目光在你们几个新人身上转了一圈——这一圈目光里，有看热闹的，也有等着看人摔跤的。', options:[
    { label:'A', text:'倾力献上一曲', kind:'亲为', check:'caiyi',
      win:{ effects:{ health:4, fame:1, flag:'noticed_shen' }, tier:'大胜', bio:'一曲终了，贵妃搁下酒盏，说了句：这孩子，手上有东西。她记住你了——是好是坏，还不知道。' },
      lose:{ effects:{ fame:-2, flag:'noticed_shen' }, tier:'败', bio:'弦断了一根。你跪下去的时候想，断弦的声音，满殿都听见了。' } },
    { label:'B', text:'藏拙，只做捧场', kind:'自保',
      fixed:{ effects:{ troops:60 }, tier:'僵持', bio:'你笑了一整晚，拍手拍得最齐整。没人记住你，也没人惦记你。' } },
    { label:'C', text:'把机会让给林晚照', kind:'谋划', check:'jiaoji',
      win:{ effects:{ troops:80, flag:'allied_lin' }, tier:'胜', bio:'林晚照的舞惊了满座。她下场时经过你身边，低声说：这份情，我记下了。' },
      lose:{ effects:{ fame:-1 }, tier:'僵持', bio:'林晚照跳砸了。让机会的人和跳砸的人，一起成了今晚的闲话。' } }
  ]},
  { n:5, name:'流言', brief:'宴后没几日，闲话先传遍了六宫。闲话说你深夜在御花园私会侍卫。没影子的事，传得有鼻子有眼，连你哪天穿的什么衣裳都编出来了。这日去冷宫附近送东西，你在门口遇见了失宠的孟姜梨，她看了你一会儿，说：这话头，我当年也听过。', options:[
    { label:'A', text:'自己查是谁传的', kind:'谋划', check:'xinji',
      win:{ effects:{ fame:2, flag:'knew_truth' }, tier:'胜', bio:'源头查到了，是个你没得罪过的人。宫里害人，有时候不需要理由，这比有理由更让人心凉。' },
      lose:{ effects:{ fame:-2, health:-2 }, tier:'败', bio:'你查了半个月，只查到一串「听说」。闲话这种东西，越查越像真的。' } },
    { label:'B', text:'托柳新雁打听', kind:'亲为',
      fixed:{ effects:{ troops:-60, fame:1, flag:'knew_truth' }, tier:'胜', bio:'柳新雁收了你的好处，三天后给你带来一句话：再传下去，源头那位自己先坐不住。果然，闲话慢慢散了。' } },
    { label:'C', text:'临走帮孟姜梨带句话', kind:'自保',
      fixed:{ effects:{ troops:-30, flag:'helped_meng' }, tier:'僵持', bio:'你替孟姜梨给旧日的姐妹带了句话。她说：宫里肯停下来跟我说话的人，不多了。这闲话，你且由它去吧。' } }
  ]},
  { n:6, name:'两宫之礼', noMerit:true, brief:'冬日里，两宫的赏赐一前一后送到了你门上。皇后赏的是一套头面，贵妃赏的是一匣子南珠。收哪一份，就是站哪一边；两份都收，是两边都得罪。', options:[
    { label:'A', text:'往皇后宫里谢恩', kind:'站队',
      fixed:{ effects:{ fame:2, health:-3, flag:'proQueen' }, tier:null, bio:'你戴着皇后赏的头面去请安。满宫都看见了，满宫也都记下了。' } },
    { label:'B', text:'往贵妃宫里回话', kind:'站队',
      fixed:{ effects:{ health:3, fame:-2, troops:100, flag:'proConsort' }, tier:null, bio:'贵妃拉着你的手说了半天话，留你用了晚膳。这话当天就传遍了六宫。' } },
    { label:'C', text:'两份都收下，谁也不去', kind:'站队', taunt:true,
      fixed:{ effects:{ troops:-50, flag:'neutral' }, tier:null, bio:'你把头面和南珠锁进同一个箱子。宫里的人说你滑头，你说这叫平安。' } }
  ]},
  { n:7, name:'陷害', brief:'开春第一桩事，是有人告发你私藏违禁之物。搜宫的人来得很快，从你箱笼底层翻出一包不该有的东西——你没见过它，但它躺在你的箱子里，比什么都像证据。主事的问你：还有什么要说的？', options:[
    { label:'A', text:'当场自辩，逐条对质', kind:'亲为', check:'weiyi',
      win:{ effects:{ fame:2 }, tier:'胜', bio:'你问到第三个问题，对方先乱了阵脚。这包东西的来路，改日再算，今日你先站住了。' },
      lose:{ effects:{ health:-7, fame:-2 }, tier:'败', bio:'你说得都对，可宫里讲理的地方不多。你被申饬禁足，恩宠一日凉过一日。' } },
    { label:'B', text:'求同宫的人作证', kind:'谋划', check:'jiaoji',
      win:{ effects:{ troops:-40, health:-3 }, tier:'胜', bio:'作证的人来得勉强，话也说得勉强，好在够了。你欠下的这份人情，比钱难还。' },
      lose:{ effects:{ health:-8 }, tier:'败', bio:'你求了一圈，门都关着。原来平日里的热闹，到了节骨眼上，一文不值。' } },
    { label:'C', text:'认个小错，避开大祸', kind:'自保',
      fixed:{ effects:{ health:-5, fame:-1 }, tier:'僵持', bio:'你认了个「失察」的错，罚了三个月月钱。错不是你的，钱是真的没了。' } }
  ],
  flagVariants:{ helped_bailu:{ brief:'开春第一桩事，是有人告发你私藏违禁之物。搜宫的人从你箱笼底层翻出一包不该有的东西。人群后头忽然挤出个小宫女，跪下来磕了个头，声音抖得不成样子，却把话说全了：那晚她值夜，她看见是谁把东西塞进去的。是白露未。', options:[
    { label:'A', text:'顺着她的证词追问到底', kind:'亲为', check:'xinji',
      win:{ effects:{ fame:3, flag:'bailu_proved' }, tier:'大胜', bio:'真相大白那一刻，白露未哭得比你还凶。你欠她的，这辈子怕是还不清了。' },
      lose:{ effects:{ health:-4, flag:'bailu_proved' }, tier:'败', bio:'证词有了，处置却拖了下来。但满宫都知道，那晚有个小宫女，替你把命豁出去了。' } },
    { label:'B', text:'护住她，只说到此为止', kind:'谋划',
      fixed:{ effects:{ troops:100, health:-2 }, tier:'胜', bio:'你说不查了。白露未不明白，你说明白人活得累，就到这儿吧。' } },
    { label:'C', text:'认个小错，避开大祸', kind:'自保',
      fixed:{ effects:{ health:-5, fame:-1 }, tier:'僵持', bio:'你认了个「失察」的错。白露未在门外站了很久，她的证词，你到底没用上。' } }
  ] } } },
  { n:8, name:'侍疾', brief:'太后病了，六宫轮流侍疾。侍疾是苦差，也是天梯——太后跟前的位置，平日里轮不到你们这样的人。管事的拿着排班单问：谁愿意去？满屋的人都低着头，装作在数地砖的缝。', options:[
    { label:'A', text:'亲自侍奉汤药', kind:'亲为', check:'tipo',
      win:{ effects:{ fame:3, health:1, flag:'taihou_favor' }, tier:'大胜', bio:'第三夜，太后醒过来，拉着你的手叫了个小名——那是她早夭的女儿的。你什么都没说，把药吹凉了递过去。' },
      lose:{ effects:{ health:-6 }, tier:'败', bio:'你熬了五夜，自己先病倒了。侍疾的人换成了别人，故事也就换了主角。' } },
    { label:'B', text:'请司药的许清晏拟方', kind:'谋划', check:'caiyi',
      win:{ effects:{ fame:2, troops:60, flag:'taihou_favor' }, tier:'胜', bio:'许清晏的方子对了症。她说：这味药我认得，是治心病的。太后好起来那日，赏了你们两个人。' },
      lose:{ effects:{ fame:-1 }, tier:'僵持', bio:'方子没用上，太医有太医的章程。许清晏把那张方子叠好收起来，像收起一句没说出口的话。' } },
    { label:'C', text:'称病避开', kind:'自保',
      fixed:{ effects:{}, tier:'僵持', bio:'你躲了这一程。后来听说侍疾的人里有人得了青眼，你把被子往上拉了拉，睡了。' } }
  ]},
  { n:9, name:'冷宫故人', brief:'又是一年选秀，当年的人，散的散，起的起。孟姜梨托人捎来口信：当年她替人传一句话，传丢了自己的前程。如今她查到那句话的下文了，只求有人替她把一封信送到该看见的人手里。送信的人担多大干系，她心里清楚，你心里也清楚。', options:[
    { label:'A', text:'替她送这一封信', kind:'亲为', check:'xinji',
      win:{ effects:{ troops:100, fame:1, flag:'meng_delivered' }, tier:'胜', bio:'信送到了。回音还没来，孟姜梨先托人送了你一包晒干的桂花——冷宫院里那棵树，今年开得很好。' },
      lose:{ effects:{ health:-6 }, tier:'败', bio:'信在半路被截了。你在屋里坐了一夜，想的是：有些忙，帮人的时候就该想到这个下场。' } },
    { label:'B', text:'明哲保身，婉言谢绝', kind:'自保',
      fixed:{ effects:{ flag:'cold_meng' }, tier:'僵持', bio:'口信回得很客气。后来你路过冷宫，门是关着的，桂花开了一地，没人扫。' } },
    { label:'C', text:'把这事透露给贵人邀功', kind:'谋划', check:'jiaoji',
      win:{ effects:{ health:3, troops:-60, flag:'used_meng' }, tier:'胜', bio:'贵人听完，赏了你一串沉香木的念珠。你转着念珠想，孟姜梨这辈子，大概不会再托人捎信了。' },
      lose:{ effects:{ fame:-2, flag:'used_meng' }, tier:'败', bio:'贵人对这事没兴趣。你卖了故人，还没卖上价钱，这是最难堪的一种买卖。' } }
  ],
  flagVariants:{ helped_meng:{ brief:'又是一年选秀，当年的人，散的散，起的起。孟姜梨的口信来得很直接：当年你肯停下来跟我说句话，这次，我只信你。她要求的不多——一封信，送到该看见的人手里。', options:[
    { label:'A', text:'替她送这一封信', kind:'亲为',
      fixed:{ effects:{ troops:120, fame:1, flag:'meng_delivered' }, tier:'胜', bio:'信送得很稳。孟姜梨说，她在冷宫里也没什么可报答的，就报你一句：你会有好下场的。她说这话的样子，像在说一件已经发生过的事。' } },
    { label:'B', text:'劝她放下，各自安好', kind:'自保',
      fixed:{ effects:{ flag:'cold_meng' }, tier:'僵持', bio:'你说了很多道理，她都听着，最后说：你变了。这两个字，比骂你难听。' } },
    { label:'C', text:'把这事透露给贵人邀功', kind:'谋划', check:'jiaoji',
      win:{ effects:{ health:3, troops:-80, flag:'used_meng' }, tier:'胜', bio:'贵人听完，赏了你一串沉香木的念珠。你转着念珠想，孟姜梨这辈子，大概不会再托人捎信了。' },
      lose:{ effects:{ fame:-2, flag:'used_meng' }, tier:'败', bio:'贵人对这事没兴趣。你卖了故人，还没卖上价钱，这是最难堪的一种买卖。' } }
  ] } } },
  { n:10, name:'那封信', brief:'宫里要变天了，人人都闻得出来。你替贵妃宫里送东西，在沈静姝的妆匣底层，摸到了一封没有落款的信。字迹是男子的，称呼亲昵得不像话。你只看了一行，就把信按回了原处——可你的手，在抖。', options:[
    { label:'A', text:'守口如瓶，当没看见', kind:'自保',
      fixed:{ effects:{ flag:'shen_trust' }, tier:'胜', bio:'三日后，贵妃无意间提起妆匣，说了句：我这屋里，难得有个手脚干净、嘴也干净的人。' } },
    { label:'B', text:'把信还给她，当面', kind:'亲为', check:'jiaoji',
      win:{ effects:{ troops:150, flag:'allied_shen' }, tier:'大胜', bio:'她盯着你看了很久，久到你以为要完了。然后她笑了，把信凑到烛火上：这世上，又少了一个能要我命的东西。' },
      lose:{ effects:{ health:-5 }, tier:'败', bio:'你的话说得太直白，倒像威胁。她收了信，也收起了笑：下去吧。这三个字，你听了一路。' } },
    { label:'C', text:'把这事卖个好价钱', kind:'谋划', check:'xinji',
      win:{ effects:{ health:5, troops:-40, flag:'shen_enemy' }, tier:'胜', bio:'对面的人听完，给了你想要的一切。只是从那天起，你走夜路总觉得身后有脚步声。' },
      lose:{ effects:{ health:-7, fame:-2, flag:'shen_enemy' }, tier:'败', bio:'消息走漏得比价钱快。贵妃还没倒，你先成了两边都不敢用的人。' } }
  ]},
  { n:11, name:'总清算', brief:'最后一局棋，所有人都落了子，只剩你。这一章走完，深宫里再没有"以后再说"。', options:[
    { label:'A', text:'在宴上做个安分人', kind:'自保',
      fixed:{ effects:{ health:-2 }, tier:'僵持', bio:'这一晚的是非，你躲过去了。躲，有时候也是一种本事。' } },
    { label:'B', text:'替两边传一句话', kind:'谋划', check:'jiaoji',
      win:{ effects:{ troops:100 }, tier:'胜', bio:'话传得圆满，两边都承你的情。' },
      lose:{ effects:{ fame:-2 }, tier:'败', bio:'话传岔了。传话的人，最容易里外不是人。' } },
    { label:'C', text:'早早退席', kind:'自保',
      fixed:{ effects:{ health:1 }, tier:'僵持', bio:'你退席的时候，听见身后的丝竹又响了起来。' } }
  ],
  flagVariants:{
    proQueen:{ brief:'皇后要动贵妃了，选在万寿宴这一晚。她不需要你出头，只需要你在贵妃敬酒时，把那杯酒稳稳接住——接住了，你就是中宫的人；手一抖，你就是弃子。', options:[
      { label:'A', text:'稳稳接住那杯酒', kind:'亲为', check:'weiyi',
        win:{ effects:{ fame:3, health:1 }, tier:'大胜', bio:'那杯酒你喝得滴水不漏。当晚，贵妃宫里的灯，一盏一盏灭了。' },
        lose:{ effects:{ fame:-2, health:-6 }, tier:'败', bio:'你的手还是抖了。酒洒在裙角上，像一句没说出口的供词。' } },
      { label:'B', text:'把酒引到自己身上', kind:'谋划', check:'jiaoji',
        win:{ effects:{ troops:150, fame:1 }, tier:'胜', bio:'你笑着说这酒该你敬皇后。满殿的人都松了口气，除了贵妃。' },
        lose:{ effects:{ troops:-80, fame:-1 }, tier:'僵持', bio:'你引得太急，两边都看出来了。宫里最忌讳的，就是自作聪明。' } },
      { label:'C', text:'称病，先退席', kind:'自保',
        fixed:{ effects:{ health:-2 }, tier:'僵持', bio:'你退席的时候，听见身后的丝竹又响了起来。这一局，你没上桌。' } }
    ] },
    proConsort:{ brief:'贵妃要在万寿宴上扳回这一局。她说，只要你肯在皇后敬酒时"不小心"打翻酒盏，事成之后，这宫里就有你的一席之地。她说这话时，替你理了理鬓边的碎发。', options:[
      { label:'A', text:'照她说的做', kind:'亲为', check:'tipo',
        win:{ effects:{ health:4, fame:-2, flag:'shenHand' }, tier:'大胜', bio:'酒盏翻在皇后裙上，满殿寂静。贵妃握住你的手，掌心是热的。' },
        lose:{ effects:{ health:-8, fame:-3 }, tier:'败', bio:'你没拿稳，酒泼了自己一身。贵妃收回了手，像收回一句没说过的话。' } },
      { label:'B', text:'做，但留一手', kind:'谋划', check:'xinji',
        win:{ effects:{ fame:1, flag:'shenSecret' }, tier:'胜', bio:'你做了，也让该看见的人看见了是谁指使的。这把柄，你收得比谁都稳。' },
        lose:{ effects:{ health:-5, fame:-2 }, tier:'败', bio:'你留的那一手太明显。贵妃当晚就换了寝殿的锁。' } },
      { label:'C', text:'临阵反悔，护住皇后', kind:'自保',
        fixed:{ effects:{ fame:2, health:-4, flag:'proQueen' }, tier:null, bio:'你接住了那杯酒。贵妃看着你，慢慢笑了：原来你也是会选的人。' } }
    ] },
    neutral:{ brief:'万寿宴上，两宫的人都看着你。你谁的队也没站过，所以这一晚，你的座位被安排在最靠门的地方——离两边都远，离是非也远。只是酒过三巡，有人把一壶酒放在了你面前。', options:[
      { label:'A', text:'给两宫各敬一杯', kind:'亲为', check:'jiaoji',
        win:{ effects:{ troops:120, fame:1 }, tier:'胜', bio:'你敬皇后时说规矩，敬贵妃时说情分。两杯酒下肚，你还是你自己的人。' },
        lose:{ effects:{ fame:-2 }, tier:'僵持', bio:'两边都接了你的酒，也都没把你当自己人。墙头草的名声，不太好听。' } },
      { label:'B', text:'借着酒劲，说一句真话', kind:'谋划', check:'xinji',
        win:{ effects:{ fame:3, flag:'clearHeart' }, tier:'大胜', bio:'你说你进宫只想好好活着。这句话太不合时宜，反倒没人敢接。' },
        lose:{ effects:{ health:-6, fame:-1 }, tier:'败', bio:'真话在宫里是最贵的，也是最容易要命的。这一晚你学到了。' } },
      { label:'C', text:'早早退席，回屋睡觉', kind:'自保', taunt:true,
        fixed:{ effects:{ health:2 }, tier:'僵持', bio:'你在被窝里听完了整场宴的丝竹声。深宫再热闹，也热闹不到你头上。' } }
    ] }
  } },
  { n:12, name:'终章', noMerit:true, brief:'风波落定，尘埃还没落定。摆在你面前的路有三条，每条都通向一种活法。往前走的，留下争的，或者转身走的——深宫不拦任何人，它只是从来不送。', options:[
    { label:'A', text:'争一争这凤位之下的人生', kind:'亲为', finalChoice:'zheng',
      fixed:{ effects:{}, tier:null, bio:'你把这些年攒下的人、事、体面，一样一样摆上台面。这一次，你不躲了。' } },
    { label:'B', text:'依一棵大树，安稳余生', kind:'谋划', finalChoice:'yi',
      fixed:{ effects:{}, tier:null, bio:'你选了一个靠得住的人，把后半程的日子押上去。押对押错，都是自己选的。' } },
    { label:'C', text:'求一道恩典，出宫去', kind:'自保', finalChoice:'li',
      fixed:{ effects:{}, tier:null, bio:'你跪下来求的不是宠，是放你走。宫门那么高，你想看看外面的天，是不是也这么高。' } }
  ]}
];

const BIOS = {"陆挽真": {"bio": "先帝旧族出身，在宫里熬了两朝。说话慢声细语，每句都留三分余地。她不依附任何人，只盘算一件事：保住家族的哀荣，体面地老去。", "trait": "话留三分", "traitDesc": "一句话只说七分，剩下的让人自己怕"}, "程又青": {"bio": "内务府家生子，四十岁熬成掌事姑姑。铁面之下有细心，先讲规矩，再讲人情。年轻时替主子背过一回锅，旧伤至今阴雨天还疼。", "trait": "铁面细心", "traitDesc": "规矩她立，人情也留三分"}, "高福宁": {"bio": "家生子出身的掌事姑姑，冷面寡言，一个眼神顶三句话。年轻时也曾得意过，如今提也不提，只想少惹事，平安熬到出宫的岁数。", "trait": "眼抵千言", "traitDesc": "不必开口，一个眼神就镇住场"}, "胡三姐": {"bio": "家生子，基层的掌事姑姑，嗓门洪亮，动不动就说听好了。她泼辣务实又护短，年轻时管过的事，比程又青还多。", "trait": "泼辣精明", "traitDesc": "嗓门压得住场，心里算得清账"}, "莫问秋": {"bio": "旧臣之后，守着冷衙门的旧档案，冷淡通透，爱说与我无关。没人看的故纸堆里藏着前朝秘辛，她守着，只当守一辈子的清净。", "trait": "故纸通明", "traitDesc": "旧档烂熟于心，前朝事她最清楚"}, "赵明仪": {"bio": "将门嫡女，母仪天下，端方隐忍。多年无子又无宠，中宫的位置却纹丝不动——她靠的不是恩宠，是规矩，是分寸，是从不说满的话。", "trait": "四平八稳", "traitDesc": "话从不说满，错从不出在她身上"}, "郑含章": {"bio": "礼官之后，任司礼，开口先引旧例，认死理，只认制度不认人。她一心要做女官之首，最怕的，却是有人说她靠的是父荫。", "trait": "旧例压人", "traitDesc": "一条旧例搬出来，谁都驳不倒"}, "秦望舒": {"bio": "世家旁支的女儿，家里送她进宫，原是替嫡姐补的缺。她温顺，爱说都好，心里却有主意——只盼生下皇子，替自己站稳脚跟。", "trait": "门第生光", "traitDesc": "世家旁支的体面，她撑得比谁都稳"}, "韩玉簪": {"bio": "家道中落的旧世家女儿，清高敏感，话里爱引诗句。行李里藏着当掉首饰换来的银票——她不肯低头，一心要重振门楣。", "trait": "诗骨清高", "traitDesc": "诗句张口就来，傲气压不住"}, "卫明珠": {"bio": "边地将门出身，爽朗能吃苦，说话带边地口音。她会骑马，身手利落，在这四方宫墙里，总偷偷想念一望无际的草原。", "trait": "骑射双绝", "traitDesc": "马背上的本事，侍卫也服气"}, "沈静姝": {"bio": "诗礼之家长女，明艳张扬，一笑倾座。话里带笑，笑里带刺，最会把人心拢到自己这边。她只怕一件事：有朝一日，盛宠不再。", "trait": "笑里藏锋", "traitDesc": "她笑着递的酒，没人敢不接"}, "贺兰敏": {"bio": "边将之女，嗓门亮，笑声能传半条宫道。骑射胜过宫中多数侍卫，脾气却急，藏不住话。她进宫不为别的，要替父兄挣回一份体面。", "trait": "声传六宫", "traitDesc": "她一笑，半宫的人都跟着松快"}, "方绮罗": {"bio": "富商之女，娇气爱美，三句不离新衣首饰。她的嫁妆单子，比许多嫔妃的体己还丰厚。深宫的路难走，她的办法简单：拿钱开路。", "trait": "金玉满堂", "traitDesc": "银子铺到的地方，路就通到哪里"}, "姜蜜儿": {"bio": "点心铺的女儿，贪吃爱笑，说话带笑音，袖子里常藏着点心。她自来熟，管不住嘴，进宫最大的心愿是尝遍宫里的好吃的。", "trait": "笑音迎人", "traitDesc": "还没开口先带笑，谁都愿意亲近"}, "钱宝珠": {"bio": "破落商户之女，精打细算，开口先算成本。她有一本全宫最详细的人情账本，谁欠谁多少，都记着——帮人可以，先讲互利。", "trait": "人情账本", "traitDesc": "谁的人情值多少，她记得一清二楚"}, "温叙白": {"bio": "书香门第出身的女官，清冷自持，惜字如金。一部宫史经她的手编修，谁也不知道，她私下还写着一本没有署名的宫闱笔记。", "trait": "秉笔直书", "traitDesc": "笔下无虚言，宫史经她手最可信"}, "许清晏": {"bio": "医户世家出身，掌司药，沉静谨慎，说话前先想三秒。她认得几种不该出现在宫里的药味，却总替人留三分余地，从不把话说死。", "trait": "三思后言", "traitDesc": "开口前想三秒，祸事躲她三分"}, "罗绛仙": {"bio": "绣户出身的针线女官，安静手巧，一幅绣品能引得满宫争看。她的绣活曾被贵人冒名领赏，她低着头，没敢吭一声。", "trait": "妙手生花", "traitDesc": "针线到她手里，花鸟都像活的"}, "孙巧姐": {"bio": "绣庄学徒出身的绣娘，耐心温和，轻声慢语。夜里点灯赶活，眼睛熬得越来越差，她只想攒够钱，开一间自己的绣摊。", "trait": "飞针走线", "traitDesc": "一根针在她手里，快得看不见影"}, "春桃": {"bio": "佃户女儿，老实肯干，应答先点头。进宫三年，没出过错，也没出过头。每月的月钱一文不舍得花，全寄回家里去。", "trait": "吃苦耐劳", "traitDesc": "再重的活计，她闷头就干完"}, "苏锦瑟": {"bio": "乐户出身，幼时被卖进乐坊，一身琵琶绝技是拿童年换来的。她通透豁达，不争宠不站队，只攒着赏钱，想出宫开一间自己的乐坊。", "trait": "一曲倾城", "traitDesc": "一曲未终，满座先软了心肠"}, "林晚照": {"bio": "地方官家女儿，在家里并不受宠，进宫的名额是自己争来的。她好胜机敏，句句机锋，可敌可友——只看对方值不值得她费心。", "trait": "机锋逼人", "traitDesc": "一句反问出口，对方先乱了阵脚"}, "陶夭夭": {"bio": "富户幼女，天真烂漫，进宫纯粹是被家人哄来的。她没防人之心，叽叽喳喳爱问为什么，一心只想着吃遍御膳房的点心。", "trait": "笑语盈盈", "traitDesc": "她一开口笑，戒心先卸一半"}, "杜若": {"bio": "教书先生之女，沉默寡言，一天说不上十句话。她的诗写得极好，却从不示人，只想安安静静，把宫里的书读完。", "trait": "诗才不露", "traitDesc": "诗写得再好，也只肯自己看"}, "阿箬": {"bio": "小贩之女，粗心大意，连连道歉是口头禅。她打碎过贵人的茶盏，嫁祸给了一只猫——随和没脾气，少挨骂就是她的福。", "trait": "笑脸迎人", "traitDesc": "错先认，笑先赔，没人忍心怪她"}, "柳新雁": {"bio": "市井出身的宫女，机灵嘴甜，语速比消息还快。宫里大半流言，都在她这儿过第一手。她谁都不得罪，只一门心思攒钱赎身出宫。", "trait": "消息先行", "traitDesc": "话还没出口，消息已经满宫飞"}, "白露未": {"bio": "农户女儿，没读过书，没心眼，想到什么说什么。认准一个人就再不变心。她力气大得惊人，一口没人挪得动的水缸，她独自能搬。", "trait": "力能扛鼎", "traitDesc": "满宫搬不动的东西，她一人能行"}, "孟姜梨": {"bio": "小官之女，曾盛宠一时，只因替人传错一句话，跌进冷清宫里。她清醒悲观，身子又弱，口头禅是都过去了——看透，却不说透。", "trait": "才情自守", "traitDesc": "一身才情藏着，从不拿出来争宠"}, "豆蔻": {"bio": "灾年被送进宫的小宫女，活泼机灵，童言无忌。她记得每个主子的小喜好，靠这份记性讨赏，只盼吃饱穿暖，快些长大。", "trait": "记性讨喜", "traitDesc": "主子的喜好她全记着，赏少不了"}, "田穗儿": {"bio": "山里猎户的女儿，乡音未改，憨直力大。她能徒手爬树掏鸟窝，身手好得不像宫女。心愿简单：吃饱，睡好，寄钱回家。", "trait": "身手矫健", "traitDesc": "爬树上墙的本事，满宫找不出第二个"}};
for (const f of FACTIONS) for (const p of f.people) { const b = BIOS[p.name]; if (b) { p.bio = b.bio; p.trait = b.trait; p.traitDesc = b.traitDesc; } }
