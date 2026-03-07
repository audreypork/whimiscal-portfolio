import { useEffect, useRef } from 'react';

interface ShaderBackgroundProps {
  isActive?: boolean;
}

const VS_SOURCE = `
  attribute vec4 aVertexPosition;
  void main() { gl_Position = aVertexPosition; }
`;

const FS_SOURCE = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_isActive;

  const vec3 bg_color = vec3(1.0, 1.0, 1.0);
  const vec3 dot_color1 = vec3(0.831, 0.980, 0.439);
  const vec3 dot_color2 = vec3(0.706, 0.902, 0.255);

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    float gridDensity = 80.0;
    vec2 grid_st = fract(st * gridDensity);
    vec2 grid_id = floor(st * gridDensity);
    vec2 noise_pos = grid_id / gridDensity;
    float speed = mix(0.1, 1.2, u_isActive);
    float noise_val = snoise(noise_pos * 3.5 + u_time * speed);
    float wave = sin(noise_val * 8.0 - u_time * 1.5);
    float size = smoothstep(-1.0, 1.0, wave) * 0.75;
    vec2 bl = step(vec2(0.5 - size/2.0), grid_st);
    vec2 tr = step(vec2(0.5 - size/2.0), 1.0 - grid_st);
    float is_dot = bl.x * bl.y * tr.x * tr.y;
    vec3 final_color = bg_color;
    if (is_dot > 0.0) {
      float color_mix = snoise(noise_pos * 4.0 - u_time * 0.8) * 0.5 + 0.5;
      final_color = mix(dot_color1, dot_color2, color_mix);
    }
    gl_FragColor = vec4(final_color, 1.0);
  }
`;

function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export default function ShaderBackground({ isActive = false }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isActiveRef = useRef(isActive);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false });
    if (!gl) return;

    const vs = loadShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
    const fs = loadShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    const vertexLoc = gl.getAttribLocation(program, 'aVertexPosition');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const activeLoc = gl.getUniformLocation(program, 'u_isActive');

    const positions = [1, 1, -1, 1, 1, -1, -1, -1];
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const startTime = Date.now();
    let activeVal = 0;
    let targetActive = 0;

    function render() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.useProgram(program);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
      gl!.vertexAttribPointer(vertexLoc, 2, gl!.FLOAT, false, 0, 0);
      gl!.enableVertexAttribArray(vertexLoc);
      gl!.uniform2f(resLoc, canvas!.width, canvas!.height);
      gl!.uniform1f(timeLoc, (Date.now() - startTime) / 1000);
      targetActive = isActiveRef.current ? 1.0 : 0.0;
      activeVal += (targetActive - activeVal) * 0.1;
      gl!.uniform1f(activeLoc, activeVal);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }
    render();

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
