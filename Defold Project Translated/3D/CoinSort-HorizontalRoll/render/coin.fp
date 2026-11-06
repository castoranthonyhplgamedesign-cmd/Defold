#version 140
in vec2 var_uv;
in vec3 var_normal;
in vec3 var_tint;
in float var_alpha;
in float var_unlit;
in vec4 var_shadow;
out vec4 color;
uniform sampler2D texture_sampler;
uniform sampler2D shadow_sampler;
vec3 linearize(vec3 v){return mix(v/12.92,pow((v+0.055)/1.055,vec3(2.4)),step(vec3(0.04045),v));}
vec3 srgb(vec3 v){return mix(v*12.92,1.055*pow(max(v,vec3(0.0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),v));}
float depthAt(vec2 uv){return dot(texture(shadow_sampler,uv),vec4(1.0,1.0/255.0,1.0/65025.0,1.0/16581375.0));}
float shadow(){
    vec3 point=var_shadow.xyz/var_shadow.w*0.5+0.5;
    if(point.x<0.0||point.x>1.0||point.y<0.0||point.y>1.0||point.z>1.0)return 1.0;
    float value=0.0;
    for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)value+=step(point.z-0.00008,depthAt(point.xy+vec2(float(x),float(y))/2048.0));
    return value/9.0;
}
void main(){
    if(var_alpha<0.001)discard;
    vec3 base=linearize(texture(texture_sampler,var_uv).rgb)*var_tint;
    vec3 n=normalize(var_normal);
    vec3 l=normalize(vec3(-2272.389,-2352.55,8480.669));
    vec3 h=normalize(l+vec3(0.0,0.0,1.0));
    float lambert=max(dot(n,l),0.0);
    float visibility=var_unlit>0.5?1.0:shadow();
    vec3 lit=base*(1.5+5.0*lambert*visibility)/3.14159265;
    float spec=pow(max(dot(n,h),0.0),25.0)*lambert*5.0*0.25*0.25*13.5/3.14159265;
    float fresnel=0.603827+(1.0-0.603827)*pow(1.0-max(dot(l,h),0.0),5.0);
    lit+=vec3(fresnel)*spec*visibility;
    color=vec4(srgb(mix(lit,base,var_unlit)),var_alpha);
}
