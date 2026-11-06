
precision mediump float;
vec4 CCFragOutput (vec4 color) {
  return color;
}
varying vec2 v_uv;
uniform sampler2D mainTexture;
vec4 frag () {
  return CCFragOutput(texture2D(mainTexture, v_uv));
}
void main() { gl_FragColor = frag(); }