
precision mediump float;
varying vec2 v_uv;
  uniform float u_percent;
uniform sampler2D mainTexture;
vec4 frag () {
  vec4 color = texture2D(mainTexture, v_uv);
  float percent = clamp(u_percent, 0.0, 1.0);
  color.xyz *= percent;
  return color;
}
void main() { gl_FragColor = frag(); }