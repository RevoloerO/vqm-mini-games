export const plasmaVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform float uTime;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Subtle vertex displacement
    float pulse = sin(uTime * 2.0 + position.y * 3.0) * 0.02;
    vec3 displaced = position + normal * pulse;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const plasmaFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;

  // Hash for randomness
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Voronoi cells for plasma tendrils
  float voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float md = 8.0;
    for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = vec2(hash(n + g), hash(n + g + vec2(37.0, 17.0)));
      o = 0.5 + 0.5 * sin(uTime + 6.2831 * o);
      vec2 r = g + o - f;
      float d = dot(r, r);
      md = min(md, d);
    }
    return md;
  }

  void main() {
    // Animated UV for flowing plasma
    vec2 uv = vUv * 4.0;

    // Layered voronoi for complex plasma pattern
    float v1 = voronoi(uv + uTime * 0.3);
    float v2 = voronoi(uv * 2.0 - uTime * 0.5);
    float v3 = voronoi(uv * 0.5 + uTime * 0.2);

    float plasma = v1 * 0.5 + v2 * 0.3 + v3 * 0.2;

    // Electric tendrils
    float tendrils = 1.0 - smoothstep(0.0, 0.15, plasma);

    // Color mixing
    vec3 color = mix(uColor1 * 0.3, uColor2, plasma);
    color += tendrils * vec3(1.0, 0.8, 1.0) * 3.0; // Bright tendril edges

    // Core glow
    float coreGlow = exp(-plasma * 5.0);
    color += coreGlow * uColor2 * 2.0;

    // Fresnel
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
    color += fresnel * uColor1 * 2.0;

    // Pulsing energy
    float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
    color *= 0.8 + pulse * 0.4;

    gl_FragColor = vec4(color, 1.0);
  }
`;
