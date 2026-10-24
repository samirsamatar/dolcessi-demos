/* Damso 담소 · real-time 3D bibimbap (three.js) · concept by Dolcessi */
import * as THREE from "three";

const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => 1 - Math.pow(1 - clamp(t), 3);
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

/* ---------- procedural textures ---------- */
// speckled stone: albedo variation + bump as normal map
function stoneMaps(size = 512) {
  const r = rng(11);
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d");
  g.fillStyle = "#808080"; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 26000; i++) {
    const v = 90 + r() * 80 | 0, a = .05 + r() * .25;
    g.fillStyle = `rgba(${v},${v},${v},${a})`;
    const s = .6 + r() * 2.4; g.fillRect(r() * size, r() * size, s, s);
  }
  for (let i = 0; i < 900; i++) { const v = r() < .5 ? 30 : 200; g.fillStyle = `rgba(${v},${v},${v},.35)`; g.beginPath(); g.arc(r() * size, r() * size, .5 + r() * 1.3, 0, TAU); g.fill(); }
  const src = g.getImageData(0, 0, size, size).data;
  const H = new Float32Array(size * size); for (let i = 0; i < H.length; i++) H[i] = src[i * 4] / 255;
  const n = g.createImageData(size, size), al = g.createImageData(size, size);
  const at = (x, y) => H[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * 2.2, dy = (at(x, y + 1) - at(x, y - 1)) * 2.2;
    const l = Math.hypot(dx, dy, 1), i = (y * size + x) * 4;
    n.data[i] = (-dx / l * .5 + .5) * 255; n.data[i + 1] = (dy / l * .5 + .5) * 255; n.data[i + 2] = (1 / l * .5 + .5) * 255; n.data[i + 3] = 255;
    const v = 40 + at(x, y) * 34; al.data[i] = v; al.data[i + 1] = v * .97; al.data[i + 2] = v * .93; al.data[i + 3] = 255;
  }
  const mk = (img, srgb) => { const cc = document.createElement("canvas"); cc.width = cc.height = size; cc.getContext("2d").putImageData(img, 0, 0); const t = new THREE.CanvasTexture(cc); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  return { normal: mk(n), map: mk(al, true) };
}
function softSprite(size = 256, seed = 1) {
  // an irregular wisp: many faint blobs inside a soft round mask
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"), r = rng(seed * 131 + 7);
  for (let i = 0; i < 70; i++) {
    const a = r() * TAU, d = Math.pow(r(), .7) * size * .3, x = size / 2 + Math.cos(a) * d, y = size / 2 + Math.sin(a) * d * 1.4, rad = size * (.05 + r() * .13);
    const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(255,255,255,${.12 + r() * .14})`); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  g.globalCompositeOperation = "destination-in";
  const m = g.createRadialGradient(size / 2, size / 2, size * .1, size / 2, size / 2, size / 2); m.addColorStop(0, "#fff"); m.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = m; g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

/* ---------- world ---------- */
export async function createWorld(canvas, opts = {}) {
  const lite = !!opts.lite;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, opts.maxDpr || 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0908);

  // studio: one big warm softbox overhead-left, a cool strip behind, a dim room → reflections on stone, glaze, spoon
  const pm = new THREE.PMREMGenerator(renderer);
  const studio = new THREE.Scene(); studio.background = new THREE.Color(0x040404);
  const panel = (w, h, x, y, z, c) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); p.position.set(x, y, z); p.lookAt(0, 0, 0); studio.add(p); };
  panel(7, 5, -4, 7, 3, new THREE.Color(3.2, 3.0, 2.7));
  panel(1.2, 8, 5.5, 2, -3.5, new THREE.Color(2.0, 2.1, 2.3));
  panel(1.0, 8, -5.5, 1.5, -2.5, new THREE.Color(1.2, 1.15, 1.1));
  panel(10, 1.2, 0, 1, 7, new THREE.Color(.9, .85, .8));
  studio.add(new THREE.Mesh(new THREE.BoxGeometry(30, 20, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(.05, .048, .045), side: THREE.BackSide })));
  scene.environment = pm.fromScene(studio, 0.02).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);

  const key = new THREE.DirectionalLight(0xfff1e0, 2.6); key.position.set(-3.5, 7, 3.5);
  key.castShadow = true; key.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 24 }); key.shadow.bias = -.0004; key.shadow.radius = 6;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe8ff, 1.6); rim.position.set(4, 3, -5); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x120d0a, .25));

  // floor: dark table, catches the bowl's soft shadow and a warm pool of light
  const floorMat = new THREE.ShaderMaterial({
    uniforms: { uBg: { value: new THREE.Color(0x0a0908) }, uGlow: { value: new THREE.Color(0x2b221b) } },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "uniform vec3 uBg; uniform vec3 uGlow; varying vec2 vUv; void main(){ float d=distance(vUv,vec2(.5)); gl_FragColor=vec4(uBg+uGlow*exp(-d*d*22.),1.);\n#include <colorspace_fragment>\n}", toneMapped: false
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.y = -.002; scene.add(floor);
  const shadowCatch = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: .55 }));
  shadowCatch.rotation.x = -Math.PI / 2; shadowCatch.receiveShadow = true; scene.add(shadowCatch);

  /* ---------- the stone bowl ---------- */
  const bowlG = new THREE.Group(); scene.add(bowlG);
  const RIN = 1.38, ROUT = 1.56, HB = 1.18;
  const outer = [], inner = [];
  // foot + rounded belly + straight-ish rim, then inside back down
  outer.push(new THREE.Vector2(0.001, 0), new THREE.Vector2(.82, 0), new THREE.Vector2(.9, .02));
  for (let i = 0; i <= 24; i++) { const t = i / 24; const a = t * Math.PI / 2; outer.push(new THREE.Vector2(.9 + (ROUT - .9) * Math.sin(a), .04 + (HB - .04) * (1 - Math.cos(a)) * .7 + t * .3 * HB)); }
  for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI; outer.push(new THREE.Vector2((ROUT + RIN) / 2 + Math.cos(a) * (ROUT - RIN) / 2, HB + .015 + Math.sin(a) * .05)); }
  for (let i = 24; i >= 0; i--) { const t = i / 24; const a = t * Math.PI / 2; inner.push(new THREE.Vector2(.001 + (RIN - .001) * Math.sin(a) * (t > 0 ? 1 : 0), .2 + (HB - .2) * (1 - Math.cos(a)))); }
  const prof = outer.concat(inner);
  const stone = stoneMaps(lite ? 384 : 512); stone.normal.repeat.set(4, 2); stone.map.repeat.set(4, 2);
  const bowlMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: stone.map, normalMap: stone.normal, normalScale: new THREE.Vector2(.55, .55), roughness: .72, metalness: 0, clearcoat: .25, clearcoatRoughness: .55, envMapIntensity: .9 });
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 128), bowlMat); bowl.castShadow = true; bowl.receiveShadow = true; bowlG.add(bowl);
  const innerY = r => .2 + (HB - .2) * (1 - Math.cos(Math.asin(clamp(r / RIN)))); // inner surface height at radius r

  /* ---------- rice ---------- */
  const RICE_TOP = .74, RICE_R = innerY(1.2) < RICE_TOP ? 1.24 : 1.2;
  const riceU = { uMix: { value: 0 }, uCrisp: { value: 0 }, uRed: { value: new THREE.Color("#A8340E") }, uGold: { value: new THREE.Color("#C2863A") } };
  const grainMat = new THREE.MeshPhysicalMaterial({ color: 0xf6f2e8, roughness: .42, sheen: .35, sheenRoughness: .5, sheenColor: new THREE.Color(0xffffff), clearcoat: .35, clearcoatRoughness: .3, envMapIntensity: .6 });
  grainMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, riceU);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float aR; varying float vR;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvR = aR;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uMix; uniform float uCrisp; uniform vec3 uRed; uniform vec3 uGold; varying float vR;")
      .replace("vec4 diffuseColor = vec4( diffuse, opacity );", "float k = smoothstep(vR - .25, vR + .05, uMix * 1.2); float cr = smoothstep(.78, .98, vR) * uCrisp; vec3 base = mix(diffuse, uGold * (.8 + .35 * fract(vR * 53.1)), cr); vec4 diffuseColor = vec4( mix(base, uRed * (.85 + .3 * fract(vR * 91.7)), k * .92), opacity );");
  };
  const NG = lite ? 2000 : 3400;
  const grainGeo = new THREE.SphereGeometry(.052, 10, 6); grainGeo.scale(1, .6, .6);
  const grains = new THREE.InstancedMesh(grainGeo, grainMat, NG); grains.castShadow = false; grains.receiveShadow = true;
  const aR = new Float32Array(NG);
  { const r = rng(3), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S = new THREE.Vector3();
    for (let i = 0; i < NG; i++) {
      const rr = Math.sqrt(r()) * RICE_R, a = r() * TAU;
      const dome = RICE_TOP + .12 * (1 - (rr / RICE_R) ** 2) + (r() - .5) * .05;
      P.set(Math.cos(a) * rr, Math.max(innerY(rr) + .03, dome), Math.sin(a) * rr);
      E.set(r() * TAU, r() * TAU, r() * TAU); Q.setFromEuler(E); const s = .85 + r() * .35; S.set(s, s, s);
      M.compose(P, Q, S); grains.setMatrixAt(i, M); aR[i] = rr / RICE_R;
      const w = .9 + r() * .1; grains.setColorAt(i, new THREE.Color(w, w * (.97 + r() * .03), w * (.9 + r() * .07)));
    } }
  grainGeo.setAttribute("aR", new THREE.InstancedBufferAttribute(aR, 1));
  bowlG.add(grains);
  // a solid rice bed under the grains so no stone shows through
  const bedMat = new THREE.MeshStandardMaterial({ color: 0xe9e3d4, roughness: .8 });
  bedMat.onBeforeCompile = sh => { Object.assign(sh.uniforms, riceU); sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uMix; uniform vec3 uRed;").replace("vec4 diffuseColor = vec4( diffuse, opacity );", "vec4 diffuseColor = vec4( mix(diffuse, uRed*.7, smoothstep(0.,1.,uMix)*.92), opacity );"); };
  const bedPts = []; for (let i = 0; i <= 20; i++) { const rr = RICE_R * 1.02 * i / 20; bedPts.push(new THREE.Vector2(rr, RICE_TOP - .02 + .1 * (1 - (rr / RICE_R) ** 2))); }
  const bed = new THREE.Mesh(new THREE.LatheGeometry(bedPts.reverse(), 64), bedMat); bed.material.side = THREE.DoubleSide; bowlG.add(bed);
  const surfY = rr => RICE_TOP + .11 * (1 - (clamp(rr / RICE_R)) ** 2);

  /* ---------- toppings: five colours in wedges ---------- */
  // each topping: instanced pieces that fall from above into their wedge, then (mix) spiral into the centre
  const toppings = [];
  const pieceCount = lite ? .65 : 1;
  function topping({ name, geo, mat, n, a0, a1, r0 = .42, r1 = 1.12, lift = .03, rot = "flat" }) {
    n = Math.round(n * pieceCount);
    const mesh = new THREE.InstancedMesh(geo, mat, n); mesh.castShadow = true; mesh.receiveShadow = true;
    const r = rng(name.length * 97 + n), data = [];
    for (let i = 0; i < n; i++) {
      const a = lerp(a0, a1, .08 + r() * .84), rr = lerp(r0, r1, Math.sqrt(r()));
      const stack = r();
      data.push({ ta: r() * TAU, tr: Math.sqrt(r()) * 1.1, a, rr, y: surfY(rr) + lift + stack * .07, rx: rot === "flat" ? (r() - .5) * .5 : r() * TAU, ry: r() * TAU, rz: rot === "flat" ? (r() - .5) * .5 : r() * TAU, s: .8 + r() * .45, d: r() * .35, sp: (r() - .5) });
    }
    const t = { name, mesh, data, drop: 0, mix: 0 }; toppings.push(t); bowlG.add(mesh); return t;
  }
  const W = TAU / 5, off = -Math.PI / 2 - W / 2 + .12;
  const glossy = (c, rgh = .5, cc = .4) => new THREE.MeshPhysicalMaterial({ color: c, roughness: rgh, clearcoat: cc, clearcoatRoughness: .35, envMapIntensity: .8 });
  // green: blanched greens (soft twisted strips)
  const greenGeo = new THREE.CapsuleGeometry(.035, .32, 4, 8); greenGeo.rotateZ(Math.PI / 2); greenGeo.scale(1, .45, 1.5);
  topping({ name: "green", geo: greenGeo, mat: glossy(0x2f5a1c, .45, .55), n: 120, a0: off, a1: off + W });
  // orange: carrot julienne
  const carrotGeo = new THREE.BoxGeometry(.36, .028, .028);
  topping({ name: "carrot", geo: carrotGeo, mat: glossy(0xe4661c, .38, .5), n: 150, a0: off + W, a1: off + 2 * W });
  // white: bean sprouts (stem + head)
  const spG = (() => {
    const a = new THREE.CapsuleGeometry(.017, .3, 3, 6).toNonIndexed(); a.rotateZ(Math.PI / 2 + .2);
    const b = new THREE.SphereGeometry(.034, 10, 8).toNonIndexed(); b.scale(1.3, 1, 1); b.translate(-.16, .035, 0);
    const pos = [], nor = [], col = [];
    [[a, [.96, .93, .85]], [b, [.93, .8, .38]]].forEach(([g, c]) => { pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); for (let i = 0; i < g.attributes.position.count; i++) col.push(...c); });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); return g;
  })();
  const spMat = glossy(0xffffff, .3, .7); spMat.vertexColors = true;
  topping({ name: "sprout", geo: spG, mat: spMat, n: 130, a0: off + 2 * W, a1: off + 3 * W });
  // brown: mushroom slices
  const mushGeo = new THREE.CylinderGeometry(.13, .12, .04, 18, 1, false, 0, Math.PI); mushGeo.scale(1, 1, .55);
  topping({ name: "mushroom", geo: mushGeo, mat: glossy(0x4a2c17, .4, .6), n: 46, a0: off + 3 * W, a1: off + 4 * W });
  // dark red-brown: marinated beef
  const beefGeo = new THREE.BoxGeometry(.3, .022, .13, 8, 1, 3); { const p = beefGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) + x * x * .45 + Math.sin(x * 22 + z * 9) * .008); } beefGeo.computeVertexNormals(); }
  topping({ name: "beef", geo: beefGeo, mat: glossy(0x3a170b, .34, .9), n: 70, a0: off + 4 * W, a1: off + 5 * W });

  // gochujang: a glossy red dollop at the centre
  const gochuGeo = new THREE.SphereGeometry(.3, 48, 24, 0, TAU, 0, Math.PI / 2);
  { const p = gochuGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const a = Math.atan2(z, x); const rr = Math.hypot(x, z) / .3; p.setY(i, y * .42 + Math.pow(Math.max(0, 1 - rr), 3) * .16 + Math.sin(a * 3 + y * 20) * .006); p.setX(i, x * (1 + Math.sin(a * 2) * .07)); p.setZ(i, z * (1 + Math.cos(a * 3) * .05)); } gochuGeo.computeVertexNormals(); }
  const gochuMat = new THREE.MeshPhysicalMaterial({ color: 0x8a1208, roughness: .3, clearcoat: .9, clearcoatRoughness: .12, sheen: .2, sheenColor: new THREE.Color(0xff5030), envMapIntensity: .9 });
  gochuGeo.scale(1.25, 1, 1.25); const gochu = new THREE.Mesh(gochuGeo, gochuMat); gochu.castShadow = true; bowlG.add(gochu);

  // the egg: an irregular white with a domed yolk
  const egg = new THREE.Group(); bowlG.add(egg);
  const whiteShape = new THREE.Shape(); { const r = rng(9); for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, rr = .62 + Math.sin(a * 3 + 1) * .05 + Math.sin(a * 7) * .025 + (r() - .5) * .02; const x = Math.cos(a) * rr, y = Math.sin(a) * rr * .9; i ? whiteShape.lineTo(x, y) : whiteShape.moveTo(x, y); } }
  const whiteGeo = new THREE.ExtrudeGeometry(whiteShape, { depth: .02, bevelEnabled: true, bevelThickness: .035, bevelSize: .05, bevelSegments: 6, curveSegments: 48 }); whiteGeo.rotateX(-Math.PI / 2);
  const eggWhite = new THREE.Mesh(whiteGeo, new THREE.MeshPhysicalMaterial({ color: 0xfbf8f1, roughness: .25, clearcoat: 1, clearcoatRoughness: .1, sheen: .5, sheenColor: new THREE.Color(0xffffff), transmission: lite ? 0 : .08, thickness: .1 }));
  eggWhite.castShadow = true; eggWhite.receiveShadow = true; egg.add(eggWhite);
  const yolkGeo = new THREE.SphereGeometry(.25, 64, 32, 0, TAU, 0, Math.PI / 2); yolkGeo.scale(1, .62, 1);
  const yolk = new THREE.Mesh(yolkGeo, new THREE.MeshPhysicalMaterial({ color: 0xf29a0e, roughness: .12, clearcoat: 1, clearcoatRoughness: .03, sheen: .6, sheenColor: new THREE.Color(0xffd27a), envMapIntensity: 1.3 }));
  yolk.position.set(.06, .04, -.04); yolk.castShadow = true; egg.add(yolk);

  // sesame seeds
  const NS = lite ? 90 : 160;
  const seedGeo = new THREE.SphereGeometry(.022, 8, 5); seedGeo.scale(1, .4, .65);
  const seeds = new THREE.InstancedMesh(seedGeo, new THREE.MeshStandardMaterial({ color: 0xeedcb0, roughness: .5 }), NS); bowlG.add(seeds);
  const seedData = []; { const r = rng(21); for (let i = 0; i < NS; i++) seedData.push({ a: r() * TAU, rr: Math.sqrt(r()) * 1.15, d: r(), ry: r() * TAU, rx: r() }); }

  // the long Korean spoon (sutgarak), polished steel
  const spoon = new THREE.Group(); scene.add(spoon);
  const steel = new THREE.MeshPhysicalMaterial({ color: 0xd9dade, metalness: 1, roughness: .16, clearcoat: .3, envMapIntensity: 1.4 });
  const bowlPart = new THREE.Mesh(new THREE.SphereGeometry(.26, 48, 24, 0, TAU, Math.PI * .62, Math.PI * .38), steel); bowlPart.scale.set(1, .35, 1.3); bowlPart.castShadow = true; spoon.add(bowlPart);
  const stemCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .02, -.3), new THREE.Vector3(0, .1, -.9), new THREE.Vector3(0, .32, -2.0), new THREE.Vector3(0, .5, -3.0)]);
  const stem = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 48, .035, 10, false), steel); stem.scale.set(1.6, .6, 1); stem.castShadow = true; spoon.add(stem);
  spoon.visible = false;

  // steam: soft sprites drifting up, additive
  const NST = lite ? 12 : 18;
  const steamTex = [softSprite(256, 1), softSprite(256, 2), softSprite(256, 3)];
  const steamMat = new THREE.SpriteMaterial({ map: steamTex[0], color: 0xffffff, transparent: true, opacity: .1, depthWrite: false, blending: THREE.AdditiveBlending });
  const steam = new THREE.Group(); scene.add(steam);
  const steamData = []; { const r = rng(33); for (let i = 0; i < NST; i++) { const mm = steamMat.clone(); mm.map = steamTex[i % 3]; const s = new THREE.Sprite(mm); steam.add(s); steamData.push({ s, a: r() * TAU, rr: r() * .9, ph: r(), sp: .12 + r() * .12, sz: 1 + r() * 1.4, sw: r() * TAU }); } }


  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S = new THREE.Vector3();
  /* ---------- banchan: the little dishes that fill the table ---------- */
  const banchan = new THREE.Group(); scene.add(banchan);
  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf1ede4, roughness: .18, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.1 });
  const celadon = new THREE.MeshPhysicalMaterial({ color: 0x9fb3a0, roughness: .2, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: 1.1 });
  const dishProfile = (R, H) => { const pts = [new THREE.Vector2(.001, 0), new THREE.Vector2(R * .62, 0), new THREE.Vector2(R * .66, .015)];
    for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI / 2; pts.push(new THREE.Vector2(R * .66 + (R - R * .66) * Math.sin(a), .015 + (H - .015) * (1 - Math.cos(a)))); }
    pts.push(new THREE.Vector2(R - .025, H + .008));
    for (let i = 10; i >= 0; i--) { const a = i / 10 * Math.PI / 2; pts.push(new THREE.Vector2(.001 + (R - .05) * Math.sin(a), .05 + (H - .06) * (1 - Math.cos(a)))); }
    return new THREE.LatheGeometry(pts, 64); };
  const pieceGeo = {
    leaf: (() => { const g = new THREE.BoxGeometry(.13, .02, .09, 4, 1, 3); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) + Math.sin(x * 30) * .01 + z * z * 1.2); } g.computeVertexNormals(); return g; })(),
    strand: (() => { const g = new THREE.CapsuleGeometry(.016, .2, 3, 6); g.rotateZ(Math.PI / 2); g.scale(1, .5, 1.6); return g; })(),
    cube: new THREE.BoxGeometry(.075, .075, .075),
    bean: (() => { const g = new THREE.SphereGeometry(.03, 10, 8); g.scale(1, .8, .75); return g; })(),
    stick: new THREE.BoxGeometry(.16, .022, .04)
  };
  const DISHES = [
    { R: .46, H: .13, mat: ceramic, bed: 0x8f1f0f, geo: "leaf", col: [0xc6421f, 0xd96a3a, 0xe8b08a], n: 46, ang: -.35, rad: 2.85 },   // kimchi
    { R: .38, H: .11, mat: celadon, bed: 0x22401a, geo: "strand", col: [0x2c5a1c, 0x3d7226, 0x234a15], n: 60, ang: .55, rad: 2.7 },    // spinach namul
    { R: .4,  H: .12, mat: ceramic, bed: 0xd9cfae, geo: "strand", col: [0xf1ead2, 0xe8dcb0, 0xe0c060], n: 60, ang: 1.45, rad: 2.8 },   // bean sprouts
    { R: .42, H: .12, mat: ceramic, bed: 0x9a2a12, geo: "cube", col: [0xd2512a, 0xe06a3c, 0xc8461f], n: 26, ang: 2.4, rad: 2.75 },     // kkakdugi
    { R: .36, H: .1,  mat: celadon, bed: 0x2a1a12, geo: "bean", col: [0x1a120e, 0x2a1d16, 0x120c09], n: 70, ang: 3.25, rad: 2.65 },   // black beans
    { R: .4,  H: .12, mat: ceramic, bed: 0x8a5a2a, geo: "stick", col: [0xc0915a, 0xb07c45, 0xd1a46a], n: 34, ang: 4.1, rad: 2.85 },     // fish cake
    { R: .38, H: .11, mat: ceramic, bed: 0x9a6a22, geo: "cube", col: [0xcf9f4e, 0xd8ad5e, 0xbf8c3c], n: 24, ang: 4.95, rad: 2.7 },      // potato jorim
  ];
  const dishObjs = DISHES.map((D, k) => {
    const g = new THREE.Group(); banchan.add(g);
    const shell = new THREE.Mesh(dishProfile(D.R, D.H), D.mat); shell.castShadow = true; shell.receiveShadow = true; g.add(shell);
    const bedM = new THREE.Mesh(new THREE.CylinderGeometry(D.R * .78, D.R * .7, .05, 32), new THREE.MeshPhysicalMaterial({ color: D.bed, roughness: .45, clearcoat: .6, clearcoatRoughness: .3 }));
    bedM.position.y = D.H * .62; bedM.scale.y = 1; g.add(bedM);
    const im = new THREE.InstancedMesh(pieceGeo[D.geo], new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .38, clearcoat: .8, clearcoatRoughness: .2 }), D.n);
    im.castShadow = true; const r = rng(77 + k * 13), c = new THREE.Color();
    for (let i = 0; i < D.n; i++) {
      const a = r() * TAU, rr = Math.sqrt(r()) * D.R * .66; P.set(Math.cos(a) * rr, D.H * .66 + .02 + r() * .05 * (1 - rr / D.R), Math.sin(a) * rr);
      E.set((r() - .5) * .9, r() * TAU, (r() - .5) * .9); Q.setFromEuler(E); const sc = .8 + r() * .45; S.set(sc, sc, sc); M.compose(P, Q, S); im.setMatrixAt(i, M);
      im.setColorAt(i, c.set(D.col[i % 3]));
    }
    g.add(im);
    g.userData = { D, d: k / DISHES.length, sp: (r() - .5) * 2 };
    g.visible = false; return g;
  });

  /* ---------- state ---------- */
  const st = {
    drop: [0, 0, 0, 0, 0], table: 0, gochu: 0, egg: 0, seeds: 0, mix: 0, spoon: 0, steam: 1, sizzle: 0,
    rotY: 0, bowlX: 0, bowlY: 0, bowlS: 1, camR: 9, camH: 5.2, camLook: .5, exposure: 1, camZ: 0, bg: "#0a0908", glow: "#2b221b", ...(opts.state || {})
  };

  function apply(t) {
    bowlG.position.set(st.bowlX, st.bowlY, 0); bowlG.rotation.y = st.rotY; bowlG.scale.setScalar(st.bowlS);
    shadowCatch.position.set(st.bowlX, 0, 0);
    const mx = st.mix;
    toppings.forEach((tp, k) => {
      const dr = st.drop[k];
      tp.mesh.visible = dr > .001;
      if (!tp.mesh.visible) return;
      tp.data.forEach((d, i) => {
        const local = ease((dr - d.d * .55) / .45);              // staggered fall
        const fall = (1 - local);
        const m = ease((mx - d.d * .3) / .7);                     // staggered mix
        const a = lerp(d.a, d.ta + TAU * (1 + d.sp), m) + fall * d.sp * 2;
        const rr = lerp(d.rr, d.tr, m) * (1 - Math.sin(m * Math.PI) * .35);
        const y = lerp(d.y, surfY(rr) + .012 + d.d * .035, m) + fall * fall * 3.2;
        P.set(Math.cos(a) * rr, y, Math.sin(a) * rr);
        E.set(lerp(d.rx + fall * 2, d.rx * .25, m), d.ry - a + m * d.sp * 3, lerp(d.rz + fall * 1.3, d.rz * .25, m)); Q.setFromEuler(E);
        const s = d.s * (local > 0 ? 1 : 0) * (1 - m * .12); S.set(s, s, s);
        M.compose(P, Q, S); tp.mesh.setMatrixAt(i, M);
      });
      tp.mesh.instanceMatrix.needsUpdate = true;
    });
    // gochujang lands with a soft squash; melts into the rice while mixing
    const g = ease(st.gochu);
    gochu.visible = st.gochu > .001;
    gochu.position.set(-.18, surfY(.1) - .02 + (1 - g) * (1 - g) * 3, .22);
    const sq = 1 + Math.max(0, Math.sin(clamp(st.gochu * 1.25) * Math.PI)) * .18 * (st.gochu < .8 ? 1 : 0);
    gochu.scale.set(sq * (1 - mx * .9) + .001, (1 / sq) * (1 - mx * .95) + .001, sq * (1 - mx * .9) + .001);
    // egg drops last, sits a bit off-centre, the yolk catches the light
    const e = ease(st.egg);
    egg.visible = st.egg > .001;
    egg.position.set(.28, surfY(.3) + .06 + (1 - e) * (1 - e) * 4, -.12);
    egg.rotation.set((1 - e) * .5, .6, (1 - e) * -.3);
    egg.scale.setScalar(1 - ease(mx * 1.4) * .999);
    yolk.scale.set(1, 1 + Math.sin(t * 2.1) * .01, 1);
    // seeds sprinkle
    seeds.visible = st.seeds > .001;
    if (seeds.visible) {
      seedData.forEach((d, i) => {
        const l = ease((st.seeds - d.d * .6) / .4), a = d.a + mx * 3;
        const rr = d.rr * (1 - mx * .4);
        P.set(Math.cos(a) * rr, surfY(rr) + .16 + (1 - l) * 2.5, Math.sin(a) * rr);
        E.set(d.rx, d.ry + l * 4, 0); Q.setFromEuler(E); const s = l > 0 ? 1 : 0; S.set(s, s, s); M.compose(P, Q, S); seeds.setMatrixAt(i, M);
      }); seeds.instanceMatrix.needsUpdate = true;
    }
    riceU.uMix.value = mx; riceU.uCrisp.value = st.sizzle;
    grainMat.sheenColor.setScalar(1 - mx * .9); grainMat.clearcoat = .35 - mx * .2;
    // spoon: dips in from the right, then circles through the bowl
    spoon.visible = st.spoon > .001;
    if (spoon.visible) {
      const sIn = ease(st.spoon), circ = mx * TAU * 2.2 + t * .25 * (mx > 0 && mx < 1 ? 1 : 0);
      const cx = Math.cos(circ) * .5 * sIn, cz = Math.sin(circ) * .45 * sIn;
      spoon.position.set(st.bowlX + cx + (1 - sIn) * 3.5, (surfY(.3) + .08) * st.bowlS + (1 - sIn) * 2.2, cz);
      spoon.rotation.set(-.12 - (1 - sIn) * .4, -Math.PI * .75 + Math.sin(circ) * .3 + (1 - sIn) * .5, -.1);
    }
    // banchan slide in across the table, one after another, and settle around the bowl
    dishObjs.forEach(g => {
      const { D, d, sp } = g.userData, l = ease((st.table - d * .6) / .4);
      g.visible = st.table > .001 && l > 0;
      if (!g.visible) return;
      const a = D.ang + (1 - l) * sp * .6, rr = D.rad - .3 + (1 - l) * 6;
      g.position.set(st.bowlX + Math.cos(a) * rr * st.bowlS, 0, Math.sin(a) * rr * st.bowlS);
      g.rotation.y = D.ang * 2 + (1 - l) * sp * 2; g.scale.setScalar(st.bowlS * 1.38);
    });
    // steam
    steam.position.set(st.bowlX, 0, 0);
    steamData.forEach(d => {
      const life = (t * d.sp + d.ph) % 1;
      const x = Math.cos(d.a) * d.rr + Math.sin(t * .6 + d.sw) * .25 * life, z = Math.sin(d.a) * d.rr;
      d.s.position.set(x * (1 + life), 1.0 + life * 2.6, z * (1 + life));
      const sz = d.sz * (.7 + life * 1.6) * st.bowlS; d.s.scale.set(sz, sz * 1.3, 1);
      d.s.material.opacity = Math.pow(Math.sin(life * Math.PI), 1.5) * .16 * st.steam * (.55 + st.sizzle * .6);
      d.s.material.rotation = d.sw + life;
    });
    // camera orbits on a fixed radius; everything keeps looking at the bowl
    renderer.toneMappingExposure = st.exposure;
    camera.position.set(st.bowlX * .25, st.camH, st.camR + st.camZ);
    camera.lookAt(st.bowlX * .25, st.camLook, st.camZ);
    scene.background.set(st.bg); floorMat.uniforms.uBg.value.set(st.bg); floorMat.uniforms.uGlow.value.set(st.glow);
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w / h < .8 ? 44 : 30; camera.updateProjectionMatrix();
  }
  resize();
  const clock = new THREE.Clock();
  let running = true;
  function frame() { if (!running) return; apply(clock.getElapsedTime()); renderer.render(scene, camera); }
  return { st, renderer, scene, camera, resize, frame, setRunning(v) { running = v; } };
}
