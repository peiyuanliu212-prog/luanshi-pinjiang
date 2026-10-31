/* 《后宫生存法则》· 宫廷版 —— events.js
 * 随机事件 8 个。字段：id / title / story / focus / weight / options
 * 选项：label / text / check / taunt / effects / result / win / lose */

const EVENTS = [
  { id:'P1', title:'御花园的猫', weight:50,
    story:'御花园里那只御猫又打翻了花架。阿箬站在旁边，脸都白了——上回打碎茶盏，她说是猫干的，这回猫真干了，反倒没人信她。',
    focus:'这只猫背的锅，比它吃的鱼还多。',
    options:[
      { label:'A', text:'替阿箬认下', effects:{ troops:40 }, result:'你认了个督管不力的小错。阿箬追上来塞给你两个果子，猫在墙头看着你们，十分高傲。' },
      { label:'B', text:'把猫抱走藏起来', effects:{ fame:1 }, result:'猫在你屋里住了一晚，呼噜打得震天响。第二天它自己回去了，像什么都没发生过。' },
      { label:'C', text:'实话实说', effects:{ health:1 }, result:'主事的听完笑了：难得有个说实话的。这事就这么过去了。' } ] },
  { id:'P2', title:'赏赐分配', weight:50,
    story:'内务府送来一筐时鲜果子，不够满宫分的。分果子的人是你——分给谁多一点，谁少一点，都有人看着。',
    focus:'果子是小事，人心是大事。',
    options:[
      { label:'A', text:'先紧着高位', effects:{ health:2, troops:-20 }, result:'高位那边很满意。分得少的几个，笑容淡了淡。' },
      { label:'B', text:'人人有份，匀着分', effects:{ troops:60, health:-1 }, result:'果子切得小了些，但每个人手里都有。柳新雁说你会做人，你说你只是怕麻烦。' },
      { label:'C', text:'把自己那份也让出去', effects:{ fame:2 }, result:'你一个没留。这事传出去，比果子甜。' } ] },
  { id:'P3', title:'撞衫', weight:40,
    story:'方绮罗的新衣裳和秦望舒撞了料子。两个人都在等一句话：谁穿得更难看。这话得你说。',
    focus:'两边都是不能得罪的人。',
    options:[
      { label:'A', text:'夸方绮罗', effects:{ troops:30, fame:-1 }, result:'方绮罗高高兴兴走了。秦望舒那天没跟你说话。' },
      { label:'B', text:'夸秦望舒', effects:{ troops:30, health:-1 }, result:'秦望舒抿嘴笑了。方绮罗回头就换了三套衣裳，一套比一套贵。' },
      { label:'C', text:'说衣裳不如人', effects:{ fame:1 }, result:'你说这料子挑人，穿对了才好看。两个人各自想了想，都觉得你说的是自己。' } ] },
  { id:'P4', title:'深夜传话', weight:40,
    story:'半夜，柳新雁摸黑来敲你的窗：一个消息，贵妃明日要查各宫的账。她说完就走，走出三步又回头：也可能是假的，你自己掂量。',
    focus:'她的消息，十次里有八次是真的。',
    options:[
      { label:'A', text:'连夜把自己的账理清', effects:{ health:-2, fame:1 }, result:'你熬了一夜。第二天没人查账，但你的账，从此是最干净的。' },
      { label:'B', text:'把消息卖给隔壁宫', effects:{ troops:50 }, result:'隔壁宫承了你的情。至于消息真假——反正卖的不是你。' },
      { label:'C', text:'睡一觉再说', effects:{ health:2 }, result:'你睡了个整觉。第二天风平浪静。柳新雁说：你这心，是真大。' } ] },
  { id:'P5', title:'节庆筹备', weight:40,
    story:'陶夭夭被派了办小宴的差事，急得团团转，来拉你帮忙。办好了，是她的功劳；办砸了，有你的一份。',
    focus:'帮，还是不帮？',
    options:[
      { label:'A', text:'帮她办得漂漂亮亮', effects:{ troops:70, health:-2 }, result:'宴办得极好。陶夭夭在人前把功劳分了你一半，这是你没想到的。' },
      { label:'B', text:'帮一半，留一半', effects:{ troops:20 }, result:'宴还过得去。陶夭夭说谢谢，你说不客气，你们都明白这「一半」是什么意思。' },
      { label:'C', text:'推说自己忙', effects:{ fame:-1 }, result:'宴还是办成了，就是没人提你的名字。陶夭夭见了你，还是笑，就是笑得淡了。' } ] },
  { id:'P6', title:'家书', weight:35,
    story:'一封家书辗转送到你手里。字不多，说家里一切都好，让你顾好自己，落款的日期是三个月前。',
    focus:'三个月前的「一切都好」。',
    options:[
      { label:'A', text:'回一封长信', effects:{ health:-1, troops:20 }, result:'你写了六页纸，把宫里的日子挑好的说。写到最后，你自己都快信了。' },
      { label:'B', text:'托人捎些银钱回去', effects:{ troops:-30, fame:1 }, result:'钱捎出去了，心里踏实了些。宫里的人攒钱各有各的用处，你的用处在宫外。' },
      { label:'C', text:'把信收进箱底', effects:{ health:1 }, result:'你把信压在箱底，和那支没送出去的钗放在一起。日子还得往前过。' } ] },
  { id:'P7', title:'冒名的绣品', weight:40,
    story:'罗绛仙熬了三个月的双面绣，被人拿去贵人跟前领了赏。她站在廊下，手里攥着针线包，一声不吭。你都听说了。',
    focus:'替她出头，就是替自己树敌。',
    options:[
      { label:'A', text:'陪她去把话说清', effects:{ troops:50, fame:1, flag:'helped_luo' }, result:'话说清了，赏要回来一半。罗绛仙回去给你绣了个荷包，针脚密得像要把谢字写进去。' },
      { label:'B', text:'私下点一点那位冒名的', effects:{ troops:30 }, result:'那位收敛了些。罗绛仙不知道是谁帮的忙，只说最近清净多了。' },
      { label:'C', text:'劝她算了', effects:{ health:1 }, result:'你说算了，她也说算了。你们都知道，这事没完，只是今天先不提。' } ] },
  { id:'P8', title:'寒夜炭火', weight:35,
    story:'大雪夜，你屋里的炭盆灭了。门外有响动——是田穗儿，抱着一盆炭站在雪里，鼻尖冻得通红，说：姐姐，我那份多，分你一半。',
    focus:'她的炭，也是按份例领的。',
    options:[
      { label:'A', text:'收下，记她的好', effects:{ health:2, flag:'helped_tian' }, result:'那盆炭烧了大半夜。田穗儿说她们山里人皮实，不怕冷，你看着她冻红的鼻尖，没拆穿。' },
      { label:'B', text:'分她一碗热汤再让她走', effects:{ troops:40 }, result:'她捧着汤碗，喝得眉开眼笑，说宫里的人就是讲究。炭留下了，汤喝完了，人情记下了。' },
      { label:'C', text:'让她拿回去', effects:{ fame:1 }, result:'你说份例就是份例。她愣了愣，抱着炭走了，雪地上留了一串脚印。' } ] }
];

const REGULAR_POOL = EVENTS.filter(e => e.weight > 0);
const CHAPTER_EVENT_NODES = [2, 4, 6, 8, 10];
const MAX_EVENTS_GAME = 5;
