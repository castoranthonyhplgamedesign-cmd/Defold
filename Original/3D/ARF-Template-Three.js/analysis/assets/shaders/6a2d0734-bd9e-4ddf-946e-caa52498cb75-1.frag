
precision highp float;
vec3 LinearToSRGB(vec3 linear) {
#ifdef CC_USE_SURFACE_SHADER
  #if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_COMPOSITE_AND_MISC && CC_SURFACES_ENABLE_DEBUG_VIEW
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_GAMMA_CORRECTION) {
      return linear;
    }
  #endif
#endif
  return sqrt(linear);
}
vec3 ACESToneMap (vec3 color) {
  color = min(color, vec3(8.0));
  const float A = 2.51;
  const float B = 0.03;
  const float C = 2.43;
  const float D = 0.59;
  const float E = 0.14;
  return (color * (A * color + B)) / (color * (C * color + D) + E);
}
vec3 HDRToLDR(vec3 color)
{
  #if CC_USE_HDR
    #if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_COMPOSITE_AND_MISC && CC_SURFACES_ENABLE_DEBUG_VIEW
      if (IS_DEBUG_VIEW_COMPOSITE_ENABLE_TONE_MAPPING)
    #endif
    {
    #if CC_TONE_MAPPING_TYPE == HDR_TONE_MAPPING_ACES
      color.rgb = ACESToneMap(color.rgb);
    #endif
    }
  #endif
  return color;
}
varying vec2 v_uv;
uniform sampler2D inputTexture;
void main () {
  gl_FragColor = texture2D(inputTexture, v_uv);
  #if CC_USE_FLOAT_OUTPUT
    gl_FragColor.rgb = HDRToLDR(gl_FragColor.rgb);
    gl_FragColor.rgb = LinearToSRGB(gl_FragColor.rgb);
  #endif
}