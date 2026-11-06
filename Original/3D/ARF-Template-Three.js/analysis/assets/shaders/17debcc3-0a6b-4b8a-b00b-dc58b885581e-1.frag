
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
  #if CC_DRAW_WIRE_FRAME
    varying vec3 vBarycentric;
  #endif
  uniform sampler2D mainTexture;
      uniform vec4 tintColor;
  vec4 add () {
    vec4 col = 2.0 * color * tintColor * CCSampleWithAlphaSeparated(mainTexture, uv);
#if CC_DRAW_WIRE_FRAME
    if (any(lessThan(vBarycentric, vec3(0.02)))) {
        col = vec4(0., 1., 1., 1.);
    }
#endif
    return CCFragOutput(col);
  }
void main() { gl_FragColor = add(); }