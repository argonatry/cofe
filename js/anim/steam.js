// Пар в hero: один фрагментный шейдер на «голом» WebGL (без three.js — ради веса).
// Если WebGL недоступен, остаётся CSS-градиент из sections.css.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(uv.x * uRes.x / uRes.y, uv.y);
  float t = uTime * 0.05;
  vec2 m = (uMouse - 0.5) * 0.35;

  // Двойное искажение координат даёт клубы, которые тянутся вверх
  vec2 q = vec2(fbm(p * 1.5 + vec2(0.0, -t * 1.6)),
                fbm(p * 1.5 + vec2(5.2, -t * 1.2)));
  float n = fbm(p * vec2(2.4, 1.2) + q * 1.6 + vec2(m.x, -t * 2.6 + m.y));

  float wisps = smoothstep(0.36, 0.82, n);
  float rise = smoothstep(1.1, 0.0, uv.y);          // у дна пар гуще
  float a = wisps * (0.18 + 0.82 * rise);

  vec3 ink = vec3(0.055, 0.110, 0.141);
  vec3 river = vec3(0.090, 0.192, 0.247);
  vec3 steam = vec3(0.875, 0.902, 0.910);
  vec3 crema = vec3(0.922, 0.769, 0.541);

  vec3 col = mix(river, ink, smoothstep(0.0, 1.0, uv.y + (q.x - 0.5) * 0.3));
  col = mix(col, steam, a * 0.5);
  col += crema * 0.05 * rise * q.y;                  // тёплый отсвет снизу
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(info || 'shader error');
  }
  return sh;
}

export function initSteam({ animate = true, lowRes = false } = {}) {
  const canvas = document.querySelector('.hero__steam');
  if (!canvas) return null;

  let gl;
  try {
    gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return null;

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uMouse = gl.getUniformLocation(prog, 'uMouse');

    // Пар размытый по природе — рендерим в пониженном разрешении, CSS растягивает.
    const scale = lowRes ? 0.35 : 0.5;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let raf = 0;
    let visible = true;
    const t0 = performance.now();

    const resize = () => {
      const w = Math.max(2, Math.round(canvas.clientWidth * scale));
      const h = Math.max(2, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const draw = (time) => {
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now) => {
      draw((now - t0) / 1000 + 20);
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    canvas.classList.add('is-on');

    if (!animate) {
      // Reduced motion: один статичный кадр.
      draw(20);
      const onResize = () => draw(20);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    const onMove = (e) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    const onVis = () => (document.hidden ? stop() : start());
    // Вне экрана шейдер не считаем.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    start();

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  } catch (err) {
    console.warn('Пар: WebGL недоступен, остаётся статичный фон.', err);
    canvas.classList.remove('is-on');
    return null;
  }
}
