// 手绘风基础工具 + Q 版角色 / 道具 / 特效
// 角色坐标系：原点在脚底中心，向上为负，角色大约占 x∈[-50,50]、y∈[-100,0]
const OUT = "#4a3434";
const TAU = Math.PI * 2;
const LW = 3;
const FONT = '"ZCOOL KuaiLe", "HanziPen SC", "Yuanti SC", "PingFang SC", sans-serif';

let rng = Math.random;
function seedRandom(seed) {
  let a = seed >>> 0;
  rng = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- 基础图形 ----------
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const jit = (pts, a) => pts.map(([x, y]) => [x + (rng() - 0.5) * 2 * a, y + (rng() - 0.5) * 2 * a]);

function smooth(pts, closed, path = new Path2D()) {
  if (closed) {
    const n = pts.length;
    path.moveTo(...mid(pts[n - 1], pts[0]));
    for (let i = 0; i < n; i++) {
      const p = pts[i], m = mid(p, pts[(i + 1) % n]);
      path.quadraticCurveTo(p[0], p[1], m[0], m[1]);
    }
    path.closePath();
  } else {
    path.moveTo(...pts[0]);
    for (let i = 1; i < pts.length - 1; i++) {
      const m = mid(pts[i], pts[i + 1]);
      path.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
    }
    path.lineTo(...pts[pts.length - 1]);
  }
  return path;
}

function oval(cx, cy, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rot, 0, TAU);
}

function dot(cx, cy, r) {
  oval(cx, cy, r, r);
  ctx.fill();
}

function paint(path, fill, stroke = true) {
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill(path);
  }
  if (stroke) ctx.stroke(path);
  return path;
}

function blobPath(cx, cy, rx, ry, rot = 0) {
  const pts = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TAU, j = 1 + (rng() - 0.5) * 0.05;
    const px = Math.cos(a) * rx * j, py = Math.sin(a) * ry * j;
    pts.push([cx + px * c - py * s, cy + px * s + py * c]);
  }
  return smooth(pts, true);
}

function blob(cx, cy, rx, ry, fill, o = {}) {
  return paint(blobPath(cx, cy, rx, ry, o.rot || 0), fill, o.stroke !== false);
}

function shape(pts, fill, o = {}) {
  return paint(smooth(jit(pts, 0.8), true), fill, o.stroke !== false);
}

function poly(pts, fill) {
  const p = new Path2D();
  p.moveTo(...pts[0]);
  pts.slice(1).forEach(q => p.lineTo(...q));
  p.closePath();
  return paint(p, fill);
}

function curve(pts) {
  ctx.stroke(smooth(jit(pts, 0.5), false));
}

// 带描边的粗管子（触手、脖子、海草）
function tubes(list, fill, w) {
  const paths = list.map(pts => smooth(jit(pts, 0.5), false));
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = OUT;
  ctx.lineWidth = w + LW * 2;
  paths.forEach(p => ctx.stroke(p));
  ctx.strokeStyle = fill;
  ctx.lineWidth = w;
  paths.forEach(p => ctx.stroke(p));
  ctx.restore();
}

// 在某个形状里画花纹（斑点、条纹），再补一圈描边
function inside(path, fn) {
  ctx.save();
  ctx.clip(path);
  fn();
  ctx.restore();
  ctx.stroke(path);
}

function roughRect(x, y, w, h, r, amp) {
  const pts = [];
  const corners = [
    [x + w - r, y + r, -Math.PI / 2],
    [x + w - r, y + h - r, 0],
    [x + r, y + h - r, Math.PI / 2],
    [x + r, y + r, Math.PI],
  ];
  corners.forEach(([cx, cy, a0], i) => {
    for (let k = 0; k <= 2; k++) {
      const a = a0 + (k / 2) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    const [nx, ny, na] = corners[(i + 1) % 4];
    const end = pts[pts.length - 1];
    const start = [nx + Math.cos(na) * r, ny + Math.sin(na) * r];
    const steps = Math.floor(Math.hypot(start[0] - end[0], start[1] - end[1]) / 60);
    for (let k = 1; k <= steps; k++) {
      const t = k / (steps + 1);
      pts.push([end[0] + (start[0] - end[0]) * t, end[1] + (start[1] - end[1]) * t]);
    }
  });
  return smooth(jit(pts, amp), true);
}

function heart(cx, cy, size, fill) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.9);
  ctx.bezierCurveTo(cx - size * 1.4, cy - size * 0.1, cx - size * 0.6, cy - size * 1.1, cx, cy - size * 0.35);
  ctx.bezierCurveTo(cx + size * 0.6, cy - size * 1.1, cx + size * 1.4, cy - size * 0.1, cx, cy + size * 0.9);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
}

function star(cx, cy, r, fill = "#ffd84d") {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
}

// ---------- 表情 ----------
// normal / happy / smile / surprised / shock / nervous / sleepy / love / smug / cool / think / angry
function face({ x = 0, ey, my = null, mx = 0, gap, r, expr = "normal", ring = false }) {
  ctx.save();
  ctx.strokeStyle = OUT;
  ctx.fillStyle = "rgba(255,120,145,0.42)";
  [-1, 1].forEach(sd => {
    oval(x + sd * (gap + r * 0.7), ey + r * 1.6, r * 1.05, r * 0.6);
    ctx.fill();
  });
  if (ring) {
    [-1, 1].forEach(sd => {
      oval(x + sd * gap, ey, r * 1.35, r * 1.45);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.lineWidth = r * 0.3;
      ctx.stroke();
    });
  }
  [-1, 1].forEach(sd => eye(x + sd * gap, ey, r, expr, sd));
  if (expr === "cool") shades(x, ey, gap, r);
  if (my !== null) mouth(x + mx, my, r, expr);
  ctx.restore();
}

function eye(ex, ey, r, expr, sd) {
  const lw = Math.max(1.6, r * 0.42);
  ctx.lineWidth = lw;
  const pupil = (cy, rr) => {
    ctx.fillStyle = "#3a2828";
    oval(ex, cy, rr * 0.82, rr);
    ctx.fill();
    ctx.fillStyle = "#fff";
    dot(ex + rr * 0.28, cy - rr * 0.38, rr * 0.36);
    dot(ex - rr * 0.3, cy + rr * 0.42, rr * 0.16);
  };
  switch (expr) {
    case "smile":
      ctx.beginPath();
      ctx.arc(ex, ey + r * 0.5, r * 0.95, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      break;
    case "sleepy":
      ctx.beginPath();
      ctx.arc(ex, ey - r * 0.4, r * 0.9, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
      break;
    case "surprised":
    case "shock":
      ctx.fillStyle = "#fff";
      oval(ex, ey, r, r * 1.15);
      ctx.fill();
      ctx.lineWidth = lw * 0.8;
      ctx.stroke();
      ctx.fillStyle = "#3a2828";
      dot(ex, ey, r * 0.42);
      ctx.fillStyle = "#fff";
      dot(ex + r * 0.14, ey - r * 0.14, r * 0.13);
      break;
    case "love":
      ctx.lineWidth = lw * 0.6;
      heart(ex, ey, r * 1.15, "#ff5f87");
      break;
    case "cool":
      break;
    case "smug":
      ctx.fillStyle = "#3a2828";
      ctx.beginPath();
      ctx.ellipse(ex, ey, r * 0.85, r, 0, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(ex - r * 1.15, ey);
      ctx.lineTo(ex + r * 1.15, ey);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      dot(ex + r * 0.3, ey + r * 0.35, r * 0.2);
      break;
    default:
      pupil(ey + (expr === "think" ? -r * 0.25 : 0), expr === "nervous" ? r * 0.85 : r);
  }
  if (expr === "angry" || expr === "nervous") {
    const inner = ex - sd * r, outer = ex + sd * r * 1.1;
    const [iy, oy] = expr === "angry" ? [ey - r * 1.25, ey - r * 1.9] : [ey - r * 1.9, ey - r * 1.35];
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(inner, iy);
    ctx.lineTo(outer, oy);
    ctx.stroke();
  }
}

function mouth(mx, my, r, expr) {
  const w = r * 1.1;
  ctx.lineWidth = Math.max(1.6, r * 0.4);
  ctx.beginPath();
  switch (expr) {
    case "happy":
    case "love": {
      const p = new Path2D();
      p.moveTo(mx - w, my);
      p.quadraticCurveTo(mx, my + w * 2.1, mx + w, my);
      p.closePath();
      ctx.fillStyle = "#d9595f";
      ctx.fill(p);
      ctx.save();
      ctx.clip(p);
      ctx.fillStyle = "#ff9aa2";
      oval(mx, my + w * 1.15, w * 0.6, w * 0.45);
      ctx.fill();
      ctx.restore();
      ctx.stroke(p);
      return;
    }
    case "smile":
      ctx.arc(mx - w * 0.5, my, w * 0.5, 0, Math.PI);
      ctx.moveTo(mx + w, my);
      ctx.arc(mx + w * 0.5, my, w * 0.5, 0, Math.PI);
      break;
    case "surprised":
      oval(mx, my + w * 0.3, w * 0.42, w * 0.52);
      ctx.fillStyle = "#d9595f";
      ctx.fill();
      break;
    case "shock":
      oval(mx, my + w * 0.5, w * 0.68, w * 0.95);
      ctx.fillStyle = "#d9595f";
      ctx.fill();
      break;
    case "sleepy":
      oval(mx, my + w * 0.2, w * 0.28, w * 0.32);
      break;
    case "nervous":
      ctx.moveTo(mx - w, my);
      ctx.quadraticCurveTo(mx - w * 0.5, my - w * 0.5, mx, my);
      ctx.quadraticCurveTo(mx + w * 0.5, my + w * 0.5, mx + w, my);
      break;
    case "smug":
    case "cool":
      ctx.moveTo(mx - w * 0.8, my + w * 0.1);
      ctx.quadraticCurveTo(mx + w * 0.1, my + w * 0.8, mx + w, my - w * 0.35);
      break;
    case "think":
      ctx.moveTo(mx - w * 0.5, my + w * 0.15);
      ctx.lineTo(mx + w * 0.45, my - w * 0.05);
      break;
    case "angry":
      ctx.moveTo(mx - w * 0.7, my + w * 0.45);
      ctx.quadraticCurveTo(mx, my - w * 0.35, mx + w * 0.7, my + w * 0.45);
      break;
    default:
      ctx.moveTo(mx - w * 0.7, my);
      ctx.quadraticCurveTo(mx, my + w * 0.9, mx + w * 0.7, my);
  }
  ctx.stroke();
}

function shades(x, ey, gap, r) {
  ctx.lineWidth = r * 0.4;
  ctx.fillStyle = "#2f2f3d";
  [-1, 1].forEach(sd => {
    ctx.beginPath();
    ctx.roundRect(x + sd * gap - r * 1.5, ey - r, r * 3, r * 2.1, r * 0.8);
    ctx.fill();
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(x - gap + r * 1.5, ey - r * 0.4);
  ctx.lineTo(x + gap - r * 1.5, ey - r * 0.4);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = r * 0.35;
  [-1, 1].forEach(sd => {
    ctx.beginPath();
    ctx.moveTo(x + sd * gap - r * 0.8, ey - r * 0.1);
    ctx.lineTo(x + sd * gap - r * 0.2, ey - r * 0.6);
    ctx.stroke();
  });
  ctx.strokeStyle = OUT;
}

// ---------- 角色 ----------
// top：头顶 y（用于摆放气泡尾巴和特效）；hx：头部中心 x 偏移
const CHARS = {};
function def(name, top, draw, hx = 0) {
  CHARS[name] = { top, hx, draw };
}

function drawKid(o, hair, shirt, hat) {
  const skin = "#ffe2cc";
  blob(-8, -4, 6.5, 5, "#6d7fb3");
  blob(8, -4, 6.5, 5, "#6d7fb3");
  blob(-18, -21, 5, 6.5, skin, { rot: 0.5 });
  blob(18, -21, 5, 6.5, skin, { rot: -0.5 });
  blob(0, -20, 16, 15, shirt);
  blob(0, -55, 30, 27, skin);
  shape([[-31, -50], [-34, -68], [-21, -85], [0, -90], [21, -85], [34, -68], [31, -50],
    [26, -60], [18, -56], [11, -63], [3, -57], [-5, -64], [-13, -57], [-21, -63], [-27, -55]], hair);
  face({ ey: -48, my: -38, gap: 13, r: 5.5, expr: o.expr });
  if (hat) {
    blob(0, -90, 21, 12, "#f6d37a");
    blob(0, -84, 21, 4, "#ef8a8a");
    blob(0, -79, 40, 7, "#f6d37a");
  }
}
def("kid", -88, o => drawKid(o, "#7a5240", "#8fd3f4"));
def("person", -88, o => drawKid(o, "#3b3b58", "#ffb38a"));
def("farmer", -98, o => drawKid(o, "#5a3d2e", "#a5d86f", true));

def("octopus", -80, o => {
  const col = o.color || "#ff9eb5";
  tubes([-2, -1, 0, 1, 2].map(i => {
    const d = i < 0 ? -1 : 1;
    return [[i * 9, -28], [i * 12, -14], [i * 15 + d * 5, -4], [i * 15 + d * 11, -9]];
  }), col, 9);
  blob(0, -50, 32, 30, col);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  dot(-16, -66, 4.5);
  dot(11, -71, 3.5);
  dot(21, -60, 2.5);
  face({ ey: -46, my: -35, gap: 13, r: 6, expr: o.expr });
});

def("otter", -80, o => {
  const col = o.color || "#b07d56", light = "#f3e1c7";
  blob(-10, -3, 7, 4, col);
  blob(10, -3, 7, 4, col);
  blob(0, -26, 22, 24, col);
  blob(0, -23, 14, 16, light, { stroke: false });
  blob(-21, -74, 7, 7, col);
  blob(21, -74, 7, 7, col);
  blob(0, -58, 27, 22, col);
  blob(0, -48, 13, 8, light);
  ctx.fillStyle = OUT;
  oval(0, -52, 3.5, 2.5);
  ctx.fill();
  face({ ey: -63, my: -46, gap: 13, r: 5, expr: o.expr });
  blob(-9, -34, 5, 4.5, col);
  blob(9, -34, 5, 4.5, col);
});

def("sloth", -82, o => {
  const col = o.color || "#b99c7c";
  blob(-24, -28, 6, 15, col, { rot: 0.2 });
  blob(24, -28, 6, 15, col, { rot: -0.2 });
  blob(0, -26, 23, 25, col);
  blob(0, -58, 26, 23, col);
  blob(0, -56, 20, 15, "#f2e4cc");
  blob(-9, -58, 8, 4.5, "#a07a5c", { rot: -0.35, stroke: false });
  blob(9, -58, 8, 4.5, "#a07a5c", { rot: 0.35, stroke: false });
  ctx.fillStyle = OUT;
  oval(0, -53, 3, 2);
  ctx.fill();
  face({ ey: -58, my: -48, gap: 9, r: 4, expr: o.expr });
});

def("cow", -86, o => {
  const col = o.color || "#ffffff", spot = "#4a3f3f";
  blob(-11, -4, 6, 5, spot);
  blob(11, -4, 6, 5, spot);
  inside(blob(0, -24, 24, 21, col), () => {
    blob(-14, -30, 9, 7, spot, { stroke: false });
    blob(13, -16, 7, 6, spot, { stroke: false });
  });
  blob(-14, -81, 4, 6, "#f7e3b5", { rot: -0.4 });
  blob(14, -81, 4, 6, "#f7e3b5", { rot: 0.4 });
  blob(-30, -66, 10, 5, col, { rot: -0.35 });
  blob(30, -66, 10, 5, col, { rot: 0.35 });
  inside(blob(0, -60, 26, 22, col), () => blob(-15, -72, 8, 7, spot, { stroke: false }));
  blob(0, -48, 17, 10, "#ffc9c9");
  ctx.fillStyle = OUT;
  oval(-6, -49, 2.2, 3);
  ctx.fill();
  oval(6, -49, 2.2, 3);
  ctx.fill();
  face({ ey: -64, my: -42, gap: 12, r: 5, expr: o.expr });
});

def("penguin", -80, o => {
  const col = o.color || "#3f4d63";
  blob(-10, -3, 8, 4, "#ffb347");
  blob(10, -3, 8, 4, "#ffb347");
  blob(-27, -36, 6, 15, col, { rot: 0.35 });
  blob(27, -36, 6, 15, col, { rot: -0.35 });
  blob(0, -40, 28, 38, col);
  blob(0, -36, 21, 30, "#fff", { stroke: false });
  face({ ey: -55, gap: 11, r: 5, expr: o.expr });
  blob(0, -47, 5.5, 3.5, "#ffb347");
});

def("flamingo", -102, o => {
  const col = o.color || "#ff9fc4";
  ctx.lineWidth = 2.5;
  curve([[-4, -28], [-4, -14], [-4, 0]]);
  curve([[5, -28], [9, -16], [4, -8], [6, 0]]);
  ctx.lineWidth = LW;
  tubes([[[-13, -44], [-18, -60], [-8, -74], [-2, -84]]], col, 7);
  blob(0, -40, 21, 14, col);
  blob(5, -42, 12, 7, col);
  blob(2, -90, 12, 11, col);
  blob(15, -87, 7, 4, "#fff1df", { rot: 0.4 });
  blob(19, -84, 3, 3, OUT, { stroke: false });
  face({ x: 1, ey: -92, gap: 6, r: 3.2, expr: o.expr });
}, 2);

def("hummingbird", -68, o => {
  const col = o.color || "#7fd8b0";
  blob(-6, -60, 15, 6, "rgba(225,245,255,0.95)", { rot: -0.7 });
  blob(-14, -55, 13, 5, "rgba(225,245,255,0.95)", { rot: -0.3 });
  shape([[-12, -38], [-24, -36], [-32, -30], [-26, -26], [-12, -30]], col);
  blob(0, -40, 17, 15, col);
  blob(-2, -35, 10, 8, "#f0fff6", { stroke: false });
  blob(7, -55, 13, 12, col);
  ctx.lineWidth = 2.5;
  curve([[19, -56], [38, -58]]);
  face({ x: 7, ey: -57, gap: 7, r: 3.5, expr: o.expr });
}, 7);

function drawBird(o, body, head, beak, feet, ring) {
  blob(-8, -3, 6, 3.5, feet);
  blob(8, -3, 6, 3.5, feet);
  blob(-23, -32, 8, 15, body, { rot: 0.35 });
  blob(23, -32, 8, 15, body, { rot: -0.35 });
  blob(0, -30, 23, 25, body);
  blob(0, -62, 21, 19, head);
  face({ ey: -65, gap: 10, r: 4.5, expr: o.expr, ring });
  blob(0, -55, 6.5, 4.5, beak);
}
def("eagle", -81, o => drawBird(o, o.color || "#a8774f", "#ffffff", "#ffcc4d", "#ffcc4d", false));
def("crow", -81, o => drawBird(o, o.color || "#55556b", o.color || "#55556b", "#c9c9d6", "#8a8aa0", true));

def("koala", -85, o => {
  const col = o.color || "#aab2bf";
  blob(-10, -3, 7, 4, col);
  blob(10, -3, 7, 4, col);
  blob(0, -24, 22, 22, col);
  blob(0, -21, 13, 14, "#e8ebf0", { stroke: false });
  [-1, 1].forEach(sd => {
    blob(sd * 26, -73, 14, 13, col);
    blob(sd * 26, -73, 8, 7, "#ffd6e0", { stroke: false });
  });
  blob(0, -58, 28, 23, col);
  blob(0, -54, 6, 8, "#4a3b3b", { stroke: false });
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  dot(-2, -58, 1.8);
  face({ ey: -61, my: -43, gap: 15, r: 5, expr: o.expr });
  blob(-10, -32, 5, 4.5, col);
  blob(10, -32, 5, 4.5, col);
});

def("elephant", -81, o => {
  const col = o.color || "#a9c6e6";
  blob(-12, -5, 7, 6, col);
  blob(12, -5, 7, 6, col);
  blob(0, -24, 24, 21, col);
  [-1, 1].forEach(sd => {
    blob(sd * 28, -58, 17, 19, col);
    blob(sd * 28, -58, 10, 12, "#ffd6e0", { stroke: false });
  });
  blob(0, -58, 25, 23, col);
  tubes([[[0, -52], [1, -42], [4, -34], [11, -32]]], col, 9);
  blob(0, -53, 6, 5, col, { stroke: false });
  face({ ey: -64, my: -46, mx: -12, gap: 12, r: 5, expr: o.expr });
});

def("zebra", -90, o => {
  const col = o.color || "#ffffff", stripe = "#4a3f3f";
  blob(-10, -4, 6, 5, stripe);
  blob(10, -4, 6, 5, stripe);
  const body = blob(0, -24, 22, 21, col);
  inside(body, () => {
    ctx.lineWidth = 4;
    [-14, -5, 4, 13].forEach(sx => curve([[sx, -46], [sx + 4, -28], [sx, -4]]));
  });
  ctx.lineWidth = LW;
  blob(-14, -82, 5, 10, col, { rot: -0.3 });
  blob(14, -82, 5, 10, col, { rot: 0.3 });
  blob(0, -85, 5, 8, stripe);
  blob(-6, -82, 4, 6, stripe);
  blob(6, -82, 4, 6, stripe);
  inside(blob(0, -60, 22, 23, col), () => {
    ctx.lineWidth = 3.5;
    curve([[-18, -79], [0, -75], [18, -79]]);
    curve([[-20, -72], [-12, -70]]);
    curve([[20, -72], [12, -70]]);
  });
  ctx.lineWidth = LW;
  blob(0, -45, 15, 10, "#ddd3e4");
  ctx.fillStyle = OUT;
  oval(-5, -46, 2, 2.6);
  ctx.fill();
  oval(5, -46, 2, 2.6);
  ctx.fill();
  face({ ey: -62, my: -39, gap: 11, r: 5, expr: o.expr });
});

def("snail", -54, o => {
  const col = o.color || "#ffe0a3";
  blob(0, -7, 38, 8, col);
  blob(26, -24, 11, 18, col);
  ctx.lineWidth = 2.5;
  curve([[22, -38], [19, -48], [17, -55]]);
  curve([[30, -38], [33, -48], [35, -55]]);
  ctx.lineWidth = LW;
  blob(17, -56, 3, 3, col);
  blob(35, -56, 3, 3, col);
  blob(-6, -30, 22, 21, "#f7a8a8");
  const spiral = [];
  for (let t = 0; t < Math.PI * 3.2; t += 0.4) spiral.push([-6 + Math.cos(t) * (2 + t * 1.6), -30 + Math.sin(t) * (2 + t * 1.6)]);
  curve(spiral);
  face({ x: 26, ey: -28, my: -19, gap: 5.5, r: 3.2, expr: o.expr });
}, 26);

def("shark", -74, o => {
  const col = o.color || "#94bfe3";
  shape([[-30, -38], [-46, -50], [-56, -58], [-50, -38], [-56, -16], [-46, -24], [-30, -32]], col);
  shape([[-10, -50], [-2, -64], [2, -74], [7, -64], [16, -50]], col);
  blob(0, -36, 37, 21, col);
  blob(6, -28, 25, 10, "#f4f8fc", { stroke: false });
  blob(-2, -24, 9, 4.5, col, { rot: 0.6 });
  ctx.lineWidth = 2;
  curve([[6, -44], [4, -38], [6, -32]]);
  curve([[1, -44], [-1, -38], [1, -32]]);
  face({ x: 20, ey: -42, my: -31, gap: 9, r: 4.5, expr: o.expr });
}, 18);

def("crab", -48, o => {
  const col = o.color || "#ff8f7d";
  tubes([-1, 1].flatMap(sd => [
    [[sd * 16, -12], [sd * 26, -10], [sd * 30, -1]],
    [[sd * 12, -8], [sd * 20, -4], [sd * 22, 0]],
    [[sd * 16, -24], [sd * 24, -30], [sd * 28, -34]],
  ]), col, 4);
  [-1, 1].forEach(sd => {
    blob(sd * 30, -40, 9, 8, col);
    ctx.beginPath();
    ctx.moveTo(sd * 34, -47);
    ctx.lineTo(sd * 30, -41);
    ctx.stroke();
  });
  ctx.lineWidth = 2.5;
  curve([[-7, -30], [-8, -38]]);
  curve([[7, -30], [8, -38]]);
  ctx.lineWidth = LW;
  blob(0, -18, 24, 15, col);
  face({ ey: -41, my: -16, gap: 8, r: 3.6, expr: o.expr, ring: true });
});

def("lion", -88, o => {
  const col = o.color || "#d4a574", mane = "#c89050";
  blob(0, -24, 22, 21, col);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
    blob(Math.cos(a) * 36, -58 + Math.sin(a) * 36, 12, 12, mane);
  }
  blob(-14, -82, 5, 7, col, { rot: -0.3 });
  blob(14, -82, 5, 7, col, { rot: 0.3 });
  blob(0, -70, 24, 20, col);
  face({ ey: -64, my: -44, gap: 12, r: 5, expr: o.expr });
});

def("tiger", -90, o => {
  const col = o.color || "#ffb347", stripe = "#4a3f3f";
  blob(-10, -4, 6, 5, stripe);
  blob(10, -4, 6, 5, stripe);
  const body = blob(0, -24, 22, 21, col);
  inside(body, () => {
    ctx.lineWidth = 3;
    [-12, 0, 12].forEach(sx => curve([[sx, -46], [sx + 2, -28], [sx, -4]]));
  });
  blob(-14, -82, 5, 10, col, { rot: -0.3 });
  blob(14, -82, 5, 10, col, { rot: 0.3 });
  blob(0, -65, 22, 20, col);
  shape([[-18, -75], [-14, -85], [-6, -82]], stripe);
  shape([[18, -75], [14, -85], [6, -82]], stripe);
  face({ ey: -62, my: -39, gap: 12, r: 5, expr: o.expr });
});

def("panda", -88, o => {
  const col = o.color || "#ffffff", black = "#3a2828";
  blob(-11, -4, 6, 5, black);
  blob(11, -4, 6, 5, black);
  blob(0, -24, 22, 21, col);
  blob(-16, -72, 9, 10, black);
  blob(16, -72, 9, 10, black);
  blob(0, -65, 24, 20, col);
  blob(0, -48, 13, 10, "#f0f0f0");
  ctx.fillStyle = black;
  oval(-6, -65, 3.5, 5);
  ctx.fill();
  oval(6, -65, 3.5, 5);
  ctx.fill();
  face({ ey: -62, my: -42, gap: 10, r: 4.5, expr: o.expr });
});

def("giraffe", -102, o => {
  const col = o.color || "#f4d4a8", spot = "#8b7355";
  tubes([[[0, -20], [1, -40], [2, -60], [3, -80]]], col, 12);
  blob(0, -28, 20, 18, col);
  inside(blob(0, -28, 20, 18, col), () => {
    [-8, 4].forEach(sx => blob(sx, -30, 8, 6, spot, { stroke: false }));
  });
  blob(-10, -90, 6, 8, col, { rot: -0.2 });
  blob(10, -90, 6, 8, col, { rot: 0.2 });
  blob(0, -92, 10, 6, col);
  face({ ey: -100, gap: 7, r: 4, expr: o.expr });
});

def("monkey", -85, o => {
  const col = o.color || "#b8956d", skin = "#f4d4a8";
  blob(-11, -4, 6, 5, col);
  blob(11, -4, 6, 5, col);
  blob(-25, -30, 8, 15, col, { rot: 0.3 });
  blob(25, -30, 8, 15, col, { rot: -0.3 });
  blob(0, -26, 22, 24, col);
  blob(0, -58, 24, 21, col);
  blob(0, -48, 15, 12, skin);
  blob(0, -56, 8, 6, skin, { stroke: false });
  ctx.fillStyle = OUT;
  oval(-6, -50, 2.5, 2);
  ctx.fill();
  oval(6, -50, 2.5, 2);
  ctx.fill();
  face({ ey: -60, my: -42, gap: 11, r: 4.5, expr: o.expr });
});

def("parrot", -82, o => {
  const col = o.color || "#e74c3c", wing = "#27ae60";
  blob(-8, -3, 6, 3.5, "#ffb347");
  blob(8, -3, 6, 3.5, "#ffb347");
  blob(-20, -25, 10, 18, wing, { rot: 0.4 });
  blob(20, -25, 10, 18, wing, { rot: -0.4 });
  blob(0, -28, 20, 24, col);
  blob(0, -58, 18, 18, col);
  blob(0, -54, 8, 5, "#f0e0a0");
  face({ ey: -62, gap: 9, r: 4, expr: o.expr });
  blob(0, -50, 5, 3.5, "#ffb347");
});

def("dolphin", -82, o => {
  const col = o.color || "#5dade2";
  blob(-12, -6, 8, 6, col);
  blob(12, -6, 8, 6, col);
  blob(0, -28, 26, 20, col);
  blob(0, -22, 15, 12, "#ffffff", { stroke: false });
  tubes([[[6, -48], [12, -60], [14, -70]]], col, 9);
  blob(0, -56, 20, 18, col);
  face({ x: 16, ey: -48, my: -36, gap: 8, r: 4, expr: o.expr });
});

def("whale", -95, o => {
  const col = o.color || "#4a7c8a";
  blob(-15, -8, 10, 7, col);
  blob(15, -8, 10, 7, col);
  blob(0, -32, 32, 26, col);
  blob(0, -28, 20, 16, "#8fbdd4", { stroke: false });
  tubes([[[2, -56], [4, -70], [6, -82]]], col, 12);
  blob(0, -62, 26, 20, col);
  face({ x: 18, ey: -54, my: -40, gap: 10, r: 5, expr: o.expr });
});

def("bear", -88, o => {
  const col = o.color || "#8b6f47";
  blob(-10, -4, 7, 5, col);
  blob(10, -4, 7, 5, col);
  blob(-18, -65, 9, 12, col);
  blob(18, -65, 9, 12, col);
  blob(0, -26, 23, 23, col);
  blob(0, -62, 26, 22, col);
  blob(0, -50, 14, 10, "#d4a574");
  ctx.fillStyle = OUT;
  oval(-6, -58, 3, 4);
  ctx.fill();
  oval(6, -58, 3, 4);
  ctx.fill();
  face({ ey: -62, my: -44, gap: 12, r: 5, expr: o.expr });
});

def("fox", -86, o => {
  const col = o.color || "#ff6b35", white = "#ffffff";
  blob(-10, -3, 7, 4, col);
  blob(10, -3, 7, 4, col);
  blob(-28, -70, 9, 12, col);
  blob(28, -70, 9, 12, col);
  blob(0, -25, 22, 22, col);
  blob(0, -50, 9, 7, white, { stroke: false });
  blob(0, -60, 24, 20, col);
  ctx.fillStyle = OUT;
  oval(-5, -50, 2.5, 2);
  ctx.fill();
  oval(5, -50, 2.5, 2);
  ctx.fill();
  face({ ey: -62, my: -42, gap: 11, r: 4.5, expr: o.expr });
});

def("rabbit", -84, o => {
  const col = o.color || "#ffe8f0", inner = "#ffccdd";
  blob(-10, -4, 6, 5, col);
  blob(10, -4, 6, 5, col);
  blob(-12, -90, 4, 18, col);
  blob(12, -90, 4, 18, col);
  blob(-12, -90, 2.5, 14, inner, { stroke: false });
  blob(12, -90, 2.5, 14, inner, { stroke: false });
  blob(0, -26, 20, 22, col);
  blob(0, -54, 22, 20, col);
  blob(0, -50, 12, 8, inner);
  ctx.fillStyle = OUT;
  oval(-5, -50, 2, 2.5);
  ctx.fill();
  oval(5, -50, 2, 2.5);
  ctx.fill();
  face({ ey: -60, my: -42, gap: 10, r: 4, expr: o.expr });
});

def("fish", -60, o => {
  const col = o.color || "#ffb347";
  blob(-12, -5, 7, 4, col);
  blob(12, -5, 7, 4, col);
  blob(0, -18, 24, 16, col);
  shape([[-32, -20], [-42, -18], [-40, -8], [-28, -10]], col);
  blob(0, -40, 18, 16, col);
  face({ ey: -38, gap: 8, r: 3.5, expr: o.expr });
  blob(0, -28, 4, 2.5, col, { stroke: false });
});

// ---------- 道具 ----------
function leafAt(x, y, len, ang, fill) {
  const c = Math.cos(ang), s = Math.sin(ang), w = len * 0.35;
  const rot = ([px, py]) => [x + px * c - py * s, y + px * s + py * c];
  shape([[0, 0], [w, -len * 0.5], [0, -len], [-w, -len * 0.5]].map(rot), fill);
}

const PROPS = {
  pebble() {
    blob(0, -11, 14, 10, "#c8d3dc");
    ctx.fillStyle = "#fff";
    oval(-5, -15, 4, 2.2);
    ctx.fill();
    star(15, -28, 5);
    star(-14, -30, 3.5);
  },
  heart(color) {
    heart(0, -46, 13, color === "blue" ? "#7fb2ff" : "#ff7b9c");
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    oval(-5, -50, 3, 2);
    ctx.fill();
  },
  ring() {
    ctx.beginPath();
    ctx.arc(0, -18, 12, 0, TAU);
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.strokeStyle = "#ffd36b";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 2.5;
    poly([[-7, -44], [7, -44], [11, -38], [0, -28], [-11, -38]], "#c9f1ff");
    star(15, -48, 5);
    star(-15, -40, 3.5);
  },
  shrimp() {
    const c = "#ffa58c";
    ctx.lineWidth = 2;
    curve([[10, -22], [20, -34], [28, -36]]);
    ctx.lineWidth = LW;
    shape([[-12, -8], [-21, -15], [-20, -5], [-22, 2], [-12, -5]], c);
    blob(-9, -9, 6, 5.5, c);
    blob(-1, -12, 7, 6.5, c);
    blob(8, -16, 8, 7, c);
    ctx.fillStyle = OUT;
    dot(11, -19, 1.8);
  },
  leaf() {
    curve([[0, 0], [0, -20], [-2, -42]]);
    leafAt(0, -12, 18, -1.0, "#9bd68f");
    leafAt(0, -22, 18, 1.0, "#9bd68f");
    leafAt(-1, -36, 16, -0.2, "#9bd68f");
  },
  flower() {
    tubes([[[0, 0], [1, -20], [0, -40]]], "#8fd18f", 4);
    leafAt(1, -16, 14, 1.0, "#9bd68f");
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * TAU - Math.PI / 2;
      blob(Math.cos(a) * 9, -48 + Math.sin(a) * 9, 7, 7, "#ffb3c6");
    }
    blob(0, -48, 6, 6, "#ffd166");
  },
  tree() {
    shape([[-8, 2], [8, 2], [6, -30], [5, -58], [-5, -58], [-6, -30]], "#c49a6c");
    blob(-20, -66, 20, 17, "#a6dc8f");
    blob(20, -66, 20, 17, "#a6dc8f");
    blob(0, -84, 28, 22, "#a6dc8f");
    ctx.fillStyle = "#ff9e9e";
    dot(-12, -86, 3);
    dot(14, -74, 3);
    dot(-22, -62, 2.5);
  },
  clock() {
    curve([[-10, -8], [-14, 0]]);
    curve([[10, -8], [14, 0]]);
    blob(-12, -41, 6, 5, "#ffd27a", { rot: -0.5 });
    blob(12, -41, 6, 5, "#ffd27a", { rot: 0.5 });
    blob(0, -24, 18, 18, "#ffd27a");
    blob(0, -24, 13, 13, "#fff");
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(0, -33);
    ctx.moveTo(0, -24);
    ctx.lineTo(6, -21);
    ctx.stroke();
  },
  calendar(label = "下周") {
    ctx.beginPath();
    ctx.roundRect(-20, -50, 40, 44, 5);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.fillStyle = "#ff8a8a";
    ctx.fillRect(-20, -50, 40, 12);
    ctx.stroke();
    ctx.fillStyle = OUT;
    ctx.font = `14px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, -22);
  },
  mirror() {
    curve([[-10, -14], [-16, 0]]);
    curve([[10, -14], [16, 0]]);
    blob(0, -48, 21, 30, "#f6c177");
    blob(0, -48, 15, 23, "#dff3ff");
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    curve([[-8, -58], [-2, -64]]);
    curve([[-9, -50], [4, -63]]);
  },
  camera() {
    ctx.beginPath();
    ctx.roundRect(-8, -42, 14, 8, 2);
    ctx.fillStyle = "#a8b4c4";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(-20, -36, 40, 28, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#4a4a5e";
    dot(0, -22, 9);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    dot(-3, -25, 2.5);
    star(16, -46, 6);
  },
  magnifier() {
    tubes([[[8, -20], [18, -4]]], "#c49a6c", 6);
    ctx.beginPath();
    ctx.arc(0, -32, 13, 0, TAU);
    ctx.fillStyle = "rgba(210,240,255,0.85)";
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = "#9aa5b1";
    ctx.lineWidth = 3.5;
    ctx.stroke();
  },
  barcode() {
    ctx.beginPath();
    ctx.roundRect(-22, -42, 44, 32, 5);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = OUT;
    let bx = -16;
    [2, 1, 3, 1, 2, 2, 1, 3, 1, 2].forEach(w => {
      ctx.fillRect(bx, -36, w * 1.2, 20);
      bx += w * 1.2 + 1.8;
    });
    star(24, -46, 6);
  },
};

// ---------- 特效（画在格子坐标里，hx/hy 是头顶位置）----------
const FX = {
  hearts(hx, hy, s) {
    heart(hx + 30 * s, hy + 12 * s, 7 * s, "#ff7b9c");
    heart(hx + 42 * s, hy - 4 * s, 5 * s, "#ff9fb5");
    heart(hx - 32 * s, hy + 8 * s, 5.5 * s, "#ff9fb5");
  },
  sparkle(hx, hy, s) {
    star(hx - 38 * s, hy + 14 * s, 8 * s);
    star(hx + 38 * s, hy + 4 * s, 10 * s);
    star(hx + 44 * s, hy + 36 * s, 5 * s);
  },
  zzz(hx, hy, s) {
    ctx.fillStyle = "#7aa7e0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    [[28, 10, 18], [40, -6, 14], [50, -18, 10]].forEach(([dx, dy, fs]) => {
      ctx.font = `${fs * s}px ${FONT}`;
      ctx.fillText("Z", hx + dx * s, hy + dy * s);
    });
  },
  sweat(hx, hy, s) {
    const cx = hx + 30 * s, cy = hy + 20 * s, r = 6 * s;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 1.6 * r);
    ctx.bezierCurveTo(cx + 1.2 * r, cy - 0.2 * r, cx + r, cy + r, cx, cy + r);
    ctx.bezierCurveTo(cx - r, cy + r, cx - 1.2 * r, cy - 0.2 * r, cx, cy - 1.6 * r);
    ctx.fillStyle = "#9edcff";
    ctx.fill();
    ctx.stroke();
  },
  idea(hx, hy, s) {
    const cx = hx + 36 * s, cy = hy + 2 * s;
    [-0.6, 0, 0.6].forEach(a => {
      ctx.beginPath();
      ctx.moveTo(cx + Math.sin(a) * 15 * s, cy - Math.cos(a) * 15 * s);
      ctx.lineTo(cx + Math.sin(a) * 21 * s, cy - Math.cos(a) * 21 * s);
      ctx.stroke();
    });
    ctx.fillStyle = "#c8cdd6";
    ctx.fillRect(cx - 4 * s, cy + 7 * s, 8 * s, 6 * s);
    ctx.strokeRect(cx - 4 * s, cy + 7 * s, 8 * s, 6 * s);
    ctx.fillStyle = "#ffe066";
    dot(cx, cy, 10 * s);
    ctx.stroke();
  },
  question(hx, hy, s) {
    ctx.font = `${30 * s}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#fff";
    ctx.strokeText("?", hx + 36 * s, hy + 8 * s);
    ctx.fillStyle = "#ff9f43";
    ctx.fillText("?", hx + 36 * s, hy + 8 * s);
  },
  anger(hx, hy, s) {
    const cx = hx + 28 * s, cy = hy + 16 * s;
    ctx.strokeStyle = "#ff5e5e";
    ctx.lineWidth = 3;
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(cx + sx * 2 * s, cy + sy * 8 * s);
      ctx.quadraticCurveTo(cx + sx * 2 * s, cy + sy * 2 * s, cx + sx * 8 * s, cy + sy * 2 * s);
      ctx.stroke();
    });
  },
  shock(hx, hy, s) {
    ctx.lineWidth = 3;
    [-2.5, -2.1, -1.05, -0.65].forEach(a => {
      ctx.beginPath();
      ctx.moveTo(hx + Math.cos(a) * 36 * s, hy + 34 * s + Math.sin(a) * 36 * s);
      ctx.lineTo(hx + Math.cos(a) * 50 * s, hy + 34 * s + Math.sin(a) * 50 * s);
      ctx.stroke();
    });
  },
  speed(hx, hy, s, it, g) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(74,52,52,0.6)";
    [30, 45, 60].forEach((dy, i) => {
      const x0 = it.cx + it.dir * (48 + i * 6) * s;
      ctx.beginPath();
      ctx.moveTo(x0, g - dy * s);
      ctx.lineTo(x0 + it.dir * 22 * s, g - dy * s);
      ctx.stroke();
    });
  },
  crown(hx, hy, s) {
    const y = hy + 6 * s, w = 14 * s;
    poly([[hx - w, y], [hx - w, y - 14 * s], [hx - w / 2, y - 7 * s], [hx, y - 17 * s],
      [hx + w / 2, y - 7 * s], [hx + w, y - 14 * s], [hx + w, y]], "#ffd36b");
    ctx.fillStyle = "#ff7b9c";
    dot(hx, y - 5 * s, 2.5 * s);
  },
};
