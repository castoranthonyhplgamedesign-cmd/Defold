
precision mediump float;
   uniform vec4 mainTiling_Offset;
uniform highp mat4 cc_matViewProj;
  uniform highp vec4 cc_cameraPos;
uniform highp mat4 cc_matWorld;
varying mediump vec2 uv;
varying mediump vec4 color;
attribute vec3 a_position;
attribute vec4 a_texCoord;
attribute vec3 a_texCoord1;
attribute vec3 a_texCoord2;
attribute vec4 a_color;
#if CC_DRAW_WIRE_FRAME
  varying vec3 vBarycentric;
#endif
vec4 vs_main() {
  highp vec4 pos = vec4(a_position, 1);
  vec4 velocity = vec4(a_texCoord1.xyz, 0);
  #if !CC_USE_WORLD_SPACE
    pos = cc_matWorld * pos;
    velocity = cc_matWorld * velocity;
  #endif
  float vertOffset = (a_texCoord.x - 0.5) * a_texCoord.y;
  vec3 camUp = normalize(cross(pos.xyz - cc_cameraPos.xyz, velocity.xyz));
  pos.xyz += camUp * vertOffset;
  pos = cc_matViewProj * pos;
  uv = a_texCoord.zw * mainTiling_Offset.xy + mainTiling_Offset.zw;;
  color = a_color;
  #if CC_DRAW_WIRE_FRAME
    vBarycentric = a_texCoord2;
  #endif
  return pos;
}
void main() { gl_Position = vs_main(); }