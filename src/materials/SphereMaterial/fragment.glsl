varying vec3 vViewPosition;
varying vec3 vWorldPosition;

uniform vec3 u_EffectOrigin;
uniform sampler2D t_Noise;
uniform float u_Time;

#include <normal_pars_fragment>

void main() {
  vec4 diffuseColor = vec4(0.0);

  #include <normal_fragment_begin>

  vec3 viewDir = normalize(vViewPosition);
	vec3 x = normalize( vec3(viewDir.z, 0.0, - viewDir.x));
	vec3 y = cross(viewDir, x);
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks

  vec3 outgoingLight = diffuseColor.rgb;

  vec4 tNoise = texture2D(t_Noise, uv+vec2(u_Time* -0.2, u_Time*0.1));
  float noise = (tNoise.r + tNoise.g + tNoise.b) / 3.0;

  float distancefromEffectOrigin = distance(vWorldPosition, u_EffectOrigin);
  float falloff = step(1.0, distancefromEffectOrigin - noise);

  outgoingLight = vec3(falloff);

  #ifdef FLIP_SIDED
    outgoingLight = vec3(1.0, 0.0, 0.7);
  #endif

  #include <output_fragment>

  gl_FragColor.a = falloff;
}
