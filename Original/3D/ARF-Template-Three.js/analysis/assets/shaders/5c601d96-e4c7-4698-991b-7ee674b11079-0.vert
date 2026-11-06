
precision highp float;
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
struct StandardVertInput {
  highp vec4 position;
  vec3 normal;
  vec4 tangent;
};
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;
attribute vec4 a_tangent;
#if CC_USE_SKINNING
    attribute vec4 a_joints;
  attribute vec4 a_weights;
#endif
#if USE_INSTANCING
  #if CC_USE_BAKED_ANIMATION
    attribute highp vec4 a_jointAnimInfo;
  #endif
  attribute vec4 a_matWorld0;
  attribute vec4 a_matWorld1;
  attribute vec4 a_matWorld2;
  #if CC_USE_LIGHTMAP
    attribute vec4 a_lightingMapUVParam;
  #endif
  #if CC_USE_REFLECTION_PROBE || CC_RECEIVE_SHADOW
    #if CC_RECEIVE_SHADOW
    #endif
    attribute vec4 a_localShadowBiasAndProbeId;
  #endif
  #if CC_USE_REFLECTION_PROBE
    attribute vec4 a_reflectionProbeData;
  #endif
  #if CC_USE_LIGHT_PROBE
    attribute vec4 a_sh_linear_const_r;
    attribute vec4 a_sh_linear_const_g;
    attribute vec4 a_sh_linear_const_b;
  #endif
#endif
#if CC_USE_MORPH
    attribute float a_vertexId;
#endif
  uniform float flip;
uniform sampler2D outputResultMap;
varying vec2 v_uv;
void main() {
  StandardVertInput In;
    In.position = vec4(a_position, 1.0);
    In.normal = a_normal;
    In.tangent = a_tangent;
  In.position.xy = flip == 0.0 ? vec2(In.position.xy.x, -In.position.xy.y) : In.position.xy;
  gl_Position = In.position;
  v_uv = a_texCoord;
}