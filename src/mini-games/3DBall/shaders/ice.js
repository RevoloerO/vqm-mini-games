export const iceVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform float uTime;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const iceFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uDeepColor;

  // Voronoi for crystal facets
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  vec3 voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float md = 8.0;
    vec2 mr;
    for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash2(n + g);
      o = 0.5 + 0.5 * sin(uTime * 0.3 + 6.2831 * o);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < md) {
        md = d;
        mr = r;
      }
    }
    return vec3(md, mr);
  }

  void main() {
    // Crystal facet pattern
    vec3 vor = voronoi(vUv * 8.0);
    float facets = vor.x;

    // Subsurface scattering approximation
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 4.0);

    // Internal light scattering
    float scatter = snoise3(vPosition * 4.0 + uTime * 0.2) * 0.5 + 0.5;

    // Base color with depth
    vec3 color = mix(uDeepColor, uBaseColor, fresnel);

    // Add crystal facet highlights
    float facetHighlight = smoothstep(0.0, 0.05, facets) * smoothstep(0.15, 0.05, facets);
    color += vec3(0.6, 0.8, 1.0) * facetHighlight * 2.0;

    // Internal glow
    float internalGlow = scatter * (1.0 - fresnel) * 0.5;
    color += uBaseColor * internalGlow;

    // Frost sparkle
    float sparkle = pow(snoise3(vPosition * 20.0 + uTime * 0.5) * 0.5 + 0.5, 8.0);
    color += vec3(1.0) * sparkle * 0.8;

    // Rim light - cold blue
    color += vec3(0.4, 0.7, 1.0) * fresnel * 1.5;

    // Overall frosted transparency feel
    float alpha = mix(0.7, 1.0, fresnel);

    gl_FragColor = vec4(color, alpha);
  }

  // Simplified 3D noise
  float snoise3(vec3 v) {
    return fract(sin(dot(v, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }
`;

// Use a simpler approach with MeshPhysicalMaterial for ice
export const iceConfig = {
  color: '#88ccff',
  metalness: 0.1,
  roughness: 0.05,
  transmission: 0.6,
  thickness: 1.5,
  ior: 1.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  envMapIntensity: 2.0,
  sheenColor: '#aaddff',
  sheen: 0.5,
};
