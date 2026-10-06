// 每条小知识配一段四格漫画脚本
// cast：从左到右的角色/道具，写法 "角色 表情 特效..."，或 "道具 参数"，或对象 {c, e, color, fx}
//   角色：kid person farmer octopus otter sloth cow penguin flamingo hummingbird eagle crow koala elephant zebra snail shark crab
//   表情：normal happy smile surprised shock nervous sleepy love smug cool think angry
//   特效：hearts sparkle zzz sweat idea question anger shock speed crown
//   道具：pebble heart ring shrimp leaf flower tree clock calendar mirror camera magnifier barcode
// say：说话者在 cast 中的下标；caption：旁白；scene：场景（可在单格覆盖）
const GREY_OCTOPUS = "#b7b0aa";

const FACTS = [
  {
    animal: "章鱼", scene: "sea",
    fact: "章鱼有三颗心脏，血液是蓝色的。",
    panels: [
      { cast: ["kid think", "octopus nervous sweat"], say: 0, text: "你看起来有点紧张？" },
      { cast: ["kid surprised", "octopus shock hearts"], say: 1, text: "当然！我有三颗心脏在同时跳！" },
      { cast: ["octopus smug sparkle crown"], text: "而且我的血是蓝色的，超贵族~" },
      { cast: ["kid smile sweat", "heart blue", "octopus nervous"], say: 0, text: "难怪你这么'蓝'过……" },
    ],
  },
  {
    animal: "章鱼", scene: "sea",
    fact: "章鱼约三分之二的神经元长在触手里，每条触手都能'自己思考'。",
    panels: [
      { cast: ["kid think", "octopus think"], say: 0, text: "你在发什么呆？" },
      { cast: ["octopus think question"], text: "我的头在想晚饭吃什么……" },
      { cast: ["octopus surprised", "crab shock sweat"], say: 0, text: "但我的触手已经自己去抓螃蟹了！" },
      { cast: ["kid shock", "octopus smile"], say: 0, text: "所以你是一个团队？" },
    ],
  },
  {
    animal: "章鱼", scene: "sea",
    fact: "章鱼能在不到一秒内改变皮肤颜色和纹理来伪装。",
    panels: [
      { cast: ["shark happy", "octopus shock sweat"], say: 0, text: "嘿嘿，抓到一只章鱼！" },
      { cast: ["shark smug", { c: "octopus", e: "smug", color: GREY_OCTOPUS, fx: ["sparkle"] }], say: 1, caption: "嗖——瞬间变色！", text: "我是一块石头~" },
      { cast: ["shark think question", { c: "octopus", e: "smile", color: GREY_OCTOPUS }], say: 0, text: "咦？人呢？" },
      { cast: ["shark nervous sweat", { c: "octopus", e: "smug", color: GREY_OCTOPUS, fx: ["sparkle"] }], say: 1, text: "我一直都在这儿哦~" },
    ],
  },
  {
    animal: "海獭", scene: "sea",
    fact: "海獭睡觉时会手牵手，防止漂散。",
    panels: [
      { cast: ["otter nervous sweat", "otter think"], say: 0, text: "今晚风浪有点大……" },
      { cast: ["otter think", "otter happy idea"], say: 1, text: "那我们牵手睡吧！" },
      { cast: ["otter smile", "heart", "otter smile"], say: 0, text: "这样就不会漂走啦~" },
      { cast: ["otter sleepy zzz", "otter sleepy"], say: 1, scene: "night", text: "Zzz……别松手哦" },
    ],
  },
  {
    animal: "树懒", scene: "forest",
    fact: "树懒大约一周才下树上一次厕所。",
    panels: [
      { cast: ["sloth think", "tree"], text: "嗯……该去厕所了。" },
      { cast: ["tree", "sloth nervous sweat"], say: 1, text: "开始往下爬……慢慢来……" },
      { cast: ["sloth sleepy", "clock"], caption: "三个小时后……", text: "快、快到了……" },
      { cast: ["sloth smile sparkle", "calendar 下周"], text: "好了，下周见！" },
    ],
  },
  {
    animal: "奶牛", scene: "grass",
    fact: "奶牛也有好朋友，和好友分开会感到焦虑。",
    panels: [
      { cast: ["cow happy hearts", "cow smile"], say: 0, text: "你是我最好的朋友！" },
      { cast: ["cow shock", "farmer think"], say: 0, text: "什么？要把我们分开？" },
      { cast: ["cow nervous sweat"], text: "我的心跳加速了……" },
      { cast: ["cow smile", "heart", "cow happy"], say: 2, text: "放心，我们永远在一个牧场！" },
    ],
  },
  {
    animal: "企鹅", scene: "snow",
    fact: "有些企鹅求偶时会送对方一颗光滑的鹅卵石。",
    panels: [
      { cast: ["penguin nervous sweat", "pebble"], text: "我找了一整天……" },
      { cast: ["penguin happy", "pebble", "penguin surprised"], say: 0, text: "这颗最圆最亮的石头，送给你！" },
      { cast: ["penguin smile", "penguin love hearts"], say: 1, text: "哇，你好用心！" },
      { cast: ["penguin happy sparkle", "ring", "penguin love"], say: 0, text: "这就是企鹅界的钻戒！" },
    ],
  },
  {
    animal: "火烈鸟", scene: "lake",
    fact: "火烈鸟生来是灰白色的，吃了含虾青素的食物才变粉。",
    panels: [
      { cast: [{ c: "flamingo", e: "smile", color: "#d9d9d9" }], text: "我小时候是灰色的。" },
      { cast: [{ c: "flamingo", e: "happy", color: "#f7cfdc" }, "shrimp"], text: "后来天天吃小虾和藻类……" },
      { cast: ["flamingo smug sparkle"], text: "就变成了这样！" },
      { cast: ["kid think question", "shrimp", "flamingo smile sweat"], say: 0, text: "那我吃虾也能变粉吗？" },
    ],
  },
  {
    animal: "蜂鸟", scene: "sunny",
    fact: "蜂鸟是唯一能倒着飞的鸟。",
    panels: [
      { cast: ["hummingbird happy", "flower"], text: "花蜜喝完啦~" },
      { cast: ["flower", "hummingbird smile speed"], say: 1, text: "倒车，倒车，请注意~" },
      { cast: ["eagle shock", "hummingbird smile"], say: 0, text: "你怎么做到的？！" },
      { cast: ["eagle surprised sweat", "hummingbird cool sparkle"], say: 1, text: "天赋，学不来的~" },
    ],
  },
  {
    animal: "乌鸦", scene: "grass",
    fact: "乌鸦能记住人脸，还会把'坏人'告诉同伴。",
    panels: [
      { cast: ["crow think", "person happy"], say: 0, text: "这个人上次赶过我……" },
      { cast: ["crow smug", "camera"], text: "记住了，这张脸。" },
      { cast: ["crow angry anger", "crow angry", "crow angry"], text: "兄弟们，就是他！" },
      { cast: ["person shock sweat", "crow angry", "crow angry"], say: 0, text: "为什么它们都盯着我？？" },
    ],
  },
  {
    animal: "考拉", scene: "forest",
    fact: "考拉每天要睡 18 到 22 个小时。",
    panels: [
      { cast: ["koala happy", "leaf"], text: "吃完桉树叶……" },
      { cast: ["koala sleepy zzz"], text: "睡一会儿。" },
      { cast: ["koala sleepy", "clock"], text: "醒了？再睡一会儿……" },
      { cast: ["kid shock question", "koala sleepy zzz"], say: 0, text: "你一天到底醒几个小时？" },
    ],
  },
  {
    animal: "大象", scene: "room",
    fact: "大象是少数能在镜子里认出自己的动物之一。",
    panels: [
      { cast: ["elephant surprised question", "mirror"], text: "咦，镜子里有头大象？" },
      { cast: ["elephant think", "mirror"], text: "等等……它跟我动作一样。" },
      { cast: ["elephant happy idea"], text: "原来是我自己！" },
      { cast: ["elephant love hearts", "mirror"], text: "长得还挺帅~" },
    ],
  },
  {
    animal: "斑马", scene: "savanna",
    fact: "每只斑马的条纹都是独一无二的，像人的指纹。",
    panels: [
      { cast: ["zebra think question", "zebra think"], say: 0, text: "我们是不是长得一样？" },
      { cast: ["zebra surprised", "magnifier", "zebra smile"], say: 2, text: "仔细看，条纹完全不同！" },
      { cast: ["zebra happy idea"], text: "原来这是我的身份证！" },
      { cast: ["zebra smug sparkle", "barcode"], text: "那我能刷条纹结账吗？" },
    ],
  },
  {
    animal: "蜗牛", scene: "sunny",
    fact: "有些蜗牛可以连续睡上三年。",
    panels: [
      { cast: ["snail nervous sweat"], text: "天太干了，我睡一觉。" },
      { cast: ["snail sleepy zzz"], text: "Zzz……" },
      { cast: ["snail sleepy zzz", "calendar 3年"], caption: "三年后……" },
      { cast: ["snail surprised question"], scene: "rain", text: "下雨了？我错过了什么？" },
    ],
  },
];
