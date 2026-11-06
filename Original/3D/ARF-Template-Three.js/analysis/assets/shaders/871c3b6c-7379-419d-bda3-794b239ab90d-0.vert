
precision mediump float;
uniform highp mat4 cc_matProj;
attribute vec3 a_position;
attribute vec4 a_color;
varying vec2 v_uv;
   uniform vec4 offset;
    uniform vec4 digits[22];
float getComponent(vec4 v, float i) {
  if (i < 1.0) { return v.x; }
  else if (i < 2.0) { return v.y; }
  else if (i < 3.0) { return v.z; }
  else { return v.w; }
}
vec4 vert () {
  mat2 proj = mat2(cc_matProj[0].xy, cc_matProj[1].xy);
  proj /= abs(proj[1].x + proj[1].y);
  vec2 position = proj * a_position.xy + offset.xy;
  v_uv = a_color.xy;
  if (a_color.z >= 0.0) {
    float n = getComponent(digits[int(a_color.z)], a_color.w);
    v_uv += vec2(offset.z * n, 0.0);
  }
  return vec4(position, 0.0, 1.0);
}
void main() { gl_Position = vert(); }