
precision highp float;
uniform highp mat4 cc_matViewProj;
uniform highp mat4 cc_matWorld;
attribute vec3 a_position;
attribute vec4 a_color;
varying vec4 v_color;
attribute float a_dist;
varying float v_dist;
vec4 vert () {
  vec4 pos = vec4(a_position, 1);
  pos = cc_matViewProj * cc_matWorld * pos;
  v_color = a_color;
  v_dist = a_dist;
  return pos;
}
void main() { gl_Position = vert(); }