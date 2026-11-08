/*! Dolcessi v4 — "reeded glass" background.
 * Navy haze and a coral glow, seen through vertical fluted glass.
 * One full-screen quad, one fragment shader. Exposes window.REED.
 */
(function () {
  'use strict';
  var W = window, d = document;
  var cv = d.getElementById('reed');
  if (!cv) return;
  var REDUCE = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COARSE = W.matchMedia('(pointer: coarse)').matches;

  var gl = null;
  try {
    var opt = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'low-power' };
    gl = cv.getContext('webgl', opt) || cv.getContext('experimental-webgl', opt);
  } catch (e) { gl = null; }
  if (!gl) { d.documentElement.classList.add('no-gl'); return; }

  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uT;uniform vec4 uGlow;uniform float uHaze;uniform vec3 uPtr;uniform float uIntro;uniform float uRib;uniform float uDim;',
    'const vec3 NAVY_D=vec3(.040,.068,.135);',
    'const vec3 NAVY=vec3(.078,.129,.239);',
    'const vec3 STEEL=vec3(.235,.318,.478);',
    'const vec3 MIST=vec3(.560,.615,.720);',
    'const vec3 CREAM=vec3(.957,.929,.878);',
    'const vec3 CORAL=vec3(1.,.42,.357);',
    'float bl(vec2 p,vec2 c,float r){vec2 q=p-c;return exp(-dot(q,q)/(r*r));}',
    'float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'vec3 scene(vec2 p,float a){',
    '  float t=uT*.06;',
    '  vec3 c=mix(NAVY,NAVY_D,smoothstep(.0,1.15,p.y));',
    '  vec2 c1=vec2(a*(.30+.10*sin(t*1.1)),.30+.10*cos(t*.9));',
    '  vec2 c2=vec2(a*(.78+.08*cos(t*.8+1.)),.20+.09*sin(t*1.3));',
    '  vec2 c3=vec2(a*(.55+.14*sin(t*.7+2.)),.62+.10*cos(t*1.2+.5));',
    '  vec2 c4=vec2(a*(.12+.06*cos(t*1.4)),.85+.06*sin(t));',
    '  c=mix(c,STEEL,.62*bl(p,c1,.42));',
    '  c=mix(c,MIST,.55*uHaze*bl(p,c2,.26));',
    '  c=mix(c,MIST,.38*uHaze*bl(p,c3,.20));',
    '  c=mix(c,STEEL,.45*bl(p,c4,.30));',
    '  c+=CREAM*.10*uHaze*bl(p,c2+vec2(.05,.03),.12);',
    '  vec2 c5=vec2(a*(.42+.10*sin(t*1.9+3.)),.42+.12*cos(t*1.5+1.));',
    '  vec2 c6=vec2(a*(.92+.05*sin(t*1.6)),.55+.10*sin(t*1.1+2.));',
    '  c=mix(c,MIST,.26*uHaze*bl(p,c5,.11));',
    '  c=mix(c,STEEL,.50*bl(p,c6,.14));',
    '  vec2 g=vec2(uGlow.x*a,uGlow.y)+vec2(.03*sin(t*2.),.02*cos(t*1.7));',
    '  float gi=uGlow.w*smoothstep(.55,1.,uIntro);',
    '  float k=bl(p,g,uGlow.z)*gi;',
    '  float k2=bl(p,g+vec2(-.18*a*uGlow.z,.10),uGlow.z*.7)*gi*.5;',
    '  c=mix(c,CORAL,clamp(k*.92+k2*.6,0.,1.));',
    '  c+=vec3(1.,.72,.62)*.22*k*k;',
    '  c=mix(c,MIST,.10*uPtr.z*bl(p,uPtr.xy,.16));',
    '  c+=CORAL*.08*uPtr.z*bl(p,uPtr.xy,.07)*gi;',
    '  return c;',
    '}',
    'void main(){',
    '  vec2 fc=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);',
    '  float a=uRes.x/uRes.y;',
    '  float k=fc.x/uRib;float f=fract(k)-.5;',
    '  float sweep=smoothstep(-.1,0.,uIntro*1.25-fc.x/uRes.x*.95);',
    '  float sx=(floor(k)+.5)*uRib-f*uRib*2.6*sweep;',
    '  vec2 sp=vec2(mix(fc.x,sx,sweep),fc.y+f*uRib*.6*sweep);',
    '  vec3 c=scene(sp/uRes.y,a);',
    '  float lens=1.-abs(2.*f);',
    '  c*=mix(1.,.90+.13*pow(lens,.7),sweep);',
    '  c+=vec3(.95,.92,.88)*.035*smoothstep(.40,.5,f)*sweep;',
    '  c-=.03*(1.-smoothstep(-.5,-.42,f))*sweep;',
    '  vec2 uv=fc/uRes;',
    '  c*=1.-.28*pow(length((uv-.5)*vec2(1.,.8)),2.2);',
    '  c+=(h21(fc+fract(uT*7.))-.5)*.035;',
    '  c*=mix(1.,.0,uDim);',
    '  gl_FragColor=vec4(c,1.);',
    '}'
  ].join('\n');

  function sh(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(s)); }
    return s;
  }
  var pr;
  try {
    pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link');
  } catch (e) { d.documentElement.classList.add('no-gl'); return; }
  gl.useProgram(pr);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ['uRes', 'uT', 'uGlow', 'uHaze', 'uPtr', 'uIntro', 'uRib', 'uDim'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });

  // state: current (c) eases toward target (t)
  var S = {
    c: { x: .68, y: .72, r: .34, i: 1, haze: .9, dim: 0 },
    t: { x: .68, y: .72, r: .34, i: 1, haze: .9, dim: 0 },
    ptr: [0.5, 0.5, 0], ptrT: [0.5, 0.5, 0],
    intro: 0, introT: 1, introStart: 0, hold: false, skip: false, lost: false
  };
  var dpr = 1, w = 0, h = 0, rib = 9;

  function resize() {
    dpr = Math.min(W.devicePixelRatio || 1, COARSE ? 1.5 : 1.5);
    var cw = cv.clientWidth || innerWidth, ch = cv.clientHeight || innerHeight;
    w = Math.max(1, Math.round(cw * dpr)); h = Math.max(1, Math.round(ch * dpr));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    rib = (cw < 700 ? 7 : 9) * dpr;
    gl.viewport(0, 0, w, h);
    dirty = true;
  }
  var dirty = true, last = 0, t0 = performance.now(), running = false;

  function draw(now) {
    var tt = REDUCE ? 12 : (now - t0) / 1000;
    gl.uniform2f(U.uRes, w, h);
    gl.uniform1f(U.uT, tt);
    gl.uniform4f(U.uGlow, S.c.x, S.c.y, S.c.r, S.c.i);
    gl.uniform1f(U.uHaze, S.c.haze);
    gl.uniform3f(U.uPtr, S.ptr[0] * (w / h), S.ptr[1], S.ptr[2]);
    gl.uniform1f(U.uIntro, S.intro);
    gl.uniform1f(U.uRib, rib);
    gl.uniform1f(U.uDim, S.c.dim);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function ease(a, b, k) { return a + (b - a) * k; }
  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    if (S.lost || d.hidden) return;
    var dt = Math.min(64, now - (last || now)); last = now;
    var k = REDUCE ? 1 : 1 - Math.pow(1 - .045, dt / 16.7);
    var moving = false;
    ['x', 'y', 'r', 'i', 'haze', 'dim'].forEach(function (p) {
      var v = ease(S.c[p], S.t[p], p === 'dim' ? Math.min(1, k * 2.2) : k);
      if (Math.abs(v - S.t[p]) > 1e-4) moving = true; else v = S.t[p];
      S.c[p] = v;
    });
    for (var i = 0; i < 3; i++) { S.ptr[i] = ease(S.ptr[i], S.ptrT[i], k * .8); }
    if (S.introStart) {
      var p = Math.min(1, (now - S.introStart) / 1500);
      S.intro = REDUCE ? 1 : 1 - Math.pow(1 - p, 3);
      if (p >= 1) S.introStart = 0;
      moving = true;
    }
    if (S.skip || S.hold) return;
    if (REDUCE && !moving && !dirty) return;
    // ~30 fps on phones keeps them cool; 60 on desktop
    if (COARSE && !moving && (now - (loop._l || 0)) < 32) return;
    loop._l = now;
    dirty = false;
    draw(now);
  }

  cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); S.lost = true; d.documentElement.classList.add('no-gl'); }, false);
  cv.addEventListener('webglcontextrestored', function () { location.reload(); }, false);
  W.addEventListener('resize', resize);

  W.REED = {
    start: function (intro) {
      resize();
      if (intro && !REDUCE) { S.intro = 0; S.introStart = performance.now(); } else { S.intro = 1; }
      d.documentElement.classList.add('gl-on');
      running = true; requestAnimationFrame(loop);
    },
    target: function (o) { for (var k in o) if (k in S.t) S.t[k] = o[k]; if (REDUCE) dirty = true; },
    jump: function (o) { for (var k in o) if (k in S.t) { S.t[k] = o[k]; S.c[k] = o[k]; } dirty = true; },
    pointer: function (x, y, on) { S.ptrT = [x / innerWidth, y / innerHeight, on ? 1 : 0]; },
    skip: function (on) { S.skip = !!on; if (!on) dirty = true; },
    hold: function (on) { S.hold = !!on; if (!on) dirty = true; },
    ok: function () { return !S.lost; }
  };
})();
