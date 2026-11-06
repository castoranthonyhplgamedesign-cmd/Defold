
#ifdef GL_EXT_draw_buffers
#extension GL_EXT_draw_buffers: enable
#endif
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives: enable
#endif
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod: enable
#endif
precision highp float;
  #define CC_SURFACES_USE_SECOND_UV HAS_SECOND_UV
  #define CC_SURFACES_USE_TWO_SIDED USE_TWOSIDE
  #define CC_SURFACES_USE_REFLECTION_DENOISE USE_REFLECTION_DENOISE
  #define CC_SURFACES_LIGHTING_ANISOTROPIC IS_ANISOTROPY
  #define CC_SURFACES_USE_VERTEX_COLOR USE_VERTEX_COLOR
  #define CC_SURFACES_USE_LEGACY_COMPATIBLE_LIGHTING USE_COMPATIBLE_LIGHTING
#if IS_ANISOTROPY || USE_NORMAL_MAP
  #define CC_SURFACES_USE_TANGENT_SPACE 1
#endif
  #define CC_SURFACES_LIGHTING_ANISOTROPIC_ENVCONVOLUTION_COUNT 31
#ifndef CC_SURFACES_USE_SECOND_UV
  #define CC_SURFACES_USE_SECOND_UV 0
#endif
#ifndef CC_SURFACES_USE_TANGENT_SPACE
  #define CC_SURFACES_USE_TANGENT_SPACE 0
#endif
#ifndef CC_SURFACES_USE_VERTEX_COLOR
  #define CC_SURFACES_USE_VERTEX_COLOR 0
#endif
#ifndef CC_SURFACES_TRANSFER_LOCAL_POS
  #define CC_SURFACES_TRANSFER_LOCAL_POS 0
#endif
#ifndef CC_SURFACES_TRANSFER_CLIP_POS
  #define CC_SURFACES_TRANSFER_CLIP_POS 0
#endif
#ifndef CC_SURFACES_USE_LIGHT_MAP
  #ifdef CC_USE_LIGHTMAP
    #define CC_SURFACES_USE_LIGHT_MAP CC_USE_LIGHTMAP
  #else
    #define CC_SURFACES_USE_LIGHT_MAP 0
  #endif
#endif
#ifndef CC_SURFACES_FLIP_UV
  #define CC_SURFACES_FLIP_UV 0
#endif
#ifndef CC_SURFACES_USE_TWO_SIDED
  #define CC_SURFACES_USE_TWO_SIDED 0
#endif
#ifndef CC_SURFACES_USE_REFLECTION_DENOISE
  #define CC_SURFACES_USE_REFLECTION_DENOISE 0
#endif
#ifndef CC_SURFACES_LIGHTING_ANISOTROPIC
  #define CC_SURFACES_LIGHTING_ANISOTROPIC 0
#endif
#ifndef CC_SURFACES_LIGHTING_ANISOTROPIC_ENVCONVOLUTION_COUNT
  #define CC_SURFACES_LIGHTING_ANISOTROPIC_ENVCONVOLUTION_COUNT 0
#endif
#ifndef CC_SURFACES_USE_LEGACY_COMPATIBLE_LIGHTING
  #define CC_SURFACES_USE_LEGACY_COMPATIBLE_LIGHTING 0
#endif
#ifndef CC_SURFACES_LIGHTING_USE_FRESNEL
  #define CC_SURFACES_LIGHTING_USE_FRESNEL 0
#endif
#ifndef CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR
  #define CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR 0
#endif
#ifndef CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  #define CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE 0
#endif
#ifndef CC_SURFACES_LIGHTING_USE_SHADOWMAP_TRANSMIT
  #define CC_SURFACES_LIGHTING_USE_SHADOWMAP_TRANSMIT 0
#endif
#ifndef CC_SURFACES_LIGHTING_TRT
  #define CC_SURFACES_LIGHTING_TRT 0
#endif
#ifndef CC_SURFACES_LIGHTING_DUAL_LOBE_SPECULAR
  #define CC_SURFACES_LIGHTING_DUAL_LOBE_SPECULAR 0
#endif
#ifndef CC_SURFACES_LIGHTING_SHEEN
  #define CC_SURFACES_LIGHTING_SHEEN 0
#endif
#ifndef CC_SURFACES_LIGHTING_CLEAR_COAT
  #define CC_SURFACES_LIGHTING_CLEAR_COAT 0
#endif
#ifndef CC_SURFACES_LIGHTING_TT
  #define CC_SURFACES_LIGHTING_TT 0
#endif
#ifndef CC_SURFACES_LIGHTING_SSS
  #define CC_SURFACES_LIGHTING_SSS 0
#endif
#ifndef CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
  #if CC_SURFACES_LIGHTING_TRT || CC_SURFACES_LIGHTING_DUAL_LOBE_SPECULAR || CC_SURFACES_LIGHTING_SHEEN || CC_SURFACES_LIGHTING_CLEAR_COAT
    #define CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR 1
  #endif
#endif
#ifndef CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
  #define CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR 0
#endif
#ifndef CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
  #if CC_SURFACES_LIGHTING_CLEAR_COAT
    #define CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND 1
  #endif
#endif
#ifndef CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
  #define CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND 0
#endif
#ifndef CC_SURFACES_ENABLE_DEBUG_VIEW
  #define CC_SURFACES_ENABLE_DEBUG_VIEW 1
#endif
#define CC_USE_SURFACE_SHADER 1
#define QUATER_PI         0.78539816340
#define HALF_PI           1.57079632679
#define PI                3.14159265359
#define PI2               6.28318530718
#define PI4               12.5663706144
#define INV_QUATER_PI     1.27323954474
#define INV_HALF_PI       0.63661977237
#define INV_PI            0.31830988618
#define INV_PI2           0.15915494309
#define INV_PI4           0.07957747155
#define EPSILON           1e-6
#define EPSILON_LOWP      1e-4
#define LOG2              1.442695
#define EXP_VALUE         2.71828183
#define FP_MAX            65504.0
#define FP_SCALE          0.0009765625
#define FP_SCALE_INV      1024.0
#define GRAY_VECTOR       vec3(0.299, 0.587, 0.114)
float saturate(float value) { return clamp(value, 0.0, 1.0); }
vec2 saturate(vec2 value) { return clamp(value, vec2(0.0), vec2(1.0)); }
vec3 saturate(vec3 value) { return clamp(value, vec3(0.0), vec3(1.0)); }
vec4 saturate(vec4 value) { return clamp(value, vec4(0.0), vec4(1.0)); }
#define LIGHT_MAP_TYPE_DISABLED 0
#define LIGHT_MAP_TYPE_ALL_IN_ONE 1
#define LIGHT_MAP_TYPE_INDIRECT_OCCLUSION 2
#define REFLECTION_PROBE_TYPE_NONE 0
#define REFLECTION_PROBE_TYPE_CUBE 1
#define REFLECTION_PROBE_TYPE_PLANAR 2
#define REFLECTION_PROBE_TYPE_BLEND 3
#define REFLECTION_PROBE_TYPE_BLEND_AND_SKYBOX 4
#define LIGHT_TYPE_DIRECTIONAL 0.0
#define LIGHT_TYPE_SPHERE 1.0
#define LIGHT_TYPE_SPOT 2.0
#define LIGHT_TYPE_POINT 3.0
#define LIGHT_TYPE_RANGED_DIRECTIONAL 4.0
#define IS_DIRECTIONAL_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_DIRECTIONAL)) < EPSILON_LOWP)
#define IS_SPHERE_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_SPHERE)) < EPSILON_LOWP)
#define IS_SPOT_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_SPOT)) < EPSILON_LOWP)
#define IS_POINT_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_POINT)) < EPSILON_LOWP)
#define IS_RANGED_DIRECTIONAL_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_RANGED_DIRECTIONAL)) < EPSILON_LOWP)
#define TONE_MAPPING_ACES 0
#define TONE_MAPPING_LINEAR 1
#define SURFACES_MAX_TRANSMIT_DEPTH_VALUE 999999.0
#ifndef CC_SURFACES_DEBUG_VIEW_SINGLE
  #define CC_SURFACES_DEBUG_VIEW_SINGLE 1
#endif
#ifndef CC_SURFACES_DEBUG_VIEW_COMPOSITE_AND_MISC
  #define CC_SURFACES_DEBUG_VIEW_COMPOSITE_AND_MISC 2
#endif
varying highp vec3 v_worldPos;
varying vec4 v_normal;
varying vec2 v_uv;
#if CC_SURFACES_USE_VERTEX_COLOR
  varying lowp vec4 v_color;
#endif
#if CC_SURFACES_USE_TANGENT_SPACE
  varying mediump vec4 v_tangent;
#endif
#if CC_SURFACES_USE_SECOND_UV
  varying mediump vec2 v_uv1;
#endif
#if CC_USE_LIGHTMAP && !CC_FORWARD_ADD
  varying mediump vec3 v_luv;
#endif
#if CC_RECEIVE_SHADOW || CC_USE_REFLECTION_PROBE
  varying mediump vec4 v_shadowBiasAndProbeId;
#endif
#if CC_USE_REFLECTION_PROBE && USE_INSTANCING
  varying mediump vec4 v_reflectionProbeData;
#endif
#if CC_USE_FOG != 4 && !CC_USE_ACCURATE_FOG
  varying mediump float v_fogFactor;
#endif
#if CC_SURFACES_TRANSFER_LOCAL_POS
  varying highp vec4 v_localPos;
#endif
#if CC_SURFACES_TRANSFER_CLIP_POS
  varying highp vec4 v_clipPos;
#endif
#if CC_USE_LIGHT_PROBE
  #if USE_INSTANCING
    varying mediump vec4 v_sh_linear_const_r;
    varying mediump vec4 v_sh_linear_const_g;
    varying mediump vec4 v_sh_linear_const_b;
  #endif
#endif
#define FSInput_worldPos v_worldPos
#define FSInput_worldNormal v_normal.xyz
#define FSInput_faceSideSign v_normal.w
#define FSInput_texcoord v_uv
#if CC_SURFACES_USE_VERTEX_COLOR
  #define FSInput_vertexColor v_color
#else
  #define FSInput_vertexColor vec4(1.0)
#endif
#if CC_SURFACES_USE_TANGENT_SPACE
  #define FSInput_worldTangent v_tangent.xyz
  #define FSInput_mirrorNormal v_tangent.w
#else
  #define FSInput_worldTangent vec3(1.0, 1.0, 1.0)
  #define FSInput_mirrorNormal 1.0
#endif
#if CC_SURFACES_USE_SECOND_UV
  #define FSInput_texcoord1 v_uv1
#else
  #define FSInput_texcoord1 vec2(0.0, 0.0)
#endif
#if CC_USE_LIGHTMAP && !CC_FORWARD_ADD
  #define FSInput_lightMapUV v_luv
#endif
#if CC_RECEIVE_SHADOW
  #define FSInput_shadowBias v_shadowBiasAndProbeId.xy
#endif
#if CC_USE_REFLECTION_PROBE
  #define FSInput_reflectionProbeId v_shadowBiasAndProbeId.z
  #if CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_BLEND || CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_BLEND_AND_SKYBOX
    #define FSInput_reflectionProbeBlendId v_shadowBiasAndProbeId.w
  #endif
  #if USE_INSTANCING
    #define FSInput_reflectionProbeData v_reflectionProbeData
  #endif
#endif
#if CC_USE_FOG != 4 && !CC_USE_ACCURATE_FOG
  #define FSInput_fogFactor v_fogFactor
#endif
#if CC_SURFACES_TRANSFER_LOCAL_POS
  #define FSInput_localPos v_localPos
#endif
#if CC_SURFACES_TRANSFER_CLIP_POS
  #define FSInput_clipPos v_clipPos
#endif
uniform highp vec4 cc_time;
  uniform mediump vec4 cc_probeInfo;
  uniform mediump vec4 cc_debug_view_mode;
uniform highp mat4 cc_matView;
  uniform highp mat4 cc_matProj;
  uniform highp mat4 cc_matViewProj;
  uniform highp vec4 cc_cameraPos;
  uniform mediump vec4 cc_surfaceTransform;
  uniform mediump vec4 cc_exposure;
  uniform mediump vec4 cc_mainLitDir;
  uniform mediump vec4 cc_mainLitColor;
  uniform mediump vec4 cc_ambientSky;
  uniform mediump vec4 cc_ambientGround;
  uniform mediump vec4 cc_fogColor;
  uniform mediump vec4 cc_fogBase;
  uniform mediump vec4 cc_fogAdd;
  uniform mediump vec4 cc_nearFar;
#define CC_SURFACES_DEBUG_VIEW_VERTEX_COLOR 1
#define CC_SURFACES_DEBUG_VIEW_VERTEX_NORMAL CC_SURFACES_DEBUG_VIEW_VERTEX_COLOR + 1
#define CC_SURFACES_DEBUG_VIEW_VERTEX_TANGENT CC_SURFACES_DEBUG_VIEW_VERTEX_NORMAL + 1
#define CC_SURFACES_DEBUG_VIEW_WORLD_POS CC_SURFACES_DEBUG_VIEW_VERTEX_TANGENT + 1
#define CC_SURFACES_DEBUG_VIEW_VERTEX_MIRROR CC_SURFACES_DEBUG_VIEW_WORLD_POS + 1
#define CC_SURFACES_DEBUG_VIEW_FACE_SIDE CC_SURFACES_DEBUG_VIEW_VERTEX_MIRROR + 1
#define CC_SURFACES_DEBUG_VIEW_UV0 CC_SURFACES_DEBUG_VIEW_FACE_SIDE + 1
#define CC_SURFACES_DEBUG_VIEW_UV1 CC_SURFACES_DEBUG_VIEW_UV0 + 1
#define CC_SURFACES_DEBUG_VIEW_UVLIGHTMAP CC_SURFACES_DEBUG_VIEW_UV1 + 1
#define CC_SURFACES_DEBUG_VIEW_PROJ_DEPTH CC_SURFACES_DEBUG_VIEW_UVLIGHTMAP + 1
#define CC_SURFACES_DEBUG_VIEW_LINEAR_DEPTH CC_SURFACES_DEBUG_VIEW_PROJ_DEPTH + 1
#define CC_SURFACES_DEBUG_VIEW_FRAGMENT_NORMAL CC_SURFACES_DEBUG_VIEW_LINEAR_DEPTH + 1
#define CC_SURFACES_DEBUG_VIEW_FRAGMENT_TANGENT CC_SURFACES_DEBUG_VIEW_FRAGMENT_NORMAL + 1
#define CC_SURFACES_DEBUG_VIEW_FRAGMENT_BINORMAL CC_SURFACES_DEBUG_VIEW_FRAGMENT_TANGENT + 1
#define CC_SURFACES_DEBUG_VIEW_BASE_COLOR CC_SURFACES_DEBUG_VIEW_FRAGMENT_BINORMAL + 1
#define CC_SURFACES_DEBUG_VIEW_DIFFUSE_COLOR CC_SURFACES_DEBUG_VIEW_BASE_COLOR + 1
#define CC_SURFACES_DEBUG_VIEW_SPECULAR_COLOR CC_SURFACES_DEBUG_VIEW_DIFFUSE_COLOR + 1
#define CC_SURFACES_DEBUG_VIEW_TRANSPARENCY CC_SURFACES_DEBUG_VIEW_SPECULAR_COLOR + 1
#define CC_SURFACES_DEBUG_VIEW_METALLIC CC_SURFACES_DEBUG_VIEW_TRANSPARENCY + 1
#define CC_SURFACES_DEBUG_VIEW_ROUGHNESS CC_SURFACES_DEBUG_VIEW_METALLIC + 1
#define CC_SURFACES_DEBUG_VIEW_SPECULAR_INTENSITY CC_SURFACES_DEBUG_VIEW_ROUGHNESS + 1
#define CC_SURFACES_DEBUG_VIEW_IOR CC_SURFACES_DEBUG_VIEW_SPECULAR_INTENSITY + 1
#define CC_SURFACES_DEBUG_VIEW_DIRECT_DIFFUSE CC_SURFACES_DEBUG_VIEW_IOR + 1
#define CC_SURFACES_DEBUG_VIEW_DIRECT_SPECULAR CC_SURFACES_DEBUG_VIEW_DIRECT_DIFFUSE + 1
#define CC_SURFACES_DEBUG_VIEW_DIRECT_ALL CC_SURFACES_DEBUG_VIEW_DIRECT_SPECULAR + 1
#define CC_SURFACES_DEBUG_VIEW_ENV_DIFFUSE CC_SURFACES_DEBUG_VIEW_DIRECT_ALL + 1
#define CC_SURFACES_DEBUG_VIEW_ENV_SPECULAR CC_SURFACES_DEBUG_VIEW_ENV_DIFFUSE + 1
#define CC_SURFACES_DEBUG_VIEW_ENV_ALL CC_SURFACES_DEBUG_VIEW_ENV_SPECULAR + 1
#define CC_SURFACES_DEBUG_VIEW_EMISSIVE CC_SURFACES_DEBUG_VIEW_ENV_ALL + 1
#define CC_SURFACES_DEBUG_VIEW_LIGHT_MAP CC_SURFACES_DEBUG_VIEW_EMISSIVE + 1
#define CC_SURFACES_DEBUG_VIEW_SHADOW CC_SURFACES_DEBUG_VIEW_LIGHT_MAP + 1
#define CC_SURFACES_DEBUG_VIEW_AO CC_SURFACES_DEBUG_VIEW_SHADOW + 1
#define CC_SURFACES_DEBUG_VIEW_FRESNEL CC_SURFACES_DEBUG_VIEW_AO + 1
#define CC_SURFACES_DEBUG_VIEW_TRANSMIT_DIRECT_DIFFUSE CC_SURFACES_DEBUG_VIEW_FRESNEL + 1
#define CC_SURFACES_DEBUG_VIEW_TRANSMIT_DIRECT_SPECULAR CC_SURFACES_DEBUG_VIEW_TRANSMIT_DIRECT_DIFFUSE + 1
#define CC_SURFACES_DEBUG_VIEW_TRANSMIT_ENV_DIFFUSE CC_SURFACES_DEBUG_VIEW_TRANSMIT_DIRECT_SPECULAR + 1
#define CC_SURFACES_DEBUG_VIEW_TRANSMIT_ENV_SPECULAR CC_SURFACES_DEBUG_VIEW_TRANSMIT_ENV_DIFFUSE + 1
#define CC_SURFACES_DEBUG_VIEW_TRANSMIT_ALL CC_SURFACES_DEBUG_VIEW_TRANSMIT_ENV_SPECULAR + 1
#define CC_SURFACES_DEBUG_VIEW_DIRECT_2ND_SPECULAR CC_SURFACES_DEBUG_VIEW_TRANSMIT_ALL + 1
#define CC_SURFACES_DEBUG_VIEW_ENVIRONMENT_2ND_SPECULAR CC_SURFACES_DEBUG_VIEW_DIRECT_2ND_SPECULAR + 1
#define CC_SURFACES_DEBUG_VIEW_2ND_SPECULAR_ALL CC_SURFACES_DEBUG_VIEW_ENVIRONMENT_2ND_SPECULAR + 1
#define CC_SURFACES_DEBUG_VIEW_FOG CC_SURFACES_DEBUG_VIEW_2ND_SPECULAR_ALL + 1
#define IS_DEBUG_VIEW_ENABLE_WITH_CAMERA (cc_surfaceTransform.y != 3.0)
bool equalf_mode(float data1, float data2) { return abs(float(data1) - float(data2)) < 0.001; }
#define IS_DEBUG_VIEW_LIGHTING_ENABLE_WITH_ALBEDO (UnpackBitFromFloat(cc_debug_view_mode.w, 6) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_MISC_ENABLE_CSM_LAYER_COLORATION (UnpackBitFromFloat(cc_debug_view_mode.w, 7) && IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_DIRECT_DIFFUSE (UnpackBitFromFloat(cc_debug_view_mode.y, 0) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_DIRECT_SPECULAR (UnpackBitFromFloat(cc_debug_view_mode.y, 1) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_ENV_DIFFUSE (UnpackBitFromFloat(cc_debug_view_mode.y, 2) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_ENV_SPECULAR (UnpackBitFromFloat(cc_debug_view_mode.y, 3) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_EMISSIVE (UnpackBitFromFloat(cc_debug_view_mode.y, 4) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_LIGHT_MAP (UnpackBitFromFloat(cc_debug_view_mode.y, 5) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_SHADOW (UnpackBitFromFloat(cc_debug_view_mode.y, 6) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_AO (UnpackBitFromFloat(cc_debug_view_mode.y, 7) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_NORMAL_MAP (UnpackBitFromFloat(cc_debug_view_mode.z, 0) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_FOG (UnpackBitFromFloat(cc_debug_view_mode.z, 1) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_TONE_MAPPING (UnpackBitFromFloat(cc_debug_view_mode.z, 2) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_GAMMA_CORRECTION (UnpackBitFromFloat(cc_debug_view_mode.z, 3) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_FRESNEL (UnpackBitFromFloat(cc_debug_view_mode.z, 4) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_TRANSMIT_DIFFUSE (UnpackBitFromFloat(cc_debug_view_mode.z, 5) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_TRANSMIT_SPECULAR (UnpackBitFromFloat(cc_debug_view_mode.z, 6) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_2ND_SPECULAR (UnpackBitFromFloat(cc_debug_view_mode.z, 7) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#define IS_DEBUG_VIEW_COMPOSITE_ENABLE_TT (UnpackBitFromFloat(cc_debug_view_mode.w, 0) || !IS_DEBUG_VIEW_ENABLE_WITH_CAMERA)
#if (CC_PIPELINE_TYPE == 0 || CC_FORCE_FORWARD_SHADING)
  #if CC_FORWARD_ADD
    #if CC_PIPELINE_TYPE == 0
      #define LIGHTS_PER_PASS 1
    #else
      #define LIGHTS_PER_PASS 10
    #endif
    #if CC_ENABLE_CLUSTERED_LIGHT_CULLING == 0
    uniform highp vec4 cc_lightPos[LIGHTS_PER_PASS];
  uniform vec4 cc_lightColor[LIGHTS_PER_PASS];
  uniform vec4 cc_lightSizeRangeAngle[LIGHTS_PER_PASS];
  uniform vec4 cc_lightDir[LIGHTS_PER_PASS];
  uniform vec4 cc_lightBoundingSizeVS[LIGHTS_PER_PASS];
    #endif
  #endif
#endif
#if CC_USE_LIGHT_PROBE
  #if !USE_INSTANCING
    uniform vec4 cc_sh_linear_const_r;
  uniform vec4 cc_sh_linear_const_g;
  uniform vec4 cc_sh_linear_const_b;
  uniform vec4 cc_sh_quadratic_r;
  uniform vec4 cc_sh_quadratic_g;
  uniform vec4 cc_sh_quadratic_b;
  uniform vec4 cc_sh_quadratic_a;
  #endif
#endif
uniform highp mat4 cc_matLightView;
  uniform highp mat4 cc_matLightViewProj;
  uniform highp vec4 cc_shadowInvProjDepthInfo;
  uniform highp vec4 cc_shadowProjDepthInfo;
  uniform highp vec4 cc_shadowProjInfo;
  uniform mediump vec4 cc_shadowNFLSInfo;
  uniform mediump vec4 cc_shadowWHPBInfo;
#if CC_SUPPORT_CASCADED_SHADOW_MAP
  uniform highp vec4 cc_csmViewDir0[4];
  uniform highp vec4 cc_csmViewDir1[4];
  uniform highp vec4 cc_csmViewDir2[4];
  uniform highp vec4 cc_csmAtlas[4];
  uniform highp mat4 cc_matCSMViewProj[4];
  uniform highp vec4 cc_csmProjDepthInfo[4];
  uniform highp vec4 cc_csmProjInfo[4];
  uniform highp vec4 cc_csmSplitsInfo;
#endif
uniform samplerCube cc_environment;
#if CC_USE_IBL
  #if CC_USE_DIFFUSEMAP
    uniform samplerCube cc_diffuseMap;
  #endif
#endif
#if CC_USE_REFLECTION_PROBE
  uniform samplerCube cc_reflectionProbeCubemap;
  uniform sampler2D cc_reflectionProbePlanarMap;
  uniform sampler2D cc_reflectionProbeDataMap;
#endif
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
#define UnpackBitFromFloat(value, bit) (mod(floor(value / pow(10.0, float(bit))), 10.0) > 0.0)
highp float unpackHighpData (float mainPart, float modPart) {
  highp float data = mainPart;
  return data + modPart;
}
void packHighpData (out float mainPart, out float modPart, highp float data) {
  mainPart = fract(data);
  modPart = data - mainPart;
}
highp float unpackHighpData (float mainPart, float modPart, const float modValue) {
  highp float data = mainPart * modValue;
  return data + modPart * modValue;
}
void packHighpData (out float mainPart, out float modPart, highp float data, const float modValue) {
  highp float divide = data / modValue;
  mainPart = floor(divide);
  modPart = (data - mainPart * modValue) / modValue;
}
highp vec2 unpackHighpData (vec2 mainPart, vec2 modPart) {
  highp vec2 data = mainPart;
  return data + modPart;
}
void packHighpData (out vec2 mainPart, out vec2 modPart, highp vec2 data) {
  mainPart = fract(data);
  modPart = data - mainPart;
}
highp vec2 unpackHighpData (vec2 mainPart, vec2 modPart, const float modValue) {
  highp vec2 data = mainPart * modValue;
  return data + modPart * modValue;
}
void packHighpData (out vec2 mainPart, out vec2 modPart, highp vec2 data, const float modValue) {
  highp vec2 divide = data / modValue;
  mainPart = floor(divide);
  modPart = (data - mainPart * modValue) / modValue;
}
highp vec3 unpackHighpData (vec3 mainPart, vec3 modPart) {
  highp vec3 data = mainPart;
  return data + modPart;
}
void packHighpData (out vec3 mainPart, out vec3 modPart, highp vec3 data) {
  mainPart = fract(data);
  modPart = data - mainPart;
}
highp vec3 unpackHighpData (vec3 mainPart, vec3 modPart, const float modValue) {
  highp vec3 data = mainPart * modValue;
  return data + modPart * modValue;
}
void packHighpData (out vec3 mainPart, out vec3 modPart, highp vec3 data, const float modValue) {
  highp vec3 divide = data / modValue;
  mainPart = floor(divide);
  modPart = (data - mainPart * modValue) / modValue;
}
highp vec4 unpackHighpData (vec4 mainPart, vec4 modPart) {
  highp vec4 data = mainPart;
  return data + modPart;
}
void packHighpData (out vec4 mainPart, out vec4 modPart, highp vec4 data) {
  mainPart = fract(data);
  modPart = data - mainPart;
}
highp vec4 unpackHighpData (vec4 mainPart, vec4 modPart, const float modValue) {
  highp vec4 data = mainPart * modValue;
  return data + modPart * modValue;
}
void packHighpData (out vec4 mainPart, out vec4 modPart, highp vec4 data, const float modValue) {
  highp vec4 divide = data / modValue;
  mainPart = floor(divide);
  modPart = (data - mainPart * modValue) / modValue;
}
highp float decode32 (highp vec4 rgba) {
  rgba = rgba * 255.0;
  highp float Sign = 1.0 - (step(128.0, (rgba[3]) + 0.5)) * 2.0;
  highp float Exponent = 2.0 * (mod(float(int((rgba[3]) + 0.5)), 128.0)) + (step(128.0, (rgba[2]) + 0.5)) - 127.0;
  highp float Mantissa = (mod(float(int((rgba[2]) + 0.5)), 128.0)) * 65536.0 + rgba[1] * 256.0 + rgba[0] + 8388608.0;
  return Sign * exp2(Exponent - 23.0) * Mantissa;
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
bool isnan(float val) {
  return (val < 0.0 || 0.0 < val || val == 0.0) ? false : true;
}
bool isinf(float x) {
  return x == x * 2.0 && x != 0.0;
}
bool isnans(vec2 val) {
    return isnan(val.x) || isnan(val.y);
}
bool isnans(vec3 val) {
    return isnan(val.x) || isnan(val.y) || isnan(val.z);
}
bool isnans(vec4 val) {
    return isnan(val.x) || isnan(val.y) || isnan(val.z) || isnan(val.w);
}
bool isinfs(vec2 val) {
    return isinf(val.x) || isinf(val.y);
}
bool isinfs(vec3 val) {
    return isinf(val.x) || isinf(val.y) || isinf(val.z);
}
bool isinfs(vec4 val) {
    return isinf(val.x) || isinf(val.y) || isinf(val.z) || isinf(val.w);
}
#if defined(CC_USE_METAL) || defined(CC_USE_WGPU)
#define CC_HANDLE_SAMPLE_NDC_FLIP_STATIC(y) y = -y
#else
#define CC_HANDLE_SAMPLE_NDC_FLIP_STATIC(y)
#endif
vec2 GetPlanarReflectScreenUV(vec3 worldPos, mat4 matVirtualCameraViewProj, float flipNDCSign, vec3 viewDir, vec3 reflectDir)
{
  vec4 clipPos = matVirtualCameraViewProj * vec4(worldPos, 1.0);
  vec2 screenUV = clipPos.xy / clipPos.w * 0.5 + 0.5;
  screenUV = vec2(1.0 - screenUV.x, screenUV.y);
  screenUV = flipNDCSign == 1.0 ? vec2(screenUV.x, 1.0 - screenUV.y) : screenUV;
  return screenUV;
}
float GetLinearDepthFromViewSpace(vec3 viewPos, float near, float far) {
  float dist = length(viewPos);
  return (dist - near) / (far - near);
}
vec3 CalculateBinormal(vec3 normal, vec3 tangent, float mirrorNormal)
{
    return cross(normal, tangent) * mirrorNormal;
}
vec3 CalculateTangent(vec3 normal, vec3 binormal)
{
    return cross(binormal, normal);
}
vec3 CalculateNormal(vec3 tangent, vec3 binormal)
{
    return cross(tangent, binormal);
}
vec3 CalculateNormalFromTangentSpace(vec3 normalFromTangentSpace, float normalStrength, vec3 normal, vec3 tangent, float mirrorNormal)
{
    vec3 binormal = CalculateBinormal(normal, tangent, mirrorNormal);
    return (normalFromTangentSpace.x * normalStrength) * normalize(tangent) +
           (normalFromTangentSpace.y * normalStrength) * normalize(binormal) +
            normalFromTangentSpace.z * normalize(normal);
}
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
void RotateTangentAndBinormal(inout vec3 tangent, inout vec3 binormal, vec3 normal, float rotationAngle)
{
    float cosTheta = cos(rotationAngle), sinTheta = sin(rotationAngle);
    vec3 B = RotationVecFromAxisY(vec3(1.0, 0.0, 0.0), cosTheta, sinTheta);
    vec3 T = RotationVecFromAxisY(vec3(0.0, 0.0, 1.0), cosTheta, sinTheta);
    vec3 tangentNew, binormalNew;
    binormalNew = B.x * binormal + B.y * normal + B.z * tangent;
    binormal = normalize(binormalNew);
    tangentNew = T.x * binormal + T.y * normal + T.z * tangent;
    tangent = normalize(tangentNew);
}
void RotateNormalAndBinormal(inout vec3 binormal, inout vec3 normal, in vec3 tangent, float rotationAngle, float mirrorNormal)
{
  if(rotationAngle > 0.0)
  {
    normal += (binormal - normal) * rotationAngle;
    normal = normalize(normal);
    binormal = CalculateBinormal(normal, tangent, mirrorNormal);
  }
  else if(rotationAngle < 0.0)
  {
    binormal += (binormal - normal) * rotationAngle;
    binormal = normalize(binormal);
    normal = CalculateNormal(tangent, binormal);
  }
}
vec2 signNotZero(vec2 v) {
  return vec2((v.x >= 0.0) ? +1.0 : -1.0, (v.y >= 0.0) ? +1.0 : -1.0);
}
vec2 float32x3_to_oct(in vec3 v) {
  vec2 p = v.xy * (1.0 / (abs(v.x) + abs(v.y) + abs(v.z)));
  return (v.z <= 0.0) ? ((1.0 - abs(p.yx)) * signNotZero(p)) : p;
}
bool GetMetallicAlbedoFromDiffuseSpecularWithoutColor(out float metallic, out vec3 albedo, vec3 diffuse, vec3 specular, float f0 )
{
	float d = max(max(diffuse.x, diffuse.y), diffuse.z);
	vec3 normalizedColor = diffuse / (d + (d < EPSILON_LOWP ? EPSILON_LOWP : 0.0));
	normalizedColor = d < EPSILON_LOWP ? specular : normalizedColor;
	float s = max(max(specular.x, specular.y), specular.z);
	float delta = (d + s) * (d + s)  - 4.0 * f0 * d;
	float deltaSqrt = sqrt(max(0.0, delta));
	float solverMetallic = (-d - s + 2.0 * f0 + deltaSqrt) / (2.0 * f0);
	vec3 solverAlbedo = (d + s) * normalizedColor - vec3(f0 * (1.0 - solverMetallic));
	bool isValidSolver = delta >= 0.0;
	metallic = isValidSolver ? clamp(solverMetallic, 0.0, 1.0) : 0.0;
	albedo = isValidSolver ? vec3(max(0.0, solverAlbedo.x), max(0.0, solverAlbedo.y), max(0.0, solverAlbedo.z)) : diffuse;
	return isValidSolver;
}
float RoughnessToPerceptualRoughness(float roughness)
{
  return sqrt(roughness);
}
  vec3 EnvReflectionWithMipFiltering(vec3 R, float roughness, float mipCount, float denoiseIntensity) {
    #if CC_USE_IBL
      #if !CC_SURFACES_USE_LEGACY_COMPATIBLE_LIGHTING && !CC_IBL_CONVOLUTED
        roughness = RoughnessToPerceptualRoughness(roughness);
      #endif
    	float mip = roughness * (mipCount - 1.0);
    	float delta = (dot(dFdx(R), dFdy(R))) * 1000.0;
    	float mipBias = mix(0.0, 5.0, clamp(delta, 0.0, 1.0));
      vec3 rotationDir = RotationVecFromAxisY(R.xyz, cc_surfaceTransform.z, cc_surfaceTransform.w);
    	vec4 biased = fragTextureLod(cc_environment, rotationDir, mip + mipBias);
     	vec4 filtered = textureCube(cc_environment, rotationDir);
      #if CC_USE_IBL == 2
      	biased.rgb = unpackRGBE(biased);
      	filtered.rgb = unpackRGBE(filtered);
      #else
      	biased.rgb = SRGBToLinear(biased.rgb);
      	filtered.rgb = SRGBToLinear(filtered.rgb);
      #endif
      return mix(biased.rgb, filtered.rgb, denoiseIntensity);
    #else
      return vec3(0.0, 0.0, 0.0);
    #endif
  }
  vec3 EnvReflection(samplerCube tex, vec3 R, float roughness, float mipCount) {
    #if !CC_SURFACES_USE_LEGACY_COMPATIBLE_LIGHTING && !CC_IBL_CONVOLUTED
      roughness = RoughnessToPerceptualRoughness(roughness);
    #endif
    vec3 rotationDir = RotationVecFromAxisY(R.xyz, cc_surfaceTransform.z, cc_surfaceTransform.w);
    vec4 envmap = fragTextureLod(tex, rotationDir, roughness * (mipCount - 1.0));
    #if CC_USE_IBL == 2
      return unpackRGBE(envmap);
    #else
      return SRGBToLinear(envmap.rgb);
    #endif
  }
  vec3 EnvReflectionOfReflectionProbe(samplerCube tex, vec3 R, float roughness, float mipCount, bool isRGBE) {
    #if !CC_SURFACES_USE_LEGACY_COMPATIBLE_LIGHTING && !CC_IBL_CONVOLUTED
      roughness = RoughnessToPerceptualRoughness(roughness);
    #endif
    vec4 envmap = fragTextureLod(tex, R, roughness * (mipCount - 1.0));
    return isRGBE ? unpackRGBE(envmap) : SRGBToLinear(envmap.rgb);
  }
#if CC_SUPPORT_CASCADED_SHADOW_MAP
#endif
float CCGetLinearDepth(vec3 worldPos, float viewSpaceBias) {
	vec4 viewPos = cc_matLightView * vec4(worldPos.xyz, 1.0);
  viewPos.z += viewSpaceBias;
	return GetLinearDepthFromViewSpace(viewPos.xyz, cc_shadowNFLSInfo.x, cc_shadowNFLSInfo.y);
}
float CCGetLinearDepth(vec3 worldPos) {
	return CCGetLinearDepth(worldPos, 0.0);
}
#if CC_RECEIVE_SHADOW
  uniform highp sampler2D cc_shadowMap;
  uniform highp sampler2D cc_spotShadowMap;
  vec4 shadowTexure(highp sampler2D shadowMap, vec2 coord) {
      #if defined(CC_USE_WGPU)
          return texture2DLod(shadowMap, coord, 0.0);
      #else
        return texture2D(shadowMap, coord);
      #endif
  }
  float SampleShadowMap (vec3 shadowNDCPos, highp sampler2D shadowMap)
  {
    #if CC_SHADOWMAP_FORMAT == 1
      return dot(shadowTexure(shadowMap, shadowNDCPos.xy), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0));
    #else
      return shadowTexure(shadowMap, shadowNDCPos.xy).x;
    #endif
  }
  float SampleShadowMapSoft (vec3 shadowNDCPos, highp sampler2D shadowMap, vec2 shadowMapResolution)
  {
    vec2 oneTap = 1.0 / shadowMapResolution;
    vec2 shadowNDCPos_offset = shadowNDCPos.xy + oneTap;
    float block0 = SampleShadowMap(vec3(shadowNDCPos.x, shadowNDCPos.y, shadowNDCPos.z), shadowMap);
    float block1 = SampleShadowMap(vec3(shadowNDCPos_offset.x, shadowNDCPos.y, shadowNDCPos.z), shadowMap);
    float block2 = SampleShadowMap(vec3(shadowNDCPos.x, shadowNDCPos_offset.y, shadowNDCPos.z), shadowMap);
    float block3 = SampleShadowMap(vec3(shadowNDCPos_offset.x, shadowNDCPos_offset.y, shadowNDCPos.z), shadowMap);
    float coefX   = mod(shadowNDCPos.x, oneTap.x) * shadowMapResolution.x;
    float resultX = mix(block0, block1, coefX);
    float resultY = mix(block2, block3, coefX);
    float coefY   = mod(shadowNDCPos.y, oneTap.y) * shadowMapResolution.y;
    return mix(resultX, resultY, coefY);
  }
  float NativePCFShadowFactorHard (vec3 shadowNDCPos, highp sampler2D shadowMap, vec2 shadowMapResolution)
  {
    #if CC_SHADOWMAP_FORMAT == 1
      return step(shadowNDCPos.z, dot(shadowTexure(shadowMap, shadowNDCPos.xy), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
    #else
      return step(shadowNDCPos.z, shadowTexure(shadowMap, shadowNDCPos.xy).x);
    #endif
  }
  float NativePCFShadowFactorSoft (vec3 shadowNDCPos, highp sampler2D shadowMap, vec2 shadowMapResolution)
  {
    vec2 oneTap = 1.0 / shadowMapResolution;
    vec2 shadowNDCPos_offset = shadowNDCPos.xy + oneTap;
    float block0, block1, block2, block3;
    #if CC_SHADOWMAP_FORMAT == 1
      block0 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos.x, shadowNDCPos.y)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block1 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos_offset.x, shadowNDCPos.y)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block2 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos.x, shadowNDCPos_offset.y)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block3 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos_offset.x, shadowNDCPos_offset.y)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
    #else
      block0 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos.x, shadowNDCPos.y)).x);
      block1 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos_offset.x, shadowNDCPos.y)).x);
      block2 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos.x, shadowNDCPos_offset.y)).x);
      block3 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos_offset.x, shadowNDCPos_offset.y)).x);
    #endif
    float coefX   = mod(shadowNDCPos.x, oneTap.x) * shadowMapResolution.x;
    float resultX = mix(block0, block1, coefX);
    float resultY = mix(block2, block3, coefX);
    float coefY   = mod(shadowNDCPos.y, oneTap.y) * shadowMapResolution.y;
    return mix(resultX, resultY, coefY);
  }
  float NativePCFShadowFactorSoft3X (vec3 shadowNDCPos, highp sampler2D shadowMap, vec2 shadowMapResolution)
  {
    vec2 oneTap = 1.0 / shadowMapResolution;
    float shadowNDCPos_offset_L = shadowNDCPos.x - oneTap.x;
    float shadowNDCPos_offset_R = shadowNDCPos.x + oneTap.x;
    float shadowNDCPos_offset_U = shadowNDCPos.y - oneTap.y;
    float shadowNDCPos_offset_D = shadowNDCPos.y + oneTap.y;
    float block0, block1, block2, block3, block4, block5, block6, block7, block8;
    #if CC_SHADOWMAP_FORMAT == 1
      block0 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos_offset_L, shadowNDCPos_offset_U)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block1 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos.x, shadowNDCPos_offset_U)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block2 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos_offset_R, shadowNDCPos_offset_U)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block3 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos_offset_L, shadowNDCPos.y)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block4 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos.x, shadowNDCPos.y)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block5 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos_offset_R, shadowNDCPos.y)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block6 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos_offset_L, shadowNDCPos_offset_D)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block7 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos.x, shadowNDCPos_offset_D)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block8 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, vec2(shadowNDCPos_offset_R, shadowNDCPos_offset_D)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
    #else
      block0 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos_offset_L, shadowNDCPos_offset_U)).x);
      block1 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos.x, shadowNDCPos_offset_U)).x);
      block2 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos_offset_R, shadowNDCPos_offset_U)).x);
      block3 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos_offset_L, shadowNDCPos.y)).x);
      block4 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos.x, shadowNDCPos.y)).x);
      block5 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos_offset_R, shadowNDCPos.y)).x);
      block6 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos_offset_L, shadowNDCPos_offset_D)).x);
      block7 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos.x, shadowNDCPos_offset_D)).x);
      block8 = step(shadowNDCPos.z, shadowTexure(shadowMap, vec2(shadowNDCPos_offset_R, shadowNDCPos_offset_D)).x);
    #endif
    float coefX = mod(shadowNDCPos.x, oneTap.x) * shadowMapResolution.x;
    float coefY = mod(shadowNDCPos.y, oneTap.y) * shadowMapResolution.y;
    float shadow = 0.0;
    float resultX = mix(block0, block1, coefX);
    float resultY = mix(block3, block4, coefX);
    shadow += mix(resultX , resultY, coefY);
    resultX = mix(block1, block2, coefX);
    resultY = mix(block4, block5, coefX);
    shadow += mix(resultX , resultY, coefY);
    resultX = mix(block3, block4, coefX);
    resultY = mix(block6, block7, coefX);
    shadow += mix(resultX, resultY, coefY);
    resultX = mix(block4, block5, coefX);
    resultY = mix(block7, block8, coefX);
    shadow += mix(resultX, resultY, coefY);
    return shadow * 0.25;
  }
  float NativePCFShadowFactorSoft5X (vec3 shadowNDCPos, highp sampler2D shadowMap, vec2 shadowMapResolution)
  {
    vec2 oneTap = 1.0 / shadowMapResolution;
    vec2 twoTap = oneTap * 2.0;
    vec2 offset1 = shadowNDCPos.xy + vec2(-twoTap.x, -twoTap.y);
    vec2 offset2 = shadowNDCPos.xy + vec2(-oneTap.x, -twoTap.y);
    vec2 offset3 = shadowNDCPos.xy + vec2(0.0, -twoTap.y);
    vec2 offset4 = shadowNDCPos.xy + vec2(oneTap.x, -twoTap.y);
    vec2 offset5 = shadowNDCPos.xy + vec2(twoTap.x, -twoTap.y);
    vec2 offset6 = shadowNDCPos.xy + vec2(-twoTap.x, -oneTap.y);
    vec2 offset7 = shadowNDCPos.xy + vec2(-oneTap.x, -oneTap.y);
    vec2 offset8 = shadowNDCPos.xy + vec2(0.0, -oneTap.y);
    vec2 offset9 = shadowNDCPos.xy + vec2(oneTap.x, -oneTap.y);
    vec2 offset10 = shadowNDCPos.xy + vec2(twoTap.x, -oneTap.y);
    vec2 offset11 = shadowNDCPos.xy + vec2(-twoTap.x, 0.0);
    vec2 offset12 = shadowNDCPos.xy + vec2(-oneTap.x, 0.0);
    vec2 offset13 = shadowNDCPos.xy + vec2(0.0, 0.0);
    vec2 offset14 = shadowNDCPos.xy + vec2(oneTap.x, 0.0);
    vec2 offset15 = shadowNDCPos.xy + vec2(twoTap.x, 0.0);
    vec2 offset16 = shadowNDCPos.xy + vec2(-twoTap.x, oneTap.y);
    vec2 offset17 = shadowNDCPos.xy + vec2(-oneTap.x, oneTap.y);
    vec2 offset18 = shadowNDCPos.xy + vec2(0.0, oneTap.y);
    vec2 offset19 = shadowNDCPos.xy + vec2(oneTap.x, oneTap.y);
    vec2 offset20 = shadowNDCPos.xy + vec2(twoTap.x, oneTap.y);
    vec2 offset21 = shadowNDCPos.xy + vec2(-twoTap.x, twoTap.y);
    vec2 offset22 = shadowNDCPos.xy + vec2(-oneTap.x, twoTap.y);
    vec2 offset23 = shadowNDCPos.xy + vec2(0.0, twoTap.y);
    vec2 offset24 = shadowNDCPos.xy + vec2(oneTap.x, twoTap.y);
    vec2 offset25 = shadowNDCPos.xy + vec2(twoTap.x, twoTap.y);
    float block1, block2, block3, block4, block5, block6, block7, block8, block9, block10, block11, block12, block13, block14, block15, block16, block17, block18, block19, block20, block21, block22, block23, block24, block25;
    #if CC_SHADOWMAP_FORMAT == 1
      block1 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset1), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block2 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset2), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block3 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset3), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block4 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset4), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block5 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset5), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block6 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset6), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block7 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset7), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block8 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset8), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block9 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset9), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block10 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset10), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block11 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset11), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block12 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset12), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block13 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset13), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block14 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset14), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block15 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset15), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block16 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset16), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block17 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset17), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block18 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset18), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block19 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset19), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block20 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset20), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block21 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset21), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block22 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset22), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block23 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset23), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block24 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset24), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
      block25 = step(shadowNDCPos.z, dot(shadowTexure(shadowMap, offset25), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)));
    #else
      block1 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset1).x);
      block2 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset2).x);
      block3 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset3).x);
      block4 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset4).x);
      block5 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset5).x);
      block6 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset6).x);
      block7 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset7).x);
      block8 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset8).x);
      block9 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset9).x);
      block10 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset10).x);
      block11 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset11).x);
      block12 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset12).x);
      block13 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset13).x);
      block14 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset14).x);
      block15 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset15).x);
      block16 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset16).x);
      block17 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset17).x);
      block18 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset18).x);
      block19 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset19).x);
      block20 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset20).x);
      block21 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset21).x);
      block22 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset22).x);
      block23 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset23).x);
      block24 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset24).x);
      block25 = step(shadowNDCPos.z, shadowTexure(shadowMap, offset25).x);
    #endif
    vec2 coef = fract(shadowNDCPos.xy * shadowMapResolution);
    vec2 v1X1 = mix(vec2(block1, block6), vec2(block2, block7), coef.xx);
    vec2 v1X2 = mix(vec2(block2, block7), vec2(block3, block8), coef.xx);
    vec2 v1X3 = mix(vec2(block3, block8), vec2(block4, block9), coef.xx);
    vec2 v1X4 = mix(vec2(block4, block9), vec2(block5, block10), coef.xx);
    float v1 = mix(v1X1.x, v1X1.y, coef.y) + mix(v1X2.x, v1X2.y, coef.y) + mix(v1X3.x, v1X3.y, coef.y) + mix(v1X4.x, v1X4.y, coef.y);
    vec2 v2X1 = mix(vec2(block6, block11), vec2(block7, block12), coef.xx);
    vec2 v2X2 = mix(vec2(block7, block12), vec2(block8, block13), coef.xx);
    vec2 v2X3 = mix(vec2(block8, block13), vec2(block9, block14), coef.xx);
    vec2 v2X4 = mix(vec2(block9, block14), vec2(block10, block15), coef.xx);
    float v2 = mix(v2X1.x, v2X1.y, coef.y) + mix(v2X2.x, v2X2.y, coef.y) + mix(v2X3.x, v2X3.y, coef.y) + mix(v2X4.x, v2X4.y, coef.y);
    vec2 v3X1 = mix(vec2(block11, block16), vec2(block12, block17), coef.xx);
    vec2 v3X2 = mix(vec2(block12, block17), vec2(block13, block18), coef.xx);
    vec2 v3X3 = mix(vec2(block13, block18), vec2(block14, block19), coef.xx);
    vec2 v3X4 = mix(vec2(block14, block19), vec2(block15, block20), coef.xx);
    float v3 = mix(v3X1.x, v3X1.y, coef.y) + mix(v3X2.x, v3X2.y, coef.y) + mix(v3X3.x, v3X3.y, coef.y) + mix(v3X4.x, v3X4.y, coef.y);
    vec2 v4X1 = mix(vec2(block16, block21), vec2(block17, block22), coef.xx);
    vec2 v4X2 = mix(vec2(block17, block22), vec2(block18, block23), coef.xx);
    vec2 v4X3 = mix(vec2(block18, block23), vec2(block19, block24), coef.xx);
    vec2 v4X4 = mix(vec2(block19, block24), vec2(block20, block25), coef.xx);
    float v4 = mix(v4X1.x, v4X1.y, coef.y) + mix(v4X2.x, v4X2.y, coef.y) + mix(v4X3.x, v4X3.y, coef.y) + mix(v4X4.x, v4X4.y, coef.y);
    float fAvg = (v1 + v2 + v3 + v4) * 0.0625;
    return fAvg;
  }
  bool GetShadowNDCPos(out vec3 shadowNDCPos, vec4 shadowPosWithDepthBias)
  {
  	shadowNDCPos = shadowPosWithDepthBias.xyz / shadowPosWithDepthBias.w * 0.5 + 0.5;
  	if (shadowNDCPos.x < 0.0 || shadowNDCPos.x > 1.0 ||
  		shadowNDCPos.y < 0.0 || shadowNDCPos.y > 1.0 ||
  		shadowNDCPos.z < 0.0 || shadowNDCPos.z > 1.0) {
  		return false;
  	}
  	shadowNDCPos.xy = cc_cameraPos.w == 1.0 ? vec2(shadowNDCPos.xy.x, 1.0 - shadowNDCPos.xy.y) : shadowNDCPos.xy;
  	return true;
  }
  vec4 ApplyShadowDepthBias_FaceNormal(vec4 shadowPos, vec3 worldNormal, float normalBias, vec3 matViewDir0, vec3 matViewDir1, vec3 matViewDir2, vec2 projScaleXY)
  {
    vec4 newShadowPos = shadowPos;
    if (normalBias > EPSILON_LOWP)
    {
      vec3 viewNormal = vec3(dot(matViewDir0, worldNormal), dot(matViewDir1, worldNormal), dot(matViewDir2, worldNormal));
      if (viewNormal.z < 0.1)
        newShadowPos.xy += viewNormal.xy * projScaleXY * normalBias * clamp(viewNormal.z, 0.001, 0.1);
    }
    return newShadowPos;
  }
  vec4 ApplyShadowDepthBias_FaceNormal(vec4 shadowPos, vec3 worldNormal, float normalBias, mat4 matLightView, vec2 projScaleXY)
  {
  	vec4 newShadowPos = shadowPos;
  	if (normalBias > EPSILON_LOWP)
  	{
  		vec4 viewNormal = matLightView * vec4(worldNormal, 0.0);
  		if (viewNormal.z < 0.1)
  			newShadowPos.xy += viewNormal.xy * projScaleXY * normalBias * clamp(viewNormal.z, 0.001, 0.1);
  	}
  	return newShadowPos;
  }
  float GetViewSpaceDepthFromNDCDepth_Orthgraphic(float NDCDepth, float projScaleZ, float projBiasZ)
  {
  	return (NDCDepth - projBiasZ) / projScaleZ;
  }
  float GetViewSpaceDepthFromNDCDepth_Perspective(float NDCDepth, float homogenousDividW, float invProjScaleZ, float invProjBiasZ)
  {
  	return NDCDepth * invProjScaleZ + homogenousDividW * invProjBiasZ;
  }
  vec4 ApplyShadowDepthBias_Perspective(vec4 shadowPos, float viewspaceDepthBias)
  {
  	vec3 viewSpacePos;
  	viewSpacePos.xy = shadowPos.xy * cc_shadowProjInfo.zw;
  	viewSpacePos.z = GetViewSpaceDepthFromNDCDepth_Perspective(shadowPos.z, shadowPos.w, cc_shadowInvProjDepthInfo.x, cc_shadowInvProjDepthInfo.y);
  	viewSpacePos.xyz += cc_shadowProjDepthInfo.z * normalize(viewSpacePos.xyz) * viewspaceDepthBias;
  	vec4 clipSpacePos;
  	clipSpacePos.xy = viewSpacePos.xy * cc_shadowProjInfo.xy;
  	clipSpacePos.zw = viewSpacePos.z * cc_shadowProjDepthInfo.xz + vec2(cc_shadowProjDepthInfo.y, 0.0);
  	#if CC_SHADOWMAP_USE_LINEAR_DEPTH
  		clipSpacePos.z = GetLinearDepthFromViewSpace(viewSpacePos.xyz, cc_shadowNFLSInfo.x, cc_shadowNFLSInfo.y);
  		clipSpacePos.z = (clipSpacePos.z * 2.0 - 1.0) * clipSpacePos.w;
  	#endif
  	return clipSpacePos;
  }
  vec4 ApplyShadowDepthBias_Orthographic(vec4 shadowPos, float viewspaceDepthBias, float projScaleZ, float projBiasZ)
  {
  	float coeffA = projScaleZ;
  	float coeffB = projBiasZ;
  	float viewSpacePos_z = GetViewSpaceDepthFromNDCDepth_Orthgraphic(shadowPos.z, projScaleZ, projBiasZ);
  	viewSpacePos_z += viewspaceDepthBias;
  	vec4 result = shadowPos;
  	result.z = viewSpacePos_z * coeffA + coeffB;
  	return result;
  }
  vec4 ApplyShadowDepthBias_PerspectiveLinearDepth(vec4 shadowPos, float viewspaceDepthBias, vec3 worldPos)
  {
    shadowPos.z = CCGetLinearDepth(worldPos, viewspaceDepthBias) * 2.0 - 1.0;
    shadowPos.z *= shadowPos.w;
    return shadowPos;
  }
  float CCGetDirLightShadowFactorHard (vec4 shadowPosWithDepthBias) {
	  vec3 shadowNDCPos;
	  if (!GetShadowNDCPos(shadowNDCPos, shadowPosWithDepthBias)) {
		  return 1.0;
	  }
    return NativePCFShadowFactorHard(shadowNDCPos, cc_shadowMap, cc_shadowWHPBInfo.xy);
  }
  float CCGetDirLightShadowFactorSoft (vec4 shadowPosWithDepthBias) {
	  vec3 shadowNDCPos;
	  if (!GetShadowNDCPos(shadowNDCPos, shadowPosWithDepthBias)) {
		  return 1.0;
	  }
    return NativePCFShadowFactorSoft(shadowNDCPos, cc_shadowMap, cc_shadowWHPBInfo.xy);
  }
  float CCGetDirLightShadowFactorSoft3X (vec4 shadowPosWithDepthBias) {
	  vec3 shadowNDCPos;
	  if (!GetShadowNDCPos(shadowNDCPos, shadowPosWithDepthBias)) {
		  return 1.0;
	  }
    return NativePCFShadowFactorSoft3X(shadowNDCPos, cc_shadowMap, cc_shadowWHPBInfo.xy);
  }
  float CCGetDirLightShadowFactorSoft5X (vec4 shadowPosWithDepthBias) {
	  vec3 shadowNDCPos;
	  if (!GetShadowNDCPos(shadowNDCPos, shadowPosWithDepthBias)) {
		  return 1.0;
	  }
    return NativePCFShadowFactorSoft5X(shadowNDCPos, cc_shadowMap, cc_shadowWHPBInfo.xy);
  }
  float CCGetSpotLightShadowFactorHard (vec4 shadowPosWithDepthBias, vec3 worldPos) {
	  vec3 shadowNDCPos;
	  if (!GetShadowNDCPos(shadowNDCPos, shadowPosWithDepthBias)) {
		  return 1.0;
	  }
    return NativePCFShadowFactorHard(shadowNDCPos, cc_spotShadowMap, cc_shadowWHPBInfo.xy);
  }
  float CCGetSpotLightShadowFactorSoft (vec4 shadowPosWithDepthBias, vec3 worldPos) {
	  vec3 shadowNDCPos;
	  if (!GetShadowNDCPos(shadowNDCPos, shadowPosWithDepthBias)) {
		  return 1.0;
	  }
    return NativePCFShadowFactorSoft(shadowNDCPos, cc_spotShadowMap, cc_shadowWHPBInfo.xy);
  }
  float CCGetSpotLightShadowFactorSoft3X (vec4 shadowPosWithDepthBias, vec3 worldPos) {
	  vec3 shadowNDCPos;
	  if (!GetShadowNDCPos(shadowNDCPos, shadowPosWithDepthBias)) {
		  return 1.0;
	  }
    return NativePCFShadowFactorSoft3X(shadowNDCPos, cc_spotShadowMap, cc_shadowWHPBInfo.xy);
  }
  float CCGetSpotLightShadowFactorSoft5X (vec4 shadowPosWithDepthBias, vec3 worldPos) {
	  vec3 shadowNDCPos;
	  if (!GetShadowNDCPos(shadowNDCPos, shadowPosWithDepthBias)) {
		  return 1.0;
	  }
    return NativePCFShadowFactorSoft5X(shadowNDCPos, cc_spotShadowMap, cc_shadowWHPBInfo.xy);
  }
  float CCSpotShadowFactorBase(out vec4 shadowPosWithDepthBias, vec4 shadowPos, vec3 worldPos, vec2 shadowBias)
  {
    float pcf = cc_shadowWHPBInfo.z;
    vec4 pos = vec4(1.0);
    #if CC_SHADOWMAP_USE_LINEAR_DEPTH
      pos = ApplyShadowDepthBias_PerspectiveLinearDepth(shadowPos, shadowBias.x, worldPos);
    #else
      pos = ApplyShadowDepthBias_Perspective(shadowPos, shadowBias.x);
    #endif
    float realtimeShadow = 1.0;
    if (pcf > 2.9) {
      realtimeShadow = CCGetSpotLightShadowFactorSoft5X(pos, worldPos);
    }else if (pcf > 1.9) {
      realtimeShadow = CCGetSpotLightShadowFactorSoft3X(pos, worldPos);
    }else if (pcf > 0.9) {
      realtimeShadow = CCGetSpotLightShadowFactorSoft(pos, worldPos);
    }else {
      realtimeShadow = CCGetSpotLightShadowFactorHard(pos, worldPos);
    }
    shadowPosWithDepthBias = pos;
    return mix(realtimeShadow, 1.0, cc_shadowNFLSInfo.w);
  }
  float CCShadowFactorBase(out vec4 shadowPosWithDepthBias, vec4 shadowPos, vec3 N, vec2 shadowBias)
  {
    vec4 pos = ApplyShadowDepthBias_FaceNormal(shadowPos, N, shadowBias.y, cc_matLightView, cc_shadowProjInfo.xy);
    pos = ApplyShadowDepthBias_Orthographic(pos, shadowBias.x, cc_shadowProjDepthInfo.x, cc_shadowProjDepthInfo.y);
    float realtimeShadow = 1.0;
    #if CC_DIR_SHADOW_PCF_TYPE == 3
      realtimeShadow = CCGetDirLightShadowFactorSoft5X(pos);
    #endif
    #if CC_DIR_SHADOW_PCF_TYPE == 2
      realtimeShadow =  CCGetDirLightShadowFactorSoft3X(pos);
    #endif
    #if CC_DIR_SHADOW_PCF_TYPE == 1
      realtimeShadow = CCGetDirLightShadowFactorSoft(pos);
    #endif
    #if CC_DIR_SHADOW_PCF_TYPE == 0
      realtimeShadow = CCGetDirLightShadowFactorHard(pos);
    #endif
    shadowPosWithDepthBias = pos;
    return mix(realtimeShadow, 1.0, cc_shadowNFLSInfo.w);
  }
  #if CC_SUPPORT_CASCADED_SHADOW_MAP
    bool CCGetCSMLevelWithTransition(out highp float ratio, vec3 clipPos) {
      highp float maxRange = 1.0 - cc_csmSplitsInfo.x;
      highp float minRange = cc_csmSplitsInfo.x;
      highp float thresholdInvert = 1.0 / cc_csmSplitsInfo.x;
      ratio = 0.0;
      if (clipPos.x <= minRange) {
        ratio = clipPos.x * thresholdInvert;
        return true;
      }
      if (clipPos.x >= maxRange) {
        ratio = 1.0 - (clipPos.x - maxRange) * thresholdInvert;
        return true;
      }
      if (clipPos.y <= minRange) {
        ratio = clipPos.y  * thresholdInvert;
        return true;
      }
      if (clipPos.y >= maxRange) {
        ratio = 1.0 - (clipPos.y - maxRange) * thresholdInvert;
        return true;
      }
      return false;
    }
    bool CCHasCSMLevel(int level, vec3 worldPos) {
      highp float layerThreshold = cc_csmViewDir0[0].w;
      bool hasLevel = false;
      for (int i = 0; i < 4; i++) {
        if (i == level) {
          vec4 shadowPos = cc_matCSMViewProj[i] * vec4(worldPos.xyz, 1.0);
          vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
          if (clipPos.x >= layerThreshold && clipPos.x <= (1.0 - layerThreshold) &&
              clipPos.y >= layerThreshold && clipPos.y <= (1.0 - layerThreshold) &&
              clipPos.z >= 0.0 && clipPos.z <= 1.0) {
            hasLevel = true;
          }
        }
      }
      return hasLevel;
    }
    void CCGetCSMLevel(out vec4 csmPos, out vec4 shadowProjDepthInfo, out vec4 shadowProjInfo, out vec3 shadowViewDir0, out vec3 shadowViewDir1, out vec3 shadowViewDir2, vec3 worldPos, int level) {
      highp float layerThreshold = cc_csmViewDir0[0].w;
      for (int i = 0; i < 4; i++) {
        vec4 shadowPos = cc_matCSMViewProj[i] * vec4(worldPos.xyz, 1.0);
        vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
        if (clipPos.x >= layerThreshold && clipPos.x <= (1.0 - layerThreshold) &&
            clipPos.y >= layerThreshold && clipPos.y <= (1.0 - layerThreshold) &&
            clipPos.z >= 0.0 && clipPos.z <= 1.0 && i == level) {
          csmPos = cc_matCSMViewProj[i] * vec4(worldPos.xyz, 1.0);
          csmPos.xy = csmPos.xy * cc_csmAtlas[i].xy + cc_csmAtlas[i].zw;
          shadowProjDepthInfo = cc_csmProjDepthInfo[i];
          shadowProjInfo = cc_csmProjInfo[i];
          shadowViewDir0 = cc_csmViewDir0[i].xyz;
          shadowViewDir1 = cc_csmViewDir1[i].xyz;
          shadowViewDir2 = cc_csmViewDir2[i].xyz;
        }
      }
    }
    int CCGetCSMLevel(out bool isTransitionArea, out highp float transitionRatio, out vec4 csmPos, out vec4 shadowProjDepthInfo, out vec4 shadowProjInfo, out vec3 shadowViewDir0, out vec3 shadowViewDir1, out vec3 shadowViewDir2, vec3 worldPos)
    {
      int level = -1;
      highp float layerThreshold = cc_csmViewDir0[0].w;
      for (int i = 0; i < 4; i++) {
        vec4 shadowPos = cc_matCSMViewProj[i] * vec4(worldPos.xyz, 1.0);
        vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
        if (clipPos.x >= layerThreshold && clipPos.x <= (1.0 - layerThreshold) &&
            clipPos.y >= layerThreshold && clipPos.y <= (1.0 - layerThreshold) &&
            clipPos.z >= 0.0 && clipPos.z <= 1.0 && level < 0) {
          #if CC_CASCADED_LAYERS_TRANSITION
            isTransitionArea = CCGetCSMLevelWithTransition(transitionRatio, clipPos);
          #endif
          csmPos = cc_matCSMViewProj[i] * vec4(worldPos.xyz, 1.0);
          csmPos.xy = csmPos.xy * cc_csmAtlas[i].xy + cc_csmAtlas[i].zw;
          shadowProjDepthInfo = cc_csmProjDepthInfo[i];
          shadowProjInfo = cc_csmProjInfo[i];
          shadowViewDir0 = cc_csmViewDir0[i].xyz;
          shadowViewDir1 = cc_csmViewDir1[i].xyz;
          shadowViewDir2 = cc_csmViewDir2[i].xyz;
          level = i;
        }
      }
      return level;
    }
    int CCGetCSMLevel(out vec4 csmPos, out vec4 shadowProjDepthInfo, out vec4 shadowProjInfo, out vec3 shadowViewDir0, out vec3 shadowViewDir1, out vec3 shadowViewDir2, vec3 worldPos)
    {
      bool isTransitionArea = false;
      highp float transitionRatio = 0.0;
      return CCGetCSMLevel(isTransitionArea, transitionRatio, csmPos, shadowProjDepthInfo, shadowProjInfo, shadowViewDir0, shadowViewDir1, shadowViewDir2, worldPos);
    }
    float CCCSMFactorBase(out vec4 csmPos, out vec4 csmPosWithBias, vec3 worldPos, vec3 N, vec2 shadowBias)
    {
      bool isTransitionArea = false;
      highp float ratio = 0.0;
      csmPos = vec4(1.0);
      vec4 shadowProjDepthInfo, shadowProjInfo;
      vec3 shadowViewDir0, shadowViewDir1, shadowViewDir2;
      int level = -1;
      #if CC_CASCADED_LAYERS_TRANSITION
        level = CCGetCSMLevel(isTransitionArea, ratio, csmPos, shadowProjDepthInfo, shadowProjInfo, shadowViewDir0, shadowViewDir1, shadowViewDir2, worldPos);
      #else
        level = CCGetCSMLevel(csmPos, shadowProjDepthInfo, shadowProjInfo, shadowViewDir0, shadowViewDir1, shadowViewDir2, worldPos);
      #endif
      if (level < 0) { return 1.0; }
      vec4 pos = ApplyShadowDepthBias_FaceNormal(csmPos, N, shadowBias.y, shadowViewDir0, shadowViewDir1, shadowViewDir2, shadowProjInfo.xy);
      pos = ApplyShadowDepthBias_Orthographic(pos, shadowBias.x, shadowProjDepthInfo.x, shadowProjDepthInfo.y);
      csmPosWithBias = pos;
      float realtimeShadow = 1.0;
      #if CC_DIR_SHADOW_PCF_TYPE == 3
        realtimeShadow = CCGetDirLightShadowFactorSoft5X(pos);
      #endif
      #if CC_DIR_SHADOW_PCF_TYPE == 2
        realtimeShadow = CCGetDirLightShadowFactorSoft3X(pos);
      #endif
      #if CC_DIR_SHADOW_PCF_TYPE == 1
        realtimeShadow = CCGetDirLightShadowFactorSoft(pos);
      #endif
      #if CC_DIR_SHADOW_PCF_TYPE == 0
        realtimeShadow = CCGetDirLightShadowFactorHard(pos);
      #endif
      #if CC_CASCADED_LAYERS_TRANSITION
        vec4 nextCSMPos = vec4(1.0);
        vec4 nextShadowProjDepthInfo, nextShadowProjInfo;
        vec3 nextShadowViewDir0, nextShadowViewDir1, nextShadowViewDir2;
        float nextRealtimeShadow = 1.0;
        CCGetCSMLevel(nextCSMPos, nextShadowProjDepthInfo, nextShadowProjInfo, nextShadowViewDir0, nextShadowViewDir1, nextShadowViewDir2, worldPos, level + 1);
        bool hasNextLevel = CCHasCSMLevel(level + 1, worldPos);
        if (hasNextLevel && isTransitionArea) {
          vec4 nexPos = ApplyShadowDepthBias_FaceNormal(nextCSMPos, N, shadowBias.y, nextShadowViewDir0, nextShadowViewDir1, nextShadowViewDir2, nextShadowProjInfo.xy);
          nexPos = ApplyShadowDepthBias_Orthographic(nexPos, shadowBias.x, nextShadowProjDepthInfo.x, nextShadowProjDepthInfo.y);
          #if CC_DIR_SHADOW_PCF_TYPE == 3
            nextRealtimeShadow = CCGetDirLightShadowFactorSoft5X(nexPos);
          #endif
          #if CC_DIR_SHADOW_PCF_TYPE == 2
            nextRealtimeShadow = CCGetDirLightShadowFactorSoft3X(nexPos);
          #endif
          #if CC_DIR_SHADOW_PCF_TYPE == 1
            nextRealtimeShadow = CCGetDirLightShadowFactorSoft(nexPos);
          #endif
          #if CC_DIR_SHADOW_PCF_TYPE == 0
            nextRealtimeShadow = CCGetDirLightShadowFactorHard(nexPos);
          #endif
          return mix(mix(nextRealtimeShadow, realtimeShadow, ratio), 1.0, cc_shadowNFLSInfo.w);
        }
        return mix(realtimeShadow, 1.0, cc_shadowNFLSInfo.w);
      #else
        return mix(realtimeShadow, 1.0, cc_shadowNFLSInfo.w);
      #endif
    }
  #else
    int CCGetCSMLevel(out vec4 csmPos, out vec4 shadowProjDepthInfo, out vec4 shadowProjInfo, out vec3 shadowViewDir0, out vec3 shadowViewDir1, out vec3 shadowViewDir2, vec3 worldPos) {
      return -1;
    }
    float CCCSMFactorBase(out vec4 csmPos, out vec4 csmPosWithBias, vec3 worldPos, vec3 N, vec2 shadowBias) {
      csmPos = cc_matLightViewProj * vec4(worldPos, 1.0);
      return CCShadowFactorBase(csmPosWithBias, csmPos, N, shadowBias);
    }
  #endif
  float CCShadowFactorBase(vec4 shadowPos, vec3 N, vec2 shadowBias) {
    vec4 shadowPosWithDepthBias;
    return CCShadowFactorBase(shadowPosWithDepthBias, shadowPos, N, shadowBias);
  }
  float CCCSMFactorBase(vec3 worldPos, vec3 N, vec2 shadowBias) {
    vec4 csmPos, csmPosWithBias;
    return CCCSMFactorBase(csmPos, csmPosWithBias, worldPos, N, shadowBias);
  }
  float CCSpotShadowFactorBase(vec4 shadowPos, vec3 worldPos, vec2 shadowBias)
  {
    vec4 shadowPosWithDepthBias;
    return CCSpotShadowFactorBase(shadowPosWithDepthBias, shadowPos, worldPos, shadowBias);
  }
#endif
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
#if CC_USE_LIGHT_PROBE
  #if CC_USE_LIGHT_PROBE
  vec3 SHEvaluate(vec3 normal)
  {
      vec3 result;
  #if USE_INSTANCING
      vec4 normal4 = vec4(normal, 1.0);
      result.r = dot(v_sh_linear_const_r, normal4);
      result.g = dot(v_sh_linear_const_g, normal4);
      result.b = dot(v_sh_linear_const_b, normal4);
  #else
      vec4 normal4 = vec4(normal, 1.0);
      result.r = dot(cc_sh_linear_const_r, normal4);
      result.g = dot(cc_sh_linear_const_g, normal4);
      result.b = dot(cc_sh_linear_const_b, normal4);
      vec4 n14 = normal.xyzz * normal.yzzx;
      float n5 = normal.x * normal.x - normal.y * normal.y;
      result.r += dot(cc_sh_quadratic_r, n14);
      result.g += dot(cc_sh_quadratic_g, n14);
      result.b += dot(cc_sh_quadratic_b, n14);
      result += (cc_sh_quadratic_a.rgb * n5);
  #endif
    #if CC_USE_HDR
      result *= cc_exposure.w * cc_exposure.x;
    #endif
    return result;
  }
  #endif
#endif
#if CC_USE_REFLECTION_PROBE
  uniform highp vec4 cc_reflectionProbeData1;
  uniform highp vec4 cc_reflectionProbeData2;
  uniform highp vec4 cc_reflectionProbeBlendData1;
  vec4 GetTexData(sampler2D dataMap, float dataMapWidth, float x, float uv_y)
  {
    return vec4(
        decode32(texture2D(dataMap, vec2(((x + 0.5)/dataMapWidth), uv_y))),
        decode32(texture2D(dataMap, vec2(((x + 1.5)/dataMapWidth), uv_y))),
        decode32(texture2D(dataMap, vec2(((x + 2.5)/dataMapWidth), uv_y))),
        decode32(texture2D(dataMap, vec2(((x + 3.5)/dataMapWidth), uv_y)))
      );
  }
  void GetPlanarReflectionProbeData(out vec4 plane, out float planarReflectionDepthScale, out float mipCount, float probeId)
  {
      #if USE_INSTANCING
        float uv_y = (probeId + 0.5) / cc_probeInfo.x;
        float dataMapWidth = 12.0;
        vec4 texData1 = GetTexData(cc_reflectionProbeDataMap, dataMapWidth, 0.0, uv_y);
        vec4 texData2 = GetTexData(cc_reflectionProbeDataMap, dataMapWidth, 4.0, uv_y);
        plane.xyz = texData1.xyz;
        plane.w = texData2.x;
        planarReflectionDepthScale = texData2.y;
        mipCount = texData2.z;
      #else
        plane = cc_reflectionProbeData1;
        planarReflectionDepthScale = cc_reflectionProbeData2.x;
        mipCount = cc_reflectionProbeData2.w;
      #endif
  }
  void GetCubeReflectionProbeData(out vec3 centerPos, out vec3 boxHalfSize, out float mipCount, float probeId)
  {
      #if USE_INSTANCING
        float uv_y = (probeId + 0.5) / cc_probeInfo.x;
        float dataMapWidth = 12.0;
        vec4 texData1 = GetTexData(cc_reflectionProbeDataMap, dataMapWidth, 0.0, uv_y);
        vec4 texData2 = GetTexData(cc_reflectionProbeDataMap, dataMapWidth, 4.0, uv_y);
        vec4 texData3 = GetTexData(cc_reflectionProbeDataMap, dataMapWidth, 8.0, uv_y);
        centerPos = texData1.xyz;
        boxHalfSize = texData2.xyz;
        mipCount = texData3.x;
      #else
        centerPos = cc_reflectionProbeData1.xyz;
        boxHalfSize = cc_reflectionProbeData2.xyz;
        mipCount = cc_reflectionProbeData2.w;
      #endif
      if (mipCount > 1000.0) mipCount -= 1000.0;
  }
  bool isReflectProbeUsingRGBE(float probeId)
  {
    #if USE_INSTANCING
        float uv_y = (probeId + 0.5) / cc_probeInfo.x;
        float dataMapWidth = 12.0;
        vec4 texData3 = GetTexData(cc_reflectionProbeDataMap, dataMapWidth, 8.0, uv_y);
        return texData3.x > 1000.0;
    #else
      return cc_reflectionProbeData2.w > 1000.0;
    #endif
  }
#endif
#if CC_USE_LIGHTMAP && !CC_FORWARD_ADD
  uniform sampler2D cc_lightingMap;
  void SampleAndDecodeLightMapColor(out vec3 lightmapColor, out float dirShadow, out float ao, sampler2D lightingMap, vec2 luv, float lum, vec3 worldNormal)
  {
  #if CC_LIGHT_MAP_VERSION > 2
  #elif CC_LIGHT_MAP_VERSION > 1
  	vec4 dataLow = texture2D(lightingMap, luv);
  	vec4 dataHigh = texture2D(lightingMap, luv + vec2(0.5, 0.0));
  	lightmapColor.xyz = dataLow.xyz + dataHigh.xyz * 0.00392156862745098;
      lightmapColor.rgb *= lum;
  	dirShadow = dataLow.a;
  	ao = dataHigh.a;
  #else
      vec4 lightmap = texture2D(lightingMap, luv);
      lightmapColor = lightmap.rgb * lum;
  	dirShadow = lightmap.a;
  	ao = 1.0;
  #endif
  }
  void GetLightMapColor(out vec3 lightmapColor, out float dirShadow, out float ao, sampler2D lightingMap, vec2 luv, float lum, vec3 worldNormal)
  {
  	vec4 lightmap;
  	vec2 occlusion;
  	SampleAndDecodeLightMapColor(lightmapColor, dirShadow, ao, lightingMap, luv, lum, worldNormal);
  #if CC_USE_HDR
      lightmapColor.rgb *= cc_exposure.w * cc_exposure.x;
  #endif
  }
#endif
    uniform vec4 diffuseColor;
    uniform vec4 specularColor;
    uniform vec4 emissive;
    uniform float emissiveScale;
    uniform float alphaThreshold;
    uniform float shininessExponent;
    uniform float glossiness;
    uniform float metallic;
    uniform float normalScale;
    uniform float transparencyFactor;
    uniform float diffuseFactor;
    uniform float specularFactor;
#define DCC_APP_OTHERS 0
#define DCC_APP_MAX 1
#define DCC_APP_BLENDER 2
#define DCC_APP_CINEMA4D 3
#define DCC_APP_GLTF 4
#define DCC_APP_MAYA 5
#if USE_SHININESS_MAP
  uniform sampler2D shininessExponentMap;
#endif
#if USE_SPECULAR_GLOSSINESS_MAP
  uniform sampler2D specularGlossinessMap;
#endif
#if USE_SPECULAR_MAP
  uniform sampler2D specularMap;
#endif
 #if USE_METALLIC_MAP
  uniform sampler2D metallicMap;
#endif
#if USE_ALBEDO_MAP
  uniform sampler2D albedoMap;
#endif
#if USE_TRANSPARENCY_MAP
  uniform sampler2D transparencyMap;
#endif
#if USE_EMISSIVE_MAP
  uniform sampler2D emissiveMap;
#endif
#if USE_EMISSIVESCALE_MAP
  uniform sampler2D emissiveScaleMap;
#endif
#if USE_NORMAL_MAP
  uniform sampler2D normalMap;
#endif
#if USE_OCCLUSION_MAP
  uniform sampler2D occlusionMap;
#endif
float discolor(vec3 srcColor)
{
  return dot(GRAY_VECTOR, srcColor);
}
float convertShininessExponent(float shininessExp)
{
  #if DCC_APP_NAME == DCC_APP_BLENDER
    float glossiness = clamp(sqrt(shininessExp) * 0.1, 0.0, 0.95);
  #elif DCC_APP_NAME == DCC_APP_MAX || DCC_APP_NAME == DCC_APP_MAYA
    float l2 = clamp(log(shininessExp + EPSILON) * 0.1442695 , 0.0, 1.0);
    float glossiness = pow(l2, 0.5);
  #else
    float glossiness = clamp(log(shininessExp + EPSILON) * 0.1442695 , 0.0, 1.0);
  #endif
    return glossiness;
}
float getSpecularIntensityFromRoughness(float roughness)
{
  #if DCC_APP_NAME == DCC_APP_BLENDER
    float specularIntensityMultiplier = mix(1.0, 5.0, roughness);
  #elif DCC_APP_NAME == DCC_APP_CINEMA4D
    float specularIntensityMultiplier = mix(1.0, 50.0, roughness);
  #elif DCC_APP_NAME == DCC_APP_MAX || DCC_APP_NAME == DCC_APP_MAYA
    float specularIntensityMultiplier = mix(1.0, 20.0, roughness);
  #else
    float specularIntensityMultiplier = 1.0;
  #endif
    return specularIntensityMultiplier;
}
vec4 getSpecularColorAndFactor()
{
  vec3 inSpecular = specularColor.rgb * specularFactor;
  float inFactor = 1.0;
  #if USE_SPECULAR_GLOSSINESS_MAP
    inSpecular = SRGBToLinear(texture2D(specularGlossinessMap, TEXTURE_UV).rgb);
  #endif
  #if USE_SPECULAR_MAP
      vec4 specularTex = texture2D(specularMap, TEXTURE_UV);
      specularTex.rgb = SRGBToLinear(specularTex.rgb);
      inSpecular = specularTex.rgb;
  #endif
  return vec4(inSpecular, inFactor);
}
#define CC_SURFACES_FRAGMENT_ALPHA_CLIP_ONLY
#define CC_SURFACES_FRAGMENT_MODIFY_WORLD_NORMAL
vec3 SurfacesFragmentModifyWorldNormal()
{
  vec3 normal = FSInput_worldNormal;
  #if USE_NORMAL_MAP
    vec3 nmmp = texture2D(normalMap, NORMAL_UV).xyz - vec3(0.5);
    normal = CalculateNormalFromTangentSpace(nmmp, normalScale, normalize(normal.xyz), normalize(FSInput_worldTangent), FSInput_mirrorNormal);
  #endif
  return normalize(normal);
}
#define CC_SURFACES_FRAGMENT_MODIFY_EMISSIVE
vec3 SurfacesFragmentModifyEmissive()
{
  vec3 emissiveColor = emissive.rgb;
  #if USE_EMISSIVE_MAP
      emissiveColor.rgb = SRGBToLinear(texture2D(emissiveMap, TEXTURE_UV).rgb);
  #endif
  #if USE_EMISSIVESCALE_MAP
      vec4 emissiveScaleColor = texture2D(emissiveScaleMap, TEXTURE_UV);
      emissiveScaleColor.rgb = SRGBToLinear(emissiveScaleColor.rgb);
      emissiveColor.rgb *= emissiveScaleColor.rgb;
  #else
      emissiveColor.rgb *= emissiveScale;
  #endif
  return emissiveColor;
}
#define CC_SURFACES_FRAGMENT_MODIFY_SHARED_DATA
struct SurfacesMaterialData
{
  #if CC_PLATFORM_ANDROID_AND_WEBGL && CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES
  vec3 worldPos, worldPos_fract_part;
  #else
  vec3 worldPos;
  #endif
  vec4 baseColor;
  vec3 worldNormal;
  vec3 emissive;
  float specularIntensity;
  float roughness;
  float metallic;
  float ao;
  vec3 worldTangent, worldBinormal;
  float ior;
#if CC_SURFACES_LIGHTING_ANISOTROPIC
  float anisotropyShape;
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR || CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  vec3 outScatteringColor, inScatteringColor;
  vec4 transmitScatteringParams;
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  vec4 transmitDiffuseParams;
#endif
#if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
  vec3 baseColor2ndSpecular, color2ndSpecular;
  float intensity2ndSpecular, roughness2ndSpecular, metallic2ndSpecular;
  vec3 worldNormal2ndSpecular, worldTangent2ndSpecular, worldBinormal2ndSpecular;
  #if CC_SURFACES_LIGHTING_ANISOTROPIC
    float anisotropyShape2ndSpecular;
  #endif
  float ior2ndSpecular, opacity2ndSpecular;
#endif
#if CC_SURFACES_LIGHTING_TT
  vec3 baseColorTT;
  float ttIntensity, ttScatterCoef;
#endif
#if CC_SURFACES_LIGHTING_SSS
  vec4 sssParams;
#endif
};
void SurfacesFragmentModifySharedData(inout SurfacesMaterialData surfaceData)
{
    vec4 baseColor = vec4(1.0);
    #if USE_VERTEX_COLOR
      baseColor.rgb *= SRGBToLinear(FSInput_vertexColor.rgb);
      baseColor.a *= FSInput_vertexColor.a;
    #endif
    #if USE_ALBEDO_MAP
      vec4 texColor = texture2D(albedoMap, TEXTURE_UV);
      texColor.rgb = SRGBToLinear(texColor.rgb);
      texColor.a *= transparencyFactor;
      baseColor *= texColor;
    #else
      baseColor *= diffuseColor;
    #endif
    baseColor.rgb *= diffuseFactor;
    #if USE_TRANSPARENCY_MAP
      baseColor.a = texture2D(transparencyMap, TEXTURE_UV).TRANSPARENCY_MAP_CHANNEL;
      #if DCC_APP_NAME == DCC_APP_MAYA
        baseColor.a = 1.0 - baseColor.a;
      #endif
    #endif
    #if USE_ALPHA_TEST
      if (baseColor.a < alphaThreshold) discard;
    #endif
    vec4 specularColorAndFactor = getSpecularColorAndFactor();
    float inGlossiness = 0.0, inSpecularIntensity = 1.0;
    #if HAS_EXPORTED_GLOSSINESS
      #if USE_SPECULAR_GLOSSINESS_MAP
        inGlossiness = 1.0 - texture2D(specularGlossinessMap, TEXTURE_UV).a;
      #else
        inGlossiness = glossiness;
      #endif
    #else
      #if USE_SHININESS_MAP
        #if GLOSSINESS_MAP_USE_SINGLE_CHANNEL
          inGlossiness = 1.0 - texture2D(shininessExponentMap, TEXTURE_UV).GLOSSINESS_MAP_CHANNEL;
        #else
          inGlossiness = 1.0 - discolor(texture2D(shininessExponentMap, TEXTURE_UV).rgb);
        #endif
      #else
        inGlossiness = convertShininessExponent(shininessExponent);
      #endif
      inSpecularIntensity *= getSpecularIntensityFromRoughness(1.0 - inGlossiness);
    #endif
    float inMetallic = 0.0;
    vec3 albedo = baseColor.rgb;
    #if HAS_EXPORTED_METALLIC
      inMetallic = metallic;
      float spec = specularFactor;
      #if USE_SPECULAR_MAP
        spec = dot(GRAY_VECTOR, texture2D(specularMap, TEXTURE_UV).rgb);
      #endif
      inSpecularIntensity *= spec * 0.5;
    #else
      GetMetallicAlbedoFromDiffuseSpecularWithoutColor(inMetallic, albedo.rgb, baseColor.rgb, specularColorAndFactor.rgb, 0.04);
      inSpecularIntensity *= inMetallic;
    #endif
    baseColor.rgb = albedo;
    surfaceData.baseColor = baseColor;
    surfaceData.specularIntensity = inSpecularIntensity * 0.5;
    surfaceData.roughness = 1.0 - inGlossiness;
    surfaceData.metallic = inMetallic;
    surfaceData.ao = 1.0;
    #if USE_OCCLUSION_MAP
      surfaceData.ao = texture2D(occlusionMap, OCCLUSION_UV).OCCLUSION_CHANNEL;
    #endif
}
struct LightingIntermediateData
{
  vec3 N, H, L, V;
  float distToLight, distToLightSqr;
  float distToCamera, distToCameraSqr;
  float angleAttenuation, distAttenuation;
  float NoL, NoV, NoH, VoH;
  float NoLSat, NoVSat, NoHSat;
  float NoVAbsSat, VoHAbsSat;
  #if CC_PLATFORM_ANDROID_AND_WEBGL && CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES
  vec3 worldPosition, worldPosition_fract_part;
  #else
  vec3 worldPosition;
  #endif
  vec3 T, B;
  float specularParam;
  float ior, layerOpacity;
#if CC_SURFACES_LIGHTING_ANISOTROPIC
  float anisotropyShape;
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  vec4 shadowPosAndDepth;
  vec4 transmitDiffuseParams;
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR || CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  vec4 transmitScatteringParams;
  vec3 outScatteringColor, inScatteringColor;
#endif
#if CC_SURFACES_LIGHTING_TT
  vec3 baseColorTT;
  float ttIntensity, ttScatterCoef;
#endif
};
void CCSurfacesLightingGetIntermediateData_PerPixel(inout LightingIntermediateData data, vec3 worldNormal, vec3 worldPos, vec3 worldTangent, vec3 worldBinormal
#if CC_SURFACES_LIGHTING_ANISOTROPIC
    , float anisotropyShape
#endif
)
{
  data.N = worldNormal;
  data.V = cc_cameraPos.xyz - worldPos;
  data.distToCameraSqr = dot(data.V, data.V);
  data.distToCamera = sqrt(data.distToCameraSqr);
  data.V /= data.distToCamera;
  data.angleAttenuation = data.distAttenuation = 1.0;
  data.NoV = dot(data.N, data.V);
  data.NoVSat = max(data.NoV, 0.0);
  data.NoVAbsSat = max(abs(data.NoV), 0.0);
  #if CC_PLATFORM_ANDROID_AND_WEBGL && CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES
  packHighpData(data.worldPosition, data.worldPosition_fract_part, worldPos);
  #else
  data.worldPosition = worldPos;
  #endif
  data.T = worldTangent;
  data.B = worldBinormal;
#if CC_SURFACES_LIGHTING_ANISOTROPIC
  data.anisotropyShape = anisotropyShape;
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR || CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  data.outScatteringColor = vec3(1.0);
  data.inScatteringColor = vec3(0.0);
  data.transmitScatteringParams = vec4(0.0);
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  data.shadowPosAndDepth = vec4(0.0, 0.0, SURFACES_MAX_TRANSMIT_DEPTH_VALUE, SURFACES_MAX_TRANSMIT_DEPTH_VALUE);
#endif
#if CC_SURFACES_LIGHTING_TT
  data.baseColorTT = vec3(0.0);
  data.ttIntensity = data.ttScatterCoef = 0.0;
#endif
}
void CCSurfacesLightingGetIntermediateData_PerLight(inout LightingIntermediateData data, vec3 lightDirWithDist)
{
  data.L = lightDirWithDist;
  data.distToLightSqr = dot(data.L, data.L);
  data.distToLight = sqrt(data.distToLightSqr);
  data.L /= data.distToLight;
  data.H = normalize(data.L + data.V);
  data.NoL = dot(data.N, data.L);
  data.NoH = dot(data.N, data.H);
  data.VoH = dot(data.V, data.H);
  data.NoLSat = max(data.NoL, 0.0);
  data.NoHSat = max(data.NoH, 0.0);
  data.VoHAbsSat = max(abs(data.VoH), 0.0);
}
struct LightingResult
{
  vec3 diffuseColorWithLighting, specularColorWithLighting;
  vec3 directDiffuse, directSpecular, directGF;
  vec3 environmentDiffuse, environmentSpecular, environmentGF;
  float shadow, ao;
  vec3 lightmapColor;
  vec3 emissive;
  vec3 fresnel;
#if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
  vec3 directDiffuseSubLayers, directSpecularSubLayers;
  vec3 environmentDiffuseSubLayers, environmentSpecularSubLayers;
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR
  vec3 directTransmitSpecular, environmentTransmitSpecular;
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  vec3 directTransmitDiffuse, environmentTransmitDiffuse;
#endif
#if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
  vec3 direct2ndSpecular, environment2ndSpecular;
  vec3 specularColorWithLighting2ndSpecular;
  vec3 directGF2ndSpecular, environmentGF2ndSpecular;
  vec3 directSubLayerF, environmentSubLayerF;
#endif
#if CC_SURFACES_LIGHTING_TT
  vec3 directTT;
  vec3 diffuseColorWithLightingTT;
#endif
};
struct LightingMiscData
{
  float lightType;
  vec3 lightPos, lightDir;
  vec4 lightColorAndIntensity;
  vec4 lightSizeRangeAngle;
};
float square(float a) { return a * a;}
vec2 square(vec2 a) { return a * a;}
vec3 square(vec3 a) { return a * a;}
float G_Schlick( float roughness, float NoV, float NoL )
{
	float k = square( 0.5 + 0.5*roughness );
	float G_SchlickV = NoV * (1.0 - k) + k;
	float G_SchlickL = NoL * (1.0 - k) + k;
	return 0.25 / ( G_SchlickV * G_SchlickL );
}
vec3 F_SchlickMultiplier( vec3 specularColor, float VoH )
{
	float Fc = exp2( (-5.55473 * VoH - 6.98316) * VoH );
  float selfShadowTerm = saturate(50.0 * specularColor.g);
  return vec3(1.0 - Fc) + vec3(selfShadowTerm * Fc) / (specularColor + vec3(EPSILON));
}
float D_GGX(float roughness, float NoH)
{
    float m = roughness * roughness;
    float m2 = m * m;
    float d = (NoH * m2 - NoH) * NoH + 1.0;
    return m2 / max(EPSILON, d * d);
}
float D_GGXMobile(float roughness, float NoH) {
  float OneMinusNoHSqr = 1.0 - NoH * NoH;
  float a = roughness * roughness;
  float n = NoH * a;
  float p = a / max(EPSILON, OneMinusNoHSqr + n * n);
  return p * p;
}
void GetAnisotropicRoughness(float roughness, float anisotropyShape, out float roughnessX, out float roughnessY)
{
    float shapeSign = sign(anisotropyShape);
    anisotropyShape *= anisotropyShape;
    float r1 = roughness, r2 = roughness;
    float lerpedRoughness = mix(1.0, 10.0, anisotropyShape);
    r2 *= shapeSign < 0.0 ? lerpedRoughness : 1.0;
    r1 *= shapeSign > 0.0 ? lerpedRoughness : 1.0;
    roughnessX = saturate(r1);
    roughnessY = saturate(r2);
}
float D_GGXAniso(float RoughnessX, float RoughnessY, float NoH, vec3 H, vec3 X, vec3 Y)
{
    float mx = max(EPSILON_LOWP, RoughnessX * RoughnessX);
    float my = max(EPSILON_LOWP, RoughnessY * RoughnessY);
    float XoH = dot(X, H);
    float YoH = dot(Y, H);
    float d = XoH * XoH / (mx * mx) + YoH * YoH / (my * my) + NoH * NoH;
    return 1.0 / max(EPSILON_LOWP, mx * my * d * d);
}
vec3 GetAnisotropicReflect(float roughness, float anisotropyShape, vec3 V, vec3 N, vec3 X, vec3 Y)
{
    float shapeSign = sign(anisotropyShape);
    anisotropyShape *= anisotropyShape;
    anisotropyShape = min(anisotropyShape, 0.4);
    anisotropyShape *= smoothstep(0.0, 0.03, roughness);
    vec3 reflectTarget = shapeSign < 0.0 ? mix(N, -Y, anisotropyShape) :
                         shapeSign > 0.0 ? mix(N, -X, anisotropyShape) : N;
    return reflect(-V, reflectTarget);
}
void IntegratedGFMultiplier (out vec3 integratedGF, out vec3 integratedF, vec3 specular, float roughness, float NoV) {
  const vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);
  const vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);
  vec4 r = roughness * c0 + c1;
  float a004 = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
  vec2 AB = vec2(-1.04, 1.04) * a004 + r.zw;
  AB.y *= clamp(50.0 * specular.g, 0.0, 1.0);
  integratedF = vec3(max(0.0, AB.x));
  integratedGF = max(vec3(0.0), vec3(AB.x) + vec3(AB.y) / (specular + EPSILON_LOWP));
}
float Sheen_HorizonFading(float NoL)
{
  const float horizonFade = 1.3;
  float horiz = saturate( 1.0 + horizonFade * NoL);
  return horiz * horiz;
}
float Sheen(float NoHSat, float NoL, float NoV, float roughness)
{
  if (NoL <= 0.0 || NoV <= 0.0)
    return 0.0;
  float NoH2 = NoHSat*NoHSat;
  float NoL2 = NoL*NoL;
  float NoV2 = NoV*NoV;
  roughness += EPSILON_LOWP;
  float r2 = roughness*roughness;
  float t = 1.0 - NoH2 + NoH2/r2;
  float Pi_D = 1.0 / (roughness * t * t);
  float Li = sqrt(1.0 - NoL2 + r2*NoL2) / NoL;
  float Lo = sqrt(1.0 - NoV2 + r2*NoV2) / NoV;
  float G = (1.0 - exp(-(Li + Lo))) / (Li + Lo);
  return Sheen_HorizonFading(NoL) * Pi_D * G / NoV;
}
float Sheen(float NoV, float roughness)
{
  NoV *= NoV;
  float NoV2 = NoV*NoV;
  roughness += EPSILON_LOWP;
  float r2 = roughness*roughness;
  float t = 1.0 - NoV2 + NoV2/r2;
  float Pi_D = 1.0 / (roughness * t * t);
  float Lo = sqrt(1.0 - NoV2 + r2*NoV2) / NoV;
  float G = (1.0 - exp(-Lo)) / Lo;
  float sheen = Pi_D * G / NoV;
  return pow(max(0.0, sheen), 0.5);
}
#define DiffuseCoefficient_EnergyConservation INV_PI
float CalculateFresnelCoefficient(float ior, float NoVSat)
{
	float g, c, n, prev, next;
	n = ior;
	c = ior * NoVSat;
	g = sqrt(1.0 + c * c - c);
	prev = (g - c) / (g + c);
	next = (c * (g+c) - n*n) / (c * (g-c) + n*n);
	prev *= prev;
	next *= next;
	return 0.5 * prev * (1.0 + next);
}
float CalculateFresnelCoefficient(float F0, float F90, float NoVSat)
{
  return mix(F90, F0, NoVSat);
}
vec3 CalculateScattering(vec3 unscatteredColor, float distance, float outScatterExtinctCoef, float inScatterExtinctCoef, float inScatterCoef, vec3 inScatterColor, vec3 outScatterColor)
{
  vec2 e = vec2(outScatterExtinctCoef, inScatterExtinctCoef * inScatterCoef);
  vec2 extinction = exp(-e * distance);
  vec3 inScattered = (1.0 - extinction.y) * inScatterColor;
  vec3 outScattered = unscatteredColor * extinction.x * outScatterColor;
  return outScattered + inScattered;
}
void InitializeLayerBlending(out vec3 blendedBaseLayerD, out vec3 blendedBaseLayerS,
                             out vec3 blendedSubLayerD, out vec3 blendedSubLayerS,
                             out vec3 lastLayerF,
                             in vec3 baseD, in vec3 baseS
                             )
{
  blendedBaseLayerD = baseD;
  blendedBaseLayerS = baseS;
  blendedSubLayerD = blendedSubLayerS = vec3(0.0);
  lastLayerF = vec3(1.0);
}
void CalculateLayerBlending(inout vec3 blendedBaseLayerD, inout vec3 blendedBaseLayerS,
                            inout vec3 blendedSubLayerD, inout vec3 blendedSubLayerS,
                            inout vec3 lastLayerF,
                            in vec3 subLayerD, in vec3 subLayerDiffuseColor,
                            in vec3 subLayerS, in vec3 subLayerSpecularColor,
                            in float subLayerOpacity, inout vec3 subLayerF
                            )
{
  subLayerF = saturate(subLayerF * subLayerOpacity);
  blendedSubLayerD = blendedSubLayerD * (vec3(1.0) - lastLayerF) + subLayerD * subLayerDiffuseColor * subLayerF;
  blendedSubLayerS = blendedSubLayerS *(vec3(1.0) - lastLayerF) + subLayerS * subLayerSpecularColor * subLayerF;
  blendedBaseLayerD *= vec3(1.0) - subLayerF;
  blendedBaseLayerS *= vec3(1.0) - subLayerF;
  lastLayerF = subLayerF;
}
float SmoothDistAtt (float distSqr, float invSqrAttRadius) {
  float factor = distSqr * invSqrAttRadius;
  float smoothFactor = clamp(1.0 - factor * factor, 0.0, 1.0);
  return smoothFactor * smoothFactor;
}
float GetDistAtt (float distSqr, float invSqrAttRadius) {
  float attenuation = 1.0 / max(distSqr, 0.01*0.01);
  attenuation *= SmoothDistAtt(distSqr , invSqrAttRadius);
  return attenuation;
}
float GetAngleAtt (vec3 L, vec3 litDir, float litAngleScale, float litAngleOffset) {
  float cd = dot(litDir, L);
  float attenuation = clamp(cd * litAngleScale + litAngleOffset, 0.0, 1.0);
  return (attenuation * attenuation);
}
float GetOutOfRange (vec3 worldPos, vec3 lightPos, vec3 lookAt, vec3 right, vec3 BoundingHalfSizeVS) {
  vec3 v = vec3(0.0);
  vec3 up = cross(right, lookAt);
  worldPos -= lightPos;
  v.x = dot(worldPos, right);
  v.y = dot(worldPos, up);
  v.z = dot(worldPos, lookAt);
  vec3 result = step(abs(v), BoundingHalfSizeVS);
  return result.x * result.y * result.z;
}
float CalculateDistanceAttenuation(float distToLightSqr, float lightRadius, float lightRange, float lightType)
{
  float attRadiusSqrInv = 1.0 / max(lightRange, 0.01);
  attRadiusSqrInv *= attRadiusSqrInv;
  float litRadiusSqr = lightRadius * lightRadius;
  float edgeAttenuation = (IS_POINT_LIGHT(lightType) || IS_RANGED_DIRECTIONAL_LIGHT(lightType)) ? 1.0 : litRadiusSqr / max(litRadiusSqr, distToLightSqr);
  return GetDistAtt(distToLightSqr, attRadiusSqrInv) * edgeAttenuation;
}
float CalculateAngleAttenuationWithStrength(vec3 spotLightDir, vec3 L, float cosAngleOuter, float strength)
{
  float cosInner = max(dot(spotLightDir, L), 0.01);
  float litAngleScale = 1.0 / max(0.001, mix(cosInner, 1.0, strength) - cosAngleOuter);
  float litAngleOffset = -cosAngleOuter * litAngleScale;
  return GetAngleAtt(L, spotLightDir, litAngleScale, litAngleOffset);
}
vec3 CalculateRefractDirection(vec3 N, vec3 V, float NoV, float ior)
{
  float sideSign = NoV < 0.0 ? -1.0 : 1.0;
  N *= sideSign;
  float cosA = abs(NoV);
  float sinA = sqrt(1.0 - cosA * cosA);
  float sinB = saturate(sinA / ior);
  float cosB = sqrt(1.0 - sinB * sinB);
  vec3 edgeA = -V + N * cosA;
  vec3 edgeB = normalize(edgeA) * sinB;
  vec3 R = edgeB - N * cosB;
  return R;
}
vec3 CalculateReflectDirection(vec3 N, vec3 V, float NoV)
{
  float sideSign = NoV < 0.0 ? -1.0 : 1.0;
  N *= sideSign;
  return reflect(-V, N);
}
vec3 CalculatePlanarReflectPositionOnPlane(vec3 N, vec3 V, vec3 worldPos, vec4 plane, vec3 cameraPos, float probeReflectedDepth)
{
  float distPixelToPlane = -dot(plane, vec4(worldPos, 1.0));
  plane.w += distPixelToPlane;
  float distCameraToPlane = abs(-dot(plane, vec4(cameraPos, 1.0)));
  vec3 planeN = plane.xyz;
  vec3 virtualCameraPos = cameraPos - 2.0 * distCameraToPlane * planeN;
  vec3 bumpedR = normalize(reflect(-V, N));
  vec3 reflectedPointPos = worldPos + probeReflectedDepth * bumpedR;
  vec3 virtualCameraToReflectedPoint = normalize(reflectedPointPos - virtualCameraPos);
  float y = distCameraToPlane / max(EPSILON_LOWP, dot(planeN, virtualCameraToReflectedPoint));
  return virtualCameraPos + y * virtualCameraToReflectedPoint;
}
vec4 CalculateBoxProjectedDirection(vec3 R, vec3 worldPos, vec3 cubeCenterPos, vec3 cubeBoxHalfSize)
{
  vec3 W = worldPos - cubeCenterPos;
  vec3 projectedLength = (sign(R) * cubeBoxHalfSize - W) / (R + vec3(EPSILON));
  float len = min(min(projectedLength.x, projectedLength.y), projectedLength.z);
  vec3 P = W + len * R;
  float weight = len < 0.0 ? 0.0 : 1.0;
  return vec4(P, weight);
}
vec3 CalculateDirectDiffuse(in LightingIntermediateData lightingData, in vec4 lightSourceColorAndIntensity)
{
    vec3 irradiance = vec3(lightingData.NoLSat) * lightSourceColorAndIntensity.rgb * lightSourceColorAndIntensity.w;
    return irradiance * DiffuseCoefficient_EnergyConservation;
}
vec3 CalculateDirectSpecular(in LightingIntermediateData lightingData, in vec4 lightSourceColorAndIntensity)
{
    vec3 irradiance = vec3(lightingData.NoLSat) * lightSourceColorAndIntensity.rgb * lightSourceColorAndIntensity.w;
    float roughness = lightingData.specularParam;
  #if CC_SURFACES_LIGHTING_ANISOTROPIC
      float rT, rB;
      GetAnisotropicRoughness(roughness, lightingData.anisotropyShape, rT, rB);
      float calcSpec = D_GGXAniso(rT, rB, lightingData.NoHSat, lightingData.H, lightingData.T, lightingData.B);
  #else
    #if CC_SURFACES_USE_LEGACY_COMPATIBLE_LIGHTING
      float calcSpec = (roughness * 0.25 + 0.25) * D_GGXMobile(roughness, lightingData.NoHSat);
    #else
      float calcSpec = D_GGX(roughness, lightingData.NoHSat);
    #endif
  #endif
    return irradiance * calcSpec;
}
#if CC_SURFACES_LIGHTING_ANISOTROPIC && CC_SURFACES_LIGHTING_ANISOTROPIC_ENVCONVOLUTION_COUNT
  vec3 EnvAnisotropicReflection(samplerCube tex, vec3 R, float roughness, float mipCount, float anisotropyShape, vec3 V, vec3 N, vec3 T, vec3 B) {
      R = normalize(R);
      float integratedBRDF = 0.0;
      vec3 envSpec = vec3(0.0);
      const int SAMPLE_STEP_COUNT = CC_SURFACES_LIGHTING_ANISOTROPIC_ENVCONVOLUTION_COUNT;
      float sampleAngleRange = PI * abs(anisotropyShape);
      vec3 anisoDirection = anisotropyShape < 0.0 ? T : B;
      vec3 ROnNormalPlane = normalize(R - anisoDirection * dot(R, anisoDirection));
      vec3 stepOffset = normalize(ROnNormalPlane - N) * (sampleAngleRange / float(SAMPLE_STEP_COUNT * 2));
      for (int i = -SAMPLE_STEP_COUNT; i <= SAMPLE_STEP_COUNT; ++i)
      {
          float rT, rB;
          GetAnisotropicRoughness(roughness, anisotropyShape, rT, rB);
          #if CC_IBL_CONVOLUTED
            float coef = abs(float(i)) / float(SAMPLE_STEP_COUNT) * float(SAMPLE_STEP_COUNT);
          #else
            float coef = pow(abs(float(i)) / float(SAMPLE_STEP_COUNT), 1.3) * float(SAMPLE_STEP_COUNT);
          #endif
          vec3 H = normalize(N + stepOffset * sign(float(i)) * coef);
          vec3 L = reflect(-V, H);
          float NoHSat = saturate(dot(N, H));
          float calcSpec = D_GGXAniso(rT, rB, NoHSat, H, T, B);
          envSpec += calcSpec * EnvReflection(tex, L, roughness, mipCount);
          integratedBRDF += calcSpec;
      }
      envSpec /= integratedBRDF;
      return envSpec;
  }
#endif
vec3 SampleEnvironmentSpecular(samplerCube tex, in LightingIntermediateData lightingData, float mipCount)
{
    vec3 envSpec = vec3(0.0);
    float roughness = lightingData.specularParam;
    #if CC_SURFACES_LIGHTING_ANISOTROPIC && !CC_SURFACES_LIGHTING_ANISOTROPIC_ENVCONVOLUTION_COUNT
      vec3 R = GetAnisotropicReflect(roughness, lightingData.anisotropyShape, lightingData.V, lightingData.N, lightingData.T, lightingData.B);
    #else
      vec3 R = CalculateReflectDirection(lightingData.N, lightingData.V, lightingData.NoV);
    #endif
    #if CC_SURFACES_LIGHTING_ANISOTROPIC && CC_SURFACES_LIGHTING_ANISOTROPIC_ENVCONVOLUTION_COUNT
      envSpec = EnvAnisotropicReflection(tex, R, roughness, mipCount, lightingData.anisotropyShape, lightingData.V, lightingData.N, lightingData.T, lightingData.B);
    #else
      #if CC_SURFACES_USE_REFLECTION_DENOISE && !CC_IBL_CONVOLUTED
        envSpec = EnvReflectionWithMipFiltering(normalize(R), roughness, mipCount, 0.6);
      #else
        envSpec = EnvReflection(tex, R, roughness, mipCount);
      #endif
    #endif
    return envSpec;
}
vec3 SampleEnvironmentSpecular(samplerCube tex, in LightingIntermediateData lightingData, float mipCount, vec3 worldPos, vec3 cubeCenterPos, vec3 boxHalfSize, bool isRGBE)
{
    vec3 envSpec = vec3(0.0);
    float roughness = lightingData.specularParam;
    #if CC_SURFACES_LIGHTING_ANISOTROPIC && !CC_SURFACES_LIGHTING_ANISOTROPIC_ENVCONVOLUTION_COUNT
      vec3 R = GetAnisotropicReflect(roughness, lightingData.anisotropyShape, lightingData.V, lightingData.N, lightingData.T, lightingData.B);
    #else
      vec3 R = CalculateReflectDirection(lightingData.N, lightingData.V, lightingData.NoV);
    #endif
    vec4 fixedR = CalculateBoxProjectedDirection(R, worldPos, cubeCenterPos, boxHalfSize);
    R = fixedR.xyz;
    vec3 envmap = SampleEnvironmentSpecular(cc_environment, lightingData, cc_ambientGround.w).xyz * cc_ambientSky.w;
    #if CC_SURFACES_LIGHTING_ANISOTROPIC && CC_SURFACES_LIGHTING_ANISOTROPIC_ENVCONVOLUTION_COUNT
      envSpec = EnvAnisotropicReflection(tex, fixedR.xyz, roughness, mipCount, lightingData.anisotropyShape, lightingData.V, lightingData.N, lightingData.T, lightingData.B);
      #if CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_CUBE
        envSpec = mix(envmap, envSpec, fixedR.w);
      #endif
    #else
      #if CC_SURFACES_USE_REFLECTION_DENOISE && !CC_IBL_CONVOLUTED
        envSpec = EnvReflectionWithMipFiltering(normalize(R), roughness, mipCount, 0.6);
      #else
        envSpec = EnvReflectionOfReflectionProbe(tex, R, roughness, mipCount, isRGBE);
        #if CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_CUBE
          envSpec = mix(envmap, envSpec, fixedR.w);
        #endif
      #endif
    #endif
    return envSpec;
}
vec3 CalculateEnvironmentDiffuse(in LightingIntermediateData lightingData, float lightIntensity)
{
  float fAmb = max(EPSILON, 0.5 - lightingData.N.y * 0.5);
  vec3 ambDiff = mix(cc_ambientSky.rgb, cc_ambientGround.rgb, fAmb);
  #if CC_USE_IBL
    #if CC_USE_DIFFUSEMAP && !CC_USE_LIGHT_PROBE
      vec3 rotationDir = RotationVecFromAxisY(lightingData.N, cc_surfaceTransform.z, cc_surfaceTransform.w);
      vec4 diffuseMap = textureCube(cc_diffuseMap, rotationDir);
      #if CC_USE_DIFFUSEMAP == 2
        ambDiff = unpackRGBE(diffuseMap);
      #else
        ambDiff = SRGBToLinear(diffuseMap.rgb);
      #endif
    #endif
  #endif
  ambDiff.rgb *= lightIntensity;
  #if CC_USE_LIGHT_PROBE
    ambDiff.rgb += SHEvaluate(lightingData.N);
  #endif
  return ambDiff.rgb;
}
vec3 CalculateEnvironmentSpecular(in LightingIntermediateData lightingData, float lightIntensity)
{
  vec3 envSpec = vec3(0.0);
#if CC_USE_REFLECTION_PROBE
    vec3 worldPos;
    #if CC_PLATFORM_ANDROID_AND_WEBGL && CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES
    worldPos = unpackHighpData(lightingData.worldPosition, lightingData.worldPosition_fract_part);
    #else
    worldPos = lightingData.worldPosition;
    #endif
  #if CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_CUBE
    if(FSInput_reflectionProbeId < 0.0){
        envSpec = SampleEnvironmentSpecular(cc_environment, lightingData, cc_ambientGround.w);
    }else{
      vec3 centerPos, boxHalfSize;
      float mipCount;
      GetCubeReflectionProbeData(centerPos, boxHalfSize, mipCount, FSInput_reflectionProbeId);
      envSpec = SampleEnvironmentSpecular(cc_reflectionProbeCubemap, lightingData, mipCount, worldPos, centerPos, boxHalfSize, isReflectProbeUsingRGBE(FSInput_reflectionProbeId));
    }
  #elif CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_PLANAR
    vec3 R = normalize(CalculateReflectDirection(lightingData.N, lightingData.V, lightingData.NoV));
    if(FSInput_reflectionProbeId < 0.0){
        vec2 screenUV = GetPlanarReflectScreenUV(worldPos, cc_matViewProj, cc_cameraPos.w, lightingData.V, R);
        envSpec = unpackRGBE(fragTextureLod(cc_reflectionProbePlanarMap, screenUV, 1.0)).xyz;
    }else{
        vec4 plane;
        float planarReflectionDepthScale, mipCount;
        GetPlanarReflectionProbeData(plane, planarReflectionDepthScale, mipCount, FSInput_reflectionProbeId);
        vec3 worldPosOffset = CalculatePlanarReflectPositionOnPlane(lightingData.N, lightingData.V, worldPos, plane, cc_cameraPos.xyz, planarReflectionDepthScale);
        vec2 screenUV = GetPlanarReflectScreenUV(worldPosOffset, cc_matViewProj, cc_cameraPos.w, lightingData.V, R);
        envSpec = unpackRGBE(fragTextureLod(cc_reflectionProbePlanarMap, screenUV, mipCount)).xyz;
    }
  #elif CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_BLEND || CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_BLEND_AND_SKYBOX
    if(FSInput_reflectionProbeId < 0.0){
        envSpec = SampleEnvironmentSpecular(cc_environment, lightingData, cc_ambientGround.w);
    }else{
      vec3 centerPos, boxHalfSize;
      float mipCount;
      GetCubeReflectionProbeData(centerPos, boxHalfSize, mipCount, FSInput_reflectionProbeId);
      envSpec = SampleEnvironmentSpecular(cc_reflectionProbeCubemap, lightingData, mipCount, worldPos, centerPos, boxHalfSize, isReflectProbeUsingRGBE(FSInput_reflectionProbeId));
      float blendFactor = 0.0;
      #if USE_INSTANCING
        blendFactor = FSInput_reflectionProbeData.x;
      #else
        blendFactor = cc_reflectionProbeBlendData1.w;
      #endif
      if(FSInput_reflectionProbeBlendId < 0.0)
      {
        vec3 skyBoxEnv = SampleEnvironmentSpecular(cc_environment, lightingData, cc_ambientGround.w).rgb * lightIntensity;
        #if CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_BLEND_AND_SKYBOX
          envSpec = mix(envSpec, skyBoxEnv, blendFactor);
        #else
          vec3 R = normalize(CalculateReflectDirection(lightingData.N, lightingData.V, lightingData.NoV));
          vec4 fixedR = CalculateBoxProjectedDirection(R, worldPos, centerPos, boxHalfSize);
          envSpec = mix(skyBoxEnv, envSpec, fixedR.w);
        #endif
      }
    }
  #endif
#elif CC_USE_IBL
    envSpec = SampleEnvironmentSpecular(cc_environment, lightingData, cc_ambientGround.w);
#endif
  #if CC_USE_REFLECTION_PROBE
    lightIntensity = FSInput_reflectionProbeId < 0.0 ? lightIntensity : 1.0;
  #endif
  return envSpec * lightIntensity;
}
bool CCSurfacesLightingEnableShadow(in float NoL)
{
#if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  return true;
#elif CC_SURFACES_LIGHTING_SSS
  return true;
#else
  return NoL > 0.0;
#endif
}
float CCSurfacesLightingCalculateDistanceAttenuation(in LightingIntermediateData lightingData, in vec4 lightSizeRangeAngle, in float lightType)
{
  return CalculateDistanceAttenuation(lightingData.distToLightSqr, lightSizeRangeAngle.x, lightSizeRangeAngle.y, lightType);
}
float CCSurfacesLightingCalculateAngleAttenuationWithStrength(in LightingIntermediateData lightingData, in vec4 lightSizeRangeAngle, in vec3 spotLightDir, in float strength)
{
  return CalculateAngleAttenuationWithStrength(spotLightDir, lightingData.L, lightSizeRangeAngle.z, strength);
}
void CCSurfacesLightingCalculateDirect(out vec3 lightingDiffuse, out vec3 lightingSpecular, in LightingIntermediateData lightingData, in vec4 lightSourceColorAndIntensity)
{
#if !CC_SURFACES_LIGHTING_DISABLE_DIFFUSE
  lightingDiffuse = CalculateDirectDiffuse(lightingData, lightSourceColorAndIntensity);
#else
  lightingDiffuse = vec3(0.0);
#endif
#if !CC_SURFACES_LIGHTING_DISABLE_SPECULAR
  lightingSpecular = CalculateDirectSpecular(lightingData, lightSourceColorAndIntensity);
#else
  lightingSpecular = vec3(0.0);
#endif
}
void CCSurfacesLightingCalculateEnvironment(out vec3 lightingDiffuse, out vec3 lightingSpecular, in LightingIntermediateData lightingData, float lightIntensity)
{
#if !CC_SURFACES_LIGHTING_DISABLE_DIFFUSE
  lightingDiffuse = CalculateEnvironmentDiffuse(lightingData, lightIntensity);
#else
  lightingDiffuse = vec3(0.0);
#endif
#if !CC_SURFACES_LIGHTING_DISABLE_SPECULAR
  lightingSpecular = CalculateEnvironmentSpecular(lightingData, lightIntensity);
#else
  lightingSpecular = vec3(0.0);
#endif
}
vec3 CCSurfaceLightingCalculateExtraFresnel(in LightingIntermediateData lightingData)
{
    float fresnel = CalculateFresnelCoefficient(lightingData.ior, lightingData.NoVAbsSat);
    return vec3(fresnel);
}
void CCSurfaceLightingCalculateDirectFresnel(out vec3 directGF, in LightingIntermediateData lightingData, vec3 specularColor, in vec3 environmentGF)
{
  #if CC_SURFACES_USE_LEGACY_COMPATIBLE_LIGHTING
    directGF = environmentGF;
  #else
    float roughness = lightingData.specularParam;
    directGF = F_SchlickMultiplier(specularColor, lightingData.VoHAbsSat) * G_Schlick(roughness, lightingData.NoVSat, lightingData.NoLSat);
  #endif
}
void CCSurfaceLightingCalculateEnvironmentFresnel(out vec3 integratedGF, vec3 integratedF, in LightingIntermediateData lightingData, vec3 specularColor)
{
  float roughness = lightingData.specularParam;
  IntegratedGFMultiplier(integratedGF, integratedF, specularColor, roughness, lightingData.NoVAbsSat);
}
#if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
  void CCSurfaceLightingCalculateDirectSubLayerFresnel(out vec3 subLayerF, in LightingIntermediateData lightingData, vec3 specularColor)
  {
    float VoH = lightingData.VoHAbsSat;
  	subLayerF = vec3(exp2( (-5.55473 * VoH - 6.98316) * VoH ));
  }
  void CCSurfaceLightingCalculateEnvironmentSubLayerFresnel(out vec3 subLayerF, in LightingIntermediateData lightingData, vec3 specularColor)
  {
    subLayerF = vec3(CalculateFresnelCoefficient(lightingData.ior, lightingData.NoVSat));
  }
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR
  void CCSurfacesLightingCalculateDirectTransmitSpecular(out vec3 lightingSpecular, in LightingIntermediateData lightingData, in vec4 lightSourceColorAndIntensity)
  {
    float roughness = lightingData.specularParam;
    float NoLSat = saturate(dot(lightingData.N, -lightingData.L));
    vec3 irradiance = NoLSat * lightSourceColorAndIntensity.rgb * lightSourceColorAndIntensity.w;
    vec3 R = CalculateRefractDirection(lightingData.N, lightingData.V, lightingData.NoV, lightingData.ior);
    float RoL = dot(lightingData.L, normalize(R));
    float calcSpec = D_GGX(roughness, saturate(RoL));
    lightingSpecular = irradiance * calcSpec;
  }
  void CCSurfacesLightingCalculateEnvironmentTransmitSpecular(out vec3 lightingSpecular, in LightingIntermediateData lightingData, float lightIntensity)
  {
    vec3 envSpec = vec3(0.0);
    vec3 R = CalculateRefractDirection(lightingData.N, lightingData.V, lightingData.NoV, lightingData.ior);
    float roughness = lightingData.specularParam;
  #if CC_USE_REFLECTION_PROBE
    #if CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_CUBE
      envSpec = EnvReflection(cc_reflectionProbeCubemap, R, roughness, cc_ambientGround.w);
    #endif
  #endif
  #if CC_USE_IBL && CC_USE_REFLECTION_PROBE != REFLECTION_PROBE_TYPE_CUBE
    envSpec = EnvReflection(cc_environment, R, roughness, cc_ambientGround.w);
  #endif
    lightingSpecular = CalculateScattering(envSpec * lightIntensity, lightingData.transmitScatteringParams.w, lightingData.transmitScatteringParams.x, lightingData.transmitScatteringParams.x, lightingData.transmitScatteringParams.y, lightingData.inScatteringColor.rgb, lightingData.outScatteringColor.rgb);
  }
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  #define objectThickness lightingData.transmitDiffuseParams.x
  #define transmitMask lightingData.transmitDiffuseParams.y
  #define envTransmitScale lightingData.transmitDiffuseParams.z
  #define envFixedDistanceScale lightingData.transmitScatteringParams.w
  #define transmitDistanceScale lightingData.transmitDiffuseParams.w
  #define DONOT_USE_SHADOWMAP_DISTANCE ((abs(float(lightingData.shadowPosAndDepth.z) - float(lightingData.shadowPosAndDepth.w)) < EPSILON) && (abs(float(lightingData.shadowPosAndDepth.z) - float(SURFACES_MAX_TRANSMIT_DEPTH_VALUE)) < EPSILON))
  #define SHADOWMAP_DISTANCE max(lightingData.shadowPosAndDepth.w - lightingData.shadowPosAndDepth.z, 0.0)
  void CCSurfacesLightingCalculateDirectTransmitDiffuse(out vec3 transmitDiffuse, in LightingIntermediateData lightingData, in vec4 lightSourceColorAndIntensity, float shadow)
  {
  #if !CC_SURFACES_LIGHTING_DISABLE_DIFFUSE
    float distance = lightingData.transmitScatteringParams.w;
    if (!DONOT_USE_SHADOWMAP_DISTANCE)
    {
      distance = transmitDistanceScale * SHADOWMAP_DISTANCE;
      shadow = step(SHADOWMAP_DISTANCE, objectThickness) > 0.0 ? 1.0 : shadow;
    }
    vec3 backIrradiance = CalculateDirectDiffuse(lightingData, lightSourceColorAndIntensity);
    backIrradiance *= shadow * transmitMask;
    transmitDiffuse = CalculateScattering(backIrradiance, distance, lightingData.transmitScatteringParams.x, lightingData.transmitScatteringParams.x, lightingData.transmitScatteringParams.y, lightingData.inScatteringColor.rgb, lightingData.outScatteringColor.rgb);
  #else
    transmitDiffuse = vec3(0.0);
  #endif
  }
  void CCSurfacesLightingCalculateEnvironmentTransmitDiffuse(out vec3 transmitDiffuse, in LightingIntermediateData lightingData, float lightIntensity, float ao, vec3 shadowLightDirection)
  {
  #if !CC_SURFACES_LIGHTING_DISABLE_DIFFUSE
    float distance = lightingData.transmitScatteringParams.w;
    if (!DONOT_USE_SHADOWMAP_DISTANCE)
    {
      float shadowMapDistance = transmitDistanceScale * SHADOWMAP_DISTANCE;
      float fixedDistance = transmitDistanceScale * envFixedDistanceScale;
      float lerpCoef = saturate(dot(lightingData.N, shadowLightDirection));
      distance = mix(fixedDistance, shadowMapDistance, lerpCoef);
    }
    vec3 backIrradiance = CalculateEnvironmentDiffuse(lightingData, lightIntensity);
    backIrradiance *= ao * transmitMask;
    transmitDiffuse = CalculateScattering(backIrradiance, distance, lightingData.transmitScatteringParams.x, lightingData.transmitScatteringParams.x, lightingData.transmitScatteringParams.y, lightingData.inScatteringColor.rgb, lightingData.outScatteringColor.rgb);
    transmitDiffuse *= envTransmitScale;
  #else
    transmitDiffuse = vec3(0.0);
  #endif
  }
  #undef objectThickness
  #undef transmitMask
  #undef envTransmitScale
  #undef envFixedDistanceScale
  #undef DONOT_USE_SHADOWMAP_DISTANCE
  #undef SHADOWMAP_DISTANCE
#endif
#if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
  #ifndef CC_SURFACES_FRAGMENT_MODIFY_2ND_SPECULAR_COLOR
  #endif
  void CCSurfacesLightingCalculateDirect2ndSpecular(out vec3 specularLighting, in LightingIntermediateData lightingData, in vec4 lightSourceColorAndIntensity, float intensitySpecular, in vec3 originalSpecular)
  {
  #if !CC_SURFACES_LIGHTING_DISABLE_SPECULAR
    vec3 unused;
    CCSurfacesLightingCalculateDirect(unused, specularLighting, lightingData, lightSourceColorAndIntensity);
    specularLighting *= intensitySpecular;
  #else
    specularLighting = vec3(0.0);
  #endif
  }
  void CCSurfacesLightingCalculateEnvironment2ndSpecular(out vec3 specularLighting, in LightingIntermediateData lightingData, float lightIntensity, float intensitySpecular, in vec3 originalSpecular)
  {
  #if !CC_SURFACES_LIGHTING_DISABLE_SPECULAR
    vec3 unused;
    specularLighting = CalculateEnvironmentSpecular(lightingData, lightIntensity);
    specularLighting *= intensitySpecular;
  #else
    specularLighting = vec3(0.0);
  #endif
  }
  void CCSurfacesLightingCalculateDirectSheen(out vec3 specularLighting, out vec3 directGF, in LightingIntermediateData lightingData, in vec4 lightSourceColorAndIntensity, float intensitySpecular)
  {
  #if !CC_SURFACES_LIGHTING_DISABLE_SPECULAR
    float sheen = Sheen(lightingData.NoHSat, lightingData.NoL, lightingData.NoV, lightingData.specularParam);
    specularLighting = vec3(sheen) * intensitySpecular * lightSourceColorAndIntensity.xyz * lightSourceColorAndIntensity.w;
    directGF = vec3(1.0);
  #else
    specularLighting = vec3(0.0);
  #endif
  }
  void CCSurfacesLightingCalculateEnvironmentSheen(out vec3 specularLighting, out vec3 environmentGF, in LightingIntermediateData lightingData, float lightIntensity, float intensitySpecular)
  {
  #if !CC_SURFACES_LIGHTING_DISABLE_SPECULAR
    LightingIntermediateData lightingDataSheen = lightingData;
    float roughness = lightingData.specularParam;
    vec3 L = normalize(mix(lightingDataSheen.B, lightingDataSheen.N, 0.3));
    lightingDataSheen.specularParam = mix(0.5, 0.9, roughness);
    lightingDataSheen.V = lightingDataSheen.N = L;
    specularLighting = CalculateEnvironmentSpecular(lightingDataSheen, lightIntensity);
    specularLighting *= intensitySpecular;
    environmentGF = vec3(Sheen(lightingData.NoV, roughness));
  #else
    specularLighting = vec3(0.0);
  #endif
  }
#endif
#if CC_SURFACES_LIGHTING_TT
  void CCSurfacesLightingCalculateDirectTT(inout LightingResult lightingResult, in LightingIntermediateData lightingData, in vec4 lightSourceColorAndIntensity)
  {
    lightingResult.diffuseColorWithLightingTT = lightingResult.diffuseColorWithLighting;
    float w = lightingData.ttIntensity;
    vec3 scatteredLighting = pow(saturate(lightingData.baseColorTT * w + lightingData.NoLSat) * lightingData.NoLSat, vec3(mix(0.5, 0.5 + lightingData.ttScatterCoef, w)));
    vec3 ttLighting = scatteredLighting - lightingData.NoLSat;
    lightingResult.directTT = ttLighting * DiffuseCoefficient_EnergyConservation * lightSourceColorAndIntensity.xyz* lightSourceColorAndIntensity.w;
  }
#endif
#if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
  void CCSurfacesLightingCalculateDirectMultiLayerBlending(inout LightingResult lightingResult
      , in LightingIntermediateData lightingData2ndLayer
    #if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND > 1
    #endif
    )
  {
    vec3 lastLayerF, zeroDiffuse = vec3(0.0);
    vec3 blendedBaseD = lightingResult.directDiffuse, blendedBaseS = lightingResult.directSpecular;
    InitializeLayerBlending(blendedBaseD, blendedBaseS,
                            lightingResult.directDiffuseSubLayers, lightingResult.directSpecularSubLayers,
                            lastLayerF,
                            lightingResult.directDiffuse, lightingResult.directSpecular
                            );
      CCSurfaceLightingCalculateDirectSubLayerFresnel(lightingResult.directSubLayerF, lightingData2ndLayer, lightingResult.specularColorWithLighting2ndSpecular);
      CalculateLayerBlending (blendedBaseD, blendedBaseS,
                              lightingResult.directDiffuseSubLayers, lightingResult.directSpecularSubLayers,
                              lastLayerF,
                              zeroDiffuse, zeroDiffuse,
                              lightingResult.direct2ndSpecular, lightingResult.specularColorWithLighting2ndSpecular,
                              lightingData2ndLayer.layerOpacity, lightingResult.directSubLayerF
                              );
    #if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND > 1
    #endif
    lightingResult.directDiffuse = blendedBaseD;
    lightingResult.directSpecular = blendedBaseS;
  }
  void CCSurfacesLightingCalculateEnvironmentMultiLayerBlending(inout LightingResult lightingResult
      , in LightingIntermediateData lightingData2ndLayer
    #if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND > 1
    #endif
    )
  {
    vec3 lastLayerF, zeroDiffuse = vec3(0.0);
    vec3 blendedBaseD = lightingResult.environmentDiffuse, blendedBaseS = lightingResult.environmentSpecular;
    InitializeLayerBlending(blendedBaseD, blendedBaseS,
                            lightingResult.environmentDiffuseSubLayers, lightingResult.environmentSpecularSubLayers,
                            lastLayerF,
                            lightingResult.environmentDiffuse, lightingResult.environmentSpecular
                            );
      CCSurfaceLightingCalculateEnvironmentSubLayerFresnel(lightingResult.environmentSubLayerF, lightingData2ndLayer, lightingResult.specularColorWithLighting2ndSpecular);
      CalculateLayerBlending (blendedBaseD, blendedBaseS,
                              lightingResult.environmentDiffuseSubLayers, lightingResult.environmentSpecularSubLayers,
                              lastLayerF,
                              zeroDiffuse, zeroDiffuse,
                              lightingResult.environment2ndSpecular, lightingResult.specularColorWithLighting2ndSpecular,
                              lightingData2ndLayer.layerOpacity, lightingResult.environmentSubLayerF
                              );
    #if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND > 1
    #endif
    lightingResult.environmentDiffuse = blendedBaseD;
    lightingResult.environmentSpecular = blendedBaseS;
  }
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_BASECOLOR_AND_TRANSPARENCY
vec4 SurfacesFragmentModifyBaseColorAndTransparency()
{
    return FSInput_vertexColor;
}
#endif
#ifndef CC_SURFACES_FRAGMENT_ALPHA_CLIP_ONLY
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_WORLD_NORMAL
vec3 SurfacesFragmentModifyWorldNormal()
{
    return normalize(FSInput_worldNormal);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_WORLD_TANGENT_AND_BINORMAL
void SurfacesFragmentModifyWorldTangentAndBinormal(inout vec3 worldTangent, inout vec3 worldBinormal, vec3 worldNormal)
{
    vec3 tangent = normalize(FSInput_worldTangent);
#if CC_SURFACES_USE_TANGENT_SPACE
    vec3 binormal = normalize(CalculateBinormal(worldNormal.xyz, tangent, FSInput_mirrorNormal));
    tangent = normalize(cross(binormal, worldNormal));
#else
    vec3 binormal = vec3(0.0, 0.0, 0.0);
#endif
    worldTangent = tangent;
    worldBinormal = binormal;
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_IOR
float SurfacesFragmentModifyIOR()
{
    return 1.0;
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_ANISOTROPY_PARAMS
vec4 SurfacesFragmentModifyAnisotropyParams(out float isRotation)
{
    isRotation = 1.0;
    return vec4(1.0, 0.0, 0.0, 0.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_EMISSIVE
vec3 SurfacesFragmentModifyEmissive()
{
    return vec3(0.0, 0.0, 0.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_PBRPARAMS
vec4 SurfacesFragmentModifyPBRParams()
{
    return vec4(1.0, 0.5, 0.0, 0.5);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_TRANSMIT_SCATTERING_PARAMS
vec4 SurfacesFragmentModifyTransmitScatteringParams()
{
    return vec4(1.0, 1.0, 1.0, 1.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_TRANSMIT_IN_SCATTERING_COLOR
vec3 SurfacesFragmentModifyTransmitInScatteringColor()
{
    return vec3(0.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_TRANSMIT_OUT_SCATTERING_COLOR
vec3 SurfacesFragmentModifyTransmitOutScatteringColor()
{
    return vec3(1.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_TRANSMIT_DIFFUSE_PARAMS
vec4 SurfacesFragmentModifyTransmitDiffuseParams()
{
    return vec4(1.0, 1.0, 1.0, 1.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_TRT_PARAMS
vec4 SurfacesFragmentModifyTRTParams()
{
    return vec4(0.2, 0.0, 0.0, 1.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_TRT_COLOR
vec3 SurfacesFragmentModifyTRTColor()
{
    return vec3(1.0, 1.0, 1.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_TT_PARAMS
vec4 SurfacesFragmentModifyTTParams()
{
    return vec4(0.0, 0.0, 0.0, 1.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_TT_COLOR
vec3 SurfacesFragmentModifyTTColor(in vec3 baseColor)
{
    return vec3(1.0, 1.0, 1.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_SSS_PARAMS
vec4 SurfacesFragmentModifySSSParams()
{
    return vec4(1.0, 0.1, 1.0, 0.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_DUAL_LOBE_SPECULAR_PARAMS
vec4 SurfacesFragmentModifyDualLobeSpecularParams(float roughness)
{
    return vec4(0.2, 0.0, 0.0, 1.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_CLEAR_COAT_PARAMS
vec4 SurfacesFragmentModifyClearCoatParams()
{
    return vec4(0.2, 1.5, 1.0, 1.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_CLEAR_COAT_COLOR
vec3 SurfacesFragmentModifyClearCoatColor()
{
    return vec3(1.0, 1.0, 1.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_CLEAR_COAT_WORLD_NORMAL
vec3 SurfacesFragmentModifyClearCoatWorldNormal()
{
    return normalize(FSInput_worldNormal);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_SHEEN_PARAMS
vec4 SurfacesFragmentModifySheenParams()
{
    return vec4(0.7, 1.0, 1.0, 1.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_SHEEN_COLOR
vec3 SurfacesFragmentModifySheenColor()
{
    return vec3(1.0, 1.0, 1.0);
}
#endif
#ifndef CC_SURFACES_FRAGMENT_MODIFY_SHARED_DATA
void SurfacesFragmentModifySharedData(inout SurfacesMaterialData surfaceData)
{
}
#endif
void CCSurfacesFragmentGetMaterialData(inout SurfacesMaterialData surfaceData)
{
  #if CC_PLATFORM_ANDROID_AND_WEBGL && CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES
  packHighpData(surfaceData.worldPos, surfaceData.worldPos_fract_part, FSInput_worldPos);
  #else
  surfaceData.worldPos = FSInput_worldPos;
  #endif
  surfaceData.baseColor = SurfacesFragmentModifyBaseColorAndTransparency();
  surfaceData.worldNormal = SurfacesFragmentModifyWorldNormal();
  SurfacesFragmentModifyWorldTangentAndBinormal(surfaceData.worldTangent, surfaceData.worldBinormal, surfaceData.worldNormal);
  surfaceData.ior = SurfacesFragmentModifyIOR();
#if CC_SURFACES_LIGHTING_ANISOTROPIC
  float isRotation;
  vec4 anisotropyParams = SurfacesFragmentModifyAnisotropyParams(isRotation);
  surfaceData.anisotropyShape = anisotropyParams.x;
  if (isRotation > 0.0) {
    RotateTangentAndBinormal(surfaceData.worldTangent, surfaceData.worldBinormal, surfaceData.worldNormal, anisotropyParams.y);
  } else {
    vec3 anisoDirTS = anisotropyParams.yzw;
    vec3 tangentWS = anisoDirTS.x * surfaceData.worldTangent + anisoDirTS.y * surfaceData.worldBinormal + anisoDirTS.z * surfaceData.worldNormal;
    surfaceData.worldTangent = normalize(tangentWS);
    surfaceData.worldBinormal = cross(surfaceData.worldNormal, tangentWS);
  }
#endif
  surfaceData.emissive = SurfacesFragmentModifyEmissive();
  vec4 pbr = SurfacesFragmentModifyPBRParams();
  surfaceData.ao = pbr.x;
  surfaceData.roughness = pbr.y;
  surfaceData.metallic = pbr.z;
  surfaceData.specularIntensity = pbr.w;
#if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR || CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  surfaceData.transmitScatteringParams = SurfacesFragmentModifyTransmitScatteringParams();
  surfaceData.inScatteringColor = SurfacesFragmentModifyTransmitInScatteringColor();
  surfaceData.outScatteringColor = SurfacesFragmentModifyTransmitOutScatteringColor();
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  surfaceData.transmitDiffuseParams = SurfacesFragmentModifyTransmitDiffuseParams();
#endif
#if CC_SURFACES_LIGHTING_TRT
  vec4 trtParams = SurfacesFragmentModifyTRTParams();
  surfaceData.roughness2ndSpecular = saturate(surfaceData.roughness + trtParams.x);
  surfaceData.metallic2ndSpecular = surfaceData.metallic;
  surfaceData.intensity2ndSpecular = trtParams.w;
  surfaceData.baseColor2ndSpecular = vec3(1.0);
  surfaceData.color2ndSpecular = SurfacesFragmentModifyTRTColor();
  surfaceData.worldNormal2ndSpecular = surfaceData.worldNormal;
  surfaceData.worldTangent2ndSpecular = surfaceData.worldTangent;
  surfaceData.worldBinormal2ndSpecular = surfaceData.worldBinormal;
  surfaceData.ior2ndSpecular = surfaceData.ior;
  surfaceData.opacity2ndSpecular = 1.0;
  #if CC_SURFACES_LIGHTING_ANISOTROPIC
    surfaceData.anisotropyShape2ndSpecular = surfaceData.anisotropyShape;
  #endif
  RotateNormalAndBinormal(surfaceData.worldBinormal2ndSpecular, surfaceData.worldNormal2ndSpecular, surfaceData.worldTangent2ndSpecular, trtParams.y, FSInput_mirrorNormal);
#endif
#if CC_SURFACES_LIGHTING_TT
  vec4 ttParams = SurfacesFragmentModifyTTParams();
  surfaceData.ttScatterCoef = ttParams.x;
  surfaceData.ttIntensity = ttParams.w;
  surfaceData.baseColorTT = SurfacesFragmentModifyTTColor(surfaceData.baseColor.rgb);
#endif
#if CC_SURFACES_LIGHTING_DUAL_LOBE_SPECULAR
  vec4 dualLobeParams = SurfacesFragmentModifyDualLobeSpecularParams(surfaceData.roughness);
  surfaceData.roughness2ndSpecular = saturate(dualLobeParams.x);
  surfaceData.metallic2ndSpecular = surfaceData.metallic;
  surfaceData.intensity2ndSpecular = dualLobeParams.w;
  surfaceData.baseColor2ndSpecular = surfaceData.baseColor.rgb;
  surfaceData.color2ndSpecular = vec3(1.0);
  surfaceData.worldNormal2ndSpecular = surfaceData.worldNormal;
  surfaceData.worldTangent2ndSpecular = surfaceData.worldTangent;
  surfaceData.worldBinormal2ndSpecular = surfaceData.worldBinormal;
  surfaceData.ior2ndSpecular = surfaceData.ior;
  surfaceData.opacity2ndSpecular = 1.0;
  #if CC_SURFACES_LIGHTING_ANISOTROPIC
    surfaceData.anisotropyShape2ndSpecular = surfaceData.anisotropyShape;
  #endif
#endif
#if CC_SURFACES_LIGHTING_SHEEN
  vec4 sheenParams = SurfacesFragmentModifySheenParams();
  surfaceData.roughness2ndSpecular = saturate(sheenParams.x);
  surfaceData.intensity2ndSpecular = sheenParams.y * sheenParams.w;
  surfaceData.metallic2ndSpecular = 1.0;
  surfaceData.baseColor2ndSpecular = SurfacesFragmentModifySheenColor();
  surfaceData.color2ndSpecular = vec3(1.0);
  surfaceData.worldNormal2ndSpecular = surfaceData.worldNormal;
  surfaceData.worldTangent2ndSpecular = surfaceData.worldTangent;
  surfaceData.worldBinormal2ndSpecular = surfaceData.worldBinormal;
  surfaceData.ior2ndSpecular = surfaceData.ior;
  surfaceData.opacity2ndSpecular = 1.0;
  #if CC_SURFACES_LIGHTING_ANISOTROPIC
    surfaceData.anisotropyShape2ndSpecular = surfaceData.anisotropyShape;
  #endif
#endif
#if CC_SURFACES_LIGHTING_CLEAR_COAT
  vec4 clearCoatParams = SurfacesFragmentModifyClearCoatParams();
  surfaceData.roughness2ndSpecular = clearCoatParams.x;
  surfaceData.metallic2ndSpecular = 0.0;
  surfaceData.ior2ndSpecular = clearCoatParams.y;
  surfaceData.opacity2ndSpecular = clearCoatParams.z;
  surfaceData.intensity2ndSpecular = clearCoatParams.w;
  surfaceData.baseColor2ndSpecular = vec3(1.0);
  surfaceData.color2ndSpecular = SurfacesFragmentModifyClearCoatColor();
  surfaceData.worldNormal2ndSpecular = SurfacesFragmentModifyClearCoatWorldNormal();
  surfaceData.worldBinormal2ndSpecular = surfaceData.worldBinormal;
  surfaceData.worldTangent2ndSpecular = CalculateTangent(surfaceData.worldNormal2ndSpecular, surfaceData.worldBinormal2ndSpecular);
  #if CC_SURFACES_LIGHTING_ANISOTROPIC
    surfaceData.anisotropyShape2ndSpecular = surfaceData.anisotropyShape;
  #endif
#endif
#if CC_SURFACES_LIGHTING_SSS
  surfaceData.sssParams = SurfacesFragmentModifySSSParams();
#endif
  SurfacesFragmentModifySharedData(surfaceData);
#if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_COMPOSITE_AND_MISC
  if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_NORMAL_MAP) {
      surfaceData.worldNormal = normalize(FSInput_worldNormal);
      surfaceData.worldTangent = normalize(FSInput_worldTangent);
  }
#endif
#if CC_USE_DEBUG_VIEW
  if (!IS_DEBUG_VIEW_LIGHTING_ENABLE_WITH_ALBEDO)
  {
      surfaceData.baseColor.rgb = vec3(1.0);
      #if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
        surfaceData.baseColor2ndSpecular.rgb = vec3(1.0);
      #endif
      #if CC_SURFACES_LIGHTING_TT
        surfaceData.baseColorTT.rgb = vec3(1.0);
      #endif
  }
#endif
}
vec3 CCSurfacesGetDiffuseColor(in SurfacesMaterialData surfaceData)
{
  return surfaceData.baseColor.rgb * (1.0 - surfaceData.metallic);
}
vec3 CCSurfacesGetSpecularColor(in SurfacesMaterialData surfaceData)
{
  float F0 = surfaceData.specularIntensity * 0.08;
  return mix(vec3(F0), surfaceData.baseColor.rgb, surfaceData.metallic);
}
void CCSurfacesLightingInitializeColorWithLighting(inout vec3 diffuseColorWithLighting, inout vec3 specularColorWithLighting, in SurfacesMaterialData surfaceData, in LightingIntermediateData lightingData)
{
  diffuseColorWithLighting = CCSurfacesGetDiffuseColor(surfaceData);
  specularColorWithLighting = CCSurfacesGetSpecularColor(surfaceData).xyz;
}
void CCSurfacesLightingCalculateColorWithLighting(inout vec3 diffuseColorWithLighting, inout vec3 specularColorWithLighting, in SurfacesMaterialData surfaceData, in LightingIntermediateData lightingData)
{
}
void CCSurfacesInitializeLightingIntermediateData(inout LightingIntermediateData lightingData, in SurfacesMaterialData surfaceData)
{
  vec3 worldPos;
  #if CC_PLATFORM_ANDROID_AND_WEBGL && CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES
  worldPos = unpackHighpData(surfaceData.worldPos, surfaceData.worldPos_fract_part);
  #else
  worldPos = surfaceData.worldPos;
  #endif
  CCSurfacesLightingGetIntermediateData_PerPixel(lightingData, surfaceData.worldNormal, worldPos, surfaceData.worldTangent, surfaceData.worldBinormal
#if CC_SURFACES_LIGHTING_ANISOTROPIC
      , surfaceData.anisotropyShape
#endif
  );
  lightingData.specularParam = surfaceData.roughness;
  lightingData.ior = surfaceData.ior;
  lightingData.layerOpacity = surfaceData.baseColor.a;
#if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR || CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  lightingData.transmitScatteringParams = surfaceData.transmitScatteringParams;
  lightingData.inScatteringColor = surfaceData.inScatteringColor;
  lightingData.outScatteringColor = surfaceData.outScatteringColor;
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  lightingData.transmitDiffuseParams = surfaceData.transmitDiffuseParams;
#endif
#if CC_SURFACES_LIGHTING_TT
  lightingData.baseColorTT = surfaceData.baseColorTT;
  lightingData.ttIntensity = surfaceData.ttIntensity;
  lightingData.ttScatterCoef = surfaceData.ttScatterCoef;
#endif
}
void CCSurfacesLightingCalculateIntermediateData_PerLight(inout LightingIntermediateData lightingData, in SurfacesMaterialData surfaceData, vec3 lightDirWithDist)
{
  CCSurfacesLightingGetIntermediateData_PerLight(lightingData, lightDirWithDist);
}
#if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
void CCSurfacesGetLightingIntermediateDataTransmitDiffuse(inout LightingIntermediateData lightingDataTD, in LightingIntermediateData lightingData, in SurfacesMaterialData surfaceData)
{
  lightingDataTD = lightingData;
  lightingDataTD.N = lightingData.transmitScatteringParams.z > 0.0 ? -FSInput_worldNormal : -(normalize(FSInput_worldNormal)+lightingData.V);
  lightingDataTD.N = normalize(lightingDataTD.N);
}
#endif
#if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
void CCSurfacesGetSurfacesMaterialData2ndSpecular(inout SurfacesMaterialData surfaceData2ndSpecular, in SurfacesMaterialData surfaceData)
{
  surfaceData2ndSpecular = surfaceData;
  surfaceData2ndSpecular.baseColor = vec4(surfaceData.baseColor2ndSpecular, surfaceData.opacity2ndSpecular);
  surfaceData2ndSpecular.roughness = surfaceData.roughness2ndSpecular;
  surfaceData2ndSpecular.metallic = surfaceData.metallic2ndSpecular;
  surfaceData2ndSpecular.worldNormal = surfaceData.worldNormal2ndSpecular;
  surfaceData2ndSpecular.worldTangent = surfaceData.worldTangent2ndSpecular;
  surfaceData2ndSpecular.worldBinormal = surfaceData.worldBinormal2ndSpecular;
  surfaceData2ndSpecular.ior = surfaceData.ior2ndSpecular;
  #if CC_SURFACES_LIGHTING_ANISOTROPIC
    surfaceData2ndSpecular.anisotropyShape = surfaceData.anisotropyShape2ndSpecular;
  #endif
}
#endif
void CCSurfacesInitializeLightingResult(inout LightingResult lightingResult, in SurfacesMaterialData surfaceData)
{
  lightingResult.ao = surfaceData.ao;
  lightingResult.emissive = surfaceData.emissive;
  lightingResult.directGF = vec3(1.0);
#if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
  lightingResult.directDiffuseSubLayers = lightingResult.directSpecularSubLayers = vec3(0.0);
  lightingResult.environmentDiffuseSubLayers = lightingResult.environmentSpecularSubLayers = vec3(0.0);
#endif
}
void CCSurfacesInitializeLightingResult(inout LightingResult lightingResult)
{
  lightingResult.directDiffuse = lightingResult.directSpecular = vec3(0.0);
  lightingResult.directGF = vec3(1.0);
#if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
  lightingResult.directDiffuseSubLayers = lightingResult.directSpecularSubLayers = vec3(0.0);
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR
  lightingResult.directTransmitSpecular = vec3(0.0);
#endif
#if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
  lightingResult.directTransmitDiffuse = vec3(0.0);
#endif
#if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
  lightingResult.direct2ndSpecular = vec3(0.0);
#endif
#if CC_SURFACES_LIGHTING_TT
  lightingResult.directTT = vec3(0.0);
#endif
}
void CCSurfacesAccumulateLightingResult(inout LightingResult lightingResultAccumulated, in LightingResult lightingResult)
{
  lightingResultAccumulated.directDiffuse += lightingResult.directDiffuse * lightingResult.shadow;
  lightingResultAccumulated.directSpecular += lightingResult.directSpecular * lightingResult.shadow * lightingResult.directGF * lightingResult.fresnel;
  #if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
    lightingResultAccumulated.directDiffuseSubLayers += lightingResult.directDiffuseSubLayers * lightingResult.shadow;
    lightingResultAccumulated.directSpecularSubLayers += lightingResult.directSpecularSubLayers * lightingResult.shadow;
  #endif
  #if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR
    lightingResultAccumulated.directTransmitSpecular += lightingResult.directTransmitSpecular * (vec3(1.0) - lightingResult.fresnel);
  #endif
  #if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
    lightingResultAccumulated.directTransmitDiffuse += lightingResult.directTransmitDiffuse;
  #endif
  #if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
    lightingResultAccumulated.direct2ndSpecular += lightingResult.direct2ndSpecular * lightingResult.shadow * lightingResult.directGF2ndSpecular * lightingResult.fresnel;
  #endif
  #if CC_SURFACES_LIGHTING_TT
    lightingResultAccumulated.directTT += lightingResult.directTT * lightingResult.shadow;
    lightingResultAccumulated.diffuseColorWithLightingTT = lightingResult.diffuseColorWithLightingTT;
  #endif
}
#if CC_PIPELINE_TYPE == 1
  vec4 CCSurfacesDeferredOutputBaseColor(in SurfacesMaterialData surfaceData)
  {
    return surfaceData.baseColor;
  }
  vec4 CCSurfacesDeferredOutputNormalMR(in SurfacesMaterialData surfaceData)
  {
    return vec4(float32x3_to_oct(surfaceData.worldNormal), surfaceData.roughness, surfaceData.metallic);
  }
  vec4 CCSurfacesDeferredOutputEmissiveAO(in SurfacesMaterialData surfaceData)
  {
    return vec4(surfaceData.emissive, surfaceData.ao);
  }
#endif
vec4 CCSurfacesShading(in SurfacesMaterialData surfaceData, in LightingResult lightingResult)
{
  vec4 color = vec4(0.0, 0.0, 0.0, surfaceData.baseColor.a);
#if CC_FORWARD_ADD
  color.xyz += lightingResult.directDiffuse * lightingResult.diffuseColorWithLighting
    + lightingResult.directSpecular * lightingResult.specularColorWithLighting * lightingResult.directGF
  #if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR
    + lightingResult.directTransmitSpecular * lightingResult.specularColorWithLighting * lightingResult.directGF
  #endif
  #if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
    + lightingResult.directDiffuseSubLayers
    + lightingResult.directSpecularSubLayers
  #else
    #if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
    + lightingResult.direct2ndSpecular * lightingResult.specularColorWithLighting2ndSpecular * surfaceData.color2ndSpecular * lightingResult.directGF2ndSpecular
    #endif
  #endif
  #if CC_SURFACES_LIGHTING_TT
    + lightingResult.directTT * lightingResult.diffuseColorWithLightingTT
  #endif
  #if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
    + lightingResult.directTransmitDiffuse
  #endif
  ;
#else
  vec3 fresnel = lightingResult.fresnel;
  vec3 invFresnel = vec3(1.0) - fresnel;
  color.xyz +=
    ( lightingResult.directDiffuse * lightingResult.diffuseColorWithLighting
    + lightingResult.directSpecular * lightingResult.specularColorWithLighting * lightingResult.directGF * fresnel
  #if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR
    + lightingResult.directTransmitSpecular * lightingResult.specularColorWithLighting * lightingResult.directGF * invFresnel
  #endif
  #if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
    + lightingResult.directDiffuseSubLayers
    + lightingResult.directSpecularSubLayers
  #else
    #if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
    + lightingResult.direct2ndSpecular * lightingResult.specularColorWithLighting2ndSpecular * surfaceData.color2ndSpecular * lightingResult.directGF2ndSpecular
    #endif
  #endif
  #if CC_SURFACES_LIGHTING_TT
    + lightingResult.directTT * lightingResult.diffuseColorWithLightingTT
  #endif
    )
    * lightingResult.shadow
  #if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
    + lightingResult.directTransmitDiffuse
  #endif
  ;
  #if CC_SURFACES_USE_LIGHT_MAP == LIGHT_MAP_TYPE_ALL_IN_ONE
    color.xyz += lightingResult.lightmapColor * lightingResult.diffuseColorWithLighting * lightingResult.shadow;
  #elif CC_SURFACES_USE_LIGHT_MAP == LIGHT_MAP_TYPE_INDIRECT_OCCLUSION
    color.xyz += lightingResult.lightmapColor * lightingResult.diffuseColorWithLighting;
  #endif
  color.xyz +=
    ( lightingResult.environmentDiffuse * lightingResult.diffuseColorWithLighting
    + lightingResult.environmentSpecular * lightingResult.specularColorWithLighting * lightingResult.environmentGF * fresnel
  #if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR
    + lightingResult.environmentTransmitSpecular * lightingResult.specularColorWithLighting * lightingResult.environmentGF * invFresnel
  #endif
  #if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
    + lightingResult.environmentDiffuseSubLayers
    + lightingResult.environmentSpecularSubLayers
  #else
    #if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
    + lightingResult.environment2ndSpecular * lightingResult.specularColorWithLighting2ndSpecular * surfaceData.color2ndSpecular * lightingResult.environmentGF2ndSpecular
    #endif
  #endif
    )
    * lightingResult.ao
  #if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
    + lightingResult.environmentTransmitDiffuse
  #endif
  ;
  color.xyz += lightingResult.emissive;
#endif
  return color;
}
#if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_SINGLE
bool CCSurfacesDebugViewSurfaceData(inout vec4 color, in SurfacesMaterialData surfaceData)
{
    bool enableMaterialAlpha = true;
    vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
    float scalar;
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_FRAGMENT_NORMAL)) && (cc_surfaceTransform.y != 3.0)))
        color = vec4(surfaceData.worldNormal * 0.5 + vec3(0.5), 1.0);
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_FRAGMENT_TANGENT)) && (cc_surfaceTransform.y != 3.0)))
    {
      #if CC_SURFACES_USE_TANGENT_SPACE
        color = vec4(surfaceData.worldTangent * 0.5 + vec3(0.5), 1.0);
      #else
        color = black;
      #endif
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_FRAGMENT_BINORMAL)) && (cc_surfaceTransform.y != 3.0)))
    {
      #if CC_SURFACES_USE_TANGENT_SPACE
        color = vec4(surfaceData.worldBinormal * 0.5 + vec3(0.5), 1.0);
      #else
        color = black;
      #endif
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_TRANSPARENCY)) && (cc_surfaceTransform.y != 3.0))) {
        scalar = surfaceData.baseColor.a;
        color = vec4(scalar, scalar, scalar, 1.0);
        enableMaterialAlpha = false;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_BASE_COLOR)) && (cc_surfaceTransform.y != 3.0)))
        color = vec4(LinearToSRGB(surfaceData.baseColor.rgb), 1.0);
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_DIFFUSE_COLOR)) && (cc_surfaceTransform.y != 3.0)))
        color = vec4(LinearToSRGB(CCSurfacesGetDiffuseColor(surfaceData)), 1.0);
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_SPECULAR_COLOR)) && (cc_surfaceTransform.y != 3.0)))
        color = vec4(LinearToSRGB(CCSurfacesGetSpecularColor(surfaceData)), 1.0);
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_ROUGHNESS)) && (cc_surfaceTransform.y != 3.0))) {
        scalar = surfaceData.roughness;
        color = vec4(scalar, scalar, scalar, 1.0);
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_METALLIC)) && (cc_surfaceTransform.y != 3.0))) {
        scalar = surfaceData.metallic;
        color = vec4(scalar, scalar, scalar, 1.0);
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_SPECULAR_INTENSITY)) && (cc_surfaceTransform.y != 3.0))) {
        scalar = surfaceData.specularIntensity;
        color = vec4(scalar, scalar, scalar, 1.0);
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_IOR)) && (cc_surfaceTransform.y != 3.0))) {
        scalar = surfaceData.ior - 1.0;
        color = vec4(scalar, scalar, scalar, 1.0);
    }
    return enableMaterialAlpha;
}
#endif
#if (CC_PIPELINE_TYPE == 0 || CC_FORCE_FORWARD_SHADING)
  #if CC_FORWARD_ADD
    void CCSurfacesLighting(inout LightingResult lightingResultAccumulated, in SurfacesMaterialData surfaceData, in vec2 shadowBias)
    {
      vec3 worldPos;
      #if CC_PLATFORM_ANDROID_AND_WEBGL && CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES
      worldPos = unpackHighpData(surfaceData.worldPos, surfaceData.worldPos_fract_part);
      #else
      worldPos = surfaceData.worldPos;
      #endif
      CCSurfacesInitializeLightingResult(lightingResultAccumulated);
      LightingIntermediateData lightingData;
      CCSurfacesInitializeLightingIntermediateData(lightingData, surfaceData);
      LightingResult lightingResult;
      CCSurfacesLightingInitializeColorWithLighting(lightingResult.diffuseColorWithLighting, lightingResult.specularColorWithLighting, surfaceData, lightingData);
      lightingResultAccumulated.diffuseColorWithLighting = lightingResult.diffuseColorWithLighting;
      lightingResultAccumulated.specularColorWithLighting = lightingResult.specularColorWithLighting;
      #if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
        vec3 diff;
        SurfacesMaterialData surfaceData2ndSpecular;
        CCSurfacesGetSurfacesMaterialData2ndSpecular(surfaceData2ndSpecular, surfaceData);
        CCSurfacesLightingInitializeColorWithLighting(diff, lightingResult.specularColorWithLighting2ndSpecular, surfaceData2ndSpecular, lightingData);
        lightingResultAccumulated.specularColorWithLighting2ndSpecular = lightingResult.specularColorWithLighting2ndSpecular;
      #endif
      int numLights = CC_PIPELINE_TYPE == 0 ? LIGHTS_PER_PASS : int(cc_lightDir[0].w);
      for (int i = 0; i < LIGHTS_PER_PASS; i++) {
        if (i >= numLights) break;
        vec3 lightDirWithLength = IS_RANGED_DIRECTIONAL_LIGHT(cc_lightPos[i].w) ? -normalize(cc_lightDir[i].xyz) : cc_lightPos[i].xyz - worldPos;
        CCSurfacesLightingCalculateIntermediateData_PerLight(lightingData, surfaceData, lightDirWithLength);
        CCSurfacesLightingCalculateColorWithLighting(lightingResult.diffuseColorWithLighting, lightingResult.specularColorWithLighting, surfaceData, lightingData);
        vec3 diffuseLighting, specularLighting;
        CCSurfacesLightingCalculateDirect(diffuseLighting, specularLighting, lightingData, cc_lightColor[i]);
      #if CC_SURFACES_LIGHTING_USE_FRESNEL
        vec3 fresnel = CCSurfaceLightingCalculateExtraFresnel(lightingData);
      #else
        vec3 fresnel = vec3(1.0);
      #endif
        lightingResult.fresnel = fresnel;
        float shadow = 1.0;
      #if CC_RECEIVE_SHADOW && CC_SHADOW_TYPE == 2
        if (cc_lightPos[i].w > 0.0 && cc_lightSizeRangeAngle[i].w > 0.0) {
          vec4 shadowPos = vec4(0.0), shadowPosWithDepthBias = vec4(0.0);
          if (CCSurfacesLightingEnableShadow(lightingData.NoL)) {
            shadowPos = cc_matLightViewProj * vec4(worldPos, 1.0);
            shadow = CCSpotShadowFactorBase(shadowPosWithDepthBias, shadowPos, worldPos, shadowBias);
          }
          #if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE && CC_SURFACES_LIGHTING_USE_SHADOWMAP_TRANSMIT
            vec3 shadowNDCPos;
            bool isExceedShadowMap = !GetShadowNDCPos(shadowNDCPos, shadowPosWithDepthBias);
            lightingData.shadowPosAndDepth.xy = shadowNDCPos.xy;
            lightingData.shadowPosAndDepth.z = isExceedShadowMap ? 0.0 : GetViewSpaceDepthFromNDCDepth_Perspective(shadowNDCPos.z, shadowPosWithDepthBias.w, cc_shadowInvProjDepthInfo.x, cc_shadowInvProjDepthInfo.y);
            lightingData.shadowPosAndDepth.w = isExceedShadowMap ? lightingData.shadowPosAndDepth.w : GetViewSpaceDepthFromNDCDepth_Perspective(SampleShadowMapSoft(shadowNDCPos, cc_spotShadowMap, cc_shadowWHPBInfo.xy), shadowPosWithDepthBias.w, cc_shadowInvProjDepthInfo.x, cc_shadowInvProjDepthInfo.y);
          #endif
        }
      #endif
      #if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_COMPOSITE_AND_MISC
        if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_SHADOW)
          shadow = 1.0;
      #endif
        lightingResult.shadow = shadow;
        float distAtt = 1.0;
        if(IS_RANGED_DIRECTIONAL_LIGHT(cc_lightPos[i].w)) {
          distAtt = GetOutOfRange(worldPos, cc_lightPos[i].xyz, cc_lightDir[i].xyz, cc_lightSizeRangeAngle[i].xyz, cc_lightBoundingSizeVS[i].xyz);
        } else {
          distAtt = CCSurfacesLightingCalculateDistanceAttenuation(lightingData, cc_lightSizeRangeAngle[i], cc_lightPos[i].w);
        }
        float angleAtt = 1.0;
        if (IS_SPOT_LIGHT(cc_lightPos[i].w)) {
          angleAtt = CCSurfacesLightingCalculateAngleAttenuationWithStrength(lightingData, cc_lightSizeRangeAngle[i], -cc_lightDir[i].xyz, cc_lightBoundingSizeVS[i].w);
        }
        float multiplier = distAtt * angleAtt;
        lightingData.angleAttenuation = angleAtt;
        lightingData.distAttenuation = distAtt;
        lightingResult.directDiffuse = diffuseLighting * multiplier;
        lightingResult.directSpecular = specularLighting * multiplier;
        CCSurfaceLightingCalculateDirectFresnel(lightingResult.directGF, lightingData, lightingResult.specularColorWithLighting, vec3(1.0));
        vec4 attenuatedLightColorAndIntensity = vec4(cc_lightColor[i].xyz, cc_lightColor[i].w * multiplier);
        #if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR
          vec3 transmitSpecularLighting;
          CCSurfacesLightingCalculateDirectTransmitSpecular(transmitSpecularLighting, lightingData, attenuatedLightColorAndIntensity);
          lightingResult.directTransmitSpecular = transmitSpecularLighting * multiplier * (1.0 - fresnel);
        #endif
        #if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
          LightingIntermediateData lightingDataTD;
          CCSurfacesGetLightingIntermediateDataTransmitDiffuse(lightingDataTD, lightingData, surfaceData);
          CCSurfacesLightingCalculateIntermediateData_PerLight(lightingDataTD, surfaceData, lightDirWithLength);
          CCSurfacesLightingCalculateDirectTransmitDiffuse(lightingResult.directTransmitDiffuse, lightingDataTD, attenuatedLightColorAndIntensity, lightingResult.shadow);
        #endif
        #if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
          LightingIntermediateData lightingData2ndSpecular;
          CCSurfacesInitializeLightingIntermediateData(lightingData2ndSpecular, surfaceData2ndSpecular);
          CCSurfacesLightingCalculateIntermediateData_PerLight(lightingData2ndSpecular, surfaceData, lightDirWithLength);
          #if !CC_SURFACES_LIGHTING_SHEEN
            CCSurfacesLightingCalculateDirect2ndSpecular(lightingResult.direct2ndSpecular, lightingData2ndSpecular, attenuatedLightColorAndIntensity, surfaceData2ndSpecular.intensity2ndSpecular, lightingResult.directSpecular);
            CCSurfaceLightingCalculateDirectFresnel(lightingResult.directGF2ndSpecular, lightingData2ndSpecular, lightingResult.specularColorWithLighting2ndSpecular, vec3(1.0));
          #else
            CCSurfacesLightingCalculateDirectSheen(lightingResult.direct2ndSpecular, lightingResult.directGF2ndSpecular, lightingData2ndSpecular, attenuatedLightColorAndIntensity, surfaceData2ndSpecular.intensity2ndSpecular);
          #endif
          lightingResult.direct2ndSpecular *= multiplier;
        #endif
        #if CC_SURFACES_LIGHTING_TT
          CCSurfacesLightingCalculateDirectTT(lightingResult, lightingData, attenuatedLightColorAndIntensity);
        #endif
        #if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
          lightingResult.specularColorWithLighting2ndSpecular *= surfaceData.color2ndSpecular;
          CCSurfacesLightingCalculateDirectMultiLayerBlending(lightingResult, lightingData2ndSpecular);
        #endif
        #ifdef CC_SURFACES_LIGHTING_MODIFY_FINAL_RESULT
          LightingMiscData miscData;
          miscData.lightType = cc_lightPos[i].w;
          miscData.lightPos = cc_lightPos[i].xyz;
          miscData.lightDir = cc_lightDir[i].xyz;
          miscData.lightColorAndIntensity = cc_lightColor[i];
          miscData.lightSizeRangeAngle = cc_lightSizeRangeAngle[i];
          SurfacesLightingModifyFinalResult(lightingResult, lightingData, surfaceData, miscData);
        #endif
        CCSurfacesAccumulateLightingResult(lightingResultAccumulated, lightingResult);
      }
    }
  #else
    void CCSurfacesLighting(inout LightingResult lightingResult, in SurfacesMaterialData surfaceData, in vec2 shadowBias)
    {
      vec3 worldPos;
      #if CC_PLATFORM_ANDROID_AND_WEBGL && CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES
      worldPos = unpackHighpData(surfaceData.worldPos, surfaceData.worldPos_fract_part);
      #else
      worldPos = surfaceData.worldPos;
      #endif
      LightingIntermediateData lightingData;
      CCSurfacesInitializeLightingIntermediateData(lightingData, surfaceData);
      CCSurfacesInitializeLightingResult(lightingResult, surfaceData);
      CCSurfacesLightingInitializeColorWithLighting(lightingResult.diffuseColorWithLighting, lightingResult.specularColorWithLighting, surfaceData, lightingData);
      CCSurfacesLightingCalculateIntermediateData_PerLight(lightingData, surfaceData, -cc_mainLitDir.xyz);
      lightingResult.shadow = 1.0;
      #if CC_RECEIVE_SHADOW && CC_SHADOW_TYPE == 2
        if (cc_mainLitDir.w > 0.0) {
          vec4 shadowPos = vec4(0.0), shadowPosWithDepthBias = vec4(0.0);
          vec4 shadowProjDepthInfo = vec4(0.0);
          vec3 shadowNDCPos;
          bool isExceedShadowMap = true;
          if (CCSurfacesLightingEnableShadow(lightingData.NoL)) {
            #if CC_DIR_LIGHT_SHADOW_TYPE == 2
              lightingResult.shadow = CCCSMFactorBase(worldPos, lightingData.N, shadowBias);
              #if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE && CC_SURFACES_LIGHTING_USE_SHADOWMAP_TRANSMIT
                vec4 shadowProjInfo;
                vec3 shadowViewDir0, shadowViewDir1, shadowViewDir2;
                isExceedShadowMap = 0 > CCGetCSMLevel(shadowPosWithDepthBias, shadowProjDepthInfo, shadowProjInfo, shadowViewDir0, shadowViewDir1, shadowViewDir2, worldPos);
                GetShadowNDCPos(shadowNDCPos, shadowPosWithDepthBias);
              #endif
            #endif
            #if CC_DIR_LIGHT_SHADOW_TYPE == 1
              shadowPos = cc_matLightViewProj * vec4(worldPos, 1.0);
              lightingResult.shadow = CCShadowFactorBase(shadowPosWithDepthBias, shadowPos, lightingData.N, shadowBias);
              shadowProjDepthInfo = cc_shadowProjDepthInfo;
              isExceedShadowMap = !GetShadowNDCPos(shadowNDCPos, shadowPosWithDepthBias);
            #endif
          }
          #if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE && CC_SURFACES_LIGHTING_USE_SHADOWMAP_TRANSMIT
            lightingData.shadowPosAndDepth.xy = shadowNDCPos.xy;
            lightingData.shadowPosAndDepth.z = isExceedShadowMap ? 0.0 : GetViewSpaceDepthFromNDCDepth_Orthgraphic(shadowNDCPos.z, shadowProjDepthInfo.x, shadowProjDepthInfo.y);
            lightingData.shadowPosAndDepth.w = isExceedShadowMap ? lightingData.shadowPosAndDepth.w : GetViewSpaceDepthFromNDCDepth_Orthgraphic(SampleShadowMapSoft(shadowNDCPos, cc_shadowMap, cc_shadowWHPBInfo.xy), shadowProjDepthInfo.x, shadowProjDepthInfo.y);
          #endif
        }
      #endif
      lightingResult.lightmapColor = vec3(0.0);
      #if CC_SURFACES_USE_LIGHT_MAP && !CC_FORWARD_ADD
        float lightmapShadow, lightmapAO;
        GetLightMapColor(lightingResult.lightmapColor, lightmapShadow, lightmapAO, cc_lightingMap, FSInput_lightMapUV.xy, FSInput_lightMapUV.z, surfaceData.worldNormal);
        #if CC_SURFACES_USE_LIGHT_MAP == LIGHT_MAP_TYPE_INDIRECT_OCCLUSION
          lightingResult.shadow *= lightmapShadow;
        #endif
        lightingResult.ao *= lightmapAO;
      #endif
      #if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_COMPOSITE_AND_MISC
        if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_SHADOW)
          lightingResult.shadow = 1.0;
        if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_AO)
          lightingResult.ao = 1.0;
      #endif
      vec3 unused;
      CCSurfacesLightingCalculateEnvironment(lightingResult.environmentDiffuse, lightingResult.environmentSpecular, lightingData, cc_ambientSky.w);
      CCSurfaceLightingCalculateEnvironmentFresnel(lightingResult.environmentGF, unused, lightingData, lightingResult.specularColorWithLighting);
      lightingResult.directDiffuse = lightingResult.directSpecular = vec3(0.0);
      #if !CC_DISABLE_DIRECTIONAL_LIGHT && !CC_FORWARD_ADD
        CCSurfacesLightingCalculateColorWithLighting(lightingResult.diffuseColorWithLighting, lightingResult.specularColorWithLighting, surfaceData, lightingData);
        CCSurfacesLightingCalculateDirect(lightingResult.directDiffuse, lightingResult.directSpecular, lightingData, cc_mainLitColor);
        CCSurfaceLightingCalculateDirectFresnel(lightingResult.directGF, lightingData, lightingResult.specularColorWithLighting, lightingResult.environmentGF);
      #endif
      #if CC_SURFACES_LIGHTING_USE_FRESNEL
        lightingResult.fresnel = CCSurfaceLightingCalculateExtraFresnel(lightingData);
      #else
        lightingResult.fresnel = vec3(1.0);
      #endif
      #if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR
        CCSurfacesLightingCalculateDirectTransmitSpecular(lightingResult.directTransmitSpecular, lightingData, cc_mainLitColor);
        CCSurfacesLightingCalculateEnvironmentTransmitSpecular(lightingResult.environmentTransmitSpecular, lightingData, cc_ambientSky.w);
      #endif
      #if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
        LightingIntermediateData lightingDataTD;
        CCSurfacesGetLightingIntermediateDataTransmitDiffuse(lightingDataTD, lightingData, surfaceData);
        CCSurfacesLightingCalculateIntermediateData_PerLight(lightingDataTD, surfaceData, -cc_mainLitDir.xyz);
        CCSurfacesLightingCalculateDirectTransmitDiffuse(lightingResult.directTransmitDiffuse, lightingDataTD, cc_mainLitColor, lightingResult.shadow);
        CCSurfacesLightingCalculateEnvironmentTransmitDiffuse(lightingResult.environmentTransmitDiffuse, lightingDataTD, cc_ambientSky.w, lightingResult.ao, -cc_mainLitDir.xyz);
      #endif
      #if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
        SurfacesMaterialData surfaceData2ndSpecular;
        CCSurfacesGetSurfacesMaterialData2ndSpecular(surfaceData2ndSpecular, surfaceData);
        LightingIntermediateData lightingData2ndSpecular;
        CCSurfacesInitializeLightingIntermediateData(lightingData2ndSpecular, surfaceData2ndSpecular);
        CCSurfacesLightingCalculateIntermediateData_PerLight(lightingData2ndSpecular, surfaceData2ndSpecular, -cc_mainLitDir.xyz);
        vec3 diff;
        CCSurfacesLightingInitializeColorWithLighting(diff, lightingResult.specularColorWithLighting2ndSpecular, surfaceData2ndSpecular, lightingData2ndSpecular);
        #if !CC_SURFACES_LIGHTING_SHEEN
          CCSurfacesLightingCalculateEnvironment2ndSpecular(lightingResult.environment2ndSpecular, lightingData2ndSpecular, cc_ambientSky.w, surfaceData2ndSpecular.intensity2ndSpecular, lightingResult.environmentSpecular);
          CCSurfaceLightingCalculateEnvironmentFresnel(lightingResult.environmentGF2ndSpecular, lightingResult.environmentSubLayerF, lightingData2ndSpecular, lightingResult.specularColorWithLighting2ndSpecular);
          CCSurfacesLightingCalculateDirect2ndSpecular(lightingResult.direct2ndSpecular, lightingData2ndSpecular, cc_mainLitColor, surfaceData2ndSpecular.intensity2ndSpecular, lightingResult.directSpecular);
          CCSurfaceLightingCalculateDirectFresnel(lightingResult.directGF2ndSpecular, lightingData2ndSpecular, lightingResult.specularColorWithLighting2ndSpecular, lightingResult.environmentGF2ndSpecular);
        #else
          CCSurfacesLightingCalculateDirectSheen(lightingResult.direct2ndSpecular, lightingResult.directGF2ndSpecular, lightingData2ndSpecular, cc_mainLitColor, surfaceData2ndSpecular.intensity2ndSpecular);
          CCSurfacesLightingCalculateEnvironmentSheen(lightingResult.environment2ndSpecular, lightingResult.environmentGF2ndSpecular, lightingData2ndSpecular, cc_ambientSky.w, surfaceData2ndSpecular.intensity2ndSpecular);
        #endif
      #endif
      #if CC_SURFACES_LIGHTING_TT
        CCSurfacesLightingCalculateDirectTT(lightingResult, lightingData, cc_mainLitColor);
      #endif
      #if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
        lightingResult.specularColorWithLighting2ndSpecular *= surfaceData.color2ndSpecular;
        CCSurfacesLightingCalculateDirectMultiLayerBlending(lightingResult, lightingData2ndSpecular);
        CCSurfacesLightingCalculateEnvironmentMultiLayerBlending(lightingResult, lightingData2ndSpecular);
      #endif
      #ifdef CC_SURFACES_LIGHTING_MODIFY_FINAL_RESULT
        LightingMiscData miscData;
        miscData.lightType = LIGHT_TYPE_DIRECTIONAL;
        miscData.lightPos = vec3(0.0);
        miscData.lightDir = cc_mainLitDir.xyz;
        miscData.lightColorAndIntensity = cc_mainLitColor;
        miscData.lightSizeRangeAngle = vec4(0.0, 0.0, 0.0, 0.0);
        SurfacesLightingModifyFinalResult(lightingResult, lightingData, surfaceData, miscData);
      #endif
    }
    #if CC_ENABLE_CLUSTERED_LIGHT_CULLING
    #endif
  #endif
#endif
vec4 CCSurfacesDebugDisplayInvalidNumber(vec4 color)
{
  float index = mod(cc_time.x * 10.0, 2.0);
  vec4 error = index < 1.0 ? vec4(1.0, 0.0, 0.2, 1.0) : vec4(0.0, 1.0, 0.2, 1.0);
  return (isnans(color.rgb) || isinfs(color.rgb)) ? error : color;
}
vec4 CCSurfacesDebugDisplayInvalidInputData(vec4 color, vec3 data)
{
  float index = mod(cc_time.x * 10.0, 2.0);
  vec4 error = index < 1.0 ? vec4(1.0, 0.0, 0.2, 1.0) : vec4(0.0, 1.0, 0.2, 1.0);
  return (isnans(data) || isinfs(data)) ? error : color;
}
#if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_SINGLE && !CC_FORWARD_ADD
  void CCSurfacesDebugViewMeshData(inout vec4 color)
  {
    vec4 white = vec4(1.0, 1.0, 1.0, 1.0);
    vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_VERTEX_COLOR)) && (cc_surfaceTransform.y != 3.0)))
    {
      #if CC_SURFACES_USE_VERTEX_COLOR
        color = FSInput_vertexColor;
      #else
        color = white;
      #endif
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_VERTEX_NORMAL)) && (cc_surfaceTransform.y != 3.0)))
        color = vec4(FSInput_worldNormal * 0.5 + vec3(0.5), 1.0);
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_VERTEX_TANGENT)) && (cc_surfaceTransform.y != 3.0)))
    {
      #if CC_SURFACES_USE_TANGENT_SPACE
        color = vec4(FSInput_worldTangent * 0.5 + vec3(0.5), 1.0);
      #else
        color = black;
      #endif
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_VERTEX_MIRROR)) && (cc_surfaceTransform.y != 3.0)))
    {
      #if CC_SURFACES_USE_TANGENT_SPACE
        float sign = FSInput_mirrorNormal * 0.5 + 0.5;
        color = vec4(sign, sign, sign, 1.0);
      #else
        color = black;
      #endif
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_FACE_SIDE)) && (cc_surfaceTransform.y != 3.0)))
    {
        float scalar = clamp(FSInput_faceSideSign, 0.0, 1.0);
        color = vec4(scalar, scalar, scalar, 1.0);
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_UV0)) && (cc_surfaceTransform.y != 3.0)))
        color = vec4(FSInput_texcoord.xy, 0.0, 1.0);
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_UV1)) && (cc_surfaceTransform.y != 3.0)))
      color = vec4(FSInput_texcoord1.xy, 0.0, 1.0);
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_UVLIGHTMAP)) && (cc_surfaceTransform.y != 3.0)))
    {
      #if CC_USE_LIGHTMAP && !CC_FORWARD_ADD
        color = vec4(FSInput_lightMapUV.xy, 0.0, 1.0);
      #else
        color = vec4(0.0, 0.0, 0.0, 1.0);
      #endif
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_PROJ_DEPTH)) && (cc_surfaceTransform.y != 3.0)))
    {
      vec4 clipPos = cc_matProj * cc_matView * vec4(FSInput_worldPos.xyz, 1.0);
      float depth = clipPos.z / clipPos.w;
      color = vec4(depth, depth, depth, 1.0);
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_LINEAR_DEPTH)) && (cc_surfaceTransform.y != 3.0)))
    {
      vec4 viewPos = cc_matView * vec4(FSInput_worldPos.xyz, 1.0);
      float depth = (-viewPos.z - cc_nearFar.x) / cc_nearFar.y;
      color = vec4(depth, depth, depth, 1.0);
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_WORLD_POS)) && (cc_surfaceTransform.y != 3.0)))
      color = vec4(FSInput_worldPos.xyz, 1.0);
  }
#endif
#if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_SINGLE
  bool CCSurfacesDebugViewLightingResult(inout vec4 color, in LightingResult lightingResult)
  {
    bool isSRGBColor = false;
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_DIRECT_DIFFUSE)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = lightingResult.directDiffuse * lightingResult.diffuseColorWithLighting;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_DIRECT_SPECULAR)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = lightingResult.directSpecular * lightingResult.specularColorWithLighting * lightingResult.directGF;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_DIRECT_ALL)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = lightingResult.directDiffuse * lightingResult.diffuseColorWithLighting + lightingResult.directSpecular * lightingResult.specularColorWithLighting * lightingResult.directGF;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_ENV_DIFFUSE)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = lightingResult.environmentDiffuse * lightingResult.diffuseColorWithLighting;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_ENV_SPECULAR)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = lightingResult.environmentSpecular * lightingResult.specularColorWithLighting * lightingResult.environmentGF;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_ENV_ALL)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = lightingResult.environmentDiffuse * lightingResult.diffuseColorWithLighting + lightingResult.environmentSpecular * lightingResult.specularColorWithLighting * lightingResult.environmentGF;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_LIGHT_MAP)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = lightingResult.lightmapColor;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_EMISSIVE)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = lightingResult.emissive;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_AO)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = vec3(lightingResult.ao);
        isSRGBColor = false;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_SHADOW)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = vec3(lightingResult.shadow);
        isSRGBColor = false;
    }
    vec3 fresnel = lightingResult.fresnel;
    vec3 directTransmitSpecular = vec3(0.0), environmentTransmitSpecular = vec3(0.0);
    vec3 directTransmitDiffuse = vec3(0.0), environmentTransmitDiffuse = vec3(0.0);
    vec3 diffuseColorWithLightingTT = vec3(0.0), specularColorWithLighting2ndSpecular = vec3(0.0);
    vec3 direct2ndSpecular = vec3(0.0), environment2ndSpecular = vec3(0.0);
  #if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR
    directTransmitSpecular = lightingResult.directTransmitSpecular;
    environmentTransmitSpecular = lightingResult.environmentTransmitSpecular;
  #endif
  #if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
    directTransmitDiffuse = lightingResult.directTransmitDiffuse;
    environmentTransmitDiffuse = lightingResult.environmentTransmitDiffuse;
  #endif
  #if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
    direct2ndSpecular = lightingResult.direct2ndSpecular * lightingResult.directGF2ndSpecular;
    environment2ndSpecular = lightingResult.environment2ndSpecular * lightingResult.environmentGF2ndSpecular;
    specularColorWithLighting2ndSpecular = lightingResult.specularColorWithLighting2ndSpecular;
    #if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
      fresnel = lightingResult.environmentSubLayerF;
    #endif
  #endif
  #if CC_SURFACES_LIGHTING_USE_MULTIPLE_LAYER_BLEND
    direct2ndSpecular = lightingResult.directSpecularSubLayers;
    environment2ndSpecular = lightingResult.environmentSpecularSubLayers;
  #endif
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_FRESNEL)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = vec3(fresnel);
        isSRGBColor = false;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_TRANSMIT_DIRECT_SPECULAR)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = directTransmitSpecular;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_TRANSMIT_ENV_SPECULAR)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = environmentTransmitSpecular;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_TRANSMIT_DIRECT_DIFFUSE)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = directTransmitDiffuse;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_TRANSMIT_ENV_DIFFUSE)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = environmentTransmitDiffuse;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_TRANSMIT_ALL)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = directTransmitSpecular + environmentTransmitSpecular + directTransmitDiffuse + environmentTransmitDiffuse;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_DIRECT_2ND_SPECULAR)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = direct2ndSpecular * specularColorWithLighting2ndSpecular;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_ENVIRONMENT_2ND_SPECULAR)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = environment2ndSpecular * specularColorWithLighting2ndSpecular;
        isSRGBColor = true;
    }
    if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_2ND_SPECULAR_ALL)) && (cc_surfaceTransform.y != 3.0)))
    {
        color.rgb = (direct2ndSpecular + environment2ndSpecular) * specularColorWithLighting2ndSpecular;
        isSRGBColor = true;
    }
    return isSRGBColor;
  }
#endif
#if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_COMPOSITE_AND_MISC
  void CCSurfacesDebugViewCompositeLightingResult(inout LightingResult lightingResult)
  {
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_DIRECT_DIFFUSE)
      lightingResult.directDiffuse = vec3(0.0);
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_DIRECT_SPECULAR)
      lightingResult.directSpecular = vec3(0.0);
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_ENV_DIFFUSE)
      lightingResult.environmentDiffuse = vec3(0.0);
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_ENV_SPECULAR)
      lightingResult.environmentSpecular = vec3(0.0);
  #if CC_SURFACES_LIGHTING_TRANSMIT_DIFFUSE
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_TRANSMIT_DIFFUSE)
      lightingResult.directTransmitDiffuse = lightingResult.environmentTransmitDiffuse = vec3(0.0);
  #endif
  #if CC_SURFACES_LIGHTING_TRANSMIT_SPECULAR
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_TRANSMIT_SPECULAR)
      lightingResult.directTransmitSpecular = lightingResult.environmentTransmitSpecular = vec3(0.0);
  #endif
  #if CC_SURFACES_LIGHTING_2ND_LAYER_SPECULAR
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_2ND_SPECULAR)
        lightingResult.direct2ndSpecular = lightingResult.environment2ndSpecular = vec3(0.0);
  #endif
  #if CC_SURFACES_LIGHTING_TT
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_TT)
        lightingResult.directTT = vec3(0.0);
  #endif
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_EMISSIVE)
      lightingResult.emissive = vec3(0.0);
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_LIGHT_MAP)
      lightingResult.lightmapColor = vec3(0.0);
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_SHADOW)
      lightingResult.shadow = 1.0;
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_AO)
      lightingResult.ao = 1.0;
    if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_FRESNEL)
      lightingResult.fresnel = vec3(1.0);
  }
#endif
#if (CC_PIPELINE_TYPE == 0 || CC_FORCE_FORWARD_SHADING)
  void main()  {
  #if CC_DISABLE_STRUCTURE_IN_FRAGMENT_SHADER
    float NoL = dot(-cc_mainLitDir.xyz, FSInput_worldNormal.xyz);
    vec4 color = SurfacesFragmentModifyBaseColorAndTransparency();
    float fogFactor = 1.0;
    #if CC_FORWARD_ADD
      color.rgb = vec3(0.0);
    #endif
  #else
    SurfacesMaterialData surfaceData;
    CCSurfacesFragmentGetMaterialData(surfaceData);
    vec2 shadowBias = vec2(0.0);
    vec3 colDebugCSMLayer = vec3(1.0);
    #if CC_RECEIVE_SHADOW
      shadowBias = FSInput_shadowBias;
      #if !CC_FORWARD_ADD
        #if CC_USE_DEBUG_VIEW && CC_SURFACES_ENABLE_DEBUG_VIEW
          if (IS_DEBUG_VIEW_MISC_ENABLE_CSM_LAYER_COLORATION)
          {
              vec4 csmPos;
              vec4 shadowProjDepthInfo, shadowProjInfo;
              vec3 shadowViewDir0, shadowViewDir1, shadowViewDir2;
              int csmLayer = -1;
              csmLayer = CCGetCSMLevel(csmPos, shadowProjDepthInfo, shadowProjInfo, shadowViewDir0, shadowViewDir1, shadowViewDir2, surfaceData.worldPos);
              bool OutOfRange = csmLayer < 0;
              if (OutOfRange)
                  colDebugCSMLayer = vec3(1.0);
              else if (csmLayer == 0)
                  colDebugCSMLayer = vec3(1.0, 0.0, 0.0);
              else if (csmLayer == 1)
                  colDebugCSMLayer = vec3(0.0, 1.0, 0.0);
              else if (csmLayer == 2)
                  colDebugCSMLayer = vec3(0.0, 0.0, 1.0);
              else if (csmLayer == 3)
                  colDebugCSMLayer = vec3(0.0, 1.0, 1.0);
          }
        #endif
      #endif
    #endif
    float fogFactor = 1.0;
    #if !CC_FORWARD_ADD
      #if CC_USE_FOG != 4
        #if !CC_USE_ACCURATE_FOG
          fogFactor = FSInput_fogFactor;
        #else
          CC_TRANSFER_FOG_BASE(vec4(FSInput_worldPos, 1.0), fogFactor);
        #endif
      #endif
      #if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_COMPOSITE_AND_MISC && CC_SURFACES_ENABLE_DEBUG_VIEW
        if (!IS_DEBUG_VIEW_COMPOSITE_ENABLE_FOG) {
            fogFactor = 1.0;
        }
      #endif
    #endif
    LightingResult lightingResult;
    CCSurfacesLighting(lightingResult, surfaceData, shadowBias);
    #if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_SINGLE && CC_SURFACES_ENABLE_DEBUG_VIEW
      vec4 debugColor = vec4(0.0, 0.0, 0.0, 1.0);
      float materialTransparency = CCSurfacesShading(surfaceData, lightingResult).a;
      #if !CC_FORWARD_ADD && !CC_SURFACES_LIGHTING_DISABLE_DIFFUSE
        CCSurfacesDebugViewMeshData(debugColor);
        if (CCSurfacesDebugViewSurfaceData(debugColor, surfaceData))
        {
          debugColor.a = materialTransparency;
        }
        if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_FOG)) && (cc_surfaceTransform.y != 3.0)))
        {
          debugColor.rgb = vec3(1.0 - fogFactor);
        }
      #endif
      #if CC_FORWARD_ADD
        if ((equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_DIRECT_DIFFUSE)) && (cc_surfaceTransform.y != 3.0)) || (equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_DIRECT_SPECULAR)) && (cc_surfaceTransform.y != 3.0)) || (equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_DIRECT_ALL)) && (cc_surfaceTransform.y != 3.0)) ||
            (equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_TRANSMIT_DIRECT_DIFFUSE)) && (cc_surfaceTransform.y != 3.0)) || (equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_TRANSMIT_DIRECT_SPECULAR)) && (cc_surfaceTransform.y != 3.0)) || (equalf_mode(cc_debug_view_mode.x, float(CC_SURFACES_DEBUG_VIEW_DIRECT_2ND_SPECULAR)) && (cc_surfaceTransform.y != 3.0)))
      #endif
        {
            if (CCSurfacesDebugViewLightingResult(debugColor, lightingResult))
            {
              debugColor.a = materialTransparency;
              #if !CC_USE_FLOAT_OUTPUT
                debugColor.rgb = HDRToLDR(debugColor.rgb);
                debugColor.rgb = LinearToSRGB(debugColor.rgb);
              #endif
            }
        }
      if (IS_DEBUG_VIEW_ENABLE_WITH_CAMERA) {
        gl_FragData[0] = debugColor;
        return;
      }
    #elif CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_COMPOSITE_AND_MISC && CC_SURFACES_ENABLE_DEBUG_VIEW
      CCSurfacesDebugViewCompositeLightingResult(lightingResult);
    #endif
    vec4 color = CCSurfacesShading(surfaceData, lightingResult);
    #if CC_USE_DEBUG_VIEW && CC_SURFACES_ENABLE_DEBUG_VIEW
      if (IS_DEBUG_VIEW_MISC_ENABLE_CSM_LAYER_COLORATION) {
          color.rgb *= colDebugCSMLayer.rgb;
      }
      #if CC_SURFACES_USE_TANGENT_SPACE
        color = CCSurfacesDebugDisplayInvalidInputData(color, FSInput_worldTangent);
      #endif
    #endif
  #endif
    #if CC_USE_FOG != 4 && (!CC_USE_FLOAT_OUTPUT || CC_IS_TRANSPARENCY_PASS)
      #if !CC_FORWARD_ADD
        #ifdef CC_SURFACES_LIGHTING_MODIFY_FOG
          color.rgb = CCSurfacesLightingModifyFog(fogFactor, color.rgb, surfaceData, lightingResult);
        #else
          CC_APPLY_FOG_BASE(color, fogFactor);
        #endif
      #endif
    #endif
    #if CC_USE_RGBE_OUTPUT
      color = packRGBE(color.rgb);
    #else
      color = CCSurfacesDebugDisplayInvalidNumber(color);
      #if !CC_USE_FLOAT_OUTPUT || CC_IS_TRANSPARENCY_PASS
        color.rgb = HDRToLDR(color.rgb);
        color.rgb = LinearToSRGB(color.rgb);
      #endif
    #endif
    gl_FragData[0] = color;
  }
#elif CC_PIPELINE_TYPE == 1
    void main () {
      SurfacesMaterialData surfaceData;
      CCSurfacesFragmentGetMaterialData(surfaceData);
      gl_FragData[0] = CCSurfacesDeferredOutputBaseColor(surfaceData);
      gl_FragData[2] = CCSurfacesDeferredOutputNormalMR(surfaceData);
      gl_FragData[1] = CCSurfacesDeferredOutputEmissiveAO(surfaceData);
    #if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_SINGLE && CC_SURFACES_ENABLE_DEBUG_VIEW
      vec4 debugColor = vec4(0.0, 0.0, 0.0, 1.0);
      CCSurfacesDebugViewMeshData(debugColor);
      CCSurfacesDebugViewSurfaceData(debugColor, surfaceData);
      if (IS_DEBUG_VIEW_ENABLE_WITH_CAMERA) {
        gl_FragData[0] = debugColor;
      }
    #endif
    }
#endif