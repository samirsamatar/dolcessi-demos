/* SHOT · the WebGL stage: one clear can, a backdrop that carries the wordmark, photo planes, pour, ice, seal · Dolcessi */
import * as THREE from "three";
import { buildCan, condensationMaps, contactShadow, CAN, FLAVOURS } from "./can.js?v=1";

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

function wordTexture(text) {
  const W = 4096, H = 1500, c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "alphabetic";
  g.font = `500 ${H * .98}px "Bodoni SHOT", "Didot", serif`;
  try { g.letterSpacing = `${-H * .01}px`; } catch (e) {}
  const m = g.measureText(text), w = m.width;
  const k = Math.min(1, (W * .985) / w);
  g.save(); g.translate(W / 2, H * .86); g.scale(k, k); g.fillText(text, 0, 0); g.restore();
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.minFilter = THREE.LinearMipmapLinearFilter; return t;
}

export async function createWorld(canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: !!opts.keep });
  const dpr = () => Math.min(devicePixelRatio || 1, opts.maxDpr || 1.5);
  renderer.setPixelRatio(dpr());
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, .1, 200);
  scene.add(camera);

  // studio light for reflections: softboxes in a dark room
  {
    const pm = new THREE.PMREMGenerator(renderer);
    const studio = new THREE.Scene();
    const glow = (w, h, x, y, z, k, tint = [1, .98, .95]) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(k * tint[0], k * tint[1], k * tint[2]), side: THREE.DoubleSide }); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.lookAt(0, y * .3, 0); studio.add(p); };
    glow(1.6, 10, -4.8, 2, 3.4, 4.2);
    glow(.9, 10, 5, 2, 2.4, 2.6);
    glow(1.4, 10, 3.8, 2, -4.6, 6);
    glow(1.4, 10, -4, 2, -4.2, 4.5, [1, .95, .88]);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.35, 2.25), side: THREE.DoubleSide })); top.position.set(0, 8, 0); top.rotation.x = Math.PI / 2; studio.add(top);
    studio.add(new THREE.Mesh(new THREE.BoxGeometry(30, 20, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(.16, .145, .13), side: THREE.BackSide })));
    scene.environment = pm.fromScene(studio, .035).texture;
    const key = new THREE.DirectionalLight(0xfff6ea, 1.2); key.position.set(-5, 9, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 2.2); rim.position.set(6, 3, -6); scene.add(rim);
  }

  // backdrop: opaque (the PET refracts it), rides with the camera, carries the giant wordmark
  const BD = 30;
  const wordTex = wordTexture("SHOT");
  const bdU = {
    uA: { value: new THREE.Color("#2D2220") }, uB: { value: new THREE.Color("#1E1614") }, uGlow: { value: new THREE.Color("#5a4134") },
    uInk: { value: new THREE.Color("#F9F5EE") }, uWord: { value: 1 }, uWordRect: { value: new THREE.Vector4(.5, .5, .9, .3) }, uWordTex: { value: wordTex },
    uGlowPos: { value: new THREE.Vector2(.5, .45) }, uAspect: { value: 1 }, uTime: { value: 0 }, uGrain: { value: .035 }
  };
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
    uniforms: bdU, toneMapped: false, depthWrite: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: `uniform vec3 uA; uniform vec3 uB; uniform vec3 uGlow; uniform vec3 uInk; uniform float uWord; uniform vec4 uWordRect; uniform sampler2D uWordTex; uniform vec2 uGlowPos; uniform float uAspect; uniform float uTime; uniform float uGrain; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
      void main(){
        vec3 c = mix(uB, uA, smoothstep(0., 1., vUv.y));
        vec2 d = (vUv - uGlowPos) * vec2(uAspect, 1.);
        c += uGlow * exp(-dot(d,d) * 3.2) * .7;
        vec2 wu = (vUv - uWordRect.xy) / uWordRect.zw + .5;
        if (wu.x > 0. && wu.x < 1. && wu.y > 0. && wu.y < 1.) { float a = texture2D(uWordTex, wu).r; c = mix(c, uInk, a * uWord); }
        c += (hash(vUv * 900. + fract(uTime)) - .5) * uGrain;
        gl_FragColor = vec4(c, 1.);
        #include <colorspace_fragment>
      }`
  }));
  backdrop.position.z = -BD; backdrop.renderOrder = -1; camera.add(backdrop);

  // the can
  const cond = condensationMaps(innerWidth < 900 ? 512 : 1024);
  const can = buildCan(renderer, "matcha", { cond, ice: true, printName: "Amsterdam · 330 ml" });
  const rig = new THREE.Group(); rig.add(can.group); scene.add(rig);
  can.group.position.y = -1.1;              // pivot the rig around the can's middle
  const shadow = contactShadow(.62); scene.add(shadow);
  shadow.material.opacity = 1;

  // pour stream
  const streamMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .18, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: .9 });
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(.032, .026, 1, 20, 1, true), streamMat);
  stream.geometry.translate(0, -.5, 0); can.group.add(stream);

  // photo planes: opaque, wipe in with a rounded mask
  const loader = new THREE.TextureLoader();
  const photoGeo = new THREE.PlaneGeometry(1, 1);
  const photos = {};
  function photo(key, url) {
    if (photos[key]) return photos[key];
    const U = { map: { value: null }, uReveal: { value: 0 }, uAspect: { value: 1 }, uImgAspect: { value: 1 }, uDim: { value: 0 }, uZoom: { value: 1.1 } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, toneMapped: false,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
      fragmentShader: `uniform sampler2D map; uniform float uReveal; uniform float uAspect; uniform float uImgAspect; uniform float uDim; uniform float uZoom; varying vec2 vUv;
        void main(){
          float edge = uReveal * 1.2 - .1;
          if (vUv.y > edge + (vUv.x - .5) * .1) discard;
          vec2 q = (vUv - .5) * vec2(uAspect, 1.); vec2 b = vec2(uAspect, 1.) * .5 - .035; vec2 dd = abs(q) - b + .035;
          if (length(max(dd, 0.)) > .035) discard;
          vec2 uv = vUv - .5; float r = uAspect / uImgAspect;
          uv *= r > 1. ? vec2(1., 1. / r) : vec2(r, 1.);
          uv = uv / (uZoom + (1. - uReveal) * .25) + .5;
          vec3 c = texture2D(map, uv).rgb * (1. - uDim);
          gl_FragColor = vec4(c, 1.);
          #include <colorspace_fragment>
        }` });
    const m = new THREE.Mesh(photoGeo, mat); m.visible = false; scene.add(m);
    loader.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; U.map.value = t; U.uImgAspect.value = t.image.width / t.image.height; });
    return (photos[key] = { mesh: m, U });
  }

  // state the choreography writes into
  const st = {
    bgA: "#2D2220", bgB: "#1E1614", glow: "#5a4134", ink: "#F9F5EE", word: 1, wordY: .56, wordW: .92, glowX: .5, glowY: .5, grain: .035,
    x: 0, y: 0, s: 1, rotY: 0, tiltX: 0, tiltZ: 0, spin: 1,
    level: CAN.FILL, pour: 0, pourCol: "#ffffff", ripple: 0, ice: 1, iceDrop: 1, lid: 0, lidSpin: 0, cond: 1, mix: 0, shake: 0,
    layers: FLAVOURS.matcha.layers.slice(), tops: FLAVOURS.matcha.tops.slice(), soft: FLAVOURS.matcha.soft.slice(),
    camY: 0, camZ: 8.6, lookY: 0, fov: 26,
    shots: [] // [{key,url,x,y,z,w,h,reveal,dim,rot}]
  };

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", e => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setPixelRatio(dpr()); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();

  const clock = new THREE.Clock(); let t = 0, spinA = 0;
  const C = new THREE.Color(), tmp = new THREE.Color();
  function frame() {
    const dt = Math.min(clock.getDelta(), 1 / 20); t += dt;
    mouse.sx += (mouse.x - mouse.sx) * .05; mouse.sy += (mouse.y - mouse.sy) * .05;

    // camera
    camera.fov = st.fov; camera.position.set(mouse.sx * .25, st.camY - mouse.sy * .12, st.camZ); camera.lookAt(0, st.lookY, 0); camera.updateProjectionMatrix();
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * BD, vw = vh * camera.aspect;
    backdrop.scale.set(vw * 1.08, vh * 1.08, 1);
    bdU.uAspect.value = camera.aspect; bdU.uTime.value = t; bdU.uGrain.value = st.grain;
    bdU.uA.value.set(st.bgA); bdU.uB.value.set(st.bgB); bdU.uGlow.value.set(st.glow); bdU.uInk.value.set(st.ink); bdU.uWord.value = st.word;
    bdU.uGlowPos.value.set(st.glowX, st.glowY);
    const ta = 4096 / 1500, ww = st.wordW, wh = ww * camera.aspect / ta;
    bdU.uWordRect.value.set(.5, st.wordY, ww, wh);

    // the can
    spinA += dt * .35 * st.spin;
    if (st.spin < .01) spinA += (Math.round(spinA / TAU) * TAU - spinA) * Math.min(1, dt * 2.5);
    const sh = st.shake;
    rig.position.set(st.x, st.y + Math.sin(t * 1.1) * .03 * st.spin, 0);
    rig.scale.setScalar(st.s);
    rig.rotation.set(st.tiltX + mouse.sy * .06 + Math.sin(t * 31) * .05 * sh, st.rotY + spinA + mouse.sx * .25, st.tiltZ + Math.sin(t * 23) * .07 * sh);
    shadow.position.set(st.x, st.y - 1.1 * st.s - .02, 0); shadow.scale.setScalar(st.s);
    shadow.visible = st.s > .05;

    const U = can.U;
    U.uTime.value = t;
    ["c0", "c1", "c2", "c3"].forEach((k, i) => U[k].value.set(st.layers[i]));
    U.uTops.value.set(st.tops[0], st.tops[1], st.tops[2]); U.uSoft.value.set(st.soft[0], st.soft[1], st.soft[2]);
    U.uMix.value = st.mix; U.uLevel.value = Math.max(.02, st.level); U.uRipple.value = st.ripple; U.uIce.value = st.ice;
    can.surf.position.y = U.uLevel.value; can.surf.visible = st.level > .07;
    can.liquid.visible = st.level > .03;

    // stream from above the frame down to the surface
    stream.visible = st.pour > .01;
    if (stream.visible) {
      const top = 6.5, bot = U.uLevel.value;
      stream.position.set(Math.sin(t * 7) * .004, top, 0); stream.scale.set(st.pour, top - bot, st.pour);
      streamMat.color.set(st.pourCol);
    }
    // ice
    can.ice.children.forEach((m, i) => {
      const k = clamp((st.iceDrop - i * .1) / .45), e = 1 - Math.pow(1 - k, 3);
      const bob = Math.sin(t * 1.3 + i) * .006;
      const r = m.userData.rest;
      m.visible = k > 0;
      m.position.set(r.x, lerp(r.y + 3.4, r.y - (CAN.FILL - st.level) + bob, e), r.z);
      m.rotation.set(m.userData.rot.x + (1 - e) * 4, m.userData.rot.y + (1 - e) * 3, m.userData.rot.z);
      tmp.set(st.layers[3]); C.set("#eef4f2").lerp(tmp, .25); can.iceMat.color.copy(C);
    });
    // lid & condensation
    can.lid.position.y = CAN.TOP + st.lid; can.lid.rotation.y = st.lidSpin;
    can.pet.normalScale.setScalar(.3 * st.cond); can.pet.roughness = .03 + .04 * st.cond;

    // photos
    const seen = new Set();
    st.shots.forEach(p => {
      const ph = photo(p.key, p.url); seen.add(p.key);
      ph.mesh.visible = p.reveal > .001;
      ph.mesh.position.set(p.x + mouse.sx * p.z * -.05, p.y + mouse.sy * p.z * .03, p.z);
      ph.mesh.scale.set(p.w, p.h, 1); ph.mesh.rotation.set(0, 0, p.rot || 0);
      ph.U.uAspect.value = p.w / p.h; ph.U.uReveal.value = p.reveal; ph.U.uDim.value = p.dim || 0;
    });
    Object.keys(photos).forEach(k => { if (!seen.has(k)) photos[k].mesh.visible = false; });

    renderer.render(scene, camera);
  }

  return { st, frame, resize, renderer, can, photo };
}
