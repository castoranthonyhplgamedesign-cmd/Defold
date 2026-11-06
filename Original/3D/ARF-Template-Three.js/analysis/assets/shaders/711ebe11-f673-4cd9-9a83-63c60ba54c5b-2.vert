
precision mediump float;
uniform highp mat4 cc_matView;
  uniform highp mat4 cc_matViewInv;
  uniform highp mat4 cc_matViewProj;
uniform highp mat4 cc_matWorld;
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
varying mediump vec2 uv;
varying mediump vec4 color;
void computeVertPos (inout vec4 pos, vec2 vertOffset, vec4 q, vec3 s
  , mat4 viewInv
) {
  vec3 viewSpaceVert = vec3(vertOffset.x * s.x, vertOffset.y * s.y, 0.);
  vec3 camX = normalize(vec3(viewInv[0][0], viewInv[1][0], viewInv[2][0]));
  vec3 camY = normalize(vec3(viewInv[0][1], viewInv[1][1], viewInv[2][1]));
  vec3 camZ = normalize(vec3(viewInv[0][2], viewInv[1][2], viewInv[2][2]));
  pos.xyz += rotateInLocalSpace(viewSpaceVert, camX, camY, camZ, q);
}
attribute vec3 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;
   uniform vec4 cc_size_rotation;
vec4 vs_main() {
  vec4 pos = vec4(a_position, 1);
  pos = cc_matWorld * pos;
  vec2 vertOffset = a_texCoord.xy - 0.5;
  computeVertPos(pos, vertOffset, quaternionFromEuler(vec3(0., 0., cc_size_rotation.z)), vec3(cc_size_rotation.xy, 0.), cc_matViewInv);
  pos = cc_matViewProj * pos;
  uv = a_texCoord.xy;
  color = a_color;
  return pos;
}
void main() { gl_Position = vs_main(); }