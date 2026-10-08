const canvas = document.getElementById("comic");
const ctx = canvas.getContext("2d");

const W = 800, HEADER = 92, GAP = 18, FOOTER = 96;
const P = (W - GAP * 3) / 2;
const H = HEADER + P * 2 + GAP + FOOTER;
const DPR = 2; // 2 倍分辨率，下载的图更清晰
canvas.width = W * DPR;
canvas.height = H * DPR;
canvas.style.width = `${W}px`;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ---------- 场景 ----------
const SCENES = {
  sea:     { sky: ["#c9f0ff", "#8fd6f5"], floor: "#ffe6b3", back: ["bubbles"], front: ["seaweed"] },
  grass:   { sky: ["#fff8e8", "#dff4ff"], floor: "#bfe8a6", back: ["clouds"], front: ["flowers"] },
  forest:  { sky: ["#f3fbe9", "#dff4ff"], floor: "#b5e39c", back: ["bgtrees"], front: ["flowers"] },
  snow:    { sky: ["#eef8ff", "#cfe8ff"], floor: "#ffffff", back: ["icebergs", "snow"], front: [] },
  lake:    { sky: ["#fff1f6", "#ffe0ec"], floor: "#aee0f2", back: ["clouds"], front: ["reeds"] },
  room:    { sky: ["#fff4e6", "#ffe8d0"], floor: "#e9c49f", back: ["wallpaper"], front: ["boards"] },
  savanna: { sky: ["#fff6da", "#ffe1b0"], floor: "#f2d699", back: ["sun", "acacia"], front: [] },
  sunny:   { sky: ["#fffbe3", "#e2f5ff"], floor: "#bfe8a6", back: ["sun", "clouds"], front: ["flowers"] },
  rain:    { sky: ["#e3eaf3", "#c8d5e6"], floor: "#b5d9a3", back: ["raincloud"], front: ["rain"] },
  night:   { sky: ["#36457a", "#5d6ca6"], floor: "#5a78a3", back: ["moon", "stars"], front: [] },
};

function cloud(cx, cy, k, fill = "#fff") {
  blob(cx - 18 * k, cy + 4 * k, 18 * k, 12 * k, fill, { stroke: false });
  blob(cx + 18 * k, cy + 4 * k, 18 * k, 12 * k, fill, { stroke: false });
  blob(cx, cy - 6 * k, 22 * k, 16 * k, fill, { stroke: false });
}

const SOFT = "rgba(74,52,52,0.25)";
const DECO = {
  bubbles(x, y, g) {
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const bx = x + 15 + rng() * (P - 30), by = y + 70 + rng() * (g - y - 110), r = 3 + rng() * 7;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      oval(bx, by, r, r);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      dot(bx - r * 0.35, by - r * 0.35, r * 0.25);
    }
  },
  seaweed(x, y, g) {
    [x + 18, x + P - 18].forEach((bx, i) => {
      const d = i ? -1 : 1;
      tubes([[[bx, g + 30], [bx + 8 * d, g - 10], [bx - 6 * d, g - 45], [bx + 5 * d, g - 80]]], "#8ad9a8", 9);
    });
  },
  clouds(x, y) {
    cloud(x + 60 + rng() * 40, y + 160 + rng() * 30, 0.8);
    cloud(x + P - 70 - rng() * 30, y + 120 + rng() * 30, 0.6);
  },
  flowers(x, y, g) {
    const cols = ["#ffb3c6", "#ffffff", "#ffd166", "#c3b5ff"];
    for (let i = 0; i < 5; i++) {
      const fx = x + 20 + rng() * (P - 40), fy = g + 14 + rng() * 26;
      ctx.fillStyle = cols[i % 4];
      for (let k = 0; k < 5; k++) dot(fx + Math.cos(k / 5 * TAU) * 4, fy + Math.sin(k / 5 * TAU) * 4, 3);
      ctx.fillStyle = "#ffcf5c";
      dot(fx, fy, 2.2);
    }
  },
  bgtrees(x, y, g) {
    ctx.strokeStyle = SOFT;
    ctx.lineWidth = 2;
    [[x + 40, 1], [x + P - 45, 0.8]].forEach(([tx, k]) => {
      ctx.fillStyle = "#e0cdb3";
      ctx.fillRect(tx - 5 * k, g - 60 * k, 10 * k, 60 * k);
      blob(tx, g - 80 * k, 36 * k, 30 * k, "#d6f0c8");
    });
  },
  icebergs(x, y, g) {
    ctx.strokeStyle = SOFT;
    ctx.lineWidth = 2;
    shape([[x - 20, g + 10], [x + 30, g - 70], [x + 70, g - 40], [x + 110, g + 10]], "#e3f3ff");
    shape([[x + P - 120, g + 10], [x + P - 60, g - 90], [x + P + 20, g + 10]], "#e3f3ff");
  },
  snow(x, y, g) {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 18; i++) dot(x + rng() * P, y + 40 + rng() * (g - y - 40), 1.5 + rng() * 2.5);
  },
  reeds(x, y, g) {
    [x + 16, x + 30, x + P - 20].forEach(rx => {
      ctx.strokeStyle = "#7fb069";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rx, g + 30);
      ctx.lineTo(rx + 4, g - 60);
      ctx.stroke();
      blob(rx + 4, g - 64, 4, 10, "#b5835a", { stroke: false });
    });
  },
  wallpaper(x, y, g) {
    ctx.fillStyle = "rgba(255,170,150,0.3)";
    for (let i = 0; i <= 7; i++)
      for (let j = 0; j <= 7; j++)
        if ((i + j) % 2 === 0) dot(x + i * P / 7, y + j * (g - y) / 7, 4);
  },
  boards(x, y, g) {
    ctx.strokeStyle = SOFT;
    ctx.lineWidth = 2;
    [g + 16, g + 34].forEach(by => {
      ctx.beginPath();
      ctx.moveTo(x, by);
      ctx.lineTo(x + P, by);
      ctx.stroke();
    });
  },
  sun(x, y) {
    const sx = x + P - 48, sy = y + 118;
    ctx.strokeStyle = "#ffc94d";
    ctx.lineWidth = 3;
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * TAU;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * 27, sy + Math.sin(a) * 27);
      ctx.lineTo(sx + Math.cos(a) * 35, sy + Math.sin(a) * 35);
      ctx.stroke();
    }
    ctx.strokeStyle = SOFT;
    blob(sx, sy, 20, 20, "#ffd96b");
  },
  acacia(x, y, g) {
    ctx.strokeStyle = "#c9a27a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 60, g);
    ctx.lineTo(x + 60, g - 70);
    ctx.moveTo(x + 60, g - 50);
    ctx.lineTo(x + 40, g - 75);
    ctx.moveTo(x + 60, g - 55);
    ctx.lineTo(x + 82, g - 76);
    ctx.stroke();
    ctx.strokeStyle = SOFT;
    ctx.lineWidth = 2;
    blob(x + 60, g - 80, 46, 12, "#cde6a8");
  },
  raincloud(x, y) {
    cloud(x + 80, y + 125, 1, "#eef2f7");
    cloud(x + P - 80, y + 110, 0.9, "#eef2f7");
  },
  rain(x, y, g) {
    ctx.strokeStyle = "#7fa7d9";
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 26; i++) {
      const rx = x + rng() * P, ry = y + 140 + rng() * (g - y - 120);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 5, ry + 12);
      ctx.stroke();
    }
  },
  moon(x, y) {
    const mx = x + P - 55, my = y + 125;
    ctx.save();
    oval(mx, my, 20, 20);
    ctx.clip();
    ctx.beginPath();
    ctx.rect(mx - 30, my - 30, 60, 60);
    ctx.arc(mx + 9, my - 6, 17, 0, TAU, true);
    ctx.fillStyle = "#fff2a8";
    ctx.fill();
    ctx.restore();
  },
  stars(x, y, g) {
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) star(x + rng() * P, y + 60 + rng() * (g - y - 120), 3 + rng() * 4, "#fff6c2");
  },
};

function drawScene(name, x, y, g) {
  const sc = SCENES[name] || SCENES.grass;
  const grad = ctx.createLinearGradient(0, y, 0, g);
  grad.addColorStop(0, sc.sky[0]);
  grad.addColorStop(1, sc.sky[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, P, P);
  sc.back.forEach(d => {
    ctx.save();
    DECO[d](x, y, g);
    ctx.restore();
  });

  const pts = [];
  for (let i = 0; i <= 6; i++) pts.push([x - 10 + (P + 20) * i / 6, g - 6 + Math.sin(i * 1.7 + rng() * 3) * 4]);
  const floor = smooth(pts, false);
  floor.lineTo(x + P + 10, y + P + 10);
  floor.lineTo(x - 10, y + P + 10);
  floor.closePath();
  ctx.fillStyle = sc.floor;
  ctx.fill(floor);
  ctx.strokeStyle = "rgba(74,52,52,0.35)";
  ctx.lineWidth = 2.5;
  ctx.stroke(smooth(pts, false));

  sc.front.forEach(d => {
    ctx.save();
    DECO[d](x, y, g);
    ctx.restore();
  });
}

// ---------- 文字 ----------
function wrapText(text, maxWidth) {
  const lines = [];
  let line = "";
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// 云朵形边框：矩形四边换成向外鼓的小圆弧
function cloudRect(x, y, w, h, amp = 5) {
  const pts = [];
  const edge = (x0, y0, x1, y1, nx, ny) => {
    const n = Math.max(3, Math.round(Math.hypot(x1 - x0, y1 - y0) / 26));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const d = amp * Math.abs(Math.sin(t * n * Math.PI));
      pts.push([x0 + (x1 - x0) * t + nx * d, y0 + (y1 - y0) * t + ny * d]);
    }
  };
  edge(x, y, x + w, y, 0, -1);
  edge(x + w, y, x + w, y + h, 1, 0);
  edge(x + w, y + h, x, y + h, 0, 1);
  edge(x, y + h, x, y, -1, 0);
  return smooth(jit(pts, 0.4), true);
}

function drawBubble(text, tx, ty, x, y, top) {
  ctx.font = `21px ${FONT}`;
  const maxW = P - 36, lh = 28;
  const lines = wrapText(text, maxW - 28);
  const w = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width)) + 30);
  const h = lines.length * lh + 18;
  const bx = clamp(tx - w / 2, x + 14, x + P - 14 - w);
  const by = y + top;
  const tipY = Math.max(by + h + 16, Math.min(ty, by + h + 44));
  const baseX = clamp(tx, bx + 22, bx + w - 22);

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 3;
  const tail = new Path2D();
  tail.moveTo(baseX - 11, by + h - 4);
  tail.quadraticCurveTo(baseX - 2, by + h + 10, tx, tipY);
  tail.quadraticCurveTo(baseX + 4, by + h + 8, baseX + 11, by + h - 4);
  ctx.fill(tail);
  ctx.stroke(tail);

  const body = cloudRect(bx, by, w, h, 7);
  ctx.fill(body);
  ctx.stroke(body);
  // 盖住尾巴和气泡交界处的线
  ctx.beginPath();
  ctx.moveTo(baseX - 8.5, by + h - 6);
  ctx.lineTo(baseX + 8.5, by + h - 6);
  ctx.lineTo(baseX + 5, by + h + 2);
  ctx.lineTo(baseX - 5, by + h + 2);
  ctx.fill();

  ctx.fillStyle = OUT;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, bx + w / 2, by + 11 + i * lh));
}

function drawCaption(text, x, y) {
  ctx.font = `17px ${FONT}`;
  const w = ctx.measureText(text).width + 22;
  const p = roughRect(x + 12, y + 12, w, 32, 6, 0.8);
  ctx.fillStyle = "#fff1a8";
  ctx.fill(p);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUT;
  ctx.stroke(p);
  ctx.fillStyle = OUT;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 23, y + 29);
}

// 中文动物名称转英文名称映射
const ANIMAL_MAP = {
  章鱼: "octopus", 海獭: "otter", 树懒: "sloth", 奶牛: "cow", 企鹅: "penguin",
  火烈鸟: "flamingo", 蜂鸟: "hummingbird", 鹰: "eagle", 乌鸦: "crow", 考拉: "koala",
  大象: "elephant", 斑马: "zebra", 蜗牛: "snail", 鲨鱼: "shark", 螃蟹: "crab",
  狮子: "lion", 老虎: "tiger", 熊猫: "panda", 长颈鹿: "giraffe", 猴子: "monkey",
  鹦鹉: "parrot", 海豚: "dolphin", 鲸鱼: "whale", 熊: "bear", 狐狸: "fox",
  兔子: "rabbit", 金鱼: "fish",
  // 带"小"的版本
  小章鱼: "octopus", 小海獭: "otter", 小树懒: "sloth", 小奶牛: "cow", 小企鹅: "penguin",
  小火烈鸟: "flamingo", 小蜂鸟: "hummingbird", 小鹰: "eagle", 小乌鸦: "crow", 小考拉: "koala",
  小大象: "elephant", 小斑马: "zebra", 小蜗牛: "snail", 小鲨鱼: "shark", 小螃蟹: "crab",
  小狮子: "lion", 小老虎: "tiger", 小熊猫: "panda", 小长颈鹿: "giraffe", 小猴子: "monkey",
  小鹦鹉: "parrot", 小海豚: "dolphin", 小鲸鱼: "whale", 小熊: "bear", 小狐狸: "fox",
  小兔子: "rabbit", 小金鱼: "fish",
};

// ---------- 格子 ----------
// 字符串写法："角色 表情 特效..." 或 "道具 参数"；也可以直接写对象 {c, e, color, fx}
function parseItem(it) {
  if (typeof it === "object") return { e: "normal", ...it, fx: it.fx || [] };
  const [name, ...rest] = it.split(" ");
  const engName = ANIMAL_MAP[name] || name;
  if (CHARS[engName]) return { c: engName, e: rest[0] || "normal", fx: rest.slice(1) };
  return { prop: name, args: rest };
}

const headX = (it, s) => it.cx + CHARS[it.c].hx * s * it.dir;

function drawItem(it, g, s) {
  ctx.save();
  ctx.translate(it.cx, g + Math.sin(animT * 2.4 + it.cx * 0.045) * 2.5);
  ctx.strokeStyle = OUT;
  ctx.lineWidth = LW;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (it.c) {
    ctx.scale(s * it.dir, s);
    ctx.fillStyle = "rgba(74,52,52,0.12)";
    oval(0, 0, 32, 5);
    ctx.fill();
    CHARS[it.c].draw({ expr: it.e, color: it.color });
  } else if (PROPS[it.prop]) {
    ctx.scale(s, s);
    ctx.fillStyle = "rgba(74,52,52,0.12)";
    oval(0, 0, 18, 4);
    ctx.fill();
    PROPS[it.prop](...it.args);
  } else {
    ctx.font = `${60 * s}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(it.prop, 0, 0);
  }
  ctx.restore();
}

// 角落小装饰：星星 / 爱心 / 小圆点，按格数轮换
function cornerDeco(x, y, idx) {
  ctx.save();
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  const spots = [[x + P - 26, y + 26], [x + 22, y + P - 24], [x + P - 24, y + P - 22]];
  spots.forEach(([sx, sy], i) => {
    const kind = (idx + i) % 3;
    if (kind === 0) {
      ctx.strokeStyle = "rgba(255,170,60,0.85)";
      star(sx, sy, 6, "#ffe28a");
    } else if (kind === 1) {
      ctx.strokeStyle = "rgba(255,120,160,0.85)";
      heart(sx, sy, 5, "#ffb3c6");
    } else {
      ctx.fillStyle = "rgba(140,190,250,0.85)";
      dot(sx, sy, 3);
      dot(sx + 9, sy + 6, 2);
      dot(sx - 8, sy + 7, 2);
    }
  });
  ctx.restore();
}

function drawPanel(panel, fact, x, y, idx) {
  seedRandom(current.seed * 7 + idx * 101);
  const g = y + P * 0.87;
  const frame = roughRect(x, y, P, P, 14, 1.2);

  // 贴纸白边：面板外圈垫一层白色
  const sticker = roughRect(x - 7, y - 7, P + 14, P + 14, 20, 1);
  ctx.fillStyle = "#fff";
  ctx.fill(sticker);
  ctx.strokeStyle = "rgba(74,52,52,0.15)";
  ctx.lineWidth = 2.5;
  ctx.stroke(sticker);

  ctx.save();
  ctx.clip(frame);
  drawScene(panel.scene || fact.scene, x, y, g);
  const items = panel.cast.map(parseItem);
  const n = items.length;
  const s = (n === 1 ? 180 : n === 2 ? 140 : 108) / 100;
  const placed = items.map((it, i) => ({
    ...it,
    cx: x + (P / n) * (i + 0.5),
    dir: i > (n - 1) / 2 ? -1 : 1, // 左边的角色朝右，右边的朝左
  }));
  placed.forEach(it => drawItem(it, g, s));
  placed.forEach(it => {
    if (!it.c) return;
    it.fx.forEach(f => {
      if (!FX[f]) return;
      ctx.save();
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      FX[f](headX(it, s), g + CHARS[it.c].top * s, s, it, g);
      ctx.restore();
    });
  });
  cornerDeco(x, y, idx);
  ctx.restore();

  ctx.lineWidth = 4;
  ctx.strokeStyle = OUT;
  ctx.stroke(frame);

  let top = 16;
  if (panel.caption) {
    drawCaption(panel.caption, x, y);
    top = 54;
  }
  if (panel.text) {
    const sp = placed[panel.say || 0];
    const tx = sp.c ? headX(sp, s) : sp.cx;
    const ty = sp.c ? g + CHARS[sp.c].top * s - 8 : g - 60 * s;
    drawBubble(panel.text, tx, ty, x, y, top);
  }
}

// ---------- 整页 ----------
function drawBackground() {
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,190,150,0.18)";
  for (let i = 0; i < W; i += 28)
    for (let j = 0; j < H; j += 28) dot(i + ((j / 28) % 2) * 14, j, 2.5);
}

function drawHeader(fact) {
  const title = `${fact.animal}的小秘密`;
  ctx.font = `40px ${FONT}`;
  ctx.fillStyle = OUT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, W / 2, HEADER / 2 + 4);
  const tw = ctx.measureText(title).width;
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 2;
  star(W / 2 - tw / 2 - 30, HEADER / 2, 11);
  star(W / 2 - tw / 2 - 52, HEADER / 2 + 14, 6, "#ffb3c6");
  star(W / 2 + tw / 2 + 28, HEADER / 2 - 6, 8);
  heart(W / 2 + tw / 2 + 50, HEADER / 2 + 10, 7, "#ff9fb5");
}

function drawFactBox(fact, fy) {
  const fh = FOOTER - 34;
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 3;
  const box = roughRect(GAP, fy, W - GAP * 2, fh, 14, 1);
  ctx.fillStyle = "#fff";
  ctx.fill(box);
  ctx.stroke(box);

  ctx.beginPath();
  ctx.roundRect(GAP + 14, fy + fh / 2 - 16, 92, 32, 16);
  ctx.fillStyle = "#ffc078";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.font = `19px ${FONT}`;
  ctx.fillStyle = OUT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("小知识", GAP + 60, fy + fh / 2 + 1);

  ctx.font = `20px ${FONT}`;
  ctx.textAlign = "left";
  const lines = wrapText(fact.fact, W - GAP * 2 - 140);
  const lh = 26;
  lines.forEach((l, i) => ctx.fillText(l, GAP + 122, fy + fh / 2 + (i - (lines.length - 1) / 2) * lh + 1));
}

function renderContent() {
  const fact = current.fact;
  drawHeader(fact);
  drawFactBox(fact, HEADER + 12);
  const panelsStartY = HEADER + FOOTER + 18;
  fact.panels.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    drawPanel(p, fact, GAP + col * (P + GAP), panelsStartY + row * (P + GAP), i);
  });
}

function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawBackground();
  renderContent();
}

// ---------- 视频 ----------
// 每段：时长(秒) + 取景（'full' 全页，数字 = 第几格特写）
const VIDEO_SEGS = [
  { t: 3.0, view: "cover" },
  { t: 1.3, view: "full" },
  { t: 2.2, view: 0 },
  { t: 2.2, view: 1 },
  { t: 2.2, view: 2 },
  { t: 2.2, view: 3 },
  { t: 2.8, view: "full" },
];
const VIDEO_DUR = VIDEO_SEGS.reduce((a, s) => a + s.t, 0);

const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
const lerp = (a, b, k) => a + (b - a) * k;
const mixRect = (a, b, k) => ({
  x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k),
  w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k),
});

function panelViewRect(i) {
  const col = i % 2, row = Math.floor(i / 2);
  const panelsStartY = HEADER + FOOTER + 18;
  return { x: GAP + col * (P + GAP) - 10, y: panelsStartY + row * (P + GAP) - 10, w: P + 20, h: P + 20 };
}
const FULL_RECT = { x: 0, y: 0, w: W, h: H };

// 把 rect 区域缩放平移到画布中央
function applyView(rect) {
  const s = W / rect.w;
  const ox = (W - rect.w * s) / 2, oy = (H - rect.h * s) / 2;
  ctx.setTransform(DPR * s, 0, 0, DPR * s, DPR * (-rect.x * s + ox), DPR * (-rect.y * s + oy));
}

// ---------- 视频封面 ----------
const COVER_CHAR = {
  章鱼: "octopus", 海獭: "otter", 树懒: "sloth", 奶牛: "cow", 企鹅: "penguin",
  火烈鸟: "flamingo", 蜂鸟: "hummingbird", 鹰: "eagle", 乌鸦: "crow", 考拉: "koala",
  大象: "elephant", 斑马: "zebra", 蜗牛: "snail", 鲨鱼: "shark", 螃蟹: "crab",
  狮子: "lion", 老虎: "tiger", 熊猫: "panda", 长颈鹿: "giraffe", 猴子: "monkey",
  鹦鹉: "parrot", 海豚: "dolphin", 鲸鱼: "whale", 熊: "bear", 狐狸: "fox",
  兔子: "rabbit", 金鱼: "fish"
};

function drawCover(lt) {
  const fact = current.fact;
  const k = easeInOut(clamp(lt / 0.5, 0, 1)); // 整体弹入
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(lerp(0.92, 1, k), lerp(0.92, 1, k));
  ctx.translate(-W / 2, -H / 2);
  ctx.globalAlpha = k;

  // 主卡片
  ctx.strokeStyle = OUT;
  const card = roughRect(48, 40, W - 96, H - 96, 30, 1.2);
  ctx.fillStyle = "#fffdf5";
  ctx.fill(card);
  ctx.lineWidth = 5;
  ctx.stroke(card);

  // 标题
  ctx.fillStyle = OUT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `56px ${FONT}`;
  ctx.fillText(`${fact.animal}的小秘密`, W / 2, 128);
  const tw = ctx.measureText(`${fact.animal}的小秘密`).width;
  ctx.lineWidth = 2.5;
  star(W / 2 - tw / 2 - 40, 126, 13);
  star(W / 2 - tw / 2 - 68, 144, 7, "#ffb3c6");
  star(W / 2 + tw / 2 + 38, 120, 10);
  heart(W / 2 + tw / 2 + 66, 140, 9, "#ff9fb5");

  // 主角
  const name = COVER_CHAR[fact.animal] || "kid";
  const ch = CHARS[name];
  ctx.save();
  ctx.translate(W / 2 + Math.sin(animT * 2.4) * 4, 470);
  ctx.scale(2.6, 2.6);
  ctx.strokeStyle = OUT;
  ctx.lineWidth = LW;
  ch.draw({ expr: "happy" });
  ctx.restore();
  // 小地面
  ctx.fillStyle = "#f2d699";
  oval(W / 2, 486, 120, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(74,52,52,0.3)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 小知识卡片
  ctx.strokeStyle = OUT;
  const bx = 92, by = 548, bw = W - 184, bh = 128;
  const kbox = easeInOut(clamp((lt - 0.35) / 0.5, 0, 1));
  ctx.save();
  ctx.translate(W / 2, by + bh / 2);
  ctx.scale(lerp(0.85, 1, kbox), lerp(0.85, 1, kbox));
  ctx.translate(-W / 2, -(by + bh / 2));
  const box = roughRect(bx, by, bw, bh, 22, 1);
  ctx.fillStyle = "#fff1a8";
  ctx.fill(box);
  ctx.lineWidth = 4;
  ctx.stroke(box);
  ctx.beginPath();
  ctx.roundRect(bx + 18, by + bh / 2 - 21, 108, 42, 21);
  ctx.fillStyle = "#ffc078";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = OUT;
  ctx.font = `24px ${FONT}`;
  ctx.fillText("小知识", bx + 72, by + bh / 2 + 1);
  ctx.font = `26px ${FONT}`;
  ctx.textAlign = "left";
  const lines = wrapText(fact.fact, bw - 180);
  lines.forEach((l, i) => ctx.fillText(l, bx + 148, by + bh / 2 + (i - (lines.length - 1) / 2) * 36 + 1));
  ctx.restore();

  // 观看提示
  ctx.textAlign = "center";
  ctx.font = `30px ${FONT}`;
  const hint = 0.5 + 0.5 * Math.sin(animT * 3);
  ctx.globalAlpha = k * (0.55 + 0.45 * hint);
  ctx.beginPath();
  ctx.roundRect(W / 2 - 150, 716, 300, 58, 29);
  ctx.fillStyle = "#8fe0c8";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = OUT;
  ctx.fillText("▶ 一起来看看吧！", W / 2, 747);
  ctx.restore();
}

function drawFrame(ms) {
  animT = ms / 1000;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawBackground();

  let acc = 0;
  for (const seg of VIDEO_SEGS) {
    if (ms < acc + seg.t * 1000 || seg === VIDEO_SEGS[VIDEO_SEGS.length - 1]) {
      const lt = clamp(ms - acc, 0, seg.t * 1000) / 1000;
      if (seg.view === "cover") {
        const k = easeInOut(clamp(lt / seg.t, 0, 1));
        const s = lerp(1.05, 1, k);
        const r = { x: (W - W / s) / 2, y: (H - H / s) / 2, w: W / s, h: H / s };
        applyView(r);
        drawCover(lt);
      } else if (typeof seg.view === "number") {
        const target = panelViewRect(seg.view);
        const k = easeInOut(clamp(lt / 0.55, 0, 1));
        // 特写：先从全页推近，之后缓慢拉远一点当"呼吸感"
        const rect = k >= 1
          ? mixRect(target, { x: target.x - target.w * 0.015, y: target.y - target.h * 0.015, w: target.w * 1.03, h: target.h * 1.03 }, Math.min(1, (lt - 0.55) / (seg.t - 0.55)))
          : mixRect(FULL_RECT, target, k);
        applyView(rect);
        const panelsStartY = HEADER + FOOTER + 18;
        drawPanel(current.fact.panels[seg.view], current.fact, GAP + (seg.view % 2) * (P + GAP), panelsStartY + Math.floor(seg.view / 2) * (P + GAP), seg.view);
      } else {
        // 全页：开场从放大 6% 收缩到 1，结尾缓慢放大 2%
        const k = easeInOut(clamp(lt / seg.t, 0, 1));
        const s = seg === VIDEO_SEGS[0] ? lerp(1.06, 1, k) : lerp(1, 1.025, k);
        const r = { x: (FULL_RECT.w - FULL_RECT.w / s) / 2, y: (FULL_RECT.h - FULL_RECT.h / s) / 2, w: FULL_RECT.w / s, h: FULL_RECT.h / s };
        applyView(r);
        renderContent();
      }
      return;
    }
    acc += seg.t * 1000;
  }
}

let recording = false;
function recordVideo() {
  if (recording || !current) return;
  recording = true;
  const btn = document.getElementById("video");
  const old = btn.textContent;
  btn.textContent = "录制中… 🎥";
  btn.disabled = true;

  const stream = canvas.captureStream(30);
  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks = [];
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  rec.onstop = () => {
    const a = document.createElement("a");
    a.download = `动物漫画视频-${current.fact.animal}.webm`;
    a.href = URL.createObjectURL(new Blob(chunks, { type: "video/webm" }));
    btn.textContent = old;
    btn.disabled = false;
    recording = false;
  };
  rec.start();
  const start = performance.now();
  (function loop(now) {
    const t = now - start;
    drawFrame(Math.min(t, VIDEO_DUR * 1000));
    if (t < VIDEO_DUR * 1000) requestAnimationFrame(loop);
    else setTimeout(() => rec.stop(), 150);
  })(start);
}

// ---------- 交互 ----------
// 支持 ?animal=章鱼 只看某种动物
const wanted = new URLSearchParams(location.search).get("animal");
let lastIndex = -1;
let current = null;
let animT = 0; // 动画时钟（秒）

function pickFact() {
  const pool = FACTS.map((_, i) => i).filter(i => !wanted || FACTS[i].animal === wanted);
  if (!pool.length) pool.push(...FACTS.keys());
  let i;
  do {
    i = pool[Math.floor(Math.random() * pool.length)];
  } while (pool.length > 1 && i === lastIndex);
  lastIndex = i;
  return FACTS[i];
}

function show() {
  const fact = pickFact();
  current = { fact, seed: Math.floor(Math.random() * 1e9) };
  render();
  // 手写字体按需加载，加载好后用同一个随机种子重画
  const text = [fact.animal, "的小秘密小知识Z?", fact.fact, ...fact.panels.flatMap(p => [p.text || "", p.caption || ""])].join("");
  const mine = current;
  document.fonts.load(`20px "ZCOOL KuaiLe"`, text)
    .then(() => current === mine && (window.__dbgT ? drawFrame(window.__dbgT) : render()), () => {});
}

document.getElementById("next").addEventListener("click", show);
document.getElementById("video").addEventListener("click", recordVideo);
document.getElementById("download").addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = `动物漫画-${current.fact.animal}.png`;
  a.href = canvas.toDataURL("image/png");
});

show();

// 调试：?t=毫秒 直接渲染视频某一帧
window.__dbgT = +new URLSearchParams(location.search).get("t") || 0;
if (window.__dbgT) drawFrame(window.__dbgT);
