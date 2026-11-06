
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives: enable
#endif
precision highp float;
varying vec4 v_color;
varying float v_dist;
vec4 frag () {
  vec4 o = v_color;
    #ifdef GL_OES_standard_derivatives
      float aa = fwidth(v_dist);
    #else
      float aa = 0.05;
    #endif
  float alpha = 1. - smoothstep(-aa, 0., abs(v_dist) - 1.0);
  o.rgb *= o.a;
  o *= alpha;
  return o;
}
void main() { gl_FragColor = frag(); }