// AGIF WORLD v1 — PS2-era 3D venture environments.
// Shared engine for every <name>.agifuturefoundation.org site.
// Renders at 640x448 (NTSC PS2 framebuffer), gouraud-lit low-poly, fog,
// blob shadows, typewriter dialog. No build step, no deps beyond three via CDN.
//
// Page contract: window.AGIF_SCENE must be set before this module loads.
// Schema:
// {
//   id, name, accent: "#rrggbb",
//   sky: 0x0a0e14, fog: [color, near, far], ground: { color, grid },
//   sun: { pos:[x,y,z], color },
//   props: [{ type:"box|cyl|cone|torus|sphere|gate|pyramid", pos:[x,y,z],
//             size:[w,h,d] | [r,h], color, label?, flat?,
//             onClick?: { action:"spin|bounce|pulse|toast|link|reveal", url?, text?, target? } }],
//   agents: [{ name, role, pos:[x,y,z], color, accentColor?, lines:[..] }],
//   eggs: { konami: "text", duck: true, monolith: false },
//   decor: [{ type:"ring|trees|pillars|crystals|waves", count, radius, color }],
//   build?: (THREE, threeScene, api) => void   // bespoke geometry hook
// }
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const S = window.AGIF_SCENE;
const ACCENT = new THREE.Color(S.accent || "#4f8cff");
const W = 640, H = 448; // PS2 NTSC framebuffer

// ---------- renderer ----------
const canvas = document.getElementById("agif-world-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setSize(W, H, false);
const scene = new THREE.Scene();
const sky = new THREE.Color(S.sky ?? 0x0a0e14);
scene.background = sky;
const [fogColor, fogNear, fogFar] = S.fog || [S.sky ?? 0x0a0e14, 18, 85];
scene.fog = new THREE.Fog(new THREE.Color(fogColor), fogNear, fogFar);

const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 400);

scene.add(new THREE.HemisphereLight(0xcfd8e8, 0x11141c, 0.9));
const sun = new THREE.DirectionalLight(S.sun?.color ?? 0xfff2d8, 0.85);
sun.position.set(...(S.sun?.pos || [30, 60, 20]));
scene.add(sun);

// ---------- world ----------
const world = new THREE.Group();
scene.add(world);
const clickables = [];   // meshes with onClick
const revealables = [];  // hidden egg meshes
const agents = [];

const mat = (color, flat) => new THREE.MeshLambertMaterial({ color, flatShading: !!flat });
function blobShadow(r) {
  const g = new THREE.CircleGeometry(r, 12);
  const m = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
  const p = new THREE.Mesh(g, m);
  p.rotation.x = -Math.PI / 2;
  p.position.y = 0.02;
  return p;
}

// ground
const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat(S.ground?.color ?? 0x141a26));
ground.rotation.x = -Math.PI / 2;
world.add(ground);
const grid = new THREE.GridHelper(400, 100, ACCENT, 0x1d2534);
grid.material.transparent = true; grid.material.opacity = 0.25;
world.add(grid);

// primitives
function makeProp(p) {
  let g;
  // pos: [x,y,z] or ground form [x,z]
  const x = p.pos[0], y = p.pos.length > 2 ? p.pos[1] : 0, z = p.pos.length > 2 ? p.pos[2] : p.pos[1];
  const s = p.size || [1, 1, 1];
  switch (p.type) {
    case "cyl":     g = new THREE.CylinderGeometry(s[0], s[0], s[1], 8); break;
    case "cone":    g = new THREE.ConeGeometry(s[0], s[1], 8); break;
    case "sphere":  g = new THREE.SphereGeometry(s[0], 10, 8); break;
    case "torus":   g = new THREE.TorusGeometry(s[0], s[0] * 0.3, 8, 20); break;
    case "pyramid": g = new THREE.ConeGeometry(s[0], s[1], 4); break;
    case "gate":    g = new THREE.TorusGeometry(s[0], s[0] * 0.12, 6, 12, Math.PI); break;
    default:        g = new THREE.BoxGeometry(s[0], s[1], s[2] || s[0]);
  }
  const mesh = new THREE.Mesh(g, mat(p.color, p.flat));
  mesh.position.set(x, y, z);
  if (p.rotY) mesh.rotation.y = p.rotY;
  if (p.label) mesh.userData.label = p.label;
  if (p.onClick) { mesh.userData.onClick = p.onClick; clickables.push(mesh); }
  if (p.shadow !== false) { const sh = blobShadow(Math.max(s[0], s[1]) * 0.9); sh.position.x = x; sh.position.z = z; world.add(sh); }
  mesh.userData.anim = null; mesh.userData.baseY = y;
  world.add(mesh);
  return mesh;
}
(S.props || []).forEach(makeProp);

// decor rings
for (const d of S.decor || []) {
  for (let i = 0; i < d.count; i++) {
    const a = (i / d.count) * Math.PI * 2, r = d.radius + Math.sin(i * 3.7) * 2;
    const h = 0.8 + ((i * 2654435761) % 1000) / 1000 * (d.h || 2.5);
    let g, y = h / 2;
    if (d.type === "ring") g = new THREE.TorusGeometry(0.5, 0.16, 6, 14);
    else if (d.type === "crystals") { g = new THREE.ConeGeometry(0.35, h, 5); y = h / 2; }
    else if (d.type === "waves") g = new THREE.BoxGeometry(2.2, 0.18, 0.5);
    else g = new THREE.BoxGeometry(0.35, h, 0.35); // pillars/trees trunks
    const m = new THREE.Mesh(g, mat(d.color, true));
    m.position.set(Math.cos(a) * r, d.type === "ring" ? 1.4 + (i % 3) * 0.8 : d.type === "waves" ? 0.3 : y, Math.sin(a) * r);
    if (d.type === "ring") { m.rotation.y = a; m.rotation.x = Math.PI / 2.4; }
    if (d.type === "waves") m.rotation.y = a + Math.PI / 2;
    world.add(m);
  }
}

// agent avatars: low-poly capsule body + head + name sprite
function nameSprite(text) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 64;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgba(8,10,16,0.82)"; ctx.fillRect(0, 8, 256, 48);
  ctx.strokeStyle = "#" + ACCENT.getHexString(); ctx.lineWidth = 3; ctx.strokeRect(1.5, 9.5, 253, 45);
  ctx.font = "bold 26px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#e8ecf3"; ctx.fillText(text.toUpperCase(), 128, 33);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true }));
  sp.scale.set(2.6, 0.65, 1);
  return sp;
}
function makeAgent(a) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 1.35, 8), mat(a.color, true));
  body.position.y = 0.85;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), mat(0xe8ecf3, true));
  head.position.y = 1.8;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.1), mat(a.accentColor || S.accent));
  visor.position.set(0, 1.82, 0.3);
  g.add(body, head, visor, blobShadow(0.7));
  const tag = nameSprite(a.name); tag.position.y = 2.5; g.add(tag);
  // pos: [x,y,z] or ground form [x,z]
  g.position.set(a.pos[0], a.pos.length > 2 ? a.pos[1] : 0, a.pos.length > 2 ? a.pos[2] : a.pos[1]);
  const home = g.position.clone();
  g.userData = { name: a.name, role: a.role, lines: a.lines, lineIdx: 0, phase: Math.random() * 9, home };
  world.add(g);
  agents.push(g);
  return g;
}
(S.agents || []).forEach(makeAgent);

// hidden duck egg
if (S.eggs?.duck !== false) {
  const duck = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mat(0xffd23f, true)); b.scale.y = 0.85; b.position.y = 0.2;
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), mat(0xffd23f, true)); h.position.set(0, 0.38, 0.16);
  const bk = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 5), mat(0xff8c00, true)); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0.37, 0.3);
  duck.add(b, h, bk);
  const dp = S.eggs?.duckPos || [12, 0, -14];
  duck.position.set(dp[0], dp.length > 2 ? dp[1] : 0, dp.length > 2 ? dp[2] : dp[1]);
  duck.userData.onClick = { action: "toast", text: "🦆 THE DUCK. Of course it's here. (AGIF WORLD easter egg 1/2)" };
  duck.visible = true;
  clickables.push(duck);
  world.add(duck);
}

// bespoke hook
const api = {
  THREE, scene, world, camera, mat, clickables, revealables, blobShadow, nameSprite,
  toast: (t) => showToast(t), open: (u) => window.open(u, "_blank", "noopener"),
};
if (S.build) S.build(THREE, world, api);

// ---------- HUD ----------
const hud = document.getElementById("agif-world-hud");
hud.innerHTML =
  '<div id="w-hud-top"><span>' + (S.name || "AGIF WORLD").toUpperCase() + '</span><span>AGIF WORLD v1</span></div>' +
  '<div id="w-hud-hint">WASD MOVE · MOUSE LOOK · CLICK INTERACT · E TALK</div>' +
  '<div id="w-toast"></div>' +
  '<div id="w-prompt"></div>' +
  '<div id="w-dialog"><div id="w-dlg-name"></div><div id="w-dlg-text"></div><div id="w-dlg-next">▼ E</div></div>';
const toastEl = hud.querySelector("#w-toast"), promptEl = hud.querySelector("#w-prompt");
const dlgEl = hud.querySelector("#w-dialog"), dlgName = hud.querySelector("#w-dlg-name"), dlgText = hud.querySelector("#w-dlg-text");
let toastT = 0;
function showToast(t) {
  toastEl.textContent = t; toastEl.classList.add("on"); toastT = performance.now() + 3200;
}
let dlg = null; // { agent, shown, done }
function openDialog(agent) {
  dlg = { agent, text: agent.userData.lines[agent.userData.lineIdx] || "...", shown: 0 };
  agent.userData.lineIdx = (agent.userData.lineIdx + 1) % agent.userData.lines.length;
  dlgName.textContent = agent.userData.name.toUpperCase() + (agent.userData.role ? " · " + agent.userData.role : "");
  dlgEl.classList.add("on");
}
function closeDialog() { dlg = null; dlgEl.classList.remove("on"); }

// ---------- controls ----------
const player = { pos: new THREE.Vector3(S.spawn?.[0] ?? 0, 1.65, S.spawn?.[1] ?? 14), yaw: Math.PI, pitch: 0 };
const keys = {};
addEventListener("keydown", (e) => {
  if (e.key === "e" || e.key === "E") interact();
  keys[e.key.toLowerCase()] = true;
});
addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

let dragging = false, moved = 0, lastX = 0, lastY = 0;
canvas.addEventListener("mousedown", (e) => { dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; });
addEventListener("mouseup", () => dragging = false);
addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  moved += Math.abs(dx) + Math.abs(dy);
  player.yaw -= dx * 0.004; player.pitch = Math.max(-1.2, Math.min(1.2, player.pitch - dy * 0.003));
  lastX = e.clientX; lastY = e.clientY;
});
// touch: left half = move stick, right half = look
let tMove = null, tLook = null;
canvas.addEventListener("touchstart", (e) => {
  for (const t of e.changedTouches) {
    if (t.clientX < innerWidth / 2 && !tMove) tMove = { id: t.identifier, x: t.clientX, y: t.clientY };
    else if (!tLook) tLook = { id: t.identifier, x: t.clientX, y: t.clientY };
  }
  e.preventDefault();
}, { passive: false });
canvas.addEventListener("touchmove", (e) => {
  for (const t of e.changedTouches) {
    if (tMove && t.identifier === tMove.id) { tMove.dx = t.clientX - tMove.x; tMove.dy = t.clientY - tMove.y; }
    if (tLook && t.identifier === tLook.id) {
      player.yaw -= (t.clientX - tLook.x) * 0.006; player.pitch = Math.max(-1.2, Math.min(1.2, player.pitch - (t.clientY - tLook.y) * 0.005));
      tLook.x = t.clientX; tLook.y = t.clientY;
    }
  }
  e.preventDefault();
}, { passive: false });
canvas.addEventListener("touchend", (e) => {
  for (const t of e.changedTouches) {
    if (tMove && t.identifier === tMove.id) tMove = null;
    if (tLook && t.identifier === tLook.id) tLook = null;
  }
});

// click interact (raycast) — only if the press didn't become a drag
// recursive so group props (duck, pylons) resolve; walk up to the
// ancestor that carries userData.onClick
const ray = new THREE.Raycaster();
const pointer = new THREE.Vector2(2, 2); // offscreen until mousemove
canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
});
function pickAt() {
  ray.setFromCamera(pointer, camera);
  const hit = ray.intersectObjects(clickables, true)[0];
  if (!hit) return null;
  let o = hit.object;
  while (o && !o.userData.onClick) o = o.parent;
  return o && o.userData.onClick ? o : null;
}
canvas.addEventListener("click", (e) => {
  if (moved > 6) return;
  const r = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  const o = pickAt();
  if (o) activate(o);
});
function activate(mesh) {
  const a = mesh.userData.onClick; if (!a) return;
  if (a.action === "link") { showToast("OPENING " + (a.url || "").replace(/^https?:\/\//, "").slice(0, 40)); window.open(a.url, "_blank", "noopener"); }
  else if (a.action === "toast") showToast(a.text);
  else if (a.action === "reveal") { revealables.forEach((o) => o.visible = true); showToast(a.text || "SOMETHING REVEALED"); }
  if (a.action === "spin" || a.action === "bounce" || a.action === "pulse") mesh.userData.anim = { type: a.action, t: 0 };
}

// konami egg
const KONAMI = ["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"];
let kIdx = 0;
addEventListener("keydown", (e) => {
  kIdx = (e.key.toLowerCase() === KONAMI[kIdx]) ? kIdx + 1 : (e.key.toLowerCase() === KONAMI[0] ? 1 : 0);
  if (kIdx === KONAMI.length) { kIdx = 0; konamiReward(); }
});
function konamiReward() {
  showToast(S.eggs?.konami || "🎮 KONAMI ACCEPTED — the grid hums approvingly. (AGIF WORLD easter egg 2/2)");
  for (let i = 0; i < 60; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 4), mat(ACCENT.clone().offsetHSL((i % 12) / 12, 0, 0), true));
    c.position.set(player.pos.x + (Math.random() - 0.5) * 2, 4 + Math.random() * 3, player.pos.z + (Math.random() - 0.5) * 2);
    c.userData.vy = 2 + Math.random() * 3; c.userData.vx = (Math.random() - 0.5) * 3; c.userData.vz = (Math.random() - 0.5) * 3;
    confetti.push(c); world.add(c);
  }
}
const confetti = [];

// ---------- interaction proximity ----------
let nearAgent = null;
function interact() {
  if (dlg) { dlg.shown >= dlg.text.length ? closeDialog() : (dlg.shown = dlg.text.length); return; }
  if (nearAgent) openDialog(nearAgent);
}

// ---------- loop ----------
const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;

  // movement
  const sp = (keys["shift"] ? 9 : 5.5) * dt;
  const fwd = new THREE.Vector3(Math.sin(player.yaw), 0, Math.cos(player.yaw));
  const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
  let mx = 0, mz = 0;
  if (keys["w"] || keys["arrowup"]) mz += 1;
  if (keys["s"] || keys["arrowdown"]) mz -= 1;
  if (keys["a"] || keys["arrowleft"]) mx -= 1;
  if (keys["d"] || keys["arrowright"]) mx += 1;
  if (tMove) { mx += Math.max(-1, Math.min(1, (tMove.dx || 0) / 40)); mz += Math.max(-1, Math.min(1, -(tMove.dy || 0) / 40)); }
  if (mx || mz) {
    const d = fwd.multiplyScalar(mz).add(right.multiplyScalar(mx)).normalize().multiplyScalar(sp);
    player.pos.add(d);
  }
  const R = 120;
  player.pos.x = Math.max(-R, Math.min(R, player.pos.x));
  player.pos.z = Math.max(-R, Math.min(R, player.pos.z));
  camera.position.copy(player.pos);
  camera.rotation.set(0, 0, 0);
  camera.rotateY(player.yaw + Math.PI);
  camera.rotateX(player.pitch);

  // toast timeout
  if (toastT && performance.now() > toastT) { toastEl.classList.remove("on"); toastT = 0; }

  // agents: bob, wander, face player, proximity prompt
  nearAgent = null;
  for (const a of agents) {
    const u = a.userData;
    a.position.y = Math.sin(t * 2 + u.phase) * 0.05;
    if (!dlg) {
      const wx = u.home.x + Math.sin(t * 0.3 + u.phase) * 1.6, wz = u.home.z + Math.cos(t * 0.22 + u.phase) * 1.6;
      a.position.x = wx; a.position.z = wz;
    }
    const d2 = a.position.distanceToSquared(player.pos);
    if (d2 < 16) {
      nearAgent = a;
      a.lookAt(player.pos.x, a.position.y, player.pos.z);
    }
  }
  // proximity prompt, else hover label for the prop under the crosshair
  let prompt = "";
  if (dlg) prompt = "";
  else if (nearAgent) prompt = "PRESS E — TALK TO " + nearAgent.userData.name.toUpperCase();
  else {
    const hov = pickAt();
    if (hov && hov.userData.label) prompt = hov.userData.label.toUpperCase();
  }
  promptEl.textContent = prompt;

  // typewriter dialog
  if (dlg) {
    dlg.shown = Math.min(dlg.text.length, dlg.shown + dt * 34);
    dlgText.textContent = dlg.text.slice(0, Math.floor(dlg.shown));
    hud.querySelector("#w-dlg-next").style.visibility = dlg.shown >= dlg.text.length ? "visible" : "hidden";
  }

  // prop animations
  for (const p of clickables) {
    const an = p.userData.anim;
    if (!an) continue;
    an.t = Math.min(1, an.t + dt * 2.2);
    if (an.type === "spin") p.rotation.y = an.t * Math.PI * 4 * (1 - an.t);
    if (an.type === "bounce") p.position.y = p.userData.baseY + Math.abs(Math.sin(an.t * Math.PI * 3)) * 0.8 * (1 - an.t);
    if (an.type === "pulse") p.scale.setScalar(1 + Math.sin(an.t * Math.PI * 4) * 0.18 * (1 - an.t));
    if (an.t >= 1) { an.t = 0; if (an.type !== "spin") p.userData.anim = null; }
  }

  // confetti physics
  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i];
    c.userData.vy -= 9.8 * dt;
    c.position.x += c.userData.vx * dt; c.position.y += c.userData.vy * dt; c.position.z += c.userData.vz * dt;
    c.rotation.x += dt * 5; c.rotation.z += dt * 7;
    if (c.position.y < 0.1) { world.remove(c); confetti.splice(i, 1); }
  }

  renderer.render(scene, camera);
}
tick();
showToast("WELCOME TO " + (S.name || "AGIF WORLD").toUpperCase() + " — EXPLORE");
window.AGIF_WORLD_OK = true; // signals the page boot that the engine is alive
