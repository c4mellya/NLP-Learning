// The mesh is uploaded once. Projection, surface deformation and lighting are
// evaluated by the GPU, instead of rebuilding thousands of Canvas2D paths per frame.
const vertexSource = `
precision highp float;
attribute vec2 aParam;
uniform float uTime;
uniform float uConcept;
uniform vec2 uTilt;
uniform vec2 uSize;
varying vec3 vNormal;
varying vec2 vParam;
vec3 surface(vec2 uv) {
  float twist = uv.x * (uConcept > 0.5 && uConcept < 1.5 ? 2.0 : 1.0) + uTime * 0.12;
  float a = 0.36 * cos(uv.y), b = 0.18 * sin(uv.y);
  float radial = 1.04 + a * cos(twist) - b * sin(twist);
  vec3 p = vec3(radial * cos(uv.x), radial * sin(uv.x), a * sin(twist) + b * cos(twist));
  if (uConcept > 1.5) p.z += 0.15 * sin(uv.x * 3.0);
  float ax = 0.84 + uTilt.y * 0.12, ay = -0.36 + uTilt.x * 0.15;
  float az = -0.42 + sin(uTime * 0.16) * 0.12;
  p.yz = vec2(p.y * cos(ax) - p.z * sin(ax), p.y * sin(ax) + p.z * cos(ax));
  p.xz = vec2(p.x * cos(ay) + p.z * sin(ay), -p.x * sin(ay) + p.z * cos(ay));
  p.xy = vec2(p.x * cos(az) - p.y * sin(az), p.x * sin(az) + p.y * cos(az));
  return p;
}
void main() {
  vec3 p = surface(aParam);
  vNormal = normalize(cross(surface(aParam + vec2(0.002, 0.0)) - p, surface(aParam + vec2(0.0, 0.002)) - p));
  vParam = aParam;
  float scale = min(uSize.x * 0.30, uSize.y * 0.35) * 4.7 / (4.7 - p.z);
  gl_Position = vec4(p.x * scale * 2.0 / uSize.x, -p.y * scale * 2.0 / uSize.y, -p.z * 0.25, 1.0);
}`
const fragmentSource = `
precision mediump float;
varying vec3 vNormal;
varying vec2 vParam;
void main() {
  vec3 n = normalize(vNormal);
  float light = max(0.0, dot(n, vec3(-0.35, -0.65, 0.67)));
  float shine = pow(max(0.0, n.z * 0.88 - n.y * 0.4), 14.0);
  vec3 color = (vec3(47.0, 89.0, 48.0) + light * vec3(148.0, 141.0, 63.0) + shine * vec3(52.0, 24.0, 83.0)) / 255.0;
  float rib = smoothstep(0.92, 1.0, cos(vParam.y * 12.0));
  color += rib * vec3(0.018, 0.023, 0.010);
  gl_FragColor = vec4(color, 1.0);
}`

export function createSculptureRenderer(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, depth: true, stencil: false, preserveDrawingBuffer: false })
  if (!gl) return null
  const allocations = [], shaders = []
  let program
  function dispose() {
    allocations.forEach(buffer => gl.deleteBuffer(buffer))
    shaders.forEach(shader => gl.deleteShader(shader))
    if (program) gl.deleteProgram(program)
  }
  function shader(type, source) {
    const value = gl.createShader(type); shaders.push(value)
    gl.shaderSource(value, source); gl.compileShader(value)
    if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(value))
    return value
  }
  try {
    program = gl.createProgram()
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource))
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program))
    const segments = 128, strips = 36, stride = strips + 1
    const params = new Float32Array((segments + 1) * stride * 2)
    const indices = new Uint16Array(segments * strips * 6)
    for (let i = 0; i <= segments; i++) for (let j = 0; j <= strips; j++) {
      const offset = (i * stride + j) * 2
      params[offset] = i / segments * Math.PI * 2; params[offset + 1] = j / strips * Math.PI * 2
    }
    let offset = 0
    for (let i = 0; i < segments; i++) for (let j = 0; j < strips; j++) {
      const a = i * stride + j, b = a + stride
      indices.set([a, b, b + 1, a, b + 1, a + 1], offset); offset += 6
    }
    const vertices = gl.createBuffer(), elements = gl.createBuffer(); allocations.push(vertices, elements)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices); gl.bufferData(gl.ARRAY_BUFFER, params, gl.STATIC_DRAW)
    const attribute = gl.getAttribLocation(program, 'aParam')
    gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
    gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0)
    const uniforms = Object.fromEntries(['uTime', 'uConcept', 'uTilt', 'uSize'].map(name => [name, gl.getUniformLocation(program, name)]))
    return {
      draw(time, tiltX, tiltY, concept, width, height) {
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.uniform1f(uniforms.uTime, time); gl.uniform1f(uniforms.uConcept, concept)
        gl.uniform2f(uniforms.uTilt, tiltX, tiltY); gl.uniform2f(uniforms.uSize, width, height)
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
      },
      dispose,
    }
  } catch {
    dispose()
    return null
  }
}
