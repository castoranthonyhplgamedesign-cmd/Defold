
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod: enable
#endif
precision mediump float;
uniform mediump vec4 cc_surfaceTransform;
  uniform mediump vec4 cc_ambientSky;
uniform samplerCube cc_environment;
vec4 fragTextureLod (sampler2D tex, vec2 coord, float lod) {
    #ifdef GL_EXT_shader_texture_lod
      return texture2DLodEXT(tex, coord, lod);
    #else
      return texture2D(tex, coord, lod);
    #endif
}
vec4 fragTextureLod (samplerCube tex, vec3 coord, float lod) {
    #ifdef GL_EXT_shader_texture_lod
      return textureCubeLodEXT(tex, coord, lod);
    #else
      return textureCube(tex, coord, lod);
    #endif
}
vec4 packRGBE (vec3 rgb) {
  highp float maxComp = max(max(rgb.r, rgb.g), rgb.b);
  highp float e = 128.0;
  if (maxComp > 0.0001) {
    e = log(maxComp) / log(1.1);
    e = ceil(e);
    e = clamp(e + 128.0, 0.0, 255.0);
  }
  highp float sc = 1.0 / pow(1.1, e - 128.0);
  vec3 encode = clamp(rgb * sc, vec3(0.0), vec3(1.0)) * 255.0;
  vec3 encode_rounded = floor(encode) + step(encode - floor(encode), vec3(0.5));
  return vec4(encode_rounded, e) / 255.0;
}
vec3 unpackRGBE (vec4 rgbe) {
  return rgbe.rgb * pow(1.1, rgbe.a * 255.0 - 128.0);
}
vec3 SRGBToLinear (vec3 gamma) {
#ifdef CC_USE_SURFACE_SHADER
  #if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_COMPOSITE_AND_MISC && CC_SURFACES_ENABLE_DEBUG_VIEW
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_GAMMA_CORRECTION) {
      return gamma;
    }
  #endif
#endif
  return gamma * gamma;
}
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
#if defined(CC_USE_METAL) || defined(CC_USE_WGPU)
#define CC_HANDLE_SAMPLE_NDC_FLIP_STATIC(y) y = -y
#else
#define CC_HANDLE_SAMPLE_NDC_FLIP_STATIC(y)
#endif
vec3 RotationVecFromAxisY(vec3 v, float cosTheta, float sinTheta)
{
    vec3 result;
    result.x = dot(v, vec3(cosTheta, 0.0, -sinTheta));
    result.y = v.y;
    result.z = dot(v, vec3(sinTheta, 0.0,  cosTheta));
    return result;
}
vec3 RotationVecFromAxisY(vec3 v, float rotateAngleArc)
{
  return RotationVecFromAxisY(v, cos(rotateAngleArc), sin(rotateAngleArc));
}
varying mediump vec4 viewDir;
uniform samplerCube environmentMap;
vec4 frag () {
  vec3 rotationDir = RotationVecFromAxisY(viewDir.xyz, cc_surfaceTransform.z, cc_surfaceTransform.w);
  #if USE_RGBE_CUBEMAP
    vec3 c = unpackRGBE(fragTextureLod(environmentMap, rotationDir.xyz, 0.0));
  #else
    vec3 c = SRGBToLinear(fragTextureLod(environmentMap, rotationDir.xyz, 0.0).rgb);
  #endif
  vec4 color = vec4(c * cc_ambientSky.w, 1.0);
  #if CC_USE_RGBE_OUTPUT
    color = packRGBE(color.rgb);
  #else
    color.rgb = HDRToLDR(color.rgb);
    color.rgb = LinearToSRGB(color.rgb);
  #endif
  return color;
}
void main() { gl_FragColor = frag(); }