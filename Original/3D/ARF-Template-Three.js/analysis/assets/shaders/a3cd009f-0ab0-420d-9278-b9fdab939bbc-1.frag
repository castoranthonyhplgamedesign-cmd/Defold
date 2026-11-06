
precision highp float;
vec3 ACESToneMap (vec3 color) {
  color = min(color, vec3(8.0));
  const float A = 2.51;
  const float B = 0.03;
  const float C = 2.43;
  const float D = 0.59;
  const float E = 0.14;
  return (color * (A * color + B)) / (color * (C * color + D) + E);
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
vec4 CCFragOutput (vec4 color) {
  #if CC_USE_RGBE_OUTPUT
    color = packRGBE(color.rgb);
  #elif !CC_USE_FLOAT_OUTPUT
    #if CC_USE_HDR && CC_TONE_MAPPING_TYPE == HDR_TONE_MAPPING_ACES
      color.rgb = ACESToneMap(color.rgb);
    #endif
    color.rgb = LinearToSRGB(color.rgb);
  #endif
  return color;
}
uniform highp vec4 cc_cameraPos;
  uniform mediump vec4 cc_fogColor;
  uniform mediump vec4 cc_fogBase;
  uniform mediump vec4 cc_fogAdd;
#if CC_USE_FOG != 4
  float LinearFog(vec4 pos, vec3 cameraPos, float fogStart, float fogEnd) {
      vec4 wPos = pos;
      float cam_dis = distance(cameraPos, wPos.xyz);
      return clamp((fogEnd - cam_dis) / (fogEnd - fogStart), 0., 1.);
  }
  float ExpFog(vec4 pos, vec3 cameraPos, float fogStart, float fogDensity, float fogAtten) {
      vec4 wPos = pos;
      float cam_dis = max(distance(cameraPos, wPos.xyz) - fogStart, 0.0) / fogAtten * 4.;
      float f = exp(-cam_dis * fogDensity);
      return f;
  }
  float ExpSquaredFog(vec4 pos, vec3 cameraPos, float fogStart, float fogDensity, float fogAtten) {
      vec4 wPos = pos;
      float cam_dis = max(distance(cameraPos, wPos.xyz) - fogStart, 0.0) / fogAtten * 4.;
      float f = exp(-cam_dis * cam_dis * fogDensity * fogDensity);
      return f;
  }
  float LayeredFog(vec4 pos, vec3 cameraPos, float fogTop, float fogRange, float fogAtten) {
      vec4 wPos = pos;
      vec3 camWorldProj = cameraPos.xyz;
      camWorldProj.y = 0.;
      vec3 worldPosProj = wPos.xyz;
      worldPosProj.y = 0.;
      float fDeltaD = distance(worldPosProj, camWorldProj) / fogAtten * 2.0;
      float fDeltaY, fDensityIntegral;
      if (cameraPos.y > fogTop) {
          if (wPos.y < fogTop) {
              fDeltaY = (fogTop - wPos.y) / fogRange * 2.0;
              fDensityIntegral = fDeltaY * fDeltaY * 0.5;
          }
          else {
              fDeltaY = 0.;
              fDensityIntegral = 0.;
          }
      }
      else {
          if (wPos.y < fogTop) {
              float fDeltaA = (fogTop - cameraPos.y) / fogRange * 2.;
              float fDeltaB = (fogTop - wPos.y) / fogRange * 2.;
              fDeltaY = abs(fDeltaA - fDeltaB);
              fDensityIntegral = abs((fDeltaA * fDeltaA * 0.5) - (fDeltaB * fDeltaB * 0.5));
          }
          else {
              fDeltaY = abs(fogTop - cameraPos.y) / fogRange * 2.;
              fDensityIntegral = abs(fDeltaY * fDeltaY * 0.5);
          }
      }
      float fDensity;
      if (fDeltaY != 0.) {
          fDensity = (sqrt(1.0 + ((fDeltaD / fDeltaY) * (fDeltaD / fDeltaY)))) * fDensityIntegral;
      }
      else {
          fDensity = 0.;
      }
      float f = exp(-fDensity);
      return f;
  }
#endif
void CC_TRANSFER_FOG_BASE(vec4 pos, out float factor)
{
#if CC_USE_FOG == 0
	factor = LinearFog(pos, cc_cameraPos.xyz, cc_fogBase.x, cc_fogBase.y);
#elif CC_USE_FOG == 1
	factor = ExpFog(pos, cc_cameraPos.xyz, cc_fogBase.x, cc_fogBase.z, cc_fogAdd.z);
#elif CC_USE_FOG == 2
	factor = ExpSquaredFog(pos, cc_cameraPos.xyz, cc_fogBase.x, cc_fogBase.z, cc_fogAdd.z);
#elif CC_USE_FOG == 3
	factor = LayeredFog(pos, cc_cameraPos.xyz, cc_fogAdd.x, cc_fogAdd.y, cc_fogAdd.z);
#else
	factor = 1.0;
#endif
}
void CC_APPLY_FOG_BASE(inout vec4 color, float factor) {
	color = vec4(mix(cc_fogColor.rgb, color.rgb, factor), color.a);
}
#if !CC_USE_ACCURATE_FOG
varying mediump float v_fog_factor;
#endif
void CC_APPLY_FOG(inout vec4 color) {
#if !CC_USE_ACCURATE_FOG
    CC_APPLY_FOG_BASE(color, v_fog_factor);
#endif
}
void CC_APPLY_FOG(inout vec4 color, vec3 worldPos) {
#if CC_USE_ACCURATE_FOG
    float factor;
    CC_TRANSFER_FOG_BASE(vec4(worldPos, 1.0), factor);
#else
    float factor = v_fog_factor;
#endif
    CC_APPLY_FOG_BASE(color, factor);
}
#if USE_ALPHA_TEST
#endif
#if USE_TEXTURE
  varying vec2 v_uv;
  uniform sampler2D mainTexture;
#endif
   uniform vec4 mainColor;
   uniform vec4 colorScaleAndCutoff;
#if USE_VERTEX_COLOR
  varying lowp vec4 v_color;
#endif
vec4 frag () {
  vec4 o = mainColor;
  o.rgb *= colorScaleAndCutoff.xyz;
  #if USE_VERTEX_COLOR
    o.rgb *= SRGBToLinear(v_color.rgb);
    o.a *= v_color.a;
  #endif
  #if USE_TEXTURE
    vec4 texColor = texture2D(mainTexture, v_uv);
    texColor.rgb = SRGBToLinear(texColor.rgb);
    o *= texColor;
  #endif
  #if USE_ALPHA_TEST
    if (o.ALPHA_TEST_CHANNEL < colorScaleAndCutoff.w) discard;
  #endif
  CC_APPLY_FOG(o);
  return CCFragOutput(o);
}
void main() { gl_FragColor = frag(); }