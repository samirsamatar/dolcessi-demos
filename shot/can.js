/* SHOT · the can: slim clear PET body, seamed aluminium end, layered drink (three.js) · Dolcessi */
import * as THREE from "three";
import { RoundedBoxGeometry } from "./vendor/RoundedBoxGeometry.js";

const TAU = Math.PI * 2;
export const CAN = { R: .46, NECK: .405, TOP: 2.2, FILL: 2.0, WALL: .012 };

/* ---------- procedural maps ---------- */
export function condensationMaps(size = 1024, seed0 = 7) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d");
  g.fillStyle = "#000"; g.fillRect(0, 0, size, size);
  let seed = seed0; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const drop = (x, y, r, h) => {
    const gr = g.createRadialGradient(x, y - r * .15, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,255,255,${h})`); gr.addColorStop(.6, `rgba(255,255,255,${h * .55})`); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r * .9, r, 0, 0, TAU); g.fill();
  };
  for (let i = 0; i < 2600; i++) drop(rnd() * size, rnd() * size, 1 + rnd() * 2.2, .45);
  for (let i = 0; i < 700; i++) drop(rnd() * size, rnd() * size, 2.5 + rnd() * 5.5, .9);
  for (let i = 0; i < 70; i++) {
    const x = rnd() * size, y0 = rnd() * size * .7, L = 30 + rnd() * 160, r = 2.5 + rnd() * 3.2;
    for (let k = 0; k < L; k += 2) drop(x + Math.sin(k * .05) * 1.5, y0 + k, r * (0.65 + 0.35 * (k / L)), .5);
    drop(x, y0 + L, r * 1.6, 1);
  }
  const src = g.getImageData(0, 0, size, size).data;
  const Hh = new Float32Array(size * size); for (let i = 0; i < Hh.length; i++) Hh[i] = src[i * 4] / 255;
  const n = g.createImageData(size, size), rgh = g.createImageData(size, size);
  const at = (x, y) => Hh[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * 3.2, dy = (at(x, y + 1) - at(x, y - 1)) * 3.2;
    const l = Math.hypot(dx, dy, 1), i = (y * size + x) * 4;
    n.data[i] = (-dx / l * .5 + .5) * 255; n.data[i + 1] = (dy / l * .5 + .5) * 255; n.data[i + 2] = (1 / l * .5 + .5) * 255; n.data[i + 3] = 255;
    const h = at(x, y), v = 255 * (0.03 + 0.22 * Math.min(1, h * 2.2)); rgh.data[i] = rgh.data[i + 1] = rgh.data[i + 2] = v; rgh.data[i + 3] = 255;
  }
  const mk = img => { const cc = document.createElement("canvas"); cc.width = cc.height = size; cc.getContext("2d").putImageData(img, 0, 0); const t = new THREE.CanvasTexture(cc); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
  return { normal: mk(n), rough: mk(rgh) };
}

// fine concentric/brushed relief for the aluminium end
function brushedMaps(size = 512) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"); const img = g.createImageData(size, size);
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const rings = new Float32Array(size); for (let i = 0; i < size; i++) rings[i] = rnd();
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const d = Math.hypot(x - size / 2, y - size / 2) | 0, v = 150 + rings[Math.min(size - 1, d)] * 60 + rnd() * 20, i = (y * size + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t;
}

/* ---------- shared GLSL noise ---------- */
const NOISE = /* glsl */`
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
float fbm(vec3 p){float f=0.,a=.5;for(int i=0;i<3;i++){f+=a*snoise(p);p*=2.03;a*=.5;}return f;}
`;

/* ---------- flavours: layers bottom → top (tops = top of each layer, 0..1 of the fill) ---------- */
export const FLAVOURS = {
  matcha:     { name: "Iced Matcha", nl: "Iced Matcha", price: "6,50", layers: ["#E9E3D2", "#7C8B36", "#6E7E2D", "#6E7E2D"], tops: [.1, .34, 1], soft: [.08, .2, .01], accent: "#6E7E2D" },
  strawberry: { name: "Strawberry Cheesecake Matcha", price: "8,85", layers: ["#9A1426", "#EEE7DA", "#5D7330", "#F2ECDF"], tops: [.2, .52, .87], soft: [.05, .16, .025], accent: "#C2253A" },
  creme:      { name: "Crème Brûlée Matcha", price: "8,85", layers: ["#EADFC9", "#5A7A24", "#C08A44", "#F1E3C8"], tops: [.32, .74, .9], soft: [.1, .05, .03], accent: "#B9822F" },
  cherry:     { name: "Creatine Cherry Matcha", price: "7,50", layers: ["#5E0A1A", "#E7DCD8", "#557521", "#557521"], tops: [.26, .56, 1], soft: [.07, .15, .01], accent: "#8E1530" },
  lavender:   { name: "Lavender CBD Matcha", price: "7,50", layers: ["#A893C8", "#EDE7E2", "#587A26", "#587A26"], tops: [.24, .56, 1], soft: [.09, .15, .01], accent: "#8C74B8" },
  carrot:     { name: "Carrot Coconut Cloud", price: "8,20", layers: ["#E2620F", "#EF8A2A", "#F6E9D6", "#F6E9D6"], tops: [.45, .74, 1], soft: [.16, .08, .01], accent: "#E2620F" },
  mocca:      { name: "Protein Mocca Latte", price: "7,50", layers: ["#3E2216", "#80533A", "#D6BFA2", "#EADCC7"], tops: [.18, .5, .9], soft: [.1, .14, .04], accent: "#6B3E26" }
};

function liquidMaterial(U) {
  const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .4, metalness: 0, clearcoat: .2, clearcoatRoughness: .35, envMapIntensity: .55 });
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vLocal; uniform float uTop; uniform float uTime; uniform float uRipple;")
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vLocal = position;
if (uTop > .5) { float r = length(position.xy); transformed.z += (sin(r * 34. - uTime * 9.) * .5 + sin(position.x * 21. + uTime * 5.) * .25) * .012 * uRipple * smoothstep(.0, .06, r) * (1. - r * 1.6); }`);
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vLocal;
uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3; uniform vec3 uTops; uniform vec3 uSoft; uniform float uFill; uniform float uY0; uniform float uTime; uniform float uTop; uniform float uMix; uniform float uIce; uniform float uLevel;
${NOISE}
vec3 drinkColor(vec3 p0){
  vec3 p = uTop > .5 ? vec3(p0.x, uLevel - .002, -p0.y) : p0;
  float y = (p.y - uY0) / max(uFill - uY0, .001);
  float ang = atan(p.z, p.x);
  float n = fbm(vec3(p.x*2.6, p.y*2.4 - uTime*.05, p.z*2.6) + uTime*.02);
  float n2 = uTop > .5 ? fbm(vec3(p.x*2.6, p.y*3.4, p.z*2.6) + 4.0) : fbm(vec3(cos(ang)*2.2, p.y*3.4, sin(ang)*2.2) + 4.0);
  float tend = uTop > .5 ? 0. : fbm(vec3(cos(ang)*5.0, p.y*.8, sin(ang)*5.0) + 9.0);
  float b0 = uTops.x + n2 * uSoft.x * 1.2 + max(0., tend) * uSoft.x * 1.6, b1 = uTops.y + (n * .9 + n2 * .6) * uSoft.y - max(0., -tend) * uSoft.y * 1.4, b2 = uTops.z + n2 * uSoft.z;
  vec3 col = c0;
  col = mix(col, c1, smoothstep(b0 - uSoft.x * .5, b0 + uSoft.x * .5, y));
  float n3 = fbm(vec3(p.x*3.6, p.y*3.2, p.z*3.6) + 2.0);
  float cloud = smoothstep(b1 - uSoft.y, b1 + uSoft.y * .25, y + n3 * uSoft.y * 1.3);
  col = mix(col, c2 * mix(1.12, .9, smoothstep(b1, uTops.z, y)), cloud);
  col = mix(col, c3, smoothstep(b2 - uSoft.z * .5, b2 + uSoft.z * .5, y));
  vec3 avg = (c0 * .25 + c1 * .35 + c2 * .3 + c3 * .1);
  col = mix(col, avg * (.9 + .2 * n), clamp(uMix, 0., 1.));
  col *= .9 + .2 * n;
  float rr = length(p.xz);
  col *= mix(.8, 1.04, smoothstep(.12, .43, rr));
  if (uTop < .5 && uIce > .01) {
    vec2 q = vec2(ang * .44 / .24, (p.y - .3) / .26);
    vec2 cid = floor(q), f = fract(q);
    float h = fract(sin(dot(cid, vec2(12.9898, 78.233))) * 43758.5453);
    float h2 = fract(h * 7.31 + .17);
    vec2 c = vec2(.5) + (vec2(h, h2) - .5) * .3;
    vec2 d = abs(f - c) - vec2(.26 + h2 * .1, .24 + h * .1);
    float box = length(max(d, 0.)) + min(max(d.x, d.y), 0.) - .07;
    float lv = (uLevel - uY0) / max(uFill - uY0, .001);
    float on = step(.45, h) * smoothstep(lv - .5, lv - .38, y) * (1. - smoothstep(lv - .06, lv - .02, y)) * uIce;
    float inside = (1. - smoothstep(-.015, .01, box)) * on;
    float edge = (1. - smoothstep(.0, .035, abs(box))) * on;
    col = mix(col, col * 1.1 + vec3(.05), inside * .3);
    col = mix(col, col * .8, edge * .15);
  }
  return col;
}`).replace("vec4 diffuseColor = vec4( diffuse, opacity );", "if (uTop < .5 && vLocal.y > uLevel) discard;\nvec4 diffuseColor = vec4( drinkColor(vLocal), opacity );");
  };
  return m;
}

/* the print: SHOT set vertically in white serif, straight onto the clear can */
function printTexture(name) {
  const W = 512, H = 2048, c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.clearRect(0, 0, W, H);
  g.save(); g.translate(W * .5, H * .5); g.rotate(-Math.PI / 2);
  g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `600 ${W * .62}px "Bodoni SHOT", "Didot", serif`;
  try { g.letterSpacing = `${W * .02}px`; } catch (e) {}
  g.fillText("SHOT", 0, -W * .02);
  g.font = `600 ${W * .045}px "Inter Tight", Arial, sans-serif`;
  try { g.letterSpacing = `${W * .018}px`; } catch (e) {}
  g.globalAlpha = .9;
  g.fillText(name.toUpperCase(), 0, W * .36);
  g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/* ---------- build one can ---------- */
export function buildCan(renderer, flavourKey = "matcha", opts = {}) {
  const F = FLAVOURS[flavourKey];
  const { R, NECK, TOP, FILL, WALL } = CAN;
  const g = new THREE.Group();

  // clear PET body: domed base, standing ring, chime, straight wall, neck into the seam
  const outer = [new THREE.Vector2(.001, .06), new THREE.Vector2(.26, .045), new THREE.Vector2(.37, .006), new THREE.Vector2(.395, 0)];
  for (let i = 1; i <= 10; i++) { const a = i / 10 * Math.PI / 2; outer.push(new THREE.Vector2(.395 + (R - .395) * Math.sin(a), .09 * (1 - Math.cos(a)))); }
  for (let i = 1; i <= 30; i++) outer.push(new THREE.Vector2(R, .09 + (2.03 - .09) * i / 30));
  for (let i = 1; i <= 12; i++) { const t = i / 12; outer.push(new THREE.Vector2(R - (R - NECK) * (t * t * (3 - 2 * t)), 2.03 + (TOP - 2.03) * t)); }
  const inner = outer.slice().reverse().map(v => new THREE.Vector2(Math.max(.001, v.x - WALL), v.y + (v.x < .05 ? WALL : 0)));
  const shellGeo = new THREE.LatheGeometry(outer.concat(inner), 128);
  const cond = opts.cond || condensationMaps(1024);
  cond.normal.repeat.set(1.6, 4.2); cond.rough.repeat.set(1.6, 4.2);
  const pet = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: .035, transmission: 1, thickness: .04, ior: 1.57, dispersion: .2,
    clearcoat: 1, clearcoatRoughness: .03, specularIntensity: 1, envMapIntensity: 1.3,
    normalMap: cond.normal, normalScale: new THREE.Vector2(.3, .3),
    attenuationColor: new THREE.Color(0xf6fbff), attenuationDistance: 4, side: THREE.DoubleSide
  });
  pet.depthWrite = false; // lets the (transmissive) ice draw after the wall
  const shell = new THREE.Mesh(shellGeo, pet); shell.renderOrder = 2; g.add(shell);

  // the drink, layered; uLevel cuts it to the current pour height
  const U = {
    c0: { value: new THREE.Color(F.layers[0]) }, c1: { value: new THREE.Color(F.layers[1]) }, c2: { value: new THREE.Color(F.layers[2]) }, c3: { value: new THREE.Color(F.layers[3]) },
    uTops: { value: new THREE.Vector3(...F.tops) }, uSoft: { value: new THREE.Vector3(...F.soft) },
    uFill: { value: FILL }, uY0: { value: .06 }, uTime: { value: 0 }, uTop: { value: 0 }, uMix: { value: 0 }, uIce: { value: 1 }, uLevel: { value: FILL }, uRipple: { value: 0 }
  };
  const RL = R - WALL - .006;
  const liqProf = [new THREE.Vector2(.001, .072), new THREE.Vector2(.25, .057), new THREE.Vector2(.35, .03)];
  for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; liqProf.push(new THREE.Vector2(.35 + (RL - .35) * Math.sin(a), .03 + .08 * (1 - Math.cos(a)))); }
  for (let i = 1; i <= 24; i++) liqProf.push(new THREE.Vector2(RL, .11 + (FILL + .1 - .11) * i / 24));
  const liqMat = liquidMaterial(U);
  const liquid = new THREE.Mesh(new THREE.LatheGeometry(liqProf, 96), liqMat); g.add(liquid);
  // the surface, a disk that rides the level and ripples while pouring
  const UT = Object.assign({}, U, { uTop: { value: 1 } });
  const surf = new THREE.Mesh(new THREE.RingGeometry(.001, RL, 72, 10), liquidMaterial(UT));
  surf.rotation.x = -Math.PI / 2; surf.position.y = FILL; g.add(surf);

  // aluminium end (built at the old scale around y=0, scaled down onto the neck)
  const brushed = brushedMaps(512);
  const alu = new THREE.MeshPhysicalMaterial({ color: 0xd9dbde, metalness: 1, roughness: .26, roughnessMap: brushed, clearcoat: .4, clearcoatRoughness: .2, envMapIntensity: 1.5 });
  const lidProf = [new THREE.Vector2(.595, -.03), new THREE.Vector2(.614, -.02)];
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + i / 8 * Math.PI; lidProf.push(new THREE.Vector2(.6 + Math.cos(a) * .024, .07 + Math.sin(a) * .03)); }
  lidProf.push(new THREE.Vector2(.578, .098), new THREE.Vector2(.566, .086));
  lidProf.push(new THREE.Vector2(.556, .005), new THREE.Vector2(.54, 0), new THREE.Vector2(.52, .012));
  lidProf.push(new THREE.Vector2(.5, .026), new THREE.Vector2(.3, .028), new THREE.Vector2(.26, .022), new THREE.Vector2(.22, .028), new THREE.Vector2(.001, .032));
  const lid = new THREE.Group(); lid.position.y = TOP; g.add(lid);
  const lidInner = new THREE.Group(); lidInner.scale.set(NECK / .6, 1.4, NECK / .6); lid.add(lidInner);
  lidInner.add(new THREE.Mesh(new THREE.LatheGeometry(lidProf, 128), alu));
  const tabShape = new THREE.Shape();
  const tw = .17, tl = .34, rr2 = .07;
  tabShape.moveTo(-tw / 2 + rr2, -tl / 2); tabShape.lineTo(tw / 2 - rr2, -tl / 2); tabShape.quadraticCurveTo(tw / 2, -tl / 2, tw / 2, -tl / 2 + rr2);
  tabShape.lineTo(tw / 2, tl / 2 - rr2); tabShape.quadraticCurveTo(tw / 2, tl / 2, tw / 2 - rr2, tl / 2); tabShape.lineTo(-tw / 2 + rr2, tl / 2);
  tabShape.quadraticCurveTo(-tw / 2, tl / 2, -tw / 2, tl / 2 - rr2); tabShape.lineTo(-tw / 2, -tl / 2 + rr2); tabShape.quadraticCurveTo(-tw / 2, -tl / 2, -tw / 2 + rr2, -tl / 2);
  const hole = new THREE.Path(); hole.absellipse(0, -tl * .2, tw * .28, tl * .17, 0, TAU, true); tabShape.holes.push(hole);
  const tabGeo = new THREE.ExtrudeGeometry(tabShape, { depth: .006, bevelEnabled: true, bevelThickness: .003, bevelSize: .005, bevelSegments: 2, curveSegments: 24 });
  tabGeo.rotateX(-Math.PI / 2);
  const tab = new THREE.Mesh(tabGeo, alu); tab.position.set(0, .034, .1); lidInner.add(tab);
  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(.03, .034, .014, 24), alu); rivet.position.set(0, .038, 0); lidInner.add(rivet);
  const score = new THREE.Mesh(new THREE.TorusGeometry(.13, .004, 6, 64, Math.PI * 1.7), alu);
  score.rotation.x = -Math.PI / 2; score.rotation.z = Math.PI * 1.15; score.scale.set(1, 1.35, 1); score.position.set(0, .029, -.24); lidInner.add(score);

  // the print, wrapped on the front
  let print = null;
  if (opts.print !== false) {
    const tex = printTexture(opts.printName || "Amsterdam");
    const phi = 1.05, y0 = .2, y1 = 1.98;
    const band = new THREE.LatheGeometry([new THREE.Vector2(R + .002, y0), new THREE.Vector2(R + .002, y1)], 48, -phi / 2, phi);
    const mat = new THREE.MeshPhysicalMaterial({ map: tex, transparent: true, alphaTest: .02, roughness: .35, clearcoat: .5, clearcoatRoughness: .2, depthWrite: false, side: THREE.FrontSide });
    print = new THREE.Mesh(band, mat); print.renderOrder = 3; g.add(print);
  }

  // ice cubes (dropped in during the ritual; opaque so they read through the PET)
  const ice = new THREE.Group(); g.add(ice);
  const iceMat = new THREE.MeshPhysicalMaterial({ color: 0xf4f8f7, roughness: .1, transmission: 1, thickness: .25, ior: 1.31, clearcoat: 1, clearcoatRoughness: .04, metalness: 0, envMapIntensity: 2, attenuationColor: new THREE.Color(0xdfeeea), attenuationDistance: .6 });
  const ig = new RoundedBoxGeometry(.2, .2, .2, 3, .045);
  const ICE = [[.12, 1.9, .1], [-.16, 1.86, .02], [.02, 1.93, -.17], [-.06, 1.8, .19], [.2, 1.78, -.12], [-.2, 1.9, -.16]];
  ICE.forEach(([x, y, z], i) => { const m = new THREE.Mesh(ig, iceMat); m.renderOrder = 4; m.userData.rest = new THREE.Vector3(x, y, z); m.userData.rot = new THREE.Euler(i * 1.3, i * .7 + .3, i * 2.1); m.position.set(x, y, z); m.rotation.copy(m.userData.rot); m.scale.setScalar(.85 + (i % 3) * .1); ice.add(m); });
  ice.visible = !!opts.ice;

  return { group: g, liquid, surf, U, UT, lid, shell, pet, print, ice, iceMat, flavour: F };
}

/* ---------- a studio for the cans ---------- */
export function buildStudio(renderer, scene, opts = {}) {
  const pm = new THREE.PMREMGenerator(renderer);
  const studio = new THREE.Scene(); studio.background = new THREE.Color(0x0b0a09);
  const glow = (w, h, x, y, z, k, tint = [1, .98, .95]) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(k * tint[0], k * tint[1], k * tint[2]), side: THREE.DoubleSide }); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.lookAt(0, y * .3, 0); studio.add(p); };
  glow(1.6, 10, -4.8, 2, 3.4, 4.2);
  glow(.9, 10, 5, 2, 2.4, 2.6);
  glow(1.4, 10, 3.8, 2, -4.6, 6);
  glow(1.4, 10, -4, 2, -4.2, 4.5, [1, .95, .88]);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.35, 2.25), side: THREE.DoubleSide })); top.position.set(0, 8, 0); top.rotation.x = Math.PI / 2; studio.add(top);
  const room = new THREE.Mesh(new THREE.BoxGeometry(30, 20, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(.16, .145, .13), side: THREE.BackSide })); studio.add(room);
  scene.environment = pm.fromScene(studio, .035).texture;

  // seamless sweep backdrop, opaque (the PET refracts it)
  const sweepMat = new THREE.ShaderMaterial({
    toneMapped: false,
    uniforms: { uA: { value: new THREE.Color(opts.bgA || "#EDE7DD") }, uB: { value: new THREE.Color(opts.bgB || "#D8CEBF") }, uGlow: { value: new THREE.Color(opts.glow || "#ffffff") } },
    vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: "uniform vec3 uA; uniform vec3 uB; uniform vec3 uGlow; varying vec3 vW; void main(){ float t = clamp((vW.y + 1.) / 9., 0., 1.); vec3 c = mix(uA, uB, t); float d = length(vW.xz * vec2(.16, .22)); c += uGlow * .06 * exp(-d*d*2.); gl_FragColor = vec4(c, 1.);\n#include <colorspace_fragment>\n}"
  });
  // floor → curve → wall as one strip (s runs from the front of the floor to the top of the wall)
  const Lf = 16, Rc = 4, La = Math.PI / 2 * Rc, Lw = 24, Ltot = Lf + La + Lw;
  const sweepGeo = new THREE.PlaneGeometry(80, Ltot, 1, 120);
  { const p = sweepGeo.attributes.position; for (let i = 0; i < p.count; i++) { const sv = p.getY(i) + Ltot / 2; let y, z;
      if (sv < Lf) { y = 0; z = 12 - sv; }
      else if (sv < Lf + La) { const a = (sv - Lf) / Rc; y = Rc - Math.cos(a) * Rc; z = (12 - Lf) - Math.sin(a) * Rc; }
      else { y = Rc + (sv - Lf - La); z = (12 - Lf) - Rc; }
      p.setXYZ(i, p.getX(i), y, z); } sweepGeo.computeVertexNormals(); }
  const sweep = new THREE.Mesh(sweepGeo, sweepMat); sweepMat.side = THREE.DoubleSide; scene.add(sweep);
  const key = new THREE.DirectionalLight(0xfff6ea, 1.2); key.position.set(-5, 9, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 2.2); rim.position.set(6, 3, -6); scene.add(rim);
  return { sweepMat, key, rim };
}
// soft contact shadow under each can (a blurred blob, cheaper and softer than shadow maps)
let _blobTex = null;
export function contactShadow(scale = 1) {
  if (!_blobTex) { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(40,30,20,.55)"); gr.addColorStop(.45, "rgba(40,30,20,.32)"); gr.addColorStop(.75, "rgba(40,30,20,.08)"); gr.addColorStop(1, "rgba(40,30,20,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); _blobTex = new THREE.CanvasTexture(c); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.3 * scale, 2.3 * scale), new THREE.MeshBasicMaterial({ map: _blobTex, transparent: true, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = .004; return m;
}
