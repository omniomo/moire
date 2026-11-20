<script lang="ts">
  import { onMount } from 'svelte';

  // Soft pastel field: base, blue, pink, peach (linear sRGB 0..1)
  let { colors = ['#eef1f8', '#bcd3ff', '#f3cfe6', '#ffe0c2'] }: { colors?: string[] } = $props();

  let canvas: HTMLCanvasElement | undefined = $state();
  let failed = $state(false);

  const VERT = `
    attribute vec2 p;
    void main() { gl_Position = vec4(p, 0.0, 1.0); }
  `;

  // 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT) + domain warping
  const FRAG = `
    precision mediump float;
    uniform vec2 u_res;
    uniform float u_time;
    uniform vec3 u_c0;
    uniform vec3 u_c1;
    uniform vec3 u_c2;
    uniform vec3 u_c3;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
        i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
        i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 p = uv;
      p.x *= u_res.x / u_res.y;
      float t = u_time * 0.035;

      // domain warp for slow, liquid colour fields
      vec2 q = p + 0.45 * vec2(snoise(vec3(p * 0.9, t)), snoise(vec3(p * 0.9 + 5.2, t + 3.7)));
      float a = smoothstep(-0.55, 0.75, snoise(vec3(q * 0.75, t * 1.2)));
      float b = smoothstep(-0.35, 0.85, snoise(vec3(q * 0.8 + 9.1, t * 0.9)));
      float c = smoothstep(0.0, 0.9, snoise(vec3(q * 0.6 - 4.3, t * 0.7)));

      vec3 col = u_c0;
      col = mix(col, u_c1, a * 0.85);
      col = mix(col, u_c2, b * 0.7);
      col = mix(col, u_c3, c * 0.6);

      // fade towards the base colour lower on the page so text areas stay calm
      col = mix(col, u_c0, smoothstep(0.55, -0.15, uv.y) * 0.45);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.replace('#', ''), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  onMount(() => {
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl) {
      failed = true;
      return;
    }

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      failed = true;
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_res');
    const uTime = gl.getUniformLocation(program, 'u_time');
    colors.slice(0, 4).forEach((hex, i) => gl.uniform3fv(gl.getUniformLocation(program, `u_c${i}`), hexToRgb(hex)));

    // The field is soft, so render it at a fraction of the screen resolution
    const SCALE = 0.35;
    const resize = () => {
      const w = Math.max(1, Math.round(window.innerWidth * SCALE));
      const h = Math.max(1, Math.round(window.innerHeight * SCALE));
      canvas!.width = w;
      canvas!.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now() - 40_000;
    let frame = 0;
    let last = 0;

    const draw = (now: number) => {
      // ~30fps is plenty for something this slow
      if (now - last >= 33) {
        last = now;
        gl.uniform1f(uTime, (now - start) / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      if (!reduceMotion && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) frame = requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', onVisibility);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  });
</script>

<div class="field" class:fallback={failed} aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
  <div class="grain"></div>
</div>

<style>
  .field {
    position: fixed;
    inset: 0;
    z-index: -10;
    pointer-events: none;
    /* static fallback (and first paint before WebGL starts) */
    background:
      radial-gradient(60% 50% at 15% 10%, #bcd3ff 0%, transparent 70%),
      radial-gradient(50% 45% at 85% 15%, #f3cfe6 0%, transparent 70%),
      radial-gradient(55% 50% at 70% 70%, #ffe0c2 0%, transparent 70%),
      #eef1f8;
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .fallback canvas {
    display: none;
  }

  .grain {
    position: absolute;
    inset: 0;
    opacity: 0.06;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  @media print {
    .field {
      display: none;
    }
  }
</style>
