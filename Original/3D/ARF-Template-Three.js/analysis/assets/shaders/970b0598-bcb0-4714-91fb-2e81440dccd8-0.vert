
precision mediump float;
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_uv;
  uniform vec4 u_buffer0;
  uniform vec4 u_buffer1;
  uniform mat4 u_projection;
vec4 vert () {
  vec2 worldPos = a_position * u_buffer1.xy + u_buffer1.zw;
  vec2 clipSpace = worldPos / u_buffer0.xy * 2.0 - 1.0;
  vec4 screenPos = u_projection * vec4(clipSpace, 0.0, 1.0);
  v_uv = a_texCoord;
  return screenPos;
}
void main() { gl_Position = vert(); }