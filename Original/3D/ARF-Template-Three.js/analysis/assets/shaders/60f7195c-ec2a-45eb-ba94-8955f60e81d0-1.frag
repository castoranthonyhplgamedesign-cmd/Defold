
precision highp float;
vec4 CCSampleWithAlphaSeparated(sampler2D tex, vec2 uv) {
#if CC_USE_EMBEDDED_ALPHA
  return vec4(texture2D(tex, uv).rgb, texture2D(tex, uv + vec2(0.0, 0.5)).r);
#else
  return texture2D(tex, uv);
#endif
}
#if USE_ALPHA_TEST
      uniform float alphaThreshold;
#endif
void ALPHA_TEST (in vec4 color) {
  #if USE_ALPHA_TEST
    if (color.a < alphaThreshold) discard;
  #endif
}
void ALPHA_TEST (in float alpha) {
  #if USE_ALPHA_TEST
    if (alpha < alphaThreshold) discard;
  #endif
}
varying vec4 color;
#if USE_TEXTURE
  varying vec2 uv0;
  uniform sampler2D cc_spriteTexture;
#endif
vec4 frag () {
  vec4 o = vec4(1, 1, 1, 1);
  #if USE_TEXTURE
    o *= CCSampleWithAlphaSeparated(cc_spriteTexture, uv0);
    #if IS_GRAY
      float gray  = 0.2126 * o.r + 0.7152 * o.g + 0.0722 * o.b;
      o.r = o.g = o.b = gray;
    #endif
  #endif
  o *= color;
  ALPHA_TEST(o);
  return o;
}
void main() { gl_FragColor = frag(); }