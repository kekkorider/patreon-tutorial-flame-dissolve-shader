import { DoubleSide, ShaderMaterial, Vector3 } from 'three'

import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'

export const SphereMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  side: DoubleSide,
  uniforms: {
    u_EffectOrigin: { value: new Vector3() },
    u_Time: { value: 0 },
    t_Noise: { value: null }
  }
})
