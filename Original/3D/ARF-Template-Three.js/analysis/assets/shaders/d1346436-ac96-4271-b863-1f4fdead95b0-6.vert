
precision highp float;
vec4 quaternionFromAxis (vec3 xAxis,vec3 yAxis,vec3 zAxis){
  mat3 m = mat3(xAxis,yAxis,zAxis);
  float trace = m[0][0] + m[1][1] + m[2][2];
  vec4 quat;
  if (trace > 0.) {
    float s = 0.5 / sqrt(trace + 1.0);
    quat.w = 0.25 / s;
    quat.x = (m[2][1] - m[1][2]) * s;
    quat.y = (m[0][2] - m[2][0]) * s;
    quat.z = (m[1][0] - m[0][1]) * s;
  } else if ((m[0][0] > m[1][1]) && (m[0][0] > m[2][2])) {
    float s = 2.0 * sqrt(1.0 + m[0][0] - m[1][1] - m[2][2]);
    quat.w = (m[2][1] - m[1][2]) / s;
    quat.x = 0.25 * s;
    quat.y = (m[0][1] + m[1][0]) / s;
    quat.z = (m[0][2] + m[2][0]) / s;
  } else if (m[1][1] > m[2][2]) {
    float s = 2.0 * sqrt(1.0 + m[1][1] - m[0][0] - m[2][2]);
    quat.w = (m[0][2] - m[2][0]) / s;
    quat.x = (m[0][1] + m[1][0]) / s;
    quat.y = 0.25 * s;
    quat.z = (m[1][2] + m[2][1]) / s;
  } else {
    float s = 2.0 * sqrt(1.0 + m[2][2] - m[0][0] - m[1][1]);
    quat.w = (m[1][0] - m[0][1]) / s;
    quat.x = (m[0][2] + m[2][0]) / s;
    quat.y = (m[1][2] + m[2][1]) / s;
    quat.z = 0.25 * s;
  }
  float len = quat.x * quat.x + quat.y * quat.y + quat.z * quat.z + quat.w * quat.w;
  if (len > 0.) {
    len = 1. / sqrt(len);
    quat.x = quat.x * len;
    quat.y = quat.y * len;
    quat.z = quat.z * len;
    quat.w = quat.w * len;
  }
  return quat;
}
vec4 quaternionFromEuler (vec3 angle){
  float x = angle.x / 2.;
  float y = angle.y / 2.;
  float z = angle.z / 2.;
  float sx = sin(x);
  float cx = cos(x);
  float sy = sin(y);
  float cy = cos(y);
  float sz = sin(z);
  float cz = cos(z);
  vec4 quat = vec4(0);
  quat.x = sx * cy * cz + cx * sy * sz;
  quat.y = cx * sy * cz + sx * cy * sz;
  quat.z = cx * cy * sz - sx * sy * cz;
  quat.w = cx * cy * cz - sx * sy * sz;
  return quat;
}
mat4 matrixFromRT (vec4 q, vec3 p){
  float x2 = q.x + q.x;
  float y2 = q.y + q.y;
  float z2 = q.z + q.z;
  float xx = q.x * x2;
  float xy = q.x * y2;
  float xz = q.x * z2;
  float yy = q.y * y2;
  float yz = q.y * z2;
  float zz = q.z * z2;
  float wx = q.w * x2;
  float wy = q.w * y2;
  float wz = q.w * z2;
  return mat4(
    1. - (yy + zz), xy + wz, xz - wy, 0,
    xy - wz, 1. - (xx + zz), yz + wx, 0,
    xz + wy, yz - wx, 1. - (xx + yy), 0,
    p.x, p.y, p.z, 1
  );
}
mat4 matFromRTS (vec4 q, vec3 t, vec3 s){
  float x = q.x, y = q.y, z = q.z, w = q.w;
  float x2 = x + x;
  float y2 = y + y;
  float z2 = z + z;
  float xx = x * x2;
  float xy = x * y2;
  float xz = x * z2;
  float yy = y * y2;
  float yz = y * z2;
  float zz = z * z2;
  float wx = w * x2;
  float wy = w * y2;
  float wz = w * z2;
  float sx = s.x;
  float sy = s.y;
  float sz = s.z;
  return mat4((1. - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1. - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1. - (xx + yy)) * sz, 0,
    t.x, t.y, t.z, 1);
}
vec4 quatMultiply (vec4 a, vec4 b){
  vec4 quat;
  quat.x = a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y;
  quat.y = a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z;
  quat.z = a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x;
  quat.w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;
  return quat;
}
void rotateVecFromQuat (inout vec3 v, vec4 q){
  float ix = q.w * v.x + q.y * v.z - q.z * v.y;
  float iy = q.w * v.y + q.z * v.x - q.x * v.z;
  float iz = q.w * v.z + q.x * v.y - q.y * v.x;
  float iw = -q.x * v.x - q.y * v.y - q.z * v.z;
  v.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;
  v.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;
  v.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;
}
vec3 rotateInLocalSpace (vec3 pos, vec3 xAxis, vec3 yAxis, vec3 zAxis, vec4 q){
  vec4 viewQuat = quaternionFromAxis(xAxis, yAxis, zAxis);
  vec4 rotQuat = quatMultiply(viewQuat, q);
  rotateVecFromQuat(pos, rotQuat);
  return pos;
}
mat3 quatToMat3(vec4 q) {
  vec3 m0 = vec3(
    1.0 - 2.0 * q.y * q.y - 2.0 * q.z * q.z,
    2.0 * q.x * q.y + 2.0 * q.w * q.z,
    2.0 * q.x * q.z - 2.0 * q.w * q.y);
	vec3 m1 = vec3(
    2.0 * q.x * q.y - 2.0 * q.w * q.z,
    1.0 - 2.0 * q.x * q.x - 2.0 * q.z * q.z,
    2.0 * q.y * q.z + 2.0 * q.w * q.x);
	vec3 m2 = vec3(
    2.0 * q.x * q.z + 2.0 * q.w * q.y,
    2.0 * q.y * q.z - 2.0 * q.w * q.x,
    1.0 - 2.0 * q.x * q.x - 2.0 * q.y * q.y);
  return mat3(m0, m1, m2);
}
vec4 mat3ToQuat(mat3 mat) {
  float tr = mat[0][0] + mat[1][1] + mat[2][2];
	float qw, qx, qy, qz;
  if (tr > 0.0) {
    float S = sqrt(tr + 1.0) * 2.0;
	  float invS = 1.0 / S;
	  qw = 0.25 * S;
	  qx = (mat[1][2] - mat[2][1]) * invS;
	  qy = (mat[2][0] - mat[0][2]) * invS;
	  qz = (mat[0][1] - mat[1][0]) * invS;
  } else if ((mat[0][0] > mat[1][1])&&(mat[0][0] > mat[2][2])) {
    float S = sqrt(1.0 + mat[0][0] - mat[1][1] - mat[2][2]) * 2.0;
	  float invS = 1.0 / S;
	  qw = (mat[1][2] - mat[2][1]) * invS;
	  qx = 0.25 * S;
	  qy = (mat[1][0] + mat[0][1]) * invS;
	  qz = (mat[2][0] + mat[0][2]) * invS;
  } else if (mat[1][1] > mat[2][2]) {
	  float S = sqrt(1.0 + mat[1][1] - mat[0][0] - mat[2][2]) * 2.0;
	  float invS = 1.0 / S;
	  qw = (mat[2][0] - mat[0][2]) * invS;
	  qx = (mat[1][0] + mat[0][1]) * invS;
	  qy = 0.25 * S;
	  qz = (mat[2][1] + mat[1][2]) * invS;
  } else {
	  float S = sqrt(1.0 + mat[2][2] - mat[0][0] - mat[1][1]) * 2.0;
	  float invS = 1.0 / S;
	  qw = (mat[0][1] - mat[1][0]) * invS;
	  qx = (mat[2][0] + mat[0][2]) * invS;
	  qy = (mat[2][1] + mat[1][2]) * invS;
	  qz = 0.25 * S;
  }
  return vec4(qx, qy, qz, qw);
}
   uniform vec4 mainTiling_Offset;
   uniform vec4 frameTile_velLenScale;
   uniform vec4 scale;
   uniform vec4 nodeRotation;
uniform highp mat4 cc_matView;
  uniform highp mat4 cc_matViewInv;
  uniform highp mat4 cc_matViewProj;
  uniform highp vec4 cc_cameraPos;
uniform highp mat4 cc_matWorld;
varying mediump vec2 uv;
varying mediump vec4 color;
void computeVertPos (inout vec4 pos, vec2 vertOffset, vec4 q, vec3 s
#if CC_RENDER_MODE == 0 || CC_RENDER_MODE == 3
  , mat4 viewInv
#endif
#if CC_RENDER_MODE == 1
  , vec3 eye
  , vec4 velocity
  , float velocityScale
  , float lengthScale
  , float xIndex
#endif
) {
#if CC_RENDER_MODE == 0
  vec3 viewSpaceVert = vec3(vertOffset.x * s.x, vertOffset.y * s.y, 0.);
  vec3 camX = normalize(vec3(viewInv[0][0], viewInv[1][0], viewInv[2][0]));
  vec3 camY = normalize(vec3(viewInv[0][1], viewInv[1][1], viewInv[2][1]));
  vec3 camZ = normalize(vec3(viewInv[0][2], viewInv[1][2], viewInv[2][2]));
  pos.xyz += rotateInLocalSpace(viewSpaceVert, camX, camY, camZ, q);
#elif CC_RENDER_MODE == 1
  vec3 camRight = normalize(cross(pos.xyz - eye, velocity.xyz)) * s.x;
  vec3 camUp = velocity.xyz * velocityScale + normalize(velocity.xyz) * lengthScale * s.y;
  pos.xyz += (camRight * abs(vertOffset.x) * sign(vertOffset.y)) - camUp * xIndex;
#elif CC_RENDER_MODE == 2
  vec3 viewSpaceVert = vec3(vertOffset.x * s.x, vertOffset.y * s.y, 0.);
  vec3 camX = vec3(1, 0, 0);
  vec3 camY = vec3(0, 0, -1);
  pos.xyz += rotateInLocalSpace(viewSpaceVert, camX, camY, cross(camX, camY), q);
#elif CC_RENDER_MODE == 3
  vec3 viewSpaceVert = vec3(vertOffset.x * s.x, vertOffset.y * s.y, 0.);
  rotateVecFromQuat(viewSpaceVert, q);
  vec3 camX = normalize(vec3(cc_matView[0][0], cc_matView[1][0], cc_matView[2][0]));
  vec3 camY = vec3(0, 1, 0);
  vec3 offset = camX * viewSpaceVert.x + camY * viewSpaceVert.y;
  pos.xyz += offset;
#else
  pos.x += vertOffset.x;
  pos.y += vertOffset.y;
#endif
}
vec2 computeUV (float frameIndex, vec2 vertIndex, vec2 frameTile){
  vec2 aniUV = vec2(0, floor(frameIndex * frameTile.y));
  aniUV.x = floor(frameIndex * frameTile.x * frameTile.y - aniUV.y * frameTile.x);
#if CC_RENDER_MODE != 4
  vertIndex.y = 1. - vertIndex.y;
#endif
  return (aniUV.xy + vertIndex) / vec2(frameTile.x, frameTile.y);
}
attribute vec3 a_texCoord1;
attribute vec3 a_texCoord2;
attribute vec4 a_color;
attribute vec3 a_texCoord;
#if !CC_INSTANCE_PARTICLE
 attribute vec3 a_position;
#endif
#if CC_INSTANCE_PARTICLE
 attribute vec4 a_texCoord4;
#endif
#if CC_RENDER_MODE == 1
  attribute vec3 a_color1;
#endif
#if CC_RENDER_MODE == 4
  attribute vec3 a_texCoord3;
  attribute vec3 a_normal;
  attribute vec4 a_color1;
#endif
vec4 lpvs_main () {
  vec3 compScale = scale.xyz * a_texCoord1;
  #if !CC_INSTANCE_PARTICLE
    vec4 pos = vec4(a_position.xyz, 1);
  #endif
  #if CC_INSTANCE_PARTICLE
    vec4 pos = vec4(a_texCoord4.xyz, 1);
  #endif
  #if CC_RENDER_MODE == 1
    vec4 velocity = vec4(a_color1.xyz, 0);
  #endif
  #if !CC_USE_WORLD_SPACE
    pos = cc_matWorld * pos;
    #if CC_RENDER_MODE == 1
      velocity = cc_matWorld * velocity;
    #endif
  #endif
  #if ROTATION_OVER_TIME_MODULE_ENABLE
    vec3 rotTmp = a_texCoord2;
    float mulFactor = 1.0;
    if (rotTmp.x > 10.0 * 0.5) {
        rotTmp.x -= 10.0;
        mulFactor = -1.0;
    }
    vec4 rot = vec4(rotTmp, 0.0);
    rot.w = mulFactor * sqrt(abs(1.0 - rot.x * rot.x - rot.y * rot.y - rot.z * rot.z));
  #endif
  #if !ROTATION_OVER_TIME_MODULE_ENABLE
    #if CC_RENDER_MODE != 4
      #if CC_RENDER_MODE == 0
        vec3 rotEuler = a_texCoord2;
      #elif CC_RENDER_MODE == 1
        vec3 rotEuler = vec3(0.);
      #endif
      #if CC_RENDER_MODE != 0 && CC_RENDER_MODE != 1
        vec3 rotEuler = vec3(0., 0., a_texCoord2.z);
      #endif
      vec4 rot = quaternionFromEuler(rotEuler);
    #endif
    #if CC_RENDER_MODE == 4
      vec4 rot = quaternionFromEuler(a_texCoord2);
    #endif
  #endif
  #if CC_RENDER_MODE != 4
    vec2 cornerOffset = vec2((a_texCoord.xy - 0.5));
    #if CC_RENDER_MODE == 0 || CC_RENDER_MODE == 3
      computeVertPos(pos, cornerOffset, rot, compScale, cc_matViewInv);
    #elif CC_RENDER_MODE == 1
      computeVertPos(pos, cornerOffset, rot, compScale, cc_cameraPos.xyz, velocity, frameTile_velLenScale.z, frameTile_velLenScale.w, a_texCoord.x);
    #elif 2
      computeVertPos(pos, cornerOffset, rot, compScale);
    #endif
    color = a_color;
  #endif
  #if CC_RENDER_MODE == 4
    mat3 rotMat = quatToMat3(rot);
    mat3 nodeMat = quatToMat3(nodeRotation);
    rotMat = nodeMat * rotMat;
    rot = mat3ToQuat(rotMat);
    mat4 xformNoScale = matrixFromRT(rot, pos.xyz);
    mat4 xform = matFromRTS(rot, pos.xyz, compScale);
    pos = xform * vec4(a_texCoord3, 1);
    vec4 normal = xformNoScale * vec4(a_normal, 0);
    color = a_color * a_color1;
  #endif
  #if !CC_INSTANCE_PARTICLE
    uv = computeUV(a_texCoord.z, a_texCoord.xy, frameTile_velLenScale.xy) * mainTiling_Offset.xy + mainTiling_Offset.zw;
  #endif
  #if CC_INSTANCE_PARTICLE
    uv = computeUV(a_texCoord4.w, a_texCoord.xy, frameTile_velLenScale.xy) * mainTiling_Offset.xy + mainTiling_Offset.zw;
  #endif
  pos = cc_matViewProj * pos;
  return pos;
}
void main() { gl_Position = lpvs_main(); }