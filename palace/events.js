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

/* 《后宫生存法则》· 宫廷版 —— events_extra.js
 * 随机事件增补 6 个（P9–P14）。字段与 events.js 一致：id / title / weight / story / focus / options
 * 选项：label / text / check / taunt / effects / flag / result / win / lose */

const EVENTS_EXTRA = [
  { id:'P9', title:'错味的药', weight:40,
    story:'司药房新到一批药材，许清晏挨个闻过去，闻到一味，眉头就没松开过。她说这味不对，先别入库，可管事的催着要签收放行。她一个人站在药柜前，额头上都是汗。',
    focus:'她闻得出的东西，账上写不出来。',
    options:[
      { label:'A', text:'陪她一味味复核', check:'caiyi',
        win:{ effects:{ troops:60, health:-2 }, result:'你们查到天黑，果然有一味掺了次货。许清晏把你的名字记在验药的册子后面，字写得格外工整。' },
        lose:{ effects:{ health:-2, fame:-1 }, result:'查了半日也没查出个所以然，倒耽误了入库。管事的脸色不好看，许清晏小声说：对不住，连累你了。' } },
      { label:'B', text:'替她拖住管事的', effects:{ troops:40, health:-2 }, result:'你陪管事的说了半天闲话，年岁、籍贯、家里的猫，都聊到了。等许清晏那边验完，你嗓子也哑了。' },
      { label:'C', text:'劝她先签了再说', effects:{ health:1, fame:-1 }, result:'她看了你一会儿，还是签了。后来那味药到底没出事，只是她再没主动跟你说过药房的事。' } ] },
  { id:'P10', title:'沉了的桶', weight:40,
    story:'井台边围了一圈人。白露未打水的时候绳子断了，桶沉了底，这桶是要赔的。她蹲在井边绞着手，月钱还没发，她拿什么赔。',
    focus:'一只桶的价钱，够她省吃俭用两个月。',
    options:[
      { label:'A', text:'先替她把桶钱垫上', effects:{ troops:40, health:-1, flag:'helped_bailu' }, result:'你跑了两处才把钱凑齐。白露未说这钱她一定还，还从袖子里摸出块糖塞你手里，说先还个利息。' },
      { label:'B', text:'陪她去管事跟前求情', check:'jiaoji',
        win:{ effects:{ fame:1, health:-1 }, result:'你说绳子本就磨得快断了，不全是她的错。管事的查了绳头，摆摆手免了赔。白露未出门就哭了，说是吓的。' },
        lose:{ effects:{ health:-3 }, result:'管事的一句「规矩就是规矩」，把你们都堵了回来。白露未的桶钱到底从月钱里扣了，你陪着站了半日，什么也没落下。' } },
      { label:'C', text:'让她自己想办法', effects:{ health:1, fame:-1 }, result:'你回了屋，歇了个整觉。只是后来再去井台打水，总觉得那眼井比先前深。' } ] },
  { id:'P11', title:'试香', weight:40,
    story:'贵妃新得了两盒香，让近身伺候的人挨个闻，说真话，哪个更衬她。前头两个都捡好听的说了，沈静姝听着没什么表情，眼睛慢慢转到你身上。',
    focus:'一盒清淡，一盒浓烈，她要听的不是香。',
    options:[
      { label:'A', text:'说真话，选清淡那盒', check:'rongmao',
        win:{ effects:{ fame:1, health:-1 }, result:'你说浓的压人，清的衬她，话音落时仪态不慌不乱。她怔了怔，把浓的那盒推开。这一晚你睡得不太踏实，总觉得这话说得太满。' },
        lose:{ effects:{ fame:-1, health:-1 }, result:'话一出口你就乱了方寸，声音发飘。她淡淡说：知道了。香盒都收走了，你在原地站了半天，手心全是汗。' } },
      { label:'B', text:'跟着夸浓的那盒', effects:{ health:2, fame:-1 }, result:'她笑笑，叫人把浓的收了起来——用的还是清的那盒。你松了口气，又有点说不上来的失落。' },
      { label:'C', text:'说娘娘用哪个都好', taunt:true, effects:{ troops:30, health:-1 }, result:'你说香是死的，人是活的，娘娘往那儿一站，什么香都成了陪衬。她笑出了声，赏了你一块点心。只是这话传出去，旁人看你的眼神多了点意味。' } ] },
  { id:'P12', title:'抄经', weight:35,
    story:'皇后为太后祈福，要赶在寿辰前抄完一部经，缺一个字迹齐整的人誊副本。赵明仪跟前的女官把话递到你这儿：这差事体面，就是熬人。',
    focus:'体面的差事，往往最磨人。',
    options:[
      { label:'A', text:'接下来，熬夜抄完', effects:{ fame:2, health:-3 }, result:'你抄了五夜，眼睛熬得通红，经却抄得一笔不苟。皇后翻到最后，点了点头。这份体面，是拿觉换的。' },
      { label:'B', text:'推说自己字丑', effects:{ health:1, fame:-1 }, result:'女官没说什么，另寻了别人。你的觉是保住了，只是之后再有体面差事，也没人想起你。' },
      { label:'C', text:'荐韩玉簪去', effects:{ troops:30, fame:-1 }, result:'韩玉簪的字确实比你强，她抄完得了句夸。你荐人的情她记下了，只是这份体面，到底记在她名下。' } ] },
  { id:'P13', title:'夜巡', weight:40,
    story:'半夜，程又青提着灯查铺，在耳房逮到阿箬抱着膝哭——她想家了，怕被人听见，躲在这儿。程又青回头问你：你跟在后头，都看见什么了？',
    focus:'一句话，能救人，也能压人。',
    options:[
      { label:'A', text:'实话实说，她在哭', check:'fuyun',
        win:{ effects:{ fame:1 }, result:'程又青沉默了一会儿，到底只罚阿箬抄了十遍宫规，还免了她的夜值。阿箬后来见你绕着走，你说不上这是对还是错。' },
        lose:{ effects:{ troops:-30, health:-1 }, result:'偏赶上程又青心情最坏的一夜。阿箬被罚跪到天亮，你陪着站了半宿。运气这东西，今夜没站在你这边。' } },
      { label:'B', text:'说她是来送针线的', effects:{ troops:50, health:-2, flag:'helped_aruo' }, result:'你替她圆了过去，代价是陪程又青把剩下的铺全查完，腿都走细了。阿箬第二天塞给你一个自己缝的香包，针脚歪歪扭扭。' },
      { label:'C', text:'说什么都没看见', taunt:true, effects:{ health:1, fame:-1 }, result:'你说你眼神不好，夜里什么都看不清。程又青看了你一眼，没拆穿。阿箬的事过去了，你睁眼说瞎话的名声，也悄悄传开了。' } ] },
  { id:'P14', title:'错位的座次', weight:40,
    story:'一场小宴，座次牌摆错了，林晚照的位置被挪到了末席。她站在门口，手里捏着帕子，进去也不是，走也不是。摆牌子的小太监早不见人影了。',
    focus:'一张牌子的事，难堪的是人。',
    options:[
      { label:'A', text:'趁没人注意把牌子换回来', effects:{ troops:60, health:-1, flag:'allied_lin' }, result:'你换得手心冒汗。林晚照落座时看见牌子，又看了你一眼，什么都没说，整晚给你布了三回菜。' },
      { label:'B', text:'陪她坐末席', effects:{ troops:40, fame:-1 }, result:'末席冷清，你们俩倒说了不少体己话。就是这一幕落在旁人眼里，又成了「失势的人抱团」的闲话。' },
      { label:'C', text:'劝她别计较', effects:{ health:1, fame:-1 }, result:'她笑笑，坐下了，整晚吃得很少。你回屋想起她捏帕子的手，觉得自己的话轻飘飘的，没什么分量。' } ] }
];

EVENTS.push(...EVENTS_EXTRA);
