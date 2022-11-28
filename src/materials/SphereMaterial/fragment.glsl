varying vec3 vWorldPosition;

uniform vec3 u_EffectOrigin;

void main() {
  vec4 diffuseColor = vec4(0.0);

  vec3 outgoingLight = diffuseColor.rgb;

  float distancefromEffectOrigin = distance(vWorldPosition, u_EffectOrigin);
  float falloff = smoothstep(1.0, 1.3, distancefromEffectOrigin);

  outgoingLight.rgb = vec3(falloff);

  #ifdef FLIP_SIDED
    outgoingLight.rgb = vec3(1.0, 0.0, 0.7);
  #endif

  #include <output_fragment>

  gl_FragColor.a = falloff;
}
