/* Taigu · real-time 3D drink world (three.js) */
import * as THREE from "three";
import { RoundedBoxGeometry } from "./vendor/RoundedBoxGeometry.js";

const TAU = Math.PI * 2;

/* ---------- procedural textures ---------- */
function condensationMaps(size = 1024) {
  // height field of droplets → normal map + roughness map
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d");
  g.fillStyle = "#000"; g.fillRect(0, 0, size, size);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const drop = (x, y, r, h) => {
    const gr = g.createRadialGradient(x, y - r * .15, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,255,255,${h})`); gr.addColorStop(.6, `rgba(255,255,255,${h * .55})`); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r * .9, r, 0, 0, TAU); g.fill();
  };
  for (let i = 0; i < 5200; i++) drop(rnd() * size, rnd() * size, 1 + rnd() * 2.6, .55);      // mist
  for (let i = 0; i < 520; i++) drop(rnd() * size, rnd() * size, 3 + rnd() * 6, .9);           // droplets
  for (let i = 0; i < 55; i++) {                                                                 // a few runs
    const x = rnd() * size, y0 = rnd() * size * .7, L = 30 + rnd() * 140, r = 3 + rnd() * 3.5;
    for (let k = 0; k < L; k += 2) drop(x + Math.sin(k * .05) * 1.5, y0 + k, r * (0.65 + 0.35 * (k / L)), .55);
    drop(x, y0 + L, r * 1.6, 1);
  }
  const src = g.getImageData(0, 0, size, size).data;
  const H = new Float32Array(size * size); for (let i = 0; i < H.length; i++) H[i] = src[i * 4] / 255;
  const n = g.createImageData(size, size), rgh = g.createImageData(size, size);
  const at = (x, y) => H[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * 3.2, dy = (at(x, y + 1) - at(x, y - 1)) * 3.2;
    const l = Math.hypot(dx, dy, 1), i = (y * size + x) * 4;
    n.data[i] = (-dx / l * .5 + .5) * 255; n.data[i + 1] = (dy / l * .5 + .5) * 255; n.data[i + 2] = (1 / l * .5 + .5) * 255; n.data[i + 3] = 255;
    const h = at(x, y), v = 255 * (0.1 + 0.25 * Math.min(1, h * 2.2)); rgh.data[i] = rgh.data[i + 1] = rgh.data[i + 2] = v; rgh.data[i + 3] = 255;
  }
  const mk = img => { const cc = document.createElement("canvas"); cc.width = cc.height = size; cc.getContext("2d").putImageData(img, 0, 0); const t = new THREE.CanvasTexture(cc); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
  return { normal: mk(n), rough: mk(rgh) };
}
async function svgTexture(url, h, color = "#111") {
  const txt = await fetch(url).then(r => r.text());
  const svg = txt.replace(/currentColor/g, color);
  const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  await img.decode();
  const ratio = img.naturalWidth / img.naturalHeight || .46;
  const c = document.createElement("canvas"); c.height = h; c.width = Math.round(h * ratio);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { tex: t, ratio };
}

/* ---------- shared noise for liquids ---------- */
const NOISE = /* glsl */`
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
float fbm(vec3 p){float f=0.,a=.5;for(int i=0;i<3;i++){f+=a*snoise(p);p*=2.03;a*=.5;}return f;}
`;

/* liquid material: physically lit, colour comes from layered volume function */
function liquidMaterial(U) {
  const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .38, metalness: 0, clearcoat: .2, clearcoatRoughness: .4, sheen: .25, sheenRoughness: .7, sheenColor: new THREE.Color(0xffffff), envMapIntensity: .7 });
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vLocal;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocal = position;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vLocal;
uniform vec3 cMilk; uniform vec3 cTea; uniform vec3 cBase; uniform float uFill; uniform float uMix; uniform float uBase; uniform float uTime; uniform float uTop;
${NOISE}
vec3 drinkColor(vec3 p0){
  vec3 p = uTop > .5 ? vec3(p0.x, uFill - .002, p0.y) : p0;   // the surface disk is flat: treat it as the very top
  float y = p.y / max(uFill, .001);                 // 0 bottom .. 1 surface
  float ang = atan(p.z, p.x);
  float n = fbm(vec3(p.x*1.6, p.y*2.2 - uTime*.08, p.z*1.6) + uTime*.03);
  float n2 = fbm(vec3(cos(ang)*2.0, p.y*3.5, sin(ang)*2.0) + 4.0);
  // tea descends from the top as uMix grows, in billowing clouds; ends layered (milk at the bottom)
  float m = clamp(uMix, 0., 1.);
  float front = 1.06 - m * .74 + (n * .34 + n2 * .16) * (.35 + .65 * m);
  float tea = smoothstep(front - .14, front + .2, y) * smoothstep(0., .06, m);
  tea *= mix(1., smoothstep(uBase + .06, uBase + .2, y), step(.001, uBase));
  // wisps of tea sinking into the milk while pouring
  float wisp = (m <= 0. || m >= 1.) ? 0. : smoothstep(.35, .8, fbm(vec3(p.x*2.4, p.y*1.4 + uTime*.25, p.z*2.4))) * smoothstep(.0, .3, m) * (1. - smoothstep(.85, 1., m));
  tea = max(tea, wisp * .55 * smoothstep(front - .6, front, y));
  vec3 col = mix(cMilk, cTea, clamp(tea, 0., 1.));
  // cloudy marbling inside
  col *= .88 + .2 * n;
  // denser colour toward the core, lighter at the walls (light scatters in milk)
  float rr = length(p.xz) / 1.0;
  col *= mix(.82, 1.08, smoothstep(.3, .95, rr));
  // base layer (strawberry / red bean) at the bottom
  float b = uBase - .012 * n2 - .008 * sin(ang * 3.0);
  float baseMask = 1.0 - smoothstep(b - .012, b + .018, y);
  // a thin blush where the purée meets the milk
  col = mix(col, mix(cMilk, cBase, .35), (1.0 - smoothstep(b, b + .07, y)) * step(.001, uBase) * .6);
  col = mix(col, cBase * (.85 + .25 * n), baseMask * step(.001, uBase));
  return col;
}`).replace("vec4 diffuseColor = vec4( diffuse, opacity );", "vec4 diffuseColor = vec4( drinkColor(vLocal), opacity );");
  };
  return m;
}

/* ---------- world ---------- */
export async function createWorld(canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, opts.maxDpr || 2));
  if ('transmissionResolutionScale' in renderer) renderer.transmissionResolutionScale = .6;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070707);
  const pm = new THREE.PMREMGenerator(renderer);
  // a virtual photo studio: two tall strip boxes, a top softbox, a dim room
  const studio = new THREE.Scene(); studio.background = new THREE.Color(0x050505);
  const glow = (w, h, x, y, z, ry, k) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k * .97), side: THREE.DoubleSide }); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; p.lookAt(0, y * .3, 0); studio.add(p); };
  glow(1.3, 9, -4.6, 1.5, 3.2, 0, 7);     // left strip (front-left)
  glow(1.0, 9, 4.8, 1.5, 2.2, 0, 5);      // right strip
  glow(1.6, 9, 3.6, 1.5, -4.5, 0, 6);     // back-right rim strip
  glow(1.4, 9, -3.8, 1.5, -4.2, 0, 4);    // back-left rim strip
  const top = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.1), side: THREE.DoubleSide })); top.position.set(0, 7, 0); top.rotation.x = Math.PI / 2; studio.add(top);
  const room = new THREE.Mesh(new THREE.BoxGeometry(30, 20, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(.07, .07, .068), side: THREE.BackSide })); studio.add(room);
  scene.environment = pm.fromScene(studio, 0).texture;
  scene.environmentIntensity = 1;

  const camera = new THREE.PerspectiveCamera(26, 1, .1, 100);
  camera.position.set(0, 1.55, 12.5);

  // key + rim lights for sparkle on the plastic
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-4, 6, 6); scene.add(key);
  const rimL = new THREE.DirectionalLight(0xffffff, 3.0); rimL.position.set(6, 2, -5); scene.add(rimL);
  const rimR = new THREE.DirectionalLight(0xfff4e0, 2.0); rimR.position.set(-6, 1, -4); scene.add(rimR);

  /* backdrop: a soft lit card behind the cup, so the plastic has something to refract */
  const bdC = document.createElement("canvas"); bdC.width = bdC.height = 512;
  const bg = bdC.getContext("2d"); const grd = bg.createRadialGradient(256, 230, 10, 256, 256, 256);
  grd.addColorStop(0, "#ffffff"); grd.addColorStop(.45, "rgba(255,255,255,.35)"); grd.addColorStop(1, "rgba(255,255,255,0)");
  bg.fillStyle = grd; bg.fillRect(0, 0, 512, 512);
  const backdropTex = new THREE.CanvasTexture(bdC); backdropTex.colorSpace = THREE.SRGBColorSpace;
  // opaque (so the cup refracts it): page colour with a soft glow in the middle
  const backdropMat = new THREE.ShaderMaterial({ toneMapped: false, uniforms: { uBg: { value: new THREE.Color(0x070707) }, uGlow: { value: new THREE.Color(0x2a2927) } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: "uniform vec3 uBg; uniform vec3 uGlow; varying vec2 vUv; void main(){ float d = distance(vUv, vec2(.5,.53)); float g = exp(-d*d*14.); gl_FragColor = vec4(uBg + uGlow * g, 1.); \n#include <colorspace_fragment>\n }" });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), backdropMat);
  backdrop.position.set(0, 1.5, -6); scene.add(backdrop);

  // the wordmark lives in the scene, so the cup refracts it
  const word = await svgTexture(opts.wordUrl || "img/word.svg", 512, "#F2EFE8");
  const wordMat = new THREE.MeshBasicMaterial({ map: word.tex, alphaTest: .5, toneMapped: false });
  const wordPlane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10 / word.ratio), wordMat);
  wordPlane.position.set(0, 1.35, -2.4); scene.add(wordPlane);

  /* ---------- the cup ---------- */
  const cup = new THREE.Group(); scene.add(cup);
  const H = 3.0, R0 = .74, R1 = 1.02, WALL = .022;
  const rAt = y => R0 + (R1 - R0) * (y / H);
  const prof = [];
  prof.push(new THREE.Vector2(0.001, 0));
  prof.push(new THREE.Vector2(R0 - .04, 0)); prof.push(new THREE.Vector2(R0, .03));
  for (let i = 1; i <= 40; i++) { const y = H * i / 40; prof.push(new THREE.Vector2(rAt(y), y)); }
  // rolled rim
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + Math.PI * i / 12; prof.push(new THREE.Vector2(R1 + .03 + Math.cos(a) * .035, H + .035 + Math.sin(a) * .035)); }
  for (let i = 40; i >= 1; i--) { const y = H * i / 40; prof.push(new THREE.Vector2(rAt(y) - WALL, y)); }
  prof.push(new THREE.Vector2(R0 - WALL - .03, WALL + .02)); prof.push(new THREE.Vector2(0.001, WALL + .02));
  const cupGeo = new THREE.LatheGeometry(prof, 112);
  const cond = condensationMaps(1024);
  cond.normal.repeat.set(3, 6.4); cond.rough.repeat.set(3, 6.4);
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: .05, transmission: 1, thickness: .35, ior: 1.57, dispersion: .3,
    clearcoat: 1, clearcoatRoughness: .04, specularIntensity: 1, envMapIntensity: 1.25,
    normalMap: cond.normal, normalScale: new THREE.Vector2(.7, .7), roughnessMap: cond.rough,
    attenuationColor: new THREE.Color(0xf4fbff), attenuationDistance: 3, side: THREE.DoubleSide
  });
  const cupMesh = new THREE.Mesh(cupGeo, glass); cup.add(cupMesh);

  // printed logo: a curved band just outside the wall, at the front
  const logo = await svgTexture(opts.logoUrl || "img/logo.svg", 1024, "#141414");
  const lgH = 1.62, lgY0 = .58, lgW = lgH * logo.ratio, phiLen = lgW / rAt(lgY0 + lgH / 2);
  const band = new THREE.LatheGeometry([new THREE.Vector2(rAt(lgY0) + .004, lgY0), new THREE.Vector2(rAt(lgY0 + lgH) + .004, lgY0 + lgH)], 64, -phiLen / 2, phiLen);
  // flip u so the print reads correctly from the front
  const logoMat = new THREE.MeshStandardMaterial({ map: logo.tex, transparent: true, alphaTest: .02, roughness: .55, metalness: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const logoMesh = new THREE.Mesh(band, logoMat); cup.add(logoMesh);

  /* ---------- the drink ---------- */
  const U = {
    cMilk: { value: new THREE.Color("#F1EEE6") }, cTea: { value: new THREE.Color("#3F6A16") }, cBase: { value: new THREE.Color("#B3122C") },
    uFill: { value: 2.55 }, uMix: { value: 1 }, uBase: { value: 0 }, uTime: { value: 0 }, uTop: { value: 0 }
  };
  const liqMat = liquidMaterial(U);
  const liqProf = [new THREE.Vector2(0.001, WALL + .03), new THREE.Vector2(R0 - WALL - .02, WALL + .03)];
  for (let i = 1; i <= 30; i++) { const y = WALL + .03 + (H - .1) * i / 30; liqProf.push(new THREE.Vector2(rAt(y) - WALL - .012, y)); }
  const liqGeo = new THREE.LatheGeometry(liqProf, 72);
  const liquid = new THREE.Mesh(liqGeo, liqMat); cup.add(liquid);
  // clip the liquid at the fill height with a local clipping plane
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 2.55);
  liqMat.clippingPlanes = [clip]; renderer.localClippingEnabled = true;
  // surface disk
  const surfMat = liquidMaterial({ ...U, uTop: { value: 1 } });
  const surface = new THREE.Mesh(new THREE.CircleGeometry(1, 120), surfMat); surface.rotation.x = -Math.PI / 2; cup.add(surface);

  // ice: frosted cubes, some breaking the surface
  const iceMat = new THREE.MeshPhysicalMaterial({ color: 0xbcd0c6, roughness: .06, metalness: 0, clearcoat: 1, clearcoatRoughness: .02, transmission: 0, envMapIntensity: 2.2, specularIntensity: 1 });
  const ice = new THREE.Group(); cup.add(ice);
  const icePos = [[-.38, .02, .18, .4], [.32, .06, -.22, 1.1], [.05, .1, .42, 2.2], [-.12, -.02, -.4, .8], [.45, -.04, .25, 2.9], [-.5, .04, -.12, 1.7]];
  icePos.forEach(([x, dy, z, r]) => { const c = new THREE.Mesh(new RoundedBoxGeometry(.5, .46, .5, 3, .08), iceMat); c.position.set(x, dy, z); c.rotation.set(r, r * 1.7, r * .6); c.userData.dy = dy; ice.add(c); });

  // mochi (shiratama) — soft white spheres, used for one flavour
  const mochiMat = new THREE.MeshPhysicalMaterial({ color: 0xfbfaf6, roughness: .55, sheen: 1, sheenRoughness: .4, sheenColor: new THREE.Color(0xffffff), clearcoat: .3 });
  const mochi = new THREE.Group(); cup.add(mochi);
  [[-.28, .1], [.22, -.18], [.08, .3]].forEach(([x, z]) => { const s = new THREE.Mesh(new THREE.SphereGeometry(.25, 48, 32), mochiMat); s.scale.set(1, .82, 1); s.position.set(x, 0, z); mochi.add(s); });
  mochi.visible = false;

  /* ---------- pour stream ---------- */
  const streamU = { uTime: { value: 0 }, cTea: U.cTea };
  const streamMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .22, clearcoat: .8, clearcoatRoughness: .15 });
  streamMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, streamU);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vUv2;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvUv2 = uv;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>\nvarying vec2 vUv2; uniform float uTime; uniform vec3 cTea;\n${NOISE}`)
      .replace("vec4 diffuseColor = vec4( diffuse, opacity );", "float nn = snoise(vec3(vUv2.x*18. - uTime*3.2, vUv2.y*6., 0.)); vec4 diffuseColor = vec4( cTea * (.9 + .18*nn), opacity );");
  };
  let streamMesh = null;
  const stream = new THREE.Group(); scene.add(stream);
  function buildStream(topY, botY, x) {
    if (streamMesh) { stream.remove(streamMesh); streamMesh.geometry.dispose(); }
    const pts = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(new THREE.Vector3(x - t * t * .06, lerp(topY, botY, t), 0)); }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 96, 1, 20, false);
    // taper: thicker at the top, thin and wobbly near the bottom
    const p = geo.attributes.position, center = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      const seg = Math.floor(i / 21) / 96; curve.getPoint(Math.min(1, seg), center);
      const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)).sub(center);
      const r = lerp(.1, .066, Math.pow(seg, .7)) * (1 + .05 * Math.sin(seg * 23.0));
      v.setLength(r).add(center); p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    streamMesh = new THREE.Mesh(geo, streamMat); stream.add(streamMesh);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- whisk scene: bowl + chasen ---------- */
  const whiskWorld = new THREE.Group(); whiskWorld.visible = false; scene.add(whiskWorld);
  const bowlProf = [];
  for (let i = 0; i <= 30; i++) { const t = i / 30; bowlProf.push(new THREE.Vector2(.55 + Math.sin(t * Math.PI * .5) * 1.25, t * 1.25)); }
  for (let i = 30; i >= 0; i--) { const t = i / 30; bowlProf.push(new THREE.Vector2(.5 + Math.sin(t * Math.PI * .5) * 1.17, .08 + t * 1.17)); }
  const bowlMat = new THREE.MeshPhysicalMaterial({ color: 0x1d1c1a, roughness: .62, metalness: 0, clearcoat: .35, clearcoatRoughness: .5 });
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(bowlProf, 140), bowlMat); whiskWorld.add(bowl);
  const foamU = { uTime: { value: 0 }, uFoam: { value: 0 }, cTea: { value: new THREE.Color("#3C6414") } };
  const foamMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .42, clearcoat: .5, clearcoatRoughness: .3, sheen: .35, sheenColor: new THREE.Color(0xcfe39a), envMapIntensity: .8 });
  foamMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, foamU);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vP; uniform float uTime; uniform float uFoam;\n" + NOISE)
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvP = position; transformed.z += (snoise(vec3(position.xy*6., uTime*.6))*.012 + snoise(vec3(position.xy*22., uTime))*.004) * uFoam;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vP; uniform float uTime; uniform float uFoam; uniform vec3 cTea;\n" + NOISE)
      .replace("vec4 diffuseColor = vec4( diffuse, opacity );", `
        float r = length(vP.xy);
        float swirl = snoise(vec3(vP.xy*3.0 + vec2(sin(uTime*.7), cos(uTime*.5))*.4, uTime*.25));
        vec3 dark = cTea * .5; vec3 foam = mix(cTea, vec3(.5,.7,.18), .38);
        float bub = smoothstep(.55,.95, snoise(vec3(vP.xy*55., uTime*.2))) * uFoam;
        vec3 col = mix(dark * (1. + .25*swirl), foam * (.95 + .1*swirl), smoothstep(0., 1., uFoam*1.1 - r*.25));
        col *= 1. - bub * .18; col += smoothstep(.7,1.,snoise(vec3(vP.xy*120., 1.))) * uFoam * .05;
        vec4 diffuseColor = vec4(col, opacity);`);
  };
  const tea = new THREE.Mesh(new THREE.CircleGeometry(1.5, 128, 0, TAU), foamMat); tea.rotation.x = -Math.PI / 2; tea.position.y = .82; whiskWorld.add(tea);
  // chasen: handle + ~70 bamboo tines in two rings
  const chasen = new THREE.Group(); whiskWorld.add(chasen);
  const bamboo = new THREE.MeshPhysicalMaterial({ color: 0xd8b98a, roughness: .55, clearcoat: .2 });
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(.17, .19, 1.4, 48), bamboo); handle.position.y = 2.15; chasen.add(handle);
  const thread = new THREE.Mesh(new THREE.TorusGeometry(.21, .025, 12, 60), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .7 })); thread.rotation.x = Math.PI / 2; thread.position.y = 1.42; chasen.add(thread);
  const tineGeo = new THREE.CylinderGeometry(.008, .012, 1.0, 5);
  const tines = new THREE.InstancedMesh(tineGeo, bamboo, 96); const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < 96; i++) {
    const outer = i < 64, a = (outer ? i / 64 : (i - 64) / 32) * TAU, r0 = outer ? .2 : .1, spread = outer ? .5 : .12;
    const top = new THREE.Vector3(Math.cos(a) * r0, 1.45, Math.sin(a) * r0), bot = new THREE.Vector3(Math.cos(a) * (r0 + spread), outer ? .62 : .8, Math.sin(a) * (r0 + spread));
    const mid = top.clone().add(bot).multiplyScalar(.5), dir = bot.clone().sub(top), len = dir.length();
    Q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()); S.set(1, len, 1);
    M.compose(mid, Q, S); tines.setMatrixAt(i, M);
  }
  chasen.add(tines);

  /* ---------- state ---------- */
  const S0 = {
    cupX: 0, cupY: 0, cupZ: 0, tilt: -.12, tiltX: 0, rotY: 0, scale: 1, cupVis: 1,
    fill: 2.55, mix: 1, base: 0, milk: "#F1EEE6", tea: "#3F6A16", baseCol: "#B3122C", mochi: 0, ice: 1,
    pour: 0, word: 1, wordS: 1, bg: "#070707", glow: "#2a2927",
    whisk: 0, foam: 0, whiskSpeed: 0, whiskX: 0, whiskS: 1, camY: 2.1, camZ: 12.5
  };
  const st = { ...S0, ...(opts.state || {}) };
  const cBg = new THREE.Color(), cA = new THREE.Color(), cB = new THREE.Color();

  function apply(t) {
    cup.visible = st.cupVis > .01;
    cup.position.set(st.cupX, st.cupY - 1.5 * st.scale + 1.5, st.cupZ); cup.scale.setScalar(st.scale);
    cup.rotation.set(st.tiltX, st.rotY, st.tilt, "ZXY");
    U.uFill.value = st.fill; clip.constant = st.fill; U.uMix.value = st.mix; U.uBase.value = st.base; U.uTime.value = t;
    U.cMilk.value.set(st.milk); U.cTea.value.set(st.tea); U.cBase.value.set(st.baseCol);
    surface.position.y = st.fill; const sr = rAt(st.fill) - WALL - .014; surface.scale.set(sr, sr, 1);
    liquid.visible = surface.visible = st.fill > .06;
    ice.visible = st.ice > .01; ice.scale.setScalar(1 - st.mochi * .35);
    ice.children.forEach((c, i) => { c.position.y = Math.max(.25, st.fill - .1 + c.userData.dy + Math.sin(t * .8 + i) * .015); });
    mochi.visible = st.mochi > .01; mochi.children.forEach((m, i) => { m.position.y = st.fill + .12 + Math.sin(t * 1.3 + i * 2) * .012; m.scale.setScalar(st.mochi); m.scale.y *= .82; });
    // the stream comes from above, follows the cup tilt
    stream.visible = st.pour > .01;
    if (stream.visible) {
      const surfW = cup.localToWorld(new THREE.Vector3(.15, st.fill, 0));
      if (!stream.userData.k || Math.abs(stream.userData.k - surfW.y) > .03 || Math.abs(stream.userData.x - surfW.x) > .03) { buildStream(9, surfW.y, surfW.x); stream.userData.k = surfW.y; stream.userData.x = surfW.x; }
      stream.scale.set(st.pour, 1, st.pour);
      stream.position.set(surfW.x * (1 - st.pour), 0, 0);
    }
    streamU.uTime.value = t;
    wordPlane.visible = st.word > .01; wordPlane.scale.setScalar(st.wordS); wordPlane.position.y = 1.35 - (1 - st.word) * 7;
    cBg.set(st.bg); scene.background.copy(cBg);
    backdropMat.uniforms.uBg.value.set(st.bg); backdropMat.uniforms.uGlow.value.set(st.glow);
    // whisk
    whiskWorld.visible = st.whisk > .01;
    if (whiskWorld.visible) {
      whiskWorld.position.set(st.whiskX, -.1 - (1 - st.whisk) * 3, 0); whiskWorld.scale.setScalar(st.whiskS); whiskWorld.rotation.x = .38;
      const sp = st.whiskSpeed;
      chasen.position.set(Math.sin(t * 14 * sp + 0.3) * .42 * sp, .5 - sp * .42, Math.cos(t * 7 * sp) * .12 * sp);
      chasen.rotation.z = Math.sin(t * 14 * sp) * .12 * sp;
      foamU.uFoam.value = st.foam; foamU.uTime.value = t;
    }
    camera.position.y = st.camY; camera.position.z = st.camZ; camera.lookAt(0, 1.5 + (st.camY - 2.1) * .25, 0);
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // keep the cup a constant size on tall phones
    camera.fov = w / h < .8 ? 36 : 26; camera.updateProjectionMatrix();
  }
  resize();
  const clock = new THREE.Clock();
  let running = true;
  let lastKey = "", idle = 0;
  function frame() {
    if (!running) return;
    const key = JSON.stringify(st);
    if (key === lastKey) { idle++; if (idle > 45 && idle % 4) return; } else { idle = 0; lastKey = key; }
    apply(clock.getElapsedTime()); renderer.render(scene, camera);
  }
  return { st, renderer, scene, camera, resize, frame, setRunning(v) { running = v; }, renderOnce() { apply(clock.getElapsedTime()); renderer.render(scene, camera); } };
}
