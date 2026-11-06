
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
    int getVertexId() {
      return int(a_vertexId);
    }
#endif
highp float decode32 (highp vec4 rgba) {
  rgba = rgba * 255.0;
  highp float Sign = 1.0 - (step(128.0, (rgba[3]) + 0.5)) * 2.0;
  highp float Exponent = 2.0 * (mod(float(int((rgba[3]) + 0.5)), 128.0)) + (step(128.0, (rgba[2]) + 0.5)) - 127.0;
  highp float Mantissa = (mod(float(int((rgba[2]) + 0.5)), 128.0)) * 65536.0 + rgba[1] * 256.0 + rgba[0] + 8388608.0;
  return Sign * exp2(Exponent - 23.0) * Mantissa;
}
#if CC_USE_MORPH
  uniform vec4 cc_displacementWeights[15];
  uniform vec4 cc_displacementTextureInfo;
  #if CC_MORPH_TARGET_HAS_POSITION
    uniform sampler2D cc_PositionDisplacements;
  #endif
  #if CC_MORPH_TARGET_HAS_NORMAL
    uniform sampler2D cc_NormalDisplacements;
  #endif
  #if CC_MORPH_TARGET_HAS_TANGENT
    uniform sampler2D cc_TangentDisplacements;
  #endif
  vec2 getPixelLocation(vec2 textureResolution, int pixelIndex) {
    float pixelIndexF = float(pixelIndex);
    float x = mod(pixelIndexF, textureResolution.x);
    float y = floor(pixelIndexF / textureResolution.x);
    return vec2(x, y);
  }
  vec2 getPixelCoordFromLocation(vec2 location, vec2 textureResolution) {
    return (vec2(location.x, location.y) + .5) / textureResolution;
  }
  #if CC_DEVICE_SUPPORT_FLOAT_TEXTURE
      vec4 fetchVec3ArrayFromTexture(sampler2D tex, int elementIndex) {
        int pixelIndex = elementIndex;
        vec2 location = getPixelLocation(cc_displacementTextureInfo.xy, pixelIndex);
        vec2 uv = getPixelCoordFromLocation(location, cc_displacementTextureInfo.xy);
        return texture2D(tex, uv);
      }
  #else
    vec4 fetchVec3ArrayFromTexture(sampler2D tex, int elementIndex) {
      int pixelIndex = elementIndex * 4;
      vec2 location = getPixelLocation(cc_displacementTextureInfo.xy, pixelIndex);
      vec2 x = getPixelCoordFromLocation(location + vec2(0.0, 0.0), cc_displacementTextureInfo.xy);
      vec2 y = getPixelCoordFromLocation(location + vec2(1.0, 0.0), cc_displacementTextureInfo.xy);
      vec2 z = getPixelCoordFromLocation(location + vec2(2.0, 0.0), cc_displacementTextureInfo.xy);
      return vec4(
        decode32(texture2D(tex, x)),
        decode32(texture2D(tex, y)),
        decode32(texture2D(tex, z)),
        1.0
      );
    }
  #endif
  float getDisplacementWeight(int index) {
    int quot = index / 4;
    int remainder = index - quot * 4;
    if (remainder == 0) {
      return cc_displacementWeights[quot].x;
    } else if (remainder == 1) {
      return cc_displacementWeights[quot].y;
    } else if (remainder == 2) {
      return cc_displacementWeights[quot].z;
    } else {
      return cc_displacementWeights[quot].w;
    }
  }
  vec3 getVec3DisplacementFromTexture(sampler2D tex, int vertexIndex) {
  #if CC_MORPH_PRECOMPUTED
    return fetchVec3ArrayFromTexture(tex, vertexIndex).rgb;
  #else
    vec3 result = vec3(0, 0, 0);
    int nVertices = int(cc_displacementTextureInfo.z);
    for (int iTarget = 0; iTarget < CC_MORPH_TARGET_COUNT; ++iTarget) {
      result += (fetchVec3ArrayFromTexture(tex, nVertices * iTarget + vertexIndex).rgb * getDisplacementWeight(iTarget));
    }
    return result;
  #endif
  }
  #if CC_MORPH_TARGET_HAS_POSITION
  vec3 getPositionDisplacement(int vertexId) {
      return getVec3DisplacementFromTexture(cc_PositionDisplacements, vertexId);
  }
  #endif
  #if CC_MORPH_TARGET_HAS_NORMAL
  vec3 getNormalDisplacement(int vertexId) {
      return getVec3DisplacementFromTexture(cc_NormalDisplacements, vertexId);
  }
  #endif
  #if CC_MORPH_TARGET_HAS_TANGENT
  vec3 getTangentDisplacement(int vertexId) {
      return getVec3DisplacementFromTexture(cc_TangentDisplacements, vertexId);
  }
  #endif
  void applyMorph (inout vec4 position, inout vec3 normal, inout vec4 tangent) {
    int vertexId = getVertexId();
  #if CC_MORPH_TARGET_HAS_POSITION
    position.xyz = position.xyz + getPositionDisplacement(vertexId);
  #endif
  #if CC_MORPH_TARGET_HAS_NORMAL
    normal.xyz = normal.xyz + getNormalDisplacement(vertexId);
  #endif
  #if CC_MORPH_TARGET_HAS_TANGENT
    tangent.xyz = tangent.xyz + getTangentDisplacement(vertexId);
  #endif
  }
  void applyMorph (inout vec4 position) {
  #if CC_MORPH_TARGET_HAS_POSITION
    position.xyz = position.xyz + getPositionDisplacement(getVertexId());
  #endif
  }
#endif
#if CC_USE_SKINNING
  #if CC_USE_BAKED_ANIMATION
    uniform highp vec4 cc_jointTextureInfo;
    uniform highp vec4 cc_jointAnimInfo;
    uniform highp sampler2D cc_jointTexture;
    void CCGetJointTextureCoords(float pixelsPerJoint, float jointIdx, out highp float x, out highp float y, out highp float invSize)
    {
      #if USE_INSTANCING
        highp float temp = pixelsPerJoint * (a_jointAnimInfo.x * a_jointAnimInfo.y + jointIdx) + a_jointAnimInfo.z;
      #else
        highp float temp = pixelsPerJoint * (cc_jointAnimInfo.x * cc_jointTextureInfo.y + jointIdx) + cc_jointTextureInfo.z;
      #endif
      invSize = cc_jointTextureInfo.w;
      highp float tempY = floor(temp * invSize);
      x = floor(temp - tempY * cc_jointTextureInfo.x);
      y = (tempY + 0.5) * invSize;
    }
  #else
    #if CC_USE_REAL_TIME_JOINT_TEXTURE
      uniform highp sampler2D cc_realtimeJoint;
    #else
      uniform highp vec4 cc_joints[CC_JOINT_UNIFORM_CAPACITY * 3];
    #endif
  #endif
  #if CC_USE_BAKED_ANIMATION
    #if CC_DEVICE_SUPPORT_FLOAT_TEXTURE
      mat4 getJointMatrix (float i) {
        highp float x, y, invSize;
        CCGetJointTextureCoords(3.0, i, x, y, invSize);
        vec4 v1 = texture2D(cc_jointTexture, vec2((x + 0.5) * invSize, y));
        vec4 v2 = texture2D(cc_jointTexture, vec2((x + 1.5) * invSize, y));
        vec4 v3 = texture2D(cc_jointTexture, vec2((x + 2.5) * invSize, y));
        return mat4(vec4(v1.xyz, 0.0), vec4(v2.xyz, 0.0), vec4(v3.xyz, 0.0), vec4(v1.w, v2.w, v3.w, 1.0));
      }
    #else
      mat4 getJointMatrix (float i) {
        highp float x, y, invSize;
        CCGetJointTextureCoords(12.0, i, x, y, invSize);
        vec4 v1 = vec4(
          decode32(texture2D(cc_jointTexture, vec2((x + 0.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 1.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 2.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 3.5) * invSize, y)))
        );
        vec4 v2 = vec4(
          decode32(texture2D(cc_jointTexture, vec2((x + 4.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 5.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 6.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 7.5) * invSize, y)))
        );
        vec4 v3 = vec4(
          decode32(texture2D(cc_jointTexture, vec2((x + 8.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 9.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 10.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 11.5) * invSize, y)))
        );
        return mat4(vec4(v1.xyz, 0.0), vec4(v2.xyz, 0.0), vec4(v3.xyz, 0.0), vec4(v1.w, v2.w, v3.w, 1.0));
      }
    #endif
  #else
    #if CC_USE_REAL_TIME_JOINT_TEXTURE
      #if CC_DEVICE_SUPPORT_FLOAT_TEXTURE
        mat4 getJointMatrix (float i) {
          float x = i;
          vec4 v1 = texture2D(cc_realtimeJoint, vec2( x / 256.0, 0.5 / 3.0));
          vec4 v2 = texture2D(cc_realtimeJoint, vec2( x / 256.0, 1.5 / 3.0));
          vec4 v3 = texture2D(cc_realtimeJoint, vec2( x / 256.0, 2.5 / 3.0));
          return mat4(vec4(v1.xyz, 0.0), vec4(v2.xyz, 0.0), vec4(v3.xyz, 0.0), vec4(v1.w, v2.w, v3.w, 1.0));
        }
      #else
        mat4 getJointMatrix (float i) {
         float x = 4.0 * i;
          vec4 v1 = vec4(
            decode32(texture2D(cc_realtimeJoint, vec2((x + 0.5)/ 1024.0, 0.5 / 3.0))),
            decode32(texture2D(cc_realtimeJoint, vec2((x + 1.5)/ 1024.0, 0.5 / 3.0))),
            decode32(texture2D(cc_realtimeJoint, vec2((x + 2.5)/ 1024.0, 0.5 / 3.0))),
            decode32(texture2D(cc_realtimeJoint, vec2((x + 3.5)/ 1024.0, 0.5 / 3.0)))
          );
          vec4 v2 = vec4(
            decode32(texture2D(cc_realtimeJoint, vec2((x + 0.5)/ 1024.0, 1.5 / 3.0))),
            decode32(texture2D(cc_realtimeJoint, vec2((x + 1.5)/ 1024.0, 1.5 / 3.0))),
            decode32(texture2D(cc_realtimeJoint, vec2((x + 2.5)/ 1024.0, 1.5 / 3.0))),
            decode32(texture2D(cc_realtimeJoint, vec2((x + 3.5)/ 1024.0, 1.5 / 3.0)))
          );
          vec4 v3 = vec4(
            decode32(texture2D(cc_realtimeJoint, vec2((x + 0.5)/ 1024.0, 2.5 / 3.0))),
            decode32(texture2D(cc_realtimeJoint, vec2((x + 1.5)/ 1024.0, 2.5 / 3.0))),
            decode32(texture2D(cc_realtimeJoint, vec2((x + 2.5)/ 1024.0, 2.5 / 3.0))),
            decode32(texture2D(cc_realtimeJoint, vec2((x + 3.5)/ 1024.0, 2.5 / 3.0)))
          );
          return mat4(vec4(v1.xyz, 0.0), vec4(v2.xyz, 0.0), vec4(v3.xyz, 0.0), vec4(v1.w, v2.w, v3.w, 1.0));
        }
      #endif
    #else
      mat4 getJointMatrix (float i) {
        int idx = int(i);
        vec4 v1 = cc_joints[idx * 3];
        vec4 v2 = cc_joints[idx * 3 + 1];
        vec4 v3 = cc_joints[idx * 3 + 2];
        return mat4(vec4(v1.xyz, 0.0), vec4(v2.xyz, 0.0), vec4(v3.xyz, 0.0), vec4(v1.w, v2.w, v3.w, 1.0));
      }
    #endif
  #endif
  mat4 skinMatrix () {
    vec4 joints = vec4(a_joints);
    return getJointMatrix(joints.x) * a_weights.x
         + getJointMatrix(joints.y) * a_weights.y
         + getJointMatrix(joints.z) * a_weights.z
         + getJointMatrix(joints.w) * a_weights.w;
  }
  void CCSkin (inout vec4 position) {
    mat4 m = skinMatrix();
    position = m * position;
  }
  void CCSkin (inout vec4 position, inout vec3 normal, inout vec4 tangent) {
    mat4 m = skinMatrix();
    position = m * position;
    normal = (m * vec4(normal, 0.0)).xyz;
    tangent.xyz = (m * vec4(tangent.xyz, 0.0)).xyz;
  }
#endif
void CCVertInput(inout vec4 In)
{
    In = vec4(a_position, 1.0);
  #if CC_USE_MORPH
    applyMorph(In);
  #endif
  #if CC_USE_SKINNING
    CCSkin(In);
  #endif
}
uniform highp mat4 cc_matView;
  uniform highp mat4 cc_matProj;
  uniform highp vec4 cc_cameraPos;
  uniform mediump vec4 cc_mainLitDir;
  uniform mediump vec4 cc_nearFar;
#if !USE_INSTANCING
  uniform highp mat4 cc_matWorld;
  uniform highp mat4 cc_matWorldIT;
#endif
void CCGetWorldMatrixFull(out mat4 matWorld, out mat4 matWorldIT)
{
  #if USE_INSTANCING
    matWorld = mat4(
      vec4(a_matWorld0.xyz, 0.0),
      vec4(a_matWorld1.xyz, 0.0),
      vec4(a_matWorld2.xyz, 0.0),
      vec4(a_matWorld0.w, a_matWorld1.w, a_matWorld2.w, 1.0)
    );
    vec3 scale = 1.0 / vec3(length(a_matWorld0.xyz), length(a_matWorld1.xyz), length(a_matWorld2.xyz));
    vec3 scale2 = scale * scale;
    matWorldIT = mat4(
      vec4(a_matWorld0.xyz * scale2.x, 0.0),
      vec4(a_matWorld1.xyz * scale2.y, 0.0),
      vec4(a_matWorld2.xyz * scale2.z, 0.0),
      vec4(0.0, 0.0, 0.0, 1.0)
    );
  #else
    matWorld = cc_matWorld;
    matWorldIT = cc_matWorldIT;
  #endif
}
uniform mediump vec4 cc_shadowWHPBInfo;
  uniform mediump vec4 cc_planarNDInfo;
vec4 CalculatePlanarShadowPos(vec3 meshWorldPos, vec3 cameraPos, vec3 lightDir, vec4 plane) {
  vec3 P = meshWorldPos;
  vec3 L = lightDir;
  vec3 N = plane.xyz;
  float d = plane.w + EPSILON_LOWP;
  float dist = (-d - dot(P, N)) / (dot(L, N) + EPSILON_LOWP);
  vec3 shadowPos = P + L * dist;
  return vec4(shadowPos, dist);
}
vec4 CalculatePlanarShadowClipPos(vec4 shadowPos, vec3 cameraPos, mat4 matView, mat4 matProj, vec4 nearFar, float bias) {
  vec4 camPos = matView * vec4(shadowPos.xyz, 1.0);
  float lerpCoef = saturate((nearFar.z < 0.0 ? -camPos.z : camPos.z) / (nearFar.y - nearFar.x));
  camPos.z += mix(nearFar.x * 0.01, nearFar.y * EPSILON_LOWP * bias, lerpCoef);
  return matProj * camPos;
}
varying float v_dist;
vec4 vert () {
  vec4 position;
  CCVertInput(position);
  mat4 matWorld, matWorldIT;
  CCGetWorldMatrixFull(matWorld, matWorldIT);
  vec3 worldPos = (matWorld * position).xyz;
  vec4 shadowPos = CalculatePlanarShadowPos(worldPos, cc_cameraPos.xyz, cc_mainLitDir.xyz, cc_planarNDInfo);
  position = CalculatePlanarShadowClipPos(shadowPos, cc_cameraPos.xyz, cc_matView, cc_matProj, cc_nearFar, cc_shadowWHPBInfo.w);
  v_dist = shadowPos.w;
  return position;
}
void main() { gl_Position = vert(); }