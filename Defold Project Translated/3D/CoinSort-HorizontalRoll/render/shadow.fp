#version 140
in float var_alpha;
out vec4 color;
void main(){
    if(var_alpha<0.01)discard;
    vec4 packed=fract(min(gl_FragCoord.z,0.999999)*vec4(1.0,255.0,65025.0,16581375.0));
    packed-=packed.yzww*vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);
    color=packed;
}
