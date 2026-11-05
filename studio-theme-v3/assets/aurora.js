/*! Dolcessi Aurora — raw WebGL fibre aurora (no deps).
 *  Thousands of instanced ribbon strips whose positions come from a Catmull-Rom
 *  ribbon path evaluated in the vertex shader (offset, twist, flow noise, time),
 *  HDR additive accumulation, dual-Kawase bloom, filmic composite with grain.
 *  Stages are keyframes; the page feeds a float stage index and we damp to it.
 */
(function () {
  'use strict';

  var A = { ok: false };
  window.Aurora = A;

  /* ───────────────────────── keyframes ─────────────────────────
     p  : 6 control points [u,v] in viewport units (0..1, v down)
     w  : half width (scene units, screen height = 2)
     tw : twist turns along the ribbon     b : brightness
     fr : fray (flow-noise amount)         sp: light-packet speed
     ph : twist phase                      dp: depth amount
     hu : colour balance (-1 garnet … +1 amber/bone)
     g  : globals — flick, warp, bloom, exp(osure), glow (+gx,gy), wind, lw (line px) */
  function R(p, w, tw, b, fr, sp, ph, dp, hu) { return { p: p, w: w, tw: tw, b: b, fr: fr, sp: sp, ph: ph, dp: dp, hu: hu }; }
  function G(o) {
    var d = { flick: 0, warp: 0, bloom: 0.85, exp: 1.25, glow: 0, gx: 0.5, gy: 1.15, wind: 1, lw: 1 };
    for (var k in o) d[k] = o[k];
    return d;
  }

  /* One ribbon through the whole page. Every stage is a placement of the SAME band: a spine (6 control
     points) carrying three layered sub-ribbons (core, inner sheet, outer veil) that share it. Neighbouring
     placements are planned close to each other, so the page reads as one ribbon meandering down it.
     Only stage 02 (takeoff, see A.takeoff) condenses it to a thin line; How fans it into three lanes that
     split from and rejoin the band. */
  function offP(p, d) {
    return p.map(function (q, j) {
      var a = p[Math.max(0, j - 1)], b = p[Math.min(5, j + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.sqrt(tx * tx + ty * ty) || 1;
      return [q[0] - ty / l * d, q[1] + tx / l * d];
    });
  }
  function band(p, w, b, o) {
    o = o || {};
    var tw = o.tw != null ? o.tw : .9, fr = o.fr != null ? o.fr : .35, sp = o.sp != null ? o.sp : 1, dp = o.dp != null ? o.dp : .6, hu = o.hu != null ? o.hu : .15;
    return [R(p, w, tw, b, fr, sp, 0, dp, hu),
      R(offP(p, w * .2), w * .55, tw * .75, b * .52, fr * 1.2, sp * 1.2, 1.6, dp * .8, hu - .45),
      R(offP(p, -w * .17), w * .32, tw * .6, b * .36, fr * 1.4, sp * .9, 2.5, dp * .6, hu + .4)];
  }
  function lanesKF(L, tall, g) {
    // three lanes that split out of the band and rejoin it at both ends; r0 = middle, r1 = +side, r2 = -side
    var c = (L[0] + L[1] + L[2]) / 3, order = tall ? [1, 2, 0] : [1, 2, 0], r = [];
    for (var k = 0; k < 3; k++) {
      var Li = L[order[k]], h = function (t) { return c + (Li - c) * t; }, p;
      p = tall ? [[-.35, c], [.0, h(.62)], [.3, Li], [.7, Li], [1.0, h(.62)], [1.35, c]]
               : [[c, 1.3], [h(.62), .97], [Li, .66], [Li, .34], [h(.62), .03], [c, -.3]];
      r.push(R(p, k === 0 ? .1 : .085, .7, k === 0 ? .62 : .5, .3, 1.1, [0, 1.6, 2.5][k], .5, .1));
    }
    return { r: r, g: g };
  }

  var WIDE = {
    pre: { r: [
      R([[-0.1, .5], [.15, .5], [.35, .5], [.65, .5], [.85, .5], [1.1, .5]], .004, 0, 1.4, 0, .6, 0, .2, .4),
      R([[-0.1, .5], [.15, .5], [.35, .5], [.65, .5], [.85, .5], [1.1, .5]], .004, 0, .5, 0, .6, 1, .2, 0),
      R([[-0.1, .5], [.15, .5], [.35, .5], [.65, .5], [.85, .5], [1.1, .5]], .004, 0, .2, 0, .6, 2, .2, 0)
    ], g: G({ bloom: 1.2, exp: 1.5 }) },

    hero: { r: band([[-0.18, 1.08], [.14, .95], [.44, .8], [.67, .55], [.86, .32], [1.16, .04]], .28, 1.0, { tw: 1.15, fr: .32, dp: .7, hu: .15 }),
      g: G({ bloom: .9, exp: 1.25, glow: .12, gx: .78, gy: .62 }) },
    why: { r: band([[-0.15, .84], [.08, .87], [.3, .86], [.52, .89], [.76, .92], [1.08, .95]], .26, .5, { tw: .45, fr: 1.2, sp: .5, dp: .5, hu: -.45 }),
      g: G({ flick: .85, bloom: .7, exp: 1.05, glow: .05, gx: .5, gy: 1.2, wind: .6 }) },
    path: { r: band([[-0.25, .9], [-.02, .9], [.16, .89], [.34, .91], [.54, .98], [.8, 1.12]], .2, .62, { tw: .45, fr: .5, sp: .9, dp: .5, hu: -.1 }),
      g: G({ bloom: .9, exp: 1.15, wind: .6 }) },
    lanes: lanesKF([.2, .5, .8], false, G({ bloom: .85, exp: 1.2 })),
    warp: { r: band([[-0.25, .55], [.1, .53], [.35, .51], [.65, .52], [.9, .5], [1.25, .48]], .46, .64, { tw: .05, fr: .5, sp: 5, dp: .9, hu: .2 }),
      g: G({ warp: .55, bloom: .9, exp: 1.2, wind: .5 }) },
    inside: { r: band([[-0.15, .58], [.12, .64], [.38, .72], [.62, .8], [.86, .9], [1.15, .99]], .3, .5, { tw: .9, fr: .35, sp: .9, dp: .6, hu: .2 }),
      g: G({ bloom: .78, exp: 1.08, glow: .05, gx: .5, gy: 1.2 }) },
    proof: { fc: [.27, .55], r: band([[.0, 1.22], [.06, .66], [.15, .17], [.39, .17], [.48, .66], [.54, 1.22]], .16, .66, { tw: .9, fr: .28, sp: 1.1, dp: .5, hu: .22 }),
      g: G({ bloom: .85, exp: 1.15, glow: .06, gx: .27, gy: .62 }) },
    faq: { r: band([[-0.12, .98], [.08, .8], [.24, .68], [.43, .76], [.7, .95], [1.1, 1.12]], .24, .5, { tw: .7, fr: .35, sp: .8, dp: .5, hu: .1 }),
      g: G({ bloom: .75, exp: 1.05, glow: .05, gx: .2, gy: 1.1 }) },
    cta: { fc: [.5, .74], r: band([[-0.15, 1.1], [.12, .95], [.35, .86], [.65, .86], [.88, .95], [1.15, 1.1]], .26, .9, { tw: .55, fr: .3, sp: .9, dp: .7, hu: .45 }),
      g: G({ bloom: 1.1, exp: 1.3, glow: .62, gx: .5, gy: .96 }) },
    popup: { r: [
      R([[-0.15, .95], [.15, .78], [.38, .6], [.62, .42], [.85, .24], [1.15, .05]], .2, 1.3, .95, .3, 1.2, 0, .7, .35),
      R([[-0.15, .1], [.15, .28], [.4, .44], [.6, .56], [.85, .72], [1.15, .92]], .1, .9, .5, .35, 1, 1.5, .5, -.3),
      R([[.2, 1.2], [.35, .85], [.48, .55], [.52, .45], [.65, .15], [.8, -.2]], .05, .5, .35, .3, 1.4, 2.5, .4, .6)
    ], g: G({ bloom: 1.1, exp: 1.3, glow: .3, gx: .5, gy: .5 }) }
  };

  // Portrait phones: the same single ribbon, placed for a tall frame (copy sits top/middle).
  var TALL = {
    pre: WIDE.pre,
    hero: { r: band([[-0.3, 1.04], [.05, .93], [.35, .8], [.62, .65], [.9, .48], [1.35, .32]], .25, 1.2, { tw: 1.05, fr: .32, dp: .7, hu: .15 }),
      g: G({ bloom: .95, exp: 1.3, glow: .16, gx: .72, gy: .92 }) },
    why: { r: band([[-0.3, .88], [.0, .9], [.28, .88], [.56, .91], [.85, .93], [1.25, .95]], .22, .55, { tw: .45, fr: 1.2, sp: .5, dp: .5, hu: -.45 }),
      g: G({ flick: .85, bloom: .7, exp: 1.1, glow: .05, gx: .5, gy: 1.2, wind: .6 }) },
    path: { r: band([[-0.35, .93], [-.05, .93], [.2, .92], [.42, .94], [.66, 1.0], [1.0, 1.14]], .18, .7, { tw: .45, fr: .5, sp: .9, dp: .5, hu: -.1 }),
      g: G({ bloom: .95, exp: 1.25, wind: .6 }) },
    lanes: lanesKF([.3, .55, .8], true, G({ bloom: .85, exp: 1.2 })),
    warp: { r: band([[-0.3, .53], [.05, .52], [.35, .5], [.65, .51], [.95, .49], [1.3, .48]], .3, .6, { tw: .05, fr: .5, sp: 5, dp: .9, hu: .2 }),
      g: G({ warp: .5, bloom: .9, exp: 1.2, wind: .5 }) },
    inside: { r: band([[-0.3, .62], [.05, .68], [.35, .77], [.65, .85], [.95, .93], [1.3, 1.0]], .22, .6, { tw: .9, fr: .35, sp: .9, dp: .6, hu: .25 }),
      g: G({ bloom: .8, exp: 1.15, glow: .08, gx: .5, gy: 1.2 }) },
    proof: { fc: [.5, .5], r: band([[.04, 1.22], [.1, .64], [.24, .16], [.76, .16], [.9, .64], [.96, 1.22]], .12, .66, { tw: .9, fr: .28, sp: 1.1, dp: .5, hu: .22 }),
      g: G({ bloom: .85, exp: 1.15, glow: .06, gx: .5, gy: .55 }) },
    faq: { r: band([[-0.3, .9], [0, .74], [.3, .64], [.6, .7], [.95, .86], [1.3, .98]], .2, .55, { tw: .7, fr: .35, sp: .8, dp: .5, hu: .1 }),
      g: G({ bloom: .78, exp: 1.12 }) },
    cta: { fc: [.5, .6], r: band([[-0.3, .94], [0, .84], [.3, .76], [.7, .76], [1.0, .84], [1.3, .94]], .2, 1.1, { tw: .55, fr: .3, sp: .9, dp: .7, hu: .55 }),
      g: G({ bloom: 1.1, exp: 1.35, glow: .55, gx: .5, gy: .9 }) },
    popup: { r: [
      R([[-0.3, .9], [0, .75], [.35, .58], [.65, .44], [1.0, .28], [1.3, .12]], .16, 1.3, .9, .3, 1.2, 0, .7, .35),
      R([[-0.3, .15], [0, .3], [.4, .45], [.6, .55], [1.0, .7], [1.3, .85]], .08, .9, .45, .35, 1, 1.5, .5, -.3),
      R([[.25, 1.2], [.38, .85], [.48, .55], [.52, .45], [.62, .15], [.75, -.2]], .04, .5, .3, .3, 1.4, 2.5, .4, .6)
    ], g: G({ bloom: 1.1, exp: 1.3, glow: .3, gx: .5, gy: .5 }) }
  };


  /* ───────────────────────── shaders ───────────────────────── */
  var VS_STRAND = [
    'precision highp float;',
    'attribute vec2 a_v;', // t, side
    'attribute vec4 a_s;', // offset o, seed, rank, ribbon (9 = ignition thread)
    'uniform vec2 u_p[18];',
    'uniform vec4 u_ra[3];', // w, twist, bright, fray
    'uniform vec4 u_rb[3];', // flow clock, phase, depth, hue
    'uniform float u_aspect, u_px, u_time, u_twc, u_vel, u_flick, u_ign, u_draw, u_thr, u_warp, u_lw, u_wind;',
    'uniform vec3 u_ptr;',
    'uniform vec2 u_tp[8];', // takeoff path (stage 02): entry, origin, 4 milestones, top, beyond
    'uniform vec4 u_tk;',    // x: condense mix, y: drawn extent (path param of the tip), z: half-width, w: plume
    'uniform vec4 u_tk2;',   // x: tip glow, y: gain, z: fray, w: unused
    'varying vec3 v_col;',
    'varying float v_side;',
    'vec2 cr(vec2 a, vec2 b, vec2 c, vec2 d, float u){float u2=u*u,u3=u2*u;return .5*((2.*b)+(-a+c)*u+(2.*a-5.*b+4.*c-d)*u2+(-a+3.*b-3.*c+d)*u3);}',
    'vec2 crd(vec2 a, vec2 b, vec2 c, vec2 d, float u){return .5*((-a+c)+2.*(2.*a-5.*b+4.*c-d)*u+3.*(-a+3.*b-3.*c+d)*u*u);}',
    'void path(int k, float t, out vec2 C, out vec2 T){',
    '  float f=clamp(t,0.,1.)*5.; float sf=min(floor(f),4.); float u=f-sf; int s=int(sf); int b=k*6;',
    '  vec2 p1=u_p[b+s]; vec2 p2=u_p[b+s+1];',
    '  int i0=s==0?b:b+s-1; int i3=s==4?b+5:b+s+2;',
    '  vec2 p0=s==0?2.*p1-p2:u_p[i0]; vec2 p3=s==4?2.*p2-p1:u_p[i3];',
    '  C=cr(p0,p1,p2,p3,u); T=crd(p0,p1,p2,p3,u);',
    '}',
    'float h1(float n){return fract(sin(n*91.345)*47453.5453);}',
    'vec2 tpath(float s, out vec2 T){',
    '  float f=clamp(s,0.,1.)*7.; float sf=min(floor(f),6.); float u=f-sf; int i=int(sf);',
    '  int i0=i==0?0:i-1; int i3=i==6?7:i+2;',
    '  vec2 p1=u_tp[i]; vec2 p2=u_tp[i+1];',
    '  vec2 p0=i==0?2.*p1-p2:u_tp[i0]; vec2 p3=i==6?2.*p2-p1:u_tp[i3];',
    '  T=crd(p0,p1,p2,p3,u); return cr(p0,p1,p2,p3,u);',
    '}',
    // one strand of the condensed bundle: rides the takeoff path from the entry up to the tip
    'vec2 tstrand(float t, out float pl){',
    '  float s=t*u_tk.y; vec2 T; vec2 C=tpath(s,T); T=normalize(T+vec2(1e-6)); vec2 N=vec2(-T.y,T.x);',
    '  float d=(1.-t)*u_tk.y;',
    // exhaust: the bundle opens into a cone right behind the nozzle and closes again down the trail
    '  pl=u_tk.w*(1.-exp(-d/.007))*exp(-d/.05)*12.;',
    '  float w=u_tk.z*(1.+pl);',
    '  float sd=a_s.y;',
    '  float tw=mix(.55+.45*cos(s*34.+u_time*.9+sd*6.2831),1.,min(pl*.3,1.));',
    '  float n=sin(s*60.+sd*41.+u_time*1.3)*.5+sin(s*130.-sd*23.+u_time*2.1)*.3+sin(s*23.+sd*7.-u_time*.7)*.2;',
    '  float fl=sin(sd*29.+u_time*(7.+sd*5.))*.5+sin(sd*13.-u_time*11.)*.3;',
    '  return C+N*(a_s.x*w*tw+n*u_tk.z*u_tk2.z*(1.+pl*.4)+fl*u_tk.z*pl*.35);',
    '}',
    // returns position; z (depth) and fold via out params
    'vec2 strand(int k, float t, vec4 ra, vec4 rb, bool thr, out float z, out float fold){',
    '  vec2 C,T; path(k,t,C,T);',
    '  T=normalize(T+vec2(1e-6)); vec2 N=vec2(-T.y,T.x);',
    '  float o=thr?0.:a_s.x; float sd=a_s.y;',
    '  float w=ra.x*(.78+.22*sin(t*4.1+u_time*.21+float(k)*1.7));',
    '  float th=ra.y*6.2831*t+rb.y+u_twc*(k==1?-1.:1.)+(sd-.5)*.5*ra.w;',
    '  float c=cos(th), sn=sin(th);',
    '  float n=sin(t*6.3+sd*41.+u_time*.33)*.5+sin(t*12.7-sd*23.+u_time*.27)*.3+sin(t*23.1+sd*11.+u_time*.61)*.2;',
    '  float off=o*w*c + n*ra.w*w*.55 + sin(t*3.0+u_time*.17*u_wind+float(k))*.02;',
    '  z=o*w*sn*rb.z + (sd-.5)*.25*rb.z; fold=abs(c);',
    '  vec2 P=C+N*off/(1.+max(z,-.6)*.55);',
    '  vec2 d=P-u_ptr.xy; float f=exp(-dot(d,d)/.05)*u_ptr.z;',
    '  P+=N*sign(dot(d,N)+1e-4)*f*.075*(.5+sd);',
    '  P.y+=u_vel*(.04+.22*sd)*(.6+.4*sin(t*3.1416));',
    '  return P;',
    '}',
    // ribbon strand, condensed-bundle strand, or a per-strand staggered blend of both
    'vec2 pos(int k, float t, vec4 ra, vec4 rb, bool thr, float mm, out float z, out float fold, out float pl){',
    '  vec2 R=vec2(0.); z=0.; fold=1.; pl=0.;',
    '  if(mm<.999) R=strand(k,t,ra,rb,thr,z,fold);',
    '  if(mm>.001){ vec2 K=tstrand(t,pl); R=mix(R,K,mm); z=mix(z,(a_s.y-.5)*.12,mm); fold=mix(fold,1.,mm); }',
    '  return R;',
    '}',
    'void main(){',
    '  bool thr=a_s.w>8.5; int k=thr?0:int(a_s.w+.01);',
    '  vec4 ra=k==0?u_ra[0]:(k==1?u_ra[1]:u_ra[2]);',
    '  vec4 rb=k==0?u_rb[0]:(k==1?u_rb[1]:u_rb[2]);',
    '  float t=a_v.x; float z,fold,z2,fold2,pl,pl2;',
    '  float mm=thr?0.:smoothstep(a_s.y*.5,a_s.y*.5+.5,u_tk.x);',
    '  vec2 P=pos(k,t,ra,rb,thr,mm,z,fold,pl);',
    '  vec2 Q=pos(k,t+.004,ra,rb,thr,mm,z2,fold2,pl2);',
    '  vec2 Tn=normalize(Q-P+vec2(1e-6)); vec2 Ns=vec2(-Tn.y,Tn.x);',
    '  float sd=a_s.y, rank=a_s.z, o=thr?0.:a_s.x;',
    '  float near=clamp(.5-z*1.2,0.,1.);',
    '  float hw=u_lw*(.75+1.1*near)*(thr?2.2:1.)*(1.+u_warp*.25);',
    '  P+=Ns*a_v.y*hw*u_px;',
    '  gl_Position=vec4(P.x/u_aspect,P.y,0.,1.);',
    '  v_side=a_v.y;',
    // brightness
    '  float edge=smoothstep(0.,.1,t)*smoothstep(1.,.9,t);',
    '  float sb=thr?3.:(.16+1.9*pow(rank,7.));',
    '  float core=1.-.5*o*o;',
    '  float ph=fract(t*mix(1.6,.55,u_warp)-rb.x*(.55+.9*sd)+sd*9.);',
    '  float pk=exp(-pow((ph-.5)*mix(7.,2.2,u_warp),2.));',
    '  float pulse=mix(.42,1.25,pk);',
    '  float depthF=mix(.45,1.15,near);',
    '  float fl=1.;',
    '  if(u_flick>0.){',
    '    float blink=step(u_flick*.62,h1(floor(u_time*7.+sd*17.)+sd*3.1));',
    '    float gap=step(u_flick*.45,h1(floor(t*26.+sd*50.)+floor(u_time*2.+sd*5.)));',
    '    fl=mix(1.,blink*gap,u_flick);',
    '  }',
    '  float vis=thr?u_thr*step(t,u_draw)*(1.+6.*exp(-pow((u_draw-t)*60.,2.))):clamp((u_ign*1.25-sd)*7.,0.,1.);',
    '  float I=edge*sb*core*pulse*depthF*fl*vis*ra.z*(1.+.35*(1.-fold));',
    '  I*=1.+u_warp*.5*pk;',
    '  if(mm>.001){',
    '    float tip=exp(-pow((1.-t)*u_tk.y/.011,2.));',
    '    float sbT=(.35+1.7*pow(rank,5.))*(1.-.4*o*o);',
    '    float nz=exp(-(1.-t)*u_tk.y/.005)*u_tk.w;',
    '    float IT=smoothstep(0.,.03,t)*sbT*mix(.55,1.3,pk)*(1.+u_tk2.x*tip+nz*2.5)/(1.+pl*.45)*u_tk2.y;',
    '    I=mix(I,IT,mm);',
    '  }',
    // colour: amber core → ember → garnet underside, rare bone highlights
    '  vec3 GAR=vec3(.42,.02,.035), EMB=vec3(1.,.16,.03), AMB=vec3(1.,.5,.13), BON=vec3(.95,.84,.72);',
    '  float hu=rb.w;',
    '  vec3 col=mix(AMB,EMB,smoothstep(.08,.6,abs(o)-hu*.25));',
    '  col=mix(col,GAR,smoothstep(.25,1.,o-hu*.45)*.92);',
    '  col=mix(col,BON,step(.975-hu*.03,rank)*.75);',
    '  col=mix(col,GAR,clamp(-hu,0.,1.)*.35*(1.-pk));',
    '  if(thr) col=mix(EMB,BON,.25);',
    '  if(mm>.001){',
    '    float ao=abs(o); float tip2=exp(-pow((1.-t)*u_tk.y/.02,2.));',
    '    vec3 ct=mix(mix(BON,AMB,.55),EMB,smoothstep(.05,.75,ao));',
    '    ct=mix(ct,GAR,smoothstep(.85,1.15,ao)*.55);',
    '    ct=mix(ct,mix(AMB,EMB,.35),min(pl*.35,1.)*.7);',
    '    ct=mix(ct,BON,tip2*.55);',
    '    col=mix(col,ct,mm);',
    '  }',
    '  v_col=col*I;',
    '}'
  ].join('\n');

  var FS_STRAND = [
    'precision mediump float;',
    'varying vec3 v_col; varying float v_side;',
    'uniform float u_gain;',
    'void main(){float a=1.-v_side*v_side; a*=a; gl_FragColor=vec4(v_col*a*u_gain,1.);}'
  ].join('\n');

  var VS_QUAD = 'attribute vec2 a_q; varying vec2 v_uv; void main(){v_uv=a_q*.5+.5; gl_Position=vec4(a_q,0.,1.);}';

  var FS_DOWN = [
    'precision mediump float; varying vec2 v_uv; uniform sampler2D u_t; uniform vec2 u_hp; uniform float u_knee;',
    'void main(){',
    ' vec4 s=texture2D(u_t,v_uv)*4.+texture2D(u_t,v_uv-u_hp)+texture2D(u_t,v_uv+u_hp)+texture2D(u_t,v_uv+vec2(u_hp.x,-u_hp.y))+texture2D(u_t,v_uv-vec2(u_hp.x,-u_hp.y));',
    ' s/=8.;',
    ' if(u_knee>0.){float l=max(s.r,max(s.g,s.b)); s.rgb*=l/(l+u_knee);}',
    ' gl_FragColor=vec4(s.rgb,1.);',
    '}'
  ].join('\n');

  var FS_UP = [
    'precision mediump float; varying vec2 v_uv; uniform sampler2D u_t; uniform vec2 u_hp; uniform float u_k;',
    'void main(){ vec2 h=u_hp;',
    ' vec4 s=texture2D(u_t,v_uv+vec2(-h.x*2.,0.))+texture2D(u_t,v_uv+vec2(-h.x,h.y))*2.+texture2D(u_t,v_uv+vec2(0.,h.y*2.))+texture2D(u_t,v_uv+vec2(h.x,h.y))*2.',
    '  +texture2D(u_t,v_uv+vec2(h.x*2.,0.))+texture2D(u_t,v_uv+vec2(h.x,-h.y))*2.+texture2D(u_t,v_uv+vec2(0.,-h.y*2.))+texture2D(u_t,v_uv+vec2(-h.x,-h.y))*2.;',
    ' gl_FragColor=vec4(s.rgb/12.*u_k,1.);',
    '}'
  ].join('\n');

  var FS_COMP = [
    'precision highp float; varying vec2 v_uv;',
    'uniform sampler2D u_scene, u_bloom; uniform vec2 u_res;',
    'uniform float u_time, u_exp, u_bloomK, u_warp, u_vel, u_glow, u_scale, u_aspect, u_fade, u_grain;',
    'uniform vec2 u_glowPos;',
    'uniform vec4 u_scrim[4]; uniform vec4 u_sk;',
    'uniform vec4 u_node[4];',
    'uniform vec4 u_shim;',
    'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float sbox(vec2 p, vec2 b){vec2 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,q.y),0.);}',
    'void main(){',
    ' vec2 uv=v_uv; vec3 sc;',
    ' if(u_shim.w>.001){ vec2 dq=vec2((uv.x-u_shim.x)*u_aspect,uv.y-u_shim.y); float mk=exp(-dot(dq,dq)/(u_shim.z*u_shim.z));',
    '   uv+=u_shim.w*mk*vec2(sin(uv.y*170.+u_time*31.)+.5*sin(uv.y*73.-u_time*17.),cos(uv.x*150.+u_time*27.))*.0032; }',
    ' float wb=u_warp, vb=u_vel;',
    ' if(wb+abs(vb)>.004){',
    '   vec2 c=vec2(.5,.5); vec3 acc=vec3(0.); float tw=0.;',
    '   for(int i=0;i<10;i++){float f=float(i)/9.; float w=1.-f*.6;',
    '     vec2 o=(uv-c)*wb*.16*f+vec2(0.,vb*.07*f);',
    '     acc+=texture2D(u_scene,uv-o).rgb*w; tw+=w;}',
    '   sc=acc/tw;',
    ' } else sc=texture2D(u_scene,uv).rgb;',
    ' vec3 col=(sc+texture2D(u_bloom,uv).rgb*u_bloomK)*u_scale;',
    ' vec2 q=vec2((uv.x-.5)*u_aspect,uv.y-.5);',
    ' vec2 gp=vec2((u_glowPos.x-.5)*u_aspect,.5-u_glowPos.y);',
    ' float gd=length((q-gp)*vec2(.62,1.));',
    ' col+=vec3(1.,.22,.05)*u_glow*(exp(-gd*gd*2.6)*.9+exp(-gd*gd*14.)*.8);',
    ' col+=vec3(.16,.012,.01)*smoothstep(.2,-.6,q.y)*.5;',
    ' for(int i=0;i<4;i++){vec4 n=u_node[i]; if(n.z>0.){vec2 np=vec2((n.x-.5)*u_aspect,.5-n.y); float d=length(q-np);',
    '   col+=vec3(1.,.36,.1)*n.z*(exp(-d*d/(n.w*n.w))*.9+exp(-d*d/(n.w*n.w*.06))*1.6);}}',
    ' col=vec3(1.)-exp(-col*u_exp);',
    ' float sk=1.;',
    ' for(int i=0;i<4;i++){vec4 e=u_scrim[i]; float k=i==0?u_sk.x:(i==1?u_sk.y:(i==2?u_sk.z:u_sk.w)); if(k>0.){float dd=sbox(q-vec2((e.x-.5)*u_aspect,.5-e.y),vec2(e.z*u_aspect,e.w)); sk*=1.-k*(1.-smoothstep(-.015,.12,dd));}}',
    ' col*=sk;',
    ' vec3 ink=vec3(.0275);',
    ' col=col+ink*(1.-col);',
    ' float vg=smoothstep(1.25,.45,length(q*vec2(.85/max(u_aspect,1.),1.))*1.15);',
    ' col*=mix(.72,1.,vg);',
    ' float g=hash(gl_FragCoord.xy+fract(u_time*7.)*vec2(431.,177.))-.5;',
    ' col+=g*u_grain + (hash(gl_FragCoord.yx+3.1)-.5)/255.;',
    ' col=mix(ink,col,u_fade);',
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  /* ───────────────────────── utilities ───────────────────────── */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function damp(a, b, k, dt) { return lerp(a, b, 1 - Math.exp(-k * dt)); }
  function rnd(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function lerpKF(a, b, t) {
    if (t <= 0) return a; if (t >= 1) return b;
    var r = [], i, j;
    for (i = 0; i < 3; i++) {
      var ra = a.r[i], rb = b.r[i], p = [];
      for (j = 0; j < 6; j++) p.push([lerp(ra.p[j][0], rb.p[j][0], t), lerp(ra.p[j][1], rb.p[j][1], t)]);
      r.push({ p: p, w: lerp(ra.w, rb.w, t), tw: lerp(ra.tw, rb.tw, t), b: lerp(ra.b, rb.b, t), fr: lerp(ra.fr, rb.fr, t),
        sp: lerp(ra.sp, rb.sp, t), ph: lerp(ra.ph, rb.ph, t), dp: lerp(ra.dp, rb.dp, t), hu: lerp(ra.hu, rb.hu, t) });
    }
    var g = {};
    for (var k in a.g) g[k] = lerp(a.g[k], b.g[k], t);
    return { r: r, g: g };
  }

  /* ───────────────────────── engine ───────────────────────── */
  var gl, isGL2, ext, cvs, progs = {}, bufs = {}, tex = {}, fbos = [], seq = ['hero'], KF = WIDE;
  var W = 0, H = 0, cw = 0, ch = 0, dpr = 1, fmt = null;
  var NMAX = 1400, SEG = 150, nDraw = 0;
  var qLevel = 0, QL = [{ s: 1, n: 1 }, { s: .85, n: .78 }, { s: .72, n: .6 }, { s: .62, n: .45 }, { s: .52, n: .34 }];
  var reduce = false, running = false, ready = false, raf = 0, lastT = 0, t0 = 0;
  var st = {
    target: 0, cur: 0, prevCur: 0, vel: 0, svel: 0, energy: 0,
    ptr: [0, 0, 0], ptrT: [0, 0, 0], ptrSeen: false,
    ov: 0, ovT: 0, ign: 0, ignT: 0, draw: 0, drawT: 0, thr: 0, thrT: 0, pre: 1, preT: 1,
    fade: 0, flow: [0, 0, 0], twc: 0, time: 0, flickAmp: 1, flickNext: 0,
    scr: [], nodes: [], anchors: null, lanes: null, focus: {}, debugQ: null, frozen: false,
    // stage 02 takeoff: driven straight from scroll by the page (no extra damping, so DOM and light stay locked)
    tk: { m: 0, draw: .2, w: 4, plume: 0, tip: 0, gain: .03, fray: .35, flare: 0, exit: 0, shim: null, pts: null, dy: 0 }
  };
  var ft = { acc: 0, n: 0, slow: 0, fast: 0, failed: [] };

  // Compile + link without asking for the result, so the driver can work in parallel
  // (KHR_parallel_shader_compile) and the main thread never stalls on the first frame.
  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  function prog(vs, fs, attribs) {
    var p = gl.createProgram(), a = sh(gl.VERTEX_SHADER, vs), b = sh(gl.FRAGMENT_SHADER, fs);
    gl.attachShader(p, a); gl.attachShader(p, b);
    for (var i = 0; i < attribs.length; i++) gl.bindAttribLocation(p, i, attribs[i]);
    gl.linkProgram(p);
    return { p: p, u: null, s: [a, b] };
  }
  function finishProg(o) {
    if (!gl.getProgramParameter(o.p, gl.LINK_STATUS)) {
      var log = gl.getProgramInfoLog(o.p) || '';
      o.s.forEach(function (x) { if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) log += ' ' + gl.getShaderInfoLog(x); });
      throw new Error(log);
    }
    var u = {}, n = gl.getProgramParameter(o.p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(o.p, i), nm = info.name.replace(/\[0\]$/, ''); u[nm] = gl.getUniformLocation(o.p, nm); }
    o.u = u;
  }

  function pickFormat() {
    // Try HDR render targets, fall back to 8-bit (scaled) if not renderable.
    var cands = [];
    if (isGL2) {
      if (gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')) cands.push({ ifmt: gl.RGBA16F, fmt: gl.RGBA, type: gl.HALF_FLOAT, scale: 1 });
    } else {
      var hf = gl.getExtension('OES_texture_half_float'), hfl = gl.getExtension('OES_texture_half_float_linear');
      gl.getExtension('EXT_color_buffer_half_float');
      if (hf && hfl) cands.push({ ifmt: gl.RGBA, fmt: gl.RGBA, type: hf.HALF_FLOAT_OES, scale: 1 });
    }
    cands.push({ ifmt: gl.RGBA, fmt: gl.RGBA, type: gl.UNSIGNED_BYTE, scale: 4 });
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i], t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, c.ifmt, 4, 4, 0, c.fmt, c.type, null);
      var f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      var okc = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(f); gl.deleteTexture(t);
      if (okc) return c;
    }
    return null;
  }

  function target(w, h) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt.ifmt, w, h, 0, fmt.fmt, fmt.type, null);
    var f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t: t, f: f, w: w, h: h };
  }
  function freeTargets() { fbos.forEach(function (o) { gl.deleteTexture(o.t); gl.deleteFramebuffer(o.f); }); fbos = []; }

  function buildGeometry() {
    // template strip: (t, side) pairs
    var v = new Float32Array((SEG + 1) * 4);
    for (var i = 0; i <= SEG; i++) { var t = i / SEG; v[i * 4] = t; v[i * 4 + 1] = -1; v[i * 4 + 2] = t; v[i * 4 + 3] = 1; }
    bufs.tpl = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bufs.tpl); gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    // per-strand data; instance 0 is the ignition thread
    var r = rnd(20261105), s = new Float32Array((NMAX + 1) * 4);
    s[0] = 0; s[1] = .5; s[2] = 1; s[3] = 9;
    for (var k = 1; k <= NMAX; k++) {
      var u = r(), o;
      if (u < .68) o = ((r() + r() + r() + r()) / 4 - .5) * 2.6; else o = r() * 2 - 1;
      o = clamp(o, -1.15, 1.15);
      var rib = r(), ri = rib < .56 ? 0 : rib < .84 ? 1 : 2;
      s[k * 4] = o; s[k * 4 + 1] = r(); s[k * 4 + 2] = r(); s[k * 4 + 3] = ri;
    }
    bufs.inst = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bufs.inst); gl.bufferData(gl.ARRAY_BUFFER, s, gl.STATIC_DRAW);
    bufs.quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bufs.quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  }

  function divisor(loc, d) { if (isGL2) gl.vertexAttribDivisor(loc, d); else ext.vertexAttribDivisorANGLE(loc, d); }
  function drawInst(mode, first, count, inst) { if (isGL2) gl.drawArraysInstanced(mode, first, count, inst); else ext.drawArraysInstancedANGLE(mode, first, count, inst); }

  function resize(force) {
    var w = cvs.clientWidth || innerWidth, h = cvs.clientHeight || innerHeight;
    // ignore small height-only jitter (mobile URL bar) unless forced
    if (!force && w === cw && Math.abs(h - ch) < 140 && W) return;
    cw = w; ch = h;
    var q = QL[qLevel];
    var d = Math.min(window.devicePixelRatio || 1, A.maxDpr) * q.s;
    W = Math.max(2, Math.round(w * d)); H = Math.max(2, Math.round(h * d)); dpr = d;
    cvs.width = W; cvs.height = H;
    KF = (w / h) < 0.82 ? TALL : WIDE;
    freeTargets();
    fbos.push(target(W, H));
    var bw = W, bh = H;
    for (var i = 0; i < 5; i++) { bw = Math.max(1, bw >> 1); bh = Math.max(1, bh >> 1); fbos.push(target(bw, bh)); }
    nDraw = Math.round(A.strands * q.n);
  }

  function setQuality(l) {
    l = clamp(l, 0, QL.length - 1);
    if (l === qLevel) return; qLevel = l; resize(true);
  }

  function frameKF() {
    var n = seq.length, c = clamp(st.cur, 0, n - 1), i0 = Math.floor(c), f = c - i0;
    var a = kfFor(seq[i0]), b = kfFor(seq[Math.min(n - 1, i0 + 1)]);
    var k = lerpKF(a, b, f);
    if (st.ov > 0.001) k = lerpKF(k, KF.popup, st.ov);
    if (st.pre > 0.001) k = lerpKF(k, KF.pre, st.pre);
    return k;
  }
  function kfFor(name) {
    var k = KF[name] || KF.hero, tall = KF === TALL;
    if (k.fc && st.focus[name]) {
      // the band bends around a live DOM element (proof phone, CTA button); clamped so it never flings far off-screen
      // followed with ~half parallax: the light sits deeper than the page, so it drifts rather than scrolls
      var py = tall ? .25 : .36, fx = clamp((st.focus[name][0] - k.fc[0]) * .55, -.4, .4), fy = clamp((st.focus[name][1] - k.fc[1]) * py, -.45, .45), g2 = {};
      for (var gk in k.g) g2[gk] = k.g[gk];
      g2.gx += fx; g2.gy += fy;
      return { r: k.r.map(function (b) { return withP(b, b.p.map(function (q) { return [q[0] + fx, q[1] + fy]; })); }), g: g2 };
    }
    if (name === 'lanes' && st.lanes) {
      // wide: lanes sit behind the three cards; tall: the cards scroll past, so the lanes only lean towards them
      var D = [.3, .55, .8], L = st.lanes.map(function (q, n) { return tall ? D[n] : clamp(q[0], .12, .88); });
      return lanesKF(L, tall, k.g);
    }
    if (name === 'path' && st.tk.trail && st.tk.pts) {
      // after the launch the trail itself widens back into the band, right where the rocket went
      var T = st.tk.pts, dy = st.tk.dy * .5, u = function (q) { return [q[0] / cw, (q[1] + dy) / ch]; };
      var m4 = u(T[5]), tp = u(T[6]), sp = [
        [m4[0] - .07, 1.3], [m4[0] - .025, Math.min(1.02, m4[1] + .28)], m4, tp, [tp[0] + .005, tp[1] * .35], [tp[0] + .01, -.35]];
      if (!k._trail) k._trail = band(sp, tall ? .2 : .26, .7, { tw: .6, fr: .4, sp: 1.2, dp: .6, hu: .3 });
      var tb = k._trail.map(function (b, n) { return withP(b, n === 0 ? sp : offP(sp, (n === 1 ? .2 : -.17) * b.w / (n === 1 ? .55 : .32))); });
      return { r: tb, g: k.g };
    }
    return k;
  }
  function norm(x, y) { var l = Math.sqrt(x * x + y * y) || 1; return [x / l, y / l]; }
  function withP(b, p) { return { p: p, w: b.w, tw: b.tw, b: b.b, fr: b.fr, sp: b.sp, ph: b.ph, dp: b.dp, hu: b.hu }; }

  var U = { p: new Float32Array(36), ra: new Float32Array(12), rb: new Float32Array(12), scr: new Float32Array(16), node: new Float32Array(16), tp: new Float32Array(16) };

  function render(now) {
    var dt = Math.min(.5, Math.max(.001, (now - lastT) / 1000 || .016));
    lastT = now;
    if (!st.frozen) st.time += dt;
    var T = st.time;

    // dynamics
    st.prevCur = st.cur;
    // damped follow of the scroll-driven stage position: the ribbon glides after the page, never snaps
    st.cur = damp(st.cur, st.target, 2.1, dt);
    var sv = (st.cur - st.prevCur) / dt;
    // warp energy comes from scroll speed (a velocity effect ON the ribbon), not from moving between placements
    st.energy = damp(st.energy, clamp(Math.abs(st.svel) * .9 + Math.abs(sv) * .25, 0, 1), 6, dt);
    st.svel = damp(st.svel, st.vel, 8, dt); st.vel *= Math.exp(-dt * 5);
    st.ov = damp(st.ov, st.ovT, 3.4, dt);
    st.pre = damp(st.pre, st.preT, 2.1, dt);
    st.ign = damp(st.ign, st.ignT, 1.6, dt);
    st.draw = damp(st.draw, st.drawT, 3.2, dt);
    st.thr = damp(st.thr, st.thrT, 2.4, dt);
    st.fade = damp(st.fade, 1, 2.2, dt);
    for (var i = 0; i < 3; i++) st.ptr[i] = damp(st.ptr[i], st.ptrT[i], i === 2 ? 2.2 : 5, dt);
    st.ptrT[2] *= Math.exp(-dt * .9);

    var K = frameKF(), g = K.g; st.lastK = K;
    var asp = cw / ch;

    // control points (+ slow living wobble) → scene space
    for (i = 0; i < 3; i++) {
      var r = K.r[i];
      for (var j = 0; j < 6; j++) {
        var wob = .018 * g.wind;
        var u = r.p[j][0] + Math.sin(T * .23 + j * 1.9 + i * 2.3) * wob;
        var v = r.p[j][1] + Math.cos(T * .19 + j * 1.3 + i * 1.1) * wob;
        U.p[(i * 6 + j) * 2] = (u * 2 - 1) * asp;
        U.p[(i * 6 + j) * 2 + 1] = 1 - v * 2;
      }
      st.flow[i] += dt * r.sp * (.32 + st.energy * 1.4);
      U.ra[i * 4] = r.w * (1 + st.energy * .35); U.ra[i * 4 + 1] = r.tw; U.ra[i * 4 + 2] = r.b * (1 + st.energy * .5); U.ra[i * 4 + 3] = r.fr + st.energy * .4;
      U.rb[i * 4] = st.flow[i]; U.rb[i * 4 + 1] = r.ph; U.rb[i * 4 + 2] = r.dp; U.rb[i * 4 + 3] = r.hu;
    }
    st.twc += dt * .07 * (1 + st.energy * 2);

    // dying-neon global flicker
    var flick = g.flick * (1 - st.ov);
    if (flick > .02) {
      // dying neon, kept gentle: short shallow dips, never more than ~2 per second
      if (T > st.flickNext) {
        var dip = st.flickAmp === 1 ? Math.random() < .62 : Math.random() < .28; // a stutter now and then
        st.flickAmp = dip ? .2 + Math.random() * .32 : 1;
        st.flickNext = T + (dip ? .05 + Math.random() * .08 : .35 + Math.random() * 1.1);
      }
    } else st.flickAmp = 1;
    var gain = lerp(1, st.flickAmp, Math.min(1, flick * 1.1));

    // ── pass 1: strands → scene (additive)
    var sc = fbos[0];
    gl.bindFramebuffer(gl.FRAMEBUFFER, sc.f); gl.viewport(0, 0, sc.w, sc.h);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    var P = progs.strand; gl.useProgram(P.p);
    gl.uniform2fv(P.u.u_p, U.p); gl.uniform4fv(P.u.u_ra, U.ra); gl.uniform4fv(P.u.u_rb, U.rb);
    gl.uniform1f(P.u.u_aspect, asp); gl.uniform1f(P.u.u_px, 2 / H * (dpr)); gl.uniform1f(P.u.u_time, T); gl.uniform1f(P.u.u_twc, st.twc);
    gl.uniform1f(P.u.u_vel, clamp(st.svel, -1.2, 1.2) * .5); gl.uniform1f(P.u.u_flick, flick);
    gl.uniform1f(P.u.u_ign, st.ign); gl.uniform1f(P.u.u_draw, st.draw); gl.uniform1f(P.u.u_thr, st.thr);
    gl.uniform1f(P.u.u_warp, clamp(g.warp + st.energy * .45, 0, 1)); gl.uniform1f(P.u.u_lw, g.lw * A.lineW); gl.uniform1f(P.u.u_wind, g.wind);
    gl.uniform3f(P.u.u_ptr, (st.ptr[0] / cw * 2 - 1) * asp, 1 - st.ptr[1] / ch * 2, st.ptr[2]);
    gl.uniform1f(P.u.u_gain, gain * A.gain / fmt.scale * (fmt.scale > 1 ? 1 : 1));
    var TK = st.tk, tm = TK.pts ? clamp(TK.m, 0, 1) : 0;
    if (tm > 0) {
      for (i = 0; i < 8; i++) { U.tp[i * 2] = (TK.pts[i][0] / cw * 2 - 1) * asp; U.tp[i * 2 + 1] = 1 - (TK.pts[i][1] + TK.dy) / ch * 2; }
      gl.uniform2fv(P.u.u_tp, U.tp);
    }
    gl.uniform4f(P.u.u_tk, tm, clamp(TK.draw, .001, 1), TK.w * 2 / ch, TK.plume);
    // the whole strand population sits on one line: scale per-strand light so the sum stays a line, not a white-out
    gl.uniform4f(P.u.u_tk2, TK.tip, TK.gain * 1100 / Math.max(200, nDraw), TK.fray, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.tpl);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); divisor(0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.inst);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0); divisor(1, 1);
    drawInst(gl.TRIANGLE_STRIP, 0, (SEG + 1) * 2, 1 + nDraw);
    divisor(1, 0); gl.disableVertexAttribArray(1);

    // ── pass 2: bloom (dual Kawase)
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.quad); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.BLEND);
    var D = progs.down; gl.useProgram(D.p); gl.uniform1i(D.u.u_t, 0); gl.activeTexture(gl.TEXTURE0);
    for (i = 1; i < fbos.length; i++) {
      var src = fbos[i - 1], dst = fbos[i];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.f); gl.viewport(0, 0, dst.w, dst.h);
      gl.bindTexture(gl.TEXTURE_2D, src.t);
      gl.uniform2f(D.u.u_hp, .5 / src.w, .5 / src.h); gl.uniform1f(D.u.u_knee, i === 1 ? .08 / fmt.scale : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    var Up = progs.up; gl.useProgram(Up.p); gl.uniform1i(Up.u.u_t, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    for (i = fbos.length - 1; i > 1; i--) {
      var s2 = fbos[i], d2 = fbos[i - 1];
      gl.bindFramebuffer(gl.FRAMEBUFFER, d2.f); gl.viewport(0, 0, d2.w, d2.h);
      gl.bindTexture(gl.TEXTURE_2D, s2.t);
      gl.uniform2f(Up.u.u_hp, .5 / s2.w, .5 / s2.h); gl.uniform1f(Up.u.u_k, 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    gl.disable(gl.BLEND);

    // ── pass 3: composite
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
    var C = progs.comp; gl.useProgram(C.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fbos[0].t); gl.uniform1i(C.u.u_scene, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fbos[1].t); gl.uniform1i(C.u.u_bloom, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform2f(C.u.u_res, W, H); gl.uniform1f(C.u.u_time, T); gl.uniform1f(C.u.u_aspect, asp);
    var calm = 1 - .88 * tm, fl = TK.flare * tm;
    gl.uniform1f(C.u.u_exp, g.exp * A.exposure * (1 + fl * .18)); gl.uniform1f(C.u.u_bloomK, g.bloom * .55 * (1 + st.energy * .6) * (1 + fl * 1.6));
    gl.uniform1f(C.u.u_warp, reduce ? 0 : clamp(g.warp * .35 + st.energy * .5, 0, .9) * calm);
    gl.uniform1f(C.u.u_vel, reduce ? 0 : clamp(st.svel, -1, 1) * .55 * calm);
    var sh = TK.shim && tm > 0 && !reduce ? TK.shim : null;
    gl.uniform4f(C.u.u_shim, sh ? sh[0] / cw : 0, sh ? 1 - (sh[1] + TK.dy) / ch : 0, sh ? sh[2] / ch : .1, sh ? sh[3] : 0);
    gl.uniform1f(C.u.u_glow, g.glow * (1 + st.ov * .3)); gl.uniform2f(C.u.u_glowPos, g.gx, g.gy);
    gl.uniform1f(C.u.u_scale, fmt.scale); gl.uniform1f(C.u.u_fade, st.fade); gl.uniform1f(C.u.u_grain, A.grain);
    for (i = 0; i < 4; i++) {
      var e = st.scr[i];
      U.scr[i * 4] = e ? e[0] : 0; U.scr[i * 4 + 1] = e ? e[1] : 0; U.scr[i * 4 + 2] = e ? e[2] : 0; U.scr[i * 4 + 3] = e ? e[3] : 0;
    }
    gl.uniform4fv(C.u.u_scrim, U.scr);
    gl.uniform4f(C.u.u_sk, st.scr[0] ? st.scr[0][4] : 0, st.scr[1] ? st.scr[1][4] : 0, st.scr[2] ? st.scr[2][4] : 0, st.scr[3] ? st.scr[3][4] : 0);
    for (i = 0; i < 4; i++) {
      var nd = st.nodes[i];
      U.node[i * 4] = nd ? nd[0] : 0; U.node[i * 4 + 1] = nd ? nd[1] : 0; U.node[i * 4 + 2] = nd ? nd[2] * (1 - st.ov) : 0; U.node[i * 4 + 3] = nd ? nd[3] : .1;
    }
    gl.uniform4fv(C.u.u_node, U.node);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function loop(now) {
    raf = 0;
    if (!running) return;
    var dtms = now - (loop.prev || now); loop.prev = now;
    render(now);
    // adaptive quality from measured frame interval (60 Hz budget; 120 Hz panels just look "fast").
    // Very slow → drop two tiers at once; slow twice in a row → drop one; a tier that was too slow
    // is never re-entered (no hitchy up/down oscillation); ~5 s of headroom → try one tier up.
    if (dtms > 0 && dtms < 250 && st.debugQ === null) {
      ft.acc += dtms; ft.n++;
      if (ft.n >= 40) {
        var avg = ft.acc / ft.n; ft.acc = 0; ft.n = 0;
        if (avg > 40) { ft.failed[qLevel] = true; setQuality(qLevel + 2); ft.slow = ft.fast = 0; }
        else if (avg > 23) { ft.fast = 0; if (++ft.slow >= 2) { ft.failed[qLevel] = true; setQuality(qLevel + 1); ft.slow = 0; } }
        else if (avg < 17.4) { ft.slow = 0; if (++ft.fast >= 7 && qLevel > A.minLevel && !ft.failed[qLevel - 1]) { setQuality(qLevel - 1); ft.fast = 0; } }
        else { ft.slow = 0; ft.fast = 0; }
      }
    } else if (dtms >= 250) { ft.acc = 0; ft.n = 0; } // tab switch / hitch: don't count it
    raf = requestAnimationFrame(loop);
  }

  function startLoop() { if (running || reduce || st.held || document.hidden || !ready) return; running = true; lastT = performance.now(); loop.prev = 0; ft.acc = 0; ft.n = 0; raf = requestAnimationFrame(loop); }
  function stopLoop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  /* ───────────────────────── public API ───────────────────────── */
  A.strands = 1100; A.maxDpr = 1.5; A.lineW = 1; A.gain = 1; A.exposure = 1; A.grain = .028; A.minLevel = 0;

  A.start = function (canvas, opts) {
    opts = opts || {};
    cvs = canvas;
    var attrs = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserve };
    try {
      gl = canvas.getContext('webgl2', attrs); isGL2 = !!gl;
      if (!gl) { gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs); ext = gl && gl.getExtension('ANGLE_instanced_arrays'); if (!ext) return false; }
      if (!gl) return false;
      fmt = pickFormat(); if (!fmt) return false;
      progs.strand = prog(VS_STRAND, FS_STRAND, ['a_v', 'a_s']);
      progs.down = prog(VS_QUAD, FS_DOWN, ['a_q']);
      progs.up = prog(VS_QUAD, FS_UP, ['a_q']);
      progs.comp = prog(VS_QUAD, FS_COMP, ['a_q']);
    } catch (e) { if (window.console) console.warn('aurora:', e.message); return false; }

    var coarse = matchMedia('(pointer:coarse)').matches, small = Math.min(screen.width, screen.height) < 700;
    var mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8;
    var mobile = coarse && small;
    var weak = mem <= 3 || cores <= 4;
    A.strands = opts.strands || (mobile ? (weak ? 380 : 560) : 1100);
    NMAX = Math.max(A.strands, 1100);
    SEG = mobile ? 110 : 150;
    A.maxDpr = 1.5;
    // phones start one tier down (DPR 1.5 × .85 ≈ 1.28) and earn the top tier only if frames allow
    if (mobile && opts.quality == null) qLevel = weak ? 2 : 1;
    A.lineW = mobile ? 1.05 : 1;
    A.gain = mobile ? 1.35 : 1;
    reduce = !!opts.reduce;
    if (opts.quality != null) { st.debugQ = opts.quality; qLevel = opts.quality; }
    if (opts.time != null) { st.time = opts.time; st.frozen = !!opts.freeze; }
    if (opts.sequence) seq = opts.sequence;

    buildGeometry();
    resize(true);
    window.addEventListener('resize', function () { resize(false); if (reduce) A.still(); }, { passive: true });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stopLoop(); else if (!reduce) startLoop(); });
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stopLoop(); A.ok = false; document.documentElement.classList.add('no-gl'); }, false);
    A.ok = true;
    if (reduce) { st.pre = st.preT = 0; st.ign = st.ignT = 1; st.thr = 0; st.fade = 1; }
    // wait for the (parallel) shader compile instead of blocking the main thread on it
    var all = [progs.strand, progs.down, progs.up, progs.comp], par = gl.getExtension('KHR_parallel_shader_compile');
    var go = function () {
      try { all.forEach(finishProg); } catch (e) { if (window.console) console.warn('aurora:', e.message); A.ok = false; document.documentElement.classList.add('no-gl'); return; }
      ready = true;
      if (reduce) A.still(); else startLoop();
    };
    if (par) (function poll() { if (all.every(function (o) { return gl.getProgramParameter(o.p, par.COMPLETION_STATUS_KHR); })) go(); else setTimeout(poll, 20); })();
    else go();
    return true;
  };

  A.sequence = function (names) { seq = names.slice(); };
  A.index = function (name) { return seq.indexOf(name); };
  A.stage = function (s) { st.target = s; };
  A.jump = function (s) { st.target = st.cur = st.prevCur = s; };
  A.velocity = function (v) { st.vel = clamp(v, -2, 2); };
  A.pointer = function (x, y) { st.ptrT[0] = x; st.ptrT[1] = y; if (!st.ptrSeen) { st.ptr[0] = x; st.ptr[1] = y; st.ptrSeen = true; } st.ptrT[2] = Math.min(1, st.ptrT[2] + .25); };
  A.overlay = function (on) { st.ovT = on ? 1 : 0; };
  // stage 02 "graph into rocket": pts = 8 control points in client px (entry, origin, 4 milestones, top, beyond),
  // m = condense mix, draw = drawn extent along the path (0..1), plume/flare/shim = launch effects, dy = scene offset
  A.takeoff = function (o) { var k; for (k in o) st.tk[k] = o[k]; };
  // hold: the page covers the canvas (e.g. the full-screen menu) — stop drawing until released
  A.hold = function (on) { st.held = !!on; if (on) stopLoop(); else if (A.ok && !reduce) startLoop(); };
  A.scrims = function (list) {
    // list: [cx, cy, rx, ry, k] in client px → normalised
    st.scr = (list || []).slice(0, 4).map(function (e) { return [e[0] / cw, e[1] / ch, e[2] / cw, e[3] / ch, e[4]]; });
  };
  A.nodes = function (list) { st.nodes = (list || []).slice(0, 4).map(function (n) { return [n[0] / cw, n[1] / ch, n[2], (n[3] || 40) / ch]; }); };
  A.focus = function (name, x, y) { st.focus[name] = [x / cw, y / ch]; };
  A.lanes = function (pts) { st.lanes = pts && pts.length === 3 ? pts.map(function (p) { return [p[0] / cw, p[1] / ch]; }) : null; };
  A.anchors = function (pts) { st.anchors = pts && pts.length >= 4 ? pts.map(function (p) { return [p[0] / cw, p[1] / ch]; }) : null; };
  // preloader choreography
  A.thread = function () { st.preT = 1; st.pre = 1; st.thrT = 1; st.thr = 1; st.drawT = 1.02; };
  A.ignite = function (quick) {
    if (quick) { st.pre = st.preT = 0; st.ign = st.ignT = 1; st.thr = st.thrT = 0; st.draw = 1; st.fade = 0; return; }
    st.preT = 0; st.ignT = 1; st.thrT = 0;
  };
  A.still = function () {
    if (!A.ok || !ready) return;
    st.cur = st.target; st.pre = 0; st.ign = 1; st.thr = 0; st.fade = 1; st.ov = st.ovT;
    var keep = st.time; st.time = 12.0; render(performance.now()); st.time = keep;
  };
  // QA probe: the visible centre of the light in viewport units (0..1). settled=true evaluates the
  // placement the ribbon is heading to (st.target) instead of the damped current one.
  function crPt(P, t) {
    var f = clamp(t, 0, 1) * 5, s = Math.min(Math.floor(f), 4), u = f - s, p1 = P[s], p2 = P[s + 1];
    var p0 = s === 0 ? [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]] : P[s - 1], p3 = s === 4 ? [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]] : P[s + 2], o = [];
    for (var k = 0; k < 2; k++) o[k] = .5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u * u * u);
    return o;
  }
  function edgeW(v) { var a = clamp((v + .06) / .12, 0, 1), b = clamp((1.06 - v) / .12, 0, 1); return a * a * (3 - 2 * a) * b * b * (3 - 2 * b); }
  function visMean(pts) {
    var sx = 0, sy = 0, n = 0;
    pts.forEach(function (q) { var w = edgeW(q[0]) * edgeW(q[1]); sx += q[0] * w; sy += q[1] * w; n += w; });
    return n > .5 ? [sx / n, sy / n, n] : null;
  }
  A.centre = function (settled) {
    if (!A.ok) return null;
    var keep = st.cur; if (settled) st.cur = st.target;
    var K = frameKF(); st.cur = keep;
    var acc = [0, 0], wsum = 0;
    for (var i = 0; i < 3; i++) {
      var r = K.r[i], pts = [];
      for (var q = 0; q <= 48; q++) pts.push(crPt(r.p, q / 48));
      var mean = visMean(pts), wt = r.b * [.56, .28, .16][i];
      if (mean) { acc[0] += mean[0] * wt; acc[1] += mean[1] * wt; wsum += wt; }
    }
    var rib = wsum ? [acc[0] / wsum, acc[1] / wsum] : [.5, .5], TK = st.tk, m = TK.pts ? clamp(TK.m, 0, 1) : 0;
    if (m > .001) {
      var tp = [];
      for (q = 0; q <= 80; q++) {
        var sP = q / 80 * TK.draw, f = sP * 7, si = Math.min(Math.floor(f), 6), uu = f - si, P = TK.pts;
        var a = P[Math.max(0, si - 1)], b = P[si], c = P[si + 1], d2 = P[Math.min(7, si + 2)];
        var x = .5 * (2 * b[0] + (-a[0] + c[0]) * uu + (2 * a[0] - 5 * b[0] + 4 * c[0] - d2[0]) * uu * uu + (-a[0] + 3 * b[0] - 3 * c[0] + d2[0]) * uu * uu * uu);
        var y = .5 * (2 * b[1] + (-a[1] + c[1]) * uu + (2 * a[1] - 5 * b[1] + 4 * c[1] - d2[1]) * uu * uu + (-a[1] + 3 * b[1] - 3 * c[1] + d2[1]) * uu * uu * uu);
        tp.push([x / cw, (y + TK.dy) / ch]);
      }
      var tm = visMean(tp);
      if (tm) rib = [rib[0] + (tm[0] - rib[0]) * m, rib[1] + (tm[1] - rib[1]) * m];
    }
    return { x: rib[0], y: rib[1], cur: st.cur, target: st.target, m: m };
  };
  A.debug = function () { return { q: qLevel, n: nDraw, W: W, H: H, fmt: fmt && fmt.scale, gl2: isGL2, cur: st.cur, target: st.target, anchors: st.anchors, lanes: st.lanes, ov: st.ov, pre: st.pre, ign: st.ign, seq: seq }; };
})();
