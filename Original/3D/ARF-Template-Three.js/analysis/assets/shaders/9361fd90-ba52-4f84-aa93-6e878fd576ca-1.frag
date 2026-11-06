
precision highp float;
uniform lowp vec4 cc_shadowColor;
vec4 CCFragOutput (vec4 color) {
  return color;
}
varying float v_dist;
vec4 frag () {
  if(v_dist < 0.0)
    discard;
  return CCFragOutput(cc_shadowColor);
}
void main() { gl_FragColor = frag(); }