/* Taigu · GPU fluid (stable fluids: advect → curl/vorticity → divergence → pressure → project) · Dolcessi */
import * as THREE from "three";

const VERT = /* glsl */`
uniform vec2 texel;
varying vec2 vUv, vL, vR, vT, vB;
void main(){
  vUv = uv; vL = vUv - vec2(texel.x, 0.); vR = vUv + vec2(texel.x, 0.); vT = vUv + vec2(0., texel.y); vB = vUv - vec2(0., texel.y);
  gl_Position = vec4(position.xy, 0., 1.);
}`;
const HEAD = "precision highp float; varying vec2 vUv, vL, vR, vT, vB;\n";

const FRAG = {
  splat: `uniform sampler2D uTarget; uniform float aspect; uniform vec3 color; uniform vec2 point; uniform float radius;
    void main(){ vec2 p = vUv - point; p.x *= aspect; vec3 s = exp(-dot(p, p) / radius) * color; gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + s, 1.); }`,
  advect: `uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 simTexel; uniform float dt; uniform float dissipation;
    void main(){ vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * simTexel; gl_FragColor = texture2D(uSource, coord) / (1. + dissipation * dt); }`,
  divergence: `uniform sampler2D uVelocity;
    void main(){ float L = texture2D(uVelocity, vL).x, R = texture2D(uVelocity, vR).x, T = texture2D(uVelocity, vT).y, B = texture2D(uVelocity, vB).y; vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.) L = -C.x; if (vR.x > 1.) R = -C.x; if (vT.y > 1.) T = -C.y; if (vB.y < 0.) B = -C.y;
      gl_FragColor = vec4(.5 * (R - L + T - B), 0., 0., 1.); }`,
  curl: `uniform sampler2D uVelocity;
    void main(){ float L = texture2D(uVelocity, vL).y, R = texture2D(uVelocity, vR).y, T = texture2D(uVelocity, vT).x, B = texture2D(uVelocity, vB).x; gl_FragColor = vec4(.5 * (R - L - T + B), 0., 0., 1.); }`,
  vorticity: `uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
    void main(){ float L = texture2D(uCurl, vL).x, R = texture2D(uCurl, vR).x, T = texture2D(uCurl, vT).x, B = texture2D(uCurl, vB).x, C = texture2D(uCurl, vUv).x;
      vec2 force = .5 * vec2(abs(T) - abs(B), abs(R) - abs(L)); force /= length(force) + .0001; force *= curl * C; force.y *= -1.;
      vec2 v = texture2D(uVelocity, vUv).xy + force * dt; gl_FragColor = vec4(clamp(v, -1000., 1000.), 0., 1.); }`,
  clear: `uniform sampler2D uTexture; uniform float value; void main(){ gl_FragColor = value * texture2D(uTexture, vUv); }`,
  pressure: `uniform sampler2D uPressure; uniform sampler2D uDivergence;
    void main(){ float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x, T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
      gl_FragColor = vec4((L + R + B + T - texture2D(uDivergence, vUv).x) * .25, 0., 0., 1.); }`,
  gradient: `uniform sampler2D uPressure; uniform sampler2D uVelocity;
    void main(){ float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x, T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
      vec2 v = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B); gl_FragColor = vec4(v, 0., 1.); }`
};

export function createFluid(renderer, o = {}) {
  const opt = Object.assign({ sim: 128, dye: 512, iters: 18, densityDiss: 1.0, velocityDiss: .25, pressure: .8, curl: 22, radius: .22, aspect: 1, force: 6000 }, o);
  const type = renderer.capabilities.isWebGL2 ? THREE.HalfFloatType : THREE.FloatType;
  const res = r => { const a = opt.aspect; return a >= 1 ? [Math.round(r * a), r] : [r, Math.round(r / a)]; };
  const rt = (w, h) => new THREE.WebGLRenderTarget(w, h, { type, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping });
  const dbl = (w, h) => { let a = rt(w, h), b = rt(w, h); return { w, h, get read() { return a; }, get write() { return b; }, swap() { const t = a; a = b; b = t; }, dispose() { a.dispose(); b.dispose(); } }; };

  let simW, simH, dyeW, dyeH, velocity, dye, pressure, divergence, curlRT;
  function alloc() {
    [simW, simH] = res(opt.sim); [dyeW, dyeH] = res(opt.dye);
    [velocity, dye, pressure].forEach(x => x && x.dispose()); [divergence, curlRT].forEach(x => x && x.dispose());
    velocity = dbl(simW, simH); dye = dbl(dyeW, dyeH); pressure = dbl(simW, simH); divergence = rt(simW, simH); curlRT = rt(simW, simH);
    [velocity.read, velocity.write, dye.read, dye.write, pressure.read, pressure.write, divergence, curlRT].forEach(t => { renderer.setRenderTarget(t); renderer.clear(); });
    renderer.setRenderTarget(null);
  }
  alloc();

  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); quad.frustumCulled = false; scene.add(quad);
  const M = {};
  for (const k in FRAG) M[k] = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: HEAD + FRAG[k], uniforms: { texel: { value: new THREE.Vector2() } }, depthTest: false, depthWrite: false });
  const add = (m, u) => Object.keys(u).forEach(k => { m.uniforms[k] = { value: u[k] }; });
  add(M.splat, { uTarget: null, aspect: 1, color: new THREE.Vector3(), point: new THREE.Vector2(), radius: .01 });
  add(M.advect, { uVelocity: null, uSource: null, simTexel: new THREE.Vector2(), dt: .016, dissipation: 1 });
  add(M.divergence, { uVelocity: null }); add(M.curl, { uVelocity: null });
  add(M.vorticity, { uVelocity: null, uCurl: null, curl: opt.curl, dt: .016 });
  add(M.clear, { uTexture: null, value: .8 }); add(M.pressure, { uPressure: null, uDivergence: null }); add(M.gradient, { uPressure: null, uVelocity: null });

  function pass(m, target, w, h) {
    m.uniforms.texel.value.set(1 / w, 1 / h); quad.material = m;
    renderer.setRenderTarget(target); renderer.render(scene, cam);
  }

  const queue = [];
  function splat(x, y, dx, dy, color, radius = opt.radius) { queue.push([x, y, dx, dy, color, radius]); }
  function doSplat([x, y, dx, dy, c, r]) {
    const u = M.splat.uniforms;
    u.aspect.value = simW / simH; u.point.value.set(x, y); u.radius.value = r / 100 * (simW / simH > 1 ? simW / simH : 1);
    u.uTarget.value = velocity.read.texture; u.color.value.set(dx, dy, 0); pass(M.splat, velocity.write, simW, simH); velocity.swap();
    u.uTarget.value = dye.read.texture; u.color.value.set(c[0], c[1], c[2]); pass(M.splat, dye.write, dyeW, dyeH); dye.swap();
  }

  function step(dt) {
    dt = Math.min(dt, 1 / 30);
    const prevAuto = renderer.autoClear; renderer.autoClear = false;
    const prevRT = renderer.getRenderTarget();
    while (queue.length) doSplat(queue.shift());
    M.curl.uniforms.uVelocity.value = velocity.read.texture; pass(M.curl, curlRT, simW, simH);
    Object.assign(M.vorticity.uniforms, {}); M.vorticity.uniforms.uVelocity.value = velocity.read.texture; M.vorticity.uniforms.uCurl.value = curlRT.texture; M.vorticity.uniforms.dt.value = dt; M.vorticity.uniforms.curl.value = opt.curl;
    pass(M.vorticity, velocity.write, simW, simH); velocity.swap();
    M.divergence.uniforms.uVelocity.value = velocity.read.texture; pass(M.divergence, divergence, simW, simH);
    M.clear.uniforms.uTexture.value = pressure.read.texture; M.clear.uniforms.value.value = opt.pressure; pass(M.clear, pressure.write, simW, simH); pressure.swap();
    M.pressure.uniforms.uDivergence.value = divergence.texture;
    for (let i = 0; i < opt.iters; i++) { M.pressure.uniforms.uPressure.value = pressure.read.texture; pass(M.pressure, pressure.write, simW, simH); pressure.swap(); }
    M.gradient.uniforms.uPressure.value = pressure.read.texture; M.gradient.uniforms.uVelocity.value = velocity.read.texture; pass(M.gradient, velocity.write, simW, simH); velocity.swap();
    const a = M.advect.uniforms; a.simTexel.value.set(1 / simW, 1 / simH); a.dt.value = dt;
    a.uVelocity.value = velocity.read.texture; a.uSource.value = velocity.read.texture; a.dissipation.value = opt.velocityDiss; pass(M.advect, velocity.write, simW, simH); velocity.swap();
    a.uVelocity.value = velocity.read.texture; a.uSource.value = dye.read.texture; a.dissipation.value = opt.densityDiss; pass(M.advect, dye.write, dyeW, dyeH); dye.swap();
    renderer.setRenderTarget(prevRT); renderer.autoClear = prevAuto;
  }

  return {
    opt, splat, step,
    get texture() { return dye.read.texture; },
    get aspect() { return opt.aspect; },
    setAspect(a) { if (Math.abs(a - opt.aspect) > .02) { opt.aspect = a; alloc(); } },
    clear() { [velocity.read, velocity.write, dye.read, dye.write, pressure.read, pressure.write].forEach(t => { renderer.setRenderTarget(t); renderer.clear(); }); renderer.setRenderTarget(null); }
  };
}
