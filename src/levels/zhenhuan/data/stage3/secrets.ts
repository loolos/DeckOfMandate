// 把柄（隐藏）

export type HuanghouId = "jingrenHoushang" | "xieliGongwu" | "antaiBupin" | "jiayanXianyi" | "shanghuaXiaoju";

/** 第二关里用陵容解决、会带进第三关的 6 种私事。 */
export type Stage2SecretId = "shiqinNeiqing" | "zhuangshenNonggui" | "sitanSiqiu" | "jierenYaochong" | "kuitanGongwei" | "qiuziXinqie";
export const STAGE2_SECRETS: readonly Stage2SecretId[] = ["shiqinNeiqing", "zhuangshenNonggui", "sitanSiqiu", "jierenYaochong", "kuitanGongwei", "qiuziXinqie"];

export type SecretId =
  | Stage2SecretId
  | "wangyeZengwu"
  | "guyiYuanyan"
  | "xinlengZhiyu"
  | "yuzhongShuxin"
  | "qiciBuyong"
  | "xijianSiyu"
  | "chuyanDingzhuang"
  | "shanduShide"
  | "yuanwangJunfu"
  | "dingmanZhonggong"
  | "shoulongMairen"
  | `enshang.${HuanghouId}`;

export type SecretDef = {
  readonly name: string;
  readonly emoji: string;
  /** 对质时的指控（齐妃、祺贵人之口）。 */
  readonly line: string;
  /** 同一桩事由宫人、小太监说出的版本；对质里轮流使用，保证每次都有宫人开口。 */
  readonly servant?: string;
  /** 只有陵容在场：甄嬛从这几条里明白是她。 */
  readonly lingrong: boolean;
  /** 这件事当初是怎么来的（对质时标在皇后的问话下面）。 */
  readonly hint: string;
};

export const SECRETS: Record<SecretId, SecretDef> = {
  shiqinNeiqing: { name: "侍寝内情", emoji: "🌙", lingrong: true, line: "祺贵人拿帕子拭着眼角：「那晚敬事房明明翻的是莞嫔的牌子，进养心殿的却是旁人。莞嫔称病，转头让别人替了去，这是欺瞒圣上，混淆宫闱。」", servant: "敬事房的小太监跪着说：「那晚翻的是莞嫔的牌子，进养心殿的却不是她。称病，转头让旁人顶替，这是欺瞒圣上，混淆宫闱。」", hint: "第二关里，你曾让陵容代你侍寝。" },
  zhuangshenNonggui: { name: "装神弄鬼", emoji: "👻", lingrong: true, line: "祺贵人颤声道：「嫔妾听说，那夜丽嫔姐姐宫里有人扮作余莺儿的冤魂哭诉，后来才知是人装的。在宫里装神弄鬼，吓得嫔御失魂，这是扰乱宫闱，欺君不敬。」", servant: "景仁宫的小宫女道：「丽嫔娘娘那夜见的‘余莺儿’，是有人扮的。莞嫔在宫里装神弄鬼，吓得嫔御失魂落魄，这是扰乱宫闱，欺君不敬。」", hint: "丽嫔惊梦那夜，扮余莺儿的冤魂吓她，是陵容帮你办的。" },
  sitanSiqiu: { name: "私探死囚", emoji: "🥀", lingrong: true, line: "齐妃一拍扶手：「余氏临死前，碎玉轩派人去冷宫见过她，旁人都不让进。私见待罪的宫人，难免叫人疑心是在替她传话、灭口，有碍皇上明察。」", servant: "冷宫的老嬷嬷低着头：「余氏临死前，碎玉轩来过人，说是探视，旁人一概不让近前。私见待罪的宫人，难免叫人疑心是在替她传话、灭口，有碍皇上明察。」", hint: "余莺儿临死前，你让陵容去冷宫探视过她。" },
  jierenYaochong: { name: "借人邀宠", emoji: "🌺", lingrong: true, line: "祺贵人轻轻一笑：「那支曲子唱得巧，皇上偏偏就往碎玉轩去了。借旁人的曲子邀宠，把皇上引到自己宫里，这是算计圣驾。」", servant: "御前的小太监说：「那晚皇上本是要往别处去的，偏有一支曲子从碎玉轩飘出来，皇上就改了道。借旁人的曲子邀宠，把圣驾引到自己宫里，这是算计圣驾。」", hint: "欢宜香浓那回，你借陵容的曲子把皇上引到了碎玉轩。" },
  kuitanGongwei: { name: "窥探宫闱", emoji: "👁️", lingrong: true, line: "齐妃冷哼一声：「各宫的宫女往哪儿走，碎玉轩的人比内务府还清楚。私下打探各宫动静，窥探宫闱，有违宫规！」", servant: "内务府的小太监说：「各宫的宫女往哪儿走，碎玉轩的人比奴才还清楚。私下打探各宫动静，这是窥探宫闱，有违宫规。」", hint: "隔墙有耳那回，各宫的动静是陵容替你打探的。" },
  qiuziXinqie: { name: "求子心切", emoji: "🙏", lingrong: true, line: "祺贵人掩口道：「嫔妾听宝华殿的人说，莞嫔在佛前跪了半日，嘴里念的竟是求子。身为嫔御私下谋求子嗣，是觊觎圣恩。」", servant: "宝华殿的小宫女道：「莞嫔在佛前跪了半日，嘴里念的不是平安，是求子。身为嫔御，私下谋求子嗣，这是怀着心思觊觎圣恩。」", hint: "在宝华殿祈福时，你在佛前求的是子嗣。" },
  wangyeZengwu: { name: "王爷赠物", emoji: "🎐", lingrong: true, line: "齐妃冷笑一声：「桐花台那日，十七爷与莞嫔说了好一会子话，宫里好些人都瞧见了。妃嫔私下与亲王说话，内外无别，辱及天家体面。」", servant: "桐花台旁当差的小太监说：「奴才那日远远瞧见，十七爷与莞嫔在台上说了好一会子话。妃嫔私下与亲王说话，内外无别，辱及天家体面。」", hint: "桐花台初遇果郡王，你与他说了好一会儿话。" },
  guyiYuanyan: { name: "故衣怨言", emoji: "👗", lingrong: true, line: "齐妃扬声道：「莞嫔穿了一回旧衣，便说皇上看的从来不是自己。这是怨怼君上，对皇上的恩宠不知足。」", servant: "碎玉轩外洒扫的小宫女低声道：「奴婢听见主子对人说，皇上看的从来不是她……这是怨怼君上，对圣恩不知足。」", hint: "纯元故衣之后，你对陵容说过皇上看的从来不是你。" },
  xinlengZhiyu: { name: "心冷之语", emoji: "💔", lingrong: true, line: "祺贵人接过话头，声音不高，字字清楚：「嫔妾听说，莞嫔私下叹过，这些年的恩宠‘终究是错付了’，还说自己的心‘冷了’。雨露皆是君恩，何来错付之说？这是怨怼君上，大不敬。」", servant: "碎玉轩外洒扫的小太监低着头：「奴才那晚听见莞嫔对人叹气，说这些年的情意‘终究是错付了’，心也冷了。对着皇上的恩宠说错付，这是怨怼，是不敬。」", hint: "纯元故衣之后，你对陵容叹过一句“终究是错付了”，说自己的心冷了。" },
  yuzhongShuxin: { name: "狱中书信", emoji: "📜", lingrong: true, line: "齐妃道：「甄大人下狱后，碎玉轩托人往狱里递过一封信。私通狱中钦犯，信里写了什么，皇上不妨问问。」", servant: "内务府的小太监说：「甄大人下狱后，碎玉轩托人往狱里递过一封信。私通狱中的钦犯，不知写了些什么，皇上不妨问问。」", hint: "父亲下狱后，你曾托人往狱里递过一封信。" },
  qiciBuyong: { name: "弃赐不用", emoji: "🍲", lingrong: true, line: "祺贵人道：「皇后娘娘亲赐的安胎补品，莞嫔一口没动，倒是喂了花。辜负中宫的赏赐，既是不敬皇后，也不爱惜皇嗣。」", servant: "景仁宫的小宫女说：「皇后娘娘亲赐的安胎补品，莞嫔一口没动，倒是喂了花。辜负中宫的赏赐，这是对皇后不敬，也不爱惜皇嗣。」", hint: "皇后送来的安胎补品，你一口也没有用。" },
  xijianSiyu: { name: "席间私语", emoji: "🏮", lingrong: true, line: "祺贵人撇着嘴：「赏花那日，莞嫔和人说了好些各宫的长短。背地里议论妃嫔，搬弄是非，这是扰得后宫不和。」", servant: "赏花那日在旁伺候的小宫女说：「莞嫔和人说了好些各宫的长短，奴婢听得真真的。背地里议论妃嫔、搬弄是非，这是扰得后宫不和。」", hint: "赏花小聚上，你与人议论过各宫的长短。" },
  chuyanDingzhuang: { name: "出言顶撞", emoji: "🗣️", lingrong: false, line: "齐妃红着眼眶抢着开口：「皇上，那日请安，臣妾不过提醒莞嫔几句宫里的规矩，她当着众姐妹的面顶撞臣妾，一句不让。臣妾好歹是妃位，这般目无尊卑，往后六宫还怎么服众！」", servant: "景仁宫的小宫女道：「那日请安，齐妃娘娘提点了莞嫔几句，奴婢亲眼见莞嫔当着众人顶撞回去，一句不让。这是目无尊卑。」", hint: "晨省讥语的事没有压下去，你当面顶过她。" },
  shanduShide: { name: "善妒失德", emoji: "🐍", lingrong: false, line: "祺贵人哭着道：「前些日子嫔妾不过说了句话，莞嫔便当着众人的面给嫔妾脸色看。嫔妾是新人，怕是容不下嫔妾，这是善妒，有违后宫和睦。」", servant: "御花园的小太监说：「那日祺小主刚说了一句话，莞嫔当着众人就给了脸色。容不下新人，这是善妒，有违后宫和睦。」", hint: "祺贵人争宠的事没有压下去，你给过她脸色。" },
  yuanwangJunfu: { name: "怨望君父", emoji: "⛓️", lingrong: false, line: "祺贵人又道：「嫔妾的父亲在前朝当差，早前上过一道折子，参的正是甄大人。后来听说，莞嫔私下里说，甄大人这案子是冤在皇上。怨怼圣裁，这是对皇上不满，近乎大不敬。」", servant: "前朝传话的小太监战战兢兢：「鄂大人参了甄大人的本之后，奴才听人传，莞嫔私下说甄大人这案子是冤在皇上。怨怼圣裁，近乎大不敬。」", hint: "鄂敏参本的事没有压下去，你为父亲的案子流露过怨望。" },
  dingmanZhonggong: { name: "怠慢中宫", emoji: "🏮", lingrong: false, line: "皇后端着茶盏，笑吟吟地说：「那日晨省，本宫问起碎玉轩的饮食起居，妹妹只含糊应了两句，连头也没抬。本宫一片心意，倒被妹妹当成了客套。」", servant: "景仁宫的小宫女道：「那日晨省，皇后娘娘问起碎玉轩近况，莞嫔答得极敷衍，连眼皮都没抬。这是怠慢中宫。」", hint: "皇后在晨省上问起碎玉轩近况，你没有好好应对。" },
  shoulongMairen: { name: "收买人心", emoji: "🧧", lingrong: false, line: "皇后端起茶盏，缓缓说道：「碎玉轩的赏钱，这些日子倒是比谁都散得勤。各宫的奴才都说莞嫔宽厚，这份宽厚，是冲着谁去的？私下收买宫人，结党营私，可是宫里的大忌。」", servant: "各宫当差的小太监低着头：「碎玉轩的人三天两头给奴才们塞银子，问的都是各宫的动静。这是收买宫人，结党营私。」", hint: "第一幕里，你一再用银钱打点各宫的宫人。" },
  "enshang.jingrenHoushang": { name: "恩赏为凭·云锦步摇", emoji: "🎁", lingrong: false, line: "祺贵人捏着帕子道：「皇后娘娘赏了一支点翠步摇、一匹云锦，那是妃位的份例、宫里的贡品。莞嫔收下转头就戴着去给太后请安，这是不知分寸，僭越位分。」", servant: "寿康宫外当差的小宫女说：「莞嫔戴着皇后娘娘赏的点翠步摇、穿着云锦来给太后请安。那是妃位的份例，这是不知分寸，僭越位分。」", hint: "你收下了景仁宫赏的云锦和点翠步摇。" },
  "enshang.xieliGongwu": { name: "恩赏为凭·协理宫务", emoji: "📜", lingrong: false, line: "齐妃接口：「皇后娘娘体恤，让她帮着打理宫务，她倒真把六宫当成了自己的，越权专擅，眼里没有皇后。」", servant: "景仁宫的小太监说：「皇后娘娘让莞嫔帮着打理宫务，她却连各宫的份例都自己做了主，奴才们不敢不依。这是越权专擅，眼里没有皇后。」", hint: "" },
  "enshang.antaiBupin": { name: "恩赏为凭·安胎补品", emoji: "🍲", lingrong: false, line: "景仁宫的小宫女道：「皇后娘娘亲自吩咐送去的安胎补品，莞嫔没让太医验过就用了。皇嗣是何等要紧的事，她半点不防备，这是不慎重皇嗣。」", servant: "碎玉轩的小厨房当差的宫人说：「景仁宫送来的补品，没经太医验看就端到了主子跟前。皇嗣要紧，这是不慎重皇嗣。」", hint: "你收下了景仁宫送来的安胎补品。" },
  "enshang.jiayanXianyi": { name: "恩赏为凭·家宴献艺", emoji: "🎵", lingrong: false, line: "祺贵人掩口笑道：「皇后娘娘说家宴缺个助兴的，莞嫔便应下了，当着皇上的面献了一曲。那一曲是弹给谁听的？刻意献艺争宠，成什么体统。」", servant: "家宴上伺候的小宫女说：「皇后娘娘一提家宴助兴，莞嫔就当众献了艺，一曲弹完，皇上的眼睛就没离开过她。这是刻意献艺争宠。」", hint: "你应了皇后的话，在家宴上当众献艺。" },
  "enshang.shanghuaXiaoju": { name: "恩赏为凭·赏花小聚", emoji: "🏮", lingrong: false, line: "皇后端着茶盏，淡淡说了一句：「那日赏花小聚，本宫特意让陵容陪妹妹去，妹妹坦然受了，席上却一直在揣度各宫的心思。窥测宫闱，可不是小事。」", servant: "赏花那日在旁伺候的小宫女说：「莞嫔席上不怎么说话，只一个劲儿打量各宫的神色。这是窥测宫闱。」", hint: "你随皇后赏花，席上留心过各宫的神色。" },
};

/** 端妃相护：被她挡下的那一桩，指控照常提出，她在一旁出言替你辩护。 */
export const DUANFEI_DEFENSE: Record<string, string> = {
  shiqinNeiqing: "那几日她身子不好，本宫是知道的。这种事翻出来，也无趣。",
  zhuangshenNonggui: "丽嫔那场惊梦，太医早断了是心病。这么多年的旧事，该翻篇了。",
  sitanSiqiu: "余氏是死是活，宫里人心里都有数。她临去前有个故人探视，算不得罪过。",
  jierenYaochong: "皇上去哪一宫，是皇上的心思。曲子好不好听，不是妃嫔的罪。",
  kuitanGongwei: "宫里谁不留心几分动静？不留心的，在这宫里活不到今天。",
  qiuziXinqie: "在佛前求个子嗣，本宫当年也求过。这算什么罪？",
  wangyeZengwu: "桐花台人来人往，说几句话便是罪过，那宫里没一个干净的。",
  guyiYuanyan: "一件旧衣裳，谁都可能一时说错话，何必追着不放。",
  xinlengZhiyu: "产后心伤，一时说了几句灰心的话罢了。那样的日子本宫也熬过，夜里自怨自艾的话，谁没说过几句？",
  yuzhongShuxin: "做女儿的递一封家书，皇上若要追究，倒显得不近人情。",
  qiciBuyong: "补品入口前验一验，是规矩，不是罪。",
  xijianSiyu: "席间闲话，各宫都说，若都要追究，这景仁宫今日怕是坐不下。",
  chuyanDingzhuang: "齐妃的嘴，宫里谁不知道？被顶一句，算不得大事。",
  shanduShide: "新人看不看脸色，是祺贵人自己的心思，何必拿来告状。",
  yuanwangJunfu: "父亲下了狱，女儿心里有怨，是人之常情。皇上也是做父亲的人。",
};
/** 没有专门对应的把柄时，端妃的通用说法。 */
export const DUANFEI_DEFAULT: readonly string[] = [
  "这些话都是风闻，本宫不信。",
  "皇后娘娘，这件事不妨到此为止吧。",
  "宫里的事查来查去，查不出什么，反倒伤了和气。",
];

/** 怨怼的陵容编出来的那一条（甄嬛知道是假的，却也知道只有陵容编得出来）。 */
export const FABRICATED_SECRET = "齐妃扬声道：「还有一桩：莞嫔私下说过，这宫里的位分，迟早都是她的。口出狂言，这是觊觎中宫，目无皇上。」";
export const FABRICATED_HINT = "这话你从未说过。";
