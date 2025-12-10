uniform float uTime;
uniform vec4 uResolution;
uniform sampler2D tFluid;

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
    float noise = noise(vPosition + uTime * .8);
    vec3 color1 = vec3(1.0, 0.95, 0.24);
    vec3 color2 = vec3(0.82, 0.82, 1.0);
    vec3 color3 = vec3(1.0, 0.15, 0.65);
    vec3 color4 = vec3(0.0, 0.76, 1.0);

    float dist = length(vUv - vec2(.5));
    float radius = .49;

    // if(dist > .5) discard;

    // Out Edge
    float outerEdge = pow(dist/radius, 110.0);
    float magOut = .5 - cos(outerEdge - 1.0);
    vec2 uvOut = dist < radius ? vUv + magOut * (vUv - vec2(.5)) : vUv;

    // Inner Edge
    float innerEdge = pow(dist/radius, -7.0);
    vec2 innerEdgePower = vec2(sin(vUv.x - .5), sin(vUv.y - .5));
    float magIn = .5 - cos(innerEdge - 1.0);
    vec2 uvIn = dist > radius ? vUv : (vUv - vec2(.5)) * magIn * innerEdgePower;

    vec2 uvDisplay = vUv + uvOut * 0.5 + uvIn;
    uvDisplay *= 2.0;

    vec2 baseUV = rotate2D(noise * 12.0) * uvDisplay  * vPosition.xy;
    float patternOne = lines(baseUV, .2);
    float patternTwo = lines(baseUV, .6);
    float patternThree = lines(baseUV, .3);
    vec3 baseColor = mix(color1, color2, patternOne);
    baseColor = mix(baseColor, color3, patternTwo);
    baseColor = mix(baseColor, color4, patternThree);

    gl_FragColor = vec4(vec3(baseColor), 1.0);
}