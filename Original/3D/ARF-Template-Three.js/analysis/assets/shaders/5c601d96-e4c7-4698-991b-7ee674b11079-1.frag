
precision highp float;
varying vec2 v_uv;
uniform sampler2D outputResultMap;
void main() {
  gl_FragColor = texture2D(outputResultMap, v_uv);
}