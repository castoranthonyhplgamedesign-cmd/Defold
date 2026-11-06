
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives: enable
#endif
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod: enable
#endif
  precision highp float;
  uniform mediump vec4 cc_probeInfo;
  uniform highp mat4 cc_matView;
  uniform highp mat4 cc_matProj;
  uniform highp mat4 cc_matViewProj;
  uniform highp mat4 cc_matViewProjInv;
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
  uniform mediump vec4 cc_viewPort;
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
  float GetCameraDepthRH(float depthHS, mat4 matProj)
  {
      return -matProj[3][2] / (depthHS + matProj[2][2]);
  }
  float GetCameraDepthRH(float depthHS, float matProj32, float matProj22)
  {
      return -matProj32 / (depthHS + matProj22);
  }
  vec4 GetWorldPosFromNDCPosRH(vec3 posHS, mat4 matProj, mat4 matViewProjInv)
  {
      float w = -GetCameraDepthRH(posHS.z, matProj);
      return matViewProjInv * vec4(posHS * w, w);
  }
  float GetLinearDepthFromViewSpace(vec3 viewPos, float near, float far) {
    float dist = length(viewPos);
    return (dist - near) / (far - near);
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
        #define UnpackBitFromFloat(value, bit) (mod(floor(value / pow(10.0, float(bit))), 10.0) > 0.0)
        highp float unpackHighpData (float mainPart, float modPart) {
          highp float data = mainPart;
          return data + modPart;
        }
        highp float unpackHighpData (float mainPart, float modPart, const float modValue) {
          highp float data = mainPart * modValue;
          return data + modPart * modValue;
        }
        highp vec2 unpackHighpData (vec2 mainPart, vec2 modPart) {
          highp vec2 data = mainPart;
          return data + modPart;
        }
        highp vec2 unpackHighpData (vec2 mainPart, vec2 modPart, const float modValue) {
          highp vec2 data = mainPart * modValue;
          return data + modPart * modValue;
        }
        highp vec3 unpackHighpData (vec3 mainPart, vec3 modPart) {
          highp vec3 data = mainPart;
          return data + modPart;
        }
        highp vec3 unpackHighpData (vec3 mainPart, vec3 modPart, const float modValue) {
          highp vec3 data = mainPart * modValue;
          return data + modPart * modValue;
        }
        highp vec4 unpackHighpData (vec4 mainPart, vec4 modPart) {
          highp vec4 data = mainPart;
          return data + modPart;
        }
        highp vec4 unpackHighpData (vec4 mainPart, vec4 modPart, const float modValue) {
          highp vec4 data = mainPart * modValue;
          return data + modPart * modValue;
        }
    vec4 shadowTexure(highp sampler2D shadowMap, vec2 coord) {
        #if defined(CC_USE_WGPU)
            return texture2DLod(shadowMap, coord, 0.0);
        #else
          return texture2D(shadowMap, coord);
        #endif
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
  uniform samplerCube cc_environment;
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
  #if CC_USE_IBL
    #if CC_USE_DIFFUSEMAP
      uniform samplerCube cc_diffuseMap;
    #endif
  #endif
  #if CC_USE_REFLECTION_PROBE
    uniform samplerCube cc_reflectionProbeCubemap;
    uniform sampler2D cc_reflectionProbePlanarMap;
    uniform sampler2D cc_reflectionProbeDataMap;
    uniform highp vec4 cc_reflectionProbeData1;
  uniform highp vec4 cc_reflectionProbeData2;
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
  #if CC_USE_LIGHT_PROBE
  #if CC_USE_LIGHT_PROBE
    #if USE_INSTANCING
      varying mediump vec4 v_sh_linear_const_r;
      varying mediump vec4 v_sh_linear_const_g;
      varying mediump vec4 v_sh_linear_const_b;
    #else
      uniform vec4 cc_sh_linear_const_r;
  uniform vec4 cc_sh_linear_const_g;
  uniform vec4 cc_sh_linear_const_b;
  uniform vec4 cc_sh_quadratic_r;
  uniform vec4 cc_sh_quadratic_g;
  uniform vec4 cc_sh_quadratic_b;
  uniform vec4 cc_sh_quadratic_a;
    #endif
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
  #endif
  float GGXMobile (float roughness, float NoH, vec3 H, vec3 N) {
    vec3 NxH = cross(N, H);
    float OneMinusNoHSqr = dot(NxH, NxH);
    float a = roughness * roughness;
    float n = NoH * a;
    float p = a / max(EPSILON, OneMinusNoHSqr + n * n);
    return p * p;
  }
  float CalcSpecular (float roughness, float NoH, vec3 H, vec3 N) {
    return (roughness * 0.25 + 0.25) * GGXMobile(roughness, NoH, H, N);
  }
  vec3 BRDFApprox (vec3 specular, float roughness, float NoV) {
    const vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);
    const vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);
    vec4 r = roughness * c0 + c1;
    float a004 = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
    vec2 AB = vec2(-1.04, 1.04) * a004 + r.zw;
    AB.y *= clamp(50.0 * specular.g, 0.0, 1.0);
    return max(vec3(0.0), specular * AB.x + AB.y);
  }
  #if USE_REFLECTION_DENOISE
    vec3 GetEnvReflectionWithMipFiltering(vec3 R, float roughness, float mipCount, float denoiseIntensity, vec2 screenUV) {
      #if CC_USE_IBL
      	float mip = roughness * (mipCount - 1.0);
      	float delta = (dot(dFdx(R), dFdy(R))) * 1000.0;
      	float mipBias = mix(0.0, 5.0, clamp(delta, 0.0, 1.0));
        #if CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_CUBE
          vec4 biased = fragTextureLod(cc_reflectionProbeCubemap, R, mip + mipBias);
       	  vec4 filtered = textureCube(cc_reflectionProbeCubemap, R);
        #elif CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_PLANAR
          vec4 biased = fragTextureLod(cc_reflectionProbePlanarMap, screenUV, mip + mipBias);
          vec4 filtered = texture2D(cc_reflectionProbePlanarMap, screenUV);
        #else
          vec4 biased = fragTextureLod(cc_environment, R, mip + mipBias);
       	  vec4 filtered = textureCube(cc_environment, R);
        #endif
        #if CC_USE_IBL == 2 || CC_USE_REFLECTION_PROBE != REFLECTION_PROBE_TYPE_NONE
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
  #endif
  struct StandardSurface {
    vec4 albedo;
        #if CC_PLATFORM_ANDROID_AND_WEBGL && CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES
        vec3 position, position_fract_part;
        #else
        vec3 position;
        #endif
    vec3 normal;
    vec3 emissive;
    vec4 lightmap;
    float lightmap_test;
    float roughness;
    float metallic;
    float occlusion;
    float specularIntensity;
    #if CC_RECEIVE_SHADOW
      vec2 shadowBias;
    #endif
    #if CC_RECEIVE_SHADOW || CC_USE_REFLECTION_PROBE
      float reflectionProbeId;
    #endif
    #if CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_BLEND || CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_BLEND_AND_SKYBOX
      float reflectionProbeBlendId;
      float reflectionProbeBlendFactor;
    #endif
  };
   vec3 SampleReflectionProbe(samplerCube tex, vec3 R, float roughness, float mipCount, bool isRGBE) {
      vec4 envmap = fragTextureLod(tex, R, roughness * (mipCount - 1.0));
      if (isRGBE)
        return unpackRGBE(envmap);
      else
        return SRGBToLinear(envmap.rgb);
    }
  vec4 CCStandardShadingBase (StandardSurface s, vec4 shadowPos) {
    vec3 diffuse = s.albedo.rgb * (1.0 - s.metallic);
    vec3 specular = mix(vec3(0.08 * s.specularIntensity), s.albedo.rgb, s.metallic);
    vec3 position;
        #if CC_PLATFORM_ANDROID_AND_WEBGL && CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES
        position = unpackHighpData(s.position, s.position_fract_part);
        #else
        position = s.position;
        #endif
    vec3 N = normalize(s.normal);
    vec3 V = normalize(cc_cameraPos.xyz - position);
    vec3 L = normalize(-cc_mainLitDir.xyz);
    float NL = max(dot(N, L), 0.0);
    float shadow = 1.0;
    #if CC_RECEIVE_SHADOW && CC_SHADOW_TYPE == 2
      if (NL > 0.0 && cc_mainLitDir.w > 0.0) {
        #if CC_DIR_LIGHT_SHADOW_TYPE == 2
          shadow = CCCSMFactorBase(position, N, s.shadowBias);
        #endif
        #if CC_DIR_LIGHT_SHADOW_TYPE == 1
          shadow = CCShadowFactorBase(shadowPos, N, s.shadowBias);
        #endif
      }
    #endif
    vec3 finalColor = vec3(0.0);
    #if CC_USE_LIGHTMAP && !CC_FORWARD_ADD
      vec3 lightmap = s.lightmap.rgb;
      #if CC_USE_HDR
          lightmap.rgb *= cc_exposure.w * cc_exposure.x;
      #endif
      #if CC_USE_LIGHTMAP == LIGHT_MAP_TYPE_INDIRECT_OCCLUSION
        shadow *= s.lightmap.a;
        finalColor += diffuse * lightmap.rgb;
      #else
        finalColor += diffuse * lightmap.rgb * shadow;
      #endif
      s.occlusion *= s.lightmap_test;
    #endif
    #if !CC_DISABLE_DIRECTIONAL_LIGHT
      float NV = max(abs(dot(N, V)), 0.0);
      specular = BRDFApprox(specular, s.roughness, NV);
      vec3 H = normalize(L + V);
      float NH = max(dot(N, H), 0.0);
      vec3 lightingColor = NL * cc_mainLitColor.rgb * cc_mainLitColor.w;
      vec3 diffuseContrib = diffuse / PI;
      vec3 specularContrib = specular * CalcSpecular(s.roughness, NH, H, N);
      vec3 dirlightContrib = (diffuseContrib + specularContrib);
      dirlightContrib *= shadow;
      finalColor += lightingColor * dirlightContrib;
    #endif
    float fAmb = max(EPSILON, 0.5 - N.y * 0.5);
    vec3 ambDiff = mix(cc_ambientSky.rgb, cc_ambientGround.rgb, fAmb);
    vec3 env = vec3(0.0), rotationDir;
    #if CC_USE_IBL
      #if CC_USE_DIFFUSEMAP && !CC_USE_LIGHT_PROBE
        rotationDir = RotationVecFromAxisY(N.xyz, cc_surfaceTransform.z, cc_surfaceTransform.w);
        vec4 diffuseMap = textureCube(cc_diffuseMap, rotationDir);
        #if CC_USE_DIFFUSEMAP == 2
          ambDiff = unpackRGBE(diffuseMap);
        #else
          ambDiff = SRGBToLinear(diffuseMap.rgb);
        #endif
      #endif
      #if !CC_USE_REFLECTION_PROBE
        vec3 R = normalize(reflect(-V, N));
        rotationDir = RotationVecFromAxisY(R.xyz, cc_surfaceTransform.z, cc_surfaceTransform.w);
        #if USE_REFLECTION_DENOISE && !CC_IBL_CONVOLUTED
          env = GetEnvReflectionWithMipFiltering(rotationDir, s.roughness, cc_ambientGround.w, 0.6, vec2(0.0));
        #else
          vec4 envmap = fragTextureLod(cc_environment, rotationDir, s.roughness * (cc_ambientGround.w - 1.0));
          #if CC_USE_IBL == 2
            env = unpackRGBE(envmap);
          #else
            env = SRGBToLinear(envmap.rgb);
          #endif
        #endif
      #endif
    #endif
    float lightIntensity = cc_ambientSky.w;
    #if CC_USE_REFLECTION_PROBE
      vec4 probe = vec4(0.0);
      vec3 R = normalize(reflect(-V, N));
      #if CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_CUBE
        if(s.reflectionProbeId < 0.0){
          env = SampleReflectionProbe(cc_environment, R, s.roughness, cc_ambientGround.w, CC_USE_IBL == 2);
        }else{
          vec3 centerPos, boxHalfSize;
          float mipCount;
          GetCubeReflectionProbeData(centerPos, boxHalfSize, mipCount, s.reflectionProbeId);
          vec4 fixedR = CalculateBoxProjectedDirection(R, position, centerPos, boxHalfSize);
          env = mix(SampleReflectionProbe(cc_environment, R, s.roughness, cc_ambientGround.w, CC_USE_IBL == 2) * lightIntensity,
            SampleReflectionProbe(cc_reflectionProbeCubemap, fixedR.xyz, s.roughness, mipCount, isReflectProbeUsingRGBE(s.reflectionProbeId)), fixedR.w);
        }
      #elif CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_PLANAR
        if(s.reflectionProbeId < 0.0){
          vec2 screenUV = GetPlanarReflectScreenUV(s.position, cc_matViewProj, cc_cameraPos.w, V, R);
          probe = fragTextureLod(cc_reflectionProbePlanarMap, screenUV, 1.0);
        }else{
          vec4 plane;
          float planarReflectionDepthScale, mipCount;
          GetPlanarReflectionProbeData(plane, planarReflectionDepthScale, mipCount, s.reflectionProbeId);
          R = normalize(CalculateReflectDirection(N, V, max(abs(dot(N, V)), 0.0)));
          vec3 worldPosOffset = CalculatePlanarReflectPositionOnPlane(N, V, s.position, plane, cc_cameraPos.xyz, planarReflectionDepthScale);
          vec2 screenUV = GetPlanarReflectScreenUV(worldPosOffset, cc_matViewProj, cc_cameraPos.w, V, R);
          probe = fragTextureLod(cc_reflectionProbePlanarMap, screenUV, mipCount);
        }
        env = unpackRGBE(probe);
      #elif CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_BLEND || CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_BLEND_AND_SKYBOX
        if (s.reflectionProbeId < 0.0) {
          env = SampleReflectionProbe(cc_environment, R, s.roughness, cc_ambientGround.w, CC_USE_IBL == 2);
        } else {
          vec3 centerPos, boxHalfSize;
          float mipCount;
          GetCubeReflectionProbeData(centerPos, boxHalfSize, mipCount, s.reflectionProbeId);
          vec4 fixedR = CalculateBoxProjectedDirection(R, s.position, centerPos, boxHalfSize);
          env = SampleReflectionProbe(cc_reflectionProbeCubemap, fixedR.xyz, s.roughness, mipCount, isReflectProbeUsingRGBE(s.reflectionProbeId));
          if (s.reflectionProbeBlendId < 0.0) {
            vec3 skyBoxEnv = SampleReflectionProbe(cc_environment, R, s.roughness, cc_ambientGround.w, CC_USE_IBL == 2) * lightIntensity;
            #if CC_USE_REFLECTION_PROBE == REFLECTION_PROBE_TYPE_BLEND_AND_SKYBOX
              env = mix(env, skyBoxEnv, s.reflectionProbeBlendFactor);
            #else
              env = mix(skyBoxEnv, env, fixedR.w);
            #endif
          }
        }
      #endif
    #endif
    #if CC_USE_REFLECTION_PROBE
      lightIntensity = s.reflectionProbeId < 0.0 ? lightIntensity : 1.0;
    #endif
    finalColor += env * lightIntensity * specular * s.occlusion;
  #if CC_USE_LIGHT_PROBE
    finalColor += SHEvaluate(N) * diffuse * s.occlusion;
  #endif
    finalColor += ambDiff.rgb * cc_ambientSky.w * diffuse * s.occlusion;
    finalColor += s.emissive;
    return vec4(finalColor, s.albedo.a);
  }
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
  #if CC_ENABLE_CLUSTERED_LIGHT_CULLING == 0
  vec4 CCStandardShadingAdditive (StandardSurface s, vec4 shadowPos) {
    vec3 position;
        #if CC_PLATFORM_ANDROID_AND_WEBGL && CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES
        position = unpackHighpData(s.position, s.position_fract_part);
        #else
        position = s.position;
        #endif
    vec3 diffuse = s.albedo.rgb * (1.0 - s.metallic);
    vec3 specular = mix(vec3(0.04), s.albedo.rgb, s.metallic);
    vec3 diffuseContrib = diffuse / PI;
    vec3 N = normalize(s.normal);
    vec3 V = normalize(cc_cameraPos.xyz - position);
    float NV = max(abs(dot(N, V)), 0.0);
    specular = BRDFApprox(specular, s.roughness, NV);
    vec3 finalColor = vec3(0.0);
    int numLights = CC_PIPELINE_TYPE == 0 ? LIGHTS_PER_PASS : int(cc_lightDir[0].w);
    for (int i = 0; i < LIGHTS_PER_PASS; i++) {
      if (i >= numLights) break;
      vec3 SLU = IS_RANGED_DIRECTIONAL_LIGHT(cc_lightPos[i].w) ? -cc_lightDir[i].xyz : cc_lightPos[i].xyz - position;
      vec3 SL = normalize(SLU);
      vec3 SH = normalize(SL + V);
      float SNL = max(dot(N, SL), 0.0);
      float SNH = max(dot(N, SH), 0.0);
      vec3 lspec = specular * CalcSpecular(s.roughness, SNH, SH, N);
      float illum = 1.0;
      float att = 1.0;
      if (IS_RANGED_DIRECTIONAL_LIGHT(cc_lightPos[i].w)) {
        att = GetOutOfRange(position, cc_lightPos[i].xyz, cc_lightDir[i].xyz, cc_lightSizeRangeAngle[i].xyz, cc_lightBoundingSizeVS[i].xyz);
      } else {
        float distSqr = dot(SLU, SLU);
        float litRadius = cc_lightSizeRangeAngle[i].x;
        float litRadiusSqr = litRadius * litRadius;
        illum = (IS_POINT_LIGHT(cc_lightPos[i].w) || IS_RANGED_DIRECTIONAL_LIGHT(cc_lightPos[i].w)) ? 1.0 : litRadiusSqr / max(litRadiusSqr, distSqr);
        float attRadiusSqrInv = 1.0 / max(cc_lightSizeRangeAngle[i].y, 0.01);
        attRadiusSqrInv *= attRadiusSqrInv;
        att = GetDistAtt(distSqr, attRadiusSqrInv);
        if (IS_SPOT_LIGHT(cc_lightPos[i].w)) {
          float cosInner = max(dot(-cc_lightDir[i].xyz, SL), 0.01);
          float cosOuter = cc_lightSizeRangeAngle[i].z;
          float strength = clamp(cc_lightBoundingSizeVS[i].w, 0.0, 1.0);
          float litAngleScale = 1.0 / max(0.001, mix(cosInner, 1.0, strength) - cosOuter);
          float litAngleOffset = -cosOuter * litAngleScale;
          att *= GetAngleAtt(SL, -cc_lightDir[i].xyz, litAngleScale, litAngleOffset);
        }
      }
      float shadow = 1.0;
      #if CC_RECEIVE_SHADOW  && CC_SHADOW_TYPE == 2
        if (IS_SPOT_LIGHT(cc_lightPos[i].w) && cc_lightSizeRangeAngle[i].w > 0.0) {
          shadow = CCSpotShadowFactorBase(shadowPos, position, s.shadowBias);
        }
      #endif
      finalColor += SNL * cc_lightColor[i].rgb * shadow * cc_lightColor[i].w * illum * att * (diffuseContrib + lspec);
    }
    return vec4(finalColor, 0.0);
  }
  #endif
#if CC_ENABLE_CLUSTERED_LIGHT_CULLING == 1
  readonly buffer b_ccLightsBuffer { vec4 b_ccLights[]; };
  readonly buffer b_clusterLightIndicesBuffer { uint b_clusterLightIndices[]; };
  readonly buffer b_clusterLightGridBuffer { uvec4 b_clusterLightGrid[]; };
  struct CCLight
  {
    vec4 cc_lightPos;
    vec4 cc_lightColor;
    vec4 cc_lightSizeRangeAngle;
    vec4 cc_lightDir;
    vec4 cc_lightBoundingSizeVS;
  };
  struct Cluster
  {
    vec3 minBounds;
    vec3 maxBounds;
  };
  struct LightGrid
  {
    uint offset;
    uint ccLights;
  };
  CCLight getCCLight(uint i)
  {
    CCLight light;
    light.cc_lightPos = b_ccLights[5u * i + 0u];
    light.cc_lightColor = b_ccLights[5u * i + 1u];
    light.cc_lightSizeRangeAngle = b_ccLights[5u * i + 2u];
    light.cc_lightDir = b_ccLights[5u * i + 3u];
    light.cc_lightBoundingSizeVS = b_ccLights[5u * i + 4u];
    return light;
  }
  LightGrid getLightGrid(uint cluster)
  {
    uvec4 gridvec = b_clusterLightGrid[cluster];
    LightGrid grid;
    grid.offset = gridvec.x;
    grid.ccLights = gridvec.y;
    return grid;
  }
  uint getGridLightIndex(uint start, uint offset)
  {
    return b_clusterLightIndices[start + offset];
  }
  uint getClusterZIndex(vec4 worldPos)
  {
    float scale = float(24u) / log(cc_nearFar.y / cc_nearFar.x);
    float bias = -(float(24u) * log(cc_nearFar.x) / log(cc_nearFar.y / cc_nearFar.x));
    float eyeDepth = -(cc_matView * worldPos).z;
    uint zIndex = uint(max(log(eyeDepth) * scale + bias, 0.0));
    return zIndex;
  }
  uint getClusterIndex(vec4 fragCoord, vec4 worldPos)
  {
    uint zIndex = getClusterZIndex(worldPos);
    float clusterSizeX = ceil(cc_viewPort.z / float(16u));
    float clusterSizeY = ceil(cc_viewPort.w / float(8u));
    uvec3 indices = uvec3(uvec2(fragCoord.xy / vec2(clusterSizeX, clusterSizeY)), zIndex);
    uint cluster = (16u * 8u) * indices.z + 16u * indices.y + indices.x;
    return cluster;
  }
  vec4 CCClusterShadingAdditive (StandardSurface s, vec4 shadowPos) {
    vec3 diffuse = s.albedo.rgb * (1.0 - s.metallic);
    vec3 specular = mix(vec3(0.04), s.albedo.rgb, s.metallic);
    vec3 diffuseContrib = diffuse / PI;
    vec3 position;
        #if CC_PLATFORM_ANDROID_AND_WEBGL && CC_ENABLE_WEBGL_HIGHP_STRUCT_VALUES
        position = unpackHighpData(s.position, s.position_fract_part);
        #else
        position = s.position;
        #endif
    vec3 N = normalize(s.normal);
    vec3 V = normalize(cc_cameraPos.xyz - position);
    float NV = max(abs(dot(N, V)), 0.001);
    specular = BRDFApprox(specular, s.roughness, NV);
    vec3 finalColor = vec3(0.0);
    uint cluster = getClusterIndex(gl_FragCoord, vec4(position, 1.0));
    LightGrid grid = getLightGrid(cluster);
    uint numLights = grid.ccLights;
    for (uint i = 0u; i < 200u; i++) {
      if (i >= numLights) break;
      uint lightIndex = getGridLightIndex(grid.offset, i);
      CCLight light = getCCLight(lightIndex);
      vec3 SLU = light.cc_lightPos.xyz - position;
      vec3 SL = normalize(SLU);
      vec3 SH = normalize(SL + V);
      float SNL = max(dot(N, SL), 0.001);
      float SNH = max(dot(N, SH), 0.0);
      float distSqr = dot(SLU, SLU);
      float litRadius = light.cc_lightSizeRangeAngle.x;
      float litRadiusSqr = litRadius * litRadius;
      float illum = PI * (litRadiusSqr / max(litRadiusSqr , distSqr));
      float attRadiusSqrInv = 1.0 / max(light.cc_lightSizeRangeAngle.y, 0.01);
      attRadiusSqrInv *= attRadiusSqrInv;
      float att = GetDistAtt(distSqr, attRadiusSqrInv);
      vec3 lspec = specular * CalcSpecular(s.roughness, SNH, SH, N);
      if (IS_SPOT_LIGHT(light.cc_lightPos.w)) {
        float cosInner = max(dot(-light.cc_lightDir.xyz, SL), 0.01);
        float cosOuter = light.cc_lightSizeRangeAngle.z;
        float litAngleScale = 1.0 / max(0.001, cosInner - cosOuter);
        float litAngleOffset = -cosOuter * litAngleScale;
        att *= GetAngleAtt(SL, -light.cc_lightDir.xyz, litAngleScale, litAngleOffset);
      }
      vec3 lightColor = light.cc_lightColor.rgb;
      float shadow = 1.0;
      #if CC_RECEIVE_SHADOW && CC_SHADOW_TYPE == 2
        if (IS_SPOT_LIGHT(light.cc_lightPos.w)  && light.cc_lightSizeRangeAngle.w > 0.0) {
          shadow = CCSpotShadowFactorBase(shadowPos, position, s.shadowBias);
        }
      #endif
      lightColor *= shadow;
      finalColor += SNL * lightColor * light.cc_lightColor.w * illum * att * (diffuseContrib + lspec);
    }
    return vec4(finalColor, 0.0);
  }
#endif
  vec3 ACESToneMap (vec3 color) {
    color = min(color, vec3(8.0));
    const float A = 2.51;
    const float B = 0.03;
    const float C = 2.43;
    const float D = 0.59;
    const float E = 0.14;
    return (color * (A * color + B)) / (color * (C * color + D) + E);
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
  vec2 signNotZero(vec2 v) {
    return vec2((v.x >= 0.0) ? +1.0 : -1.0, (v.y >= 0.0) ? +1.0 : -1.0);
  }
  vec3 oct_to_float32x3(vec2 e) {
    vec3 v = vec3(e.xy, 1.0 - abs(e.x) - abs(e.y));
    if (v.z < 0.0) v.xy = (1.0 - abs(v.yx)) * signNotZero(v.xy);
    return normalize(v);
  }
  varying vec2 v_uv;
  uniform sampler2D albedoMap;
  uniform sampler2D normalMap;
  uniform sampler2D emissiveMap;
  uniform sampler2D depthStencil;
  vec4 screen2WS(vec3 coord) {
    vec3 ndc = vec3(
      2.0 * (coord.x - cc_viewPort.x) / cc_viewPort.z - 1.0,
      2.0 * (coord.y - cc_viewPort.y) / cc_viewPort.w - 1.0,
      2.0 * coord.z - 1.0);
    CC_HANDLE_SAMPLE_NDC_FLIP_STATIC(ndc.y);
    return GetWorldPosFromNDCPosRH(ndc, cc_matProj, cc_matViewProjInv);
  }
  void main () {
    StandardSurface s;
    vec4 albedo = texture2D(albedoMap, v_uv);
    vec4 normal = texture2D(normalMap, v_uv);
    vec4 emissive = texture2D(emissiveMap, v_uv);
    float depth = texture2D(depthStencil, v_uv).x;
    s.albedo = albedo;
    vec3 position = screen2WS(vec3(gl_FragCoord.xy, depth)).xyz;
    s.position = position;
    s.roughness = normal.z;
    s.normal = oct_to_float32x3(normal.xy);
    s.specularIntensity = 0.5;
    s.metallic = normal.w;
    s.emissive = emissive.xyz;
    s.occlusion = emissive.w;
#if CC_RECEIVE_SHADOW
    s.shadowBias = vec2(0, 0);
#endif
    float fogFactor;
    CC_TRANSFER_FOG_BASE(vec4(position, 1), fogFactor);
    vec4 shadowPos;
    shadowPos = cc_matLightViewProj * vec4(position, 1);
    vec4 color = CCStandardShadingBase(s, shadowPos) +
#if CC_ENABLE_CLUSTERED_LIGHT_CULLING == 1
                 CCClusterShadingAdditive(s, shadowPos);
#else
                 CCStandardShadingAdditive(s, shadowPos);
#endif
    CC_APPLY_FOG_BASE(color, fogFactor);
    color = CCFragOutput(color);
#if CC_USE_DEBUG_VIEW == CC_SURFACES_DEBUG_VIEW_SINGLE
    color = vec4(albedoMap.rgb, 1.0);
#endif
    gl_FragColor = color;
  }