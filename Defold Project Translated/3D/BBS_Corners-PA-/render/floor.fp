varying mediump vec2 uv;
uniform lowp sampler2D texture_sampler;
void main(){gl_FragColor=texture2D(texture_sampler,uv);}
