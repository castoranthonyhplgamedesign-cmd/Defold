varying mediump vec3 var_normal;
varying mediump vec3 var_body;
uniform lowp vec4 tint;
void main() {
    mediump vec3 n = normalize(var_normal);
    mediump float light = 0.58 + 0.32 * max(0.0, dot(n, normalize(vec3(-0.68,0.86,0.36)))) + 0.1 * max(0.0,n.y);
    mediump float shine = pow(max(0.0, dot(n, normalize(vec3(-0.3,1.0,0.25)))), 32.0) * 0.19;
    lowp vec3 base = mix(vec3(tint.r + tint.g + tint.b > 2.7 ? 0.05 : 1.0), tint.rgb, var_body);
    gl_FragColor = vec4(base * light + shine, tint.a);
}
