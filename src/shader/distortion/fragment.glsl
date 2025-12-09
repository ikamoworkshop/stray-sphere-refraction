uniform float uTime;
uniform vec4 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

float PI = 3.1415926533589793238;

// Noise
float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

mat2 rotate2D(float angle){
    return mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
    );
}

float lines(vec2 uv, float offset){
    return smoothstep(
        0.0, 0.5 + offset * 0.5,
        abs(0.5 * (sin(uv.x * 2.0) + offset * 2.0))
    );
}

void main(){
    float noise = noise(vPosition + uTime * .3);
    vec3 color1 = vec3(0.83, 0.13, 1.0);
    vec3 color2 = vec3(0.26, 1.0, 0.96);
    vec3 color3 = vec3(0.04, 0.05, 0.09);

    vec2 baseUV = rotate2D(noise) * vPosition.xy;
    float patternOne = lines(baseUV, .5);
    float patternTwo = lines(baseUV, .1);

    vec3 baseColor = mix(color1, color2, patternOne);
    vec3 baseColor2 = mix(baseColor, color3, patternTwo);

    gl_FragColor = vec4(vec3(baseColor2), 1.0);
}