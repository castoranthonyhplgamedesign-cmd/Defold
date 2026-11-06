
precision highp float;
attribute vec3 a_position;
vec4 vert () {
  vec4 pos = vec4(a_position, 1);
  return pos;
}
void main() { gl_Position = vert(); }