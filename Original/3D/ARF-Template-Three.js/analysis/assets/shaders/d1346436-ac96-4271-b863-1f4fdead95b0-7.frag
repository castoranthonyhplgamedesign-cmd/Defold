
precision mediump float;
vec4 CCFragOutput (vec4 color) {
  return color;
}
vec4 CCSampleWithAlphaSeparated(sampler2D tex, vec2 uv) {
#if CC_USE_EMBEDDED_ALPHA
  return vec4(texture2D(tex, uv).rgb, texture2D(tex, uv + vec2(0.0, 0.5)).r);
#else
  return texture2D(tex, uv);
#endif
}
varying vec2 uv;
varying vec4 color;
uniform sampler2D mainTexture;
vec4 premultiplied () {
  vec4 col = color * CCSampleWithAlphaSeparated(mainTexture, uv) * color.a;
  return CCFragOutput(col);
}
void main() { gl_FragColor = premultiplied(); }