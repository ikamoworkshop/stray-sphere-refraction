import WaterTexture from "./WaterTexture"

const WaterEffect = {

	name: 'WaterEffect',

	uniforms: {

		'uTexture': { value: null },
        'tDiffuse': { value: null },
        'uBlueStrength': { value: null },
        'uBendStrength': {value: null },
        'uTime': {value: null },
	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`
    uniform sampler2D uTexture;
    uniform sampler2D tDiffuse;
    uniform float uBlueStrength;
    uniform float uBendStrength;
    uniform float uTime;

    varying vec2 vUv;
    #define PI 3.14159265359

    vec3 draw(sampler2D image, vec2 uv) {
        return texture2D(image,vec2(uv.x, uv.y)).rgb;   
    }
        
    float rand(vec2 co){
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    vec3 blueEffect(vec2 uv, sampler2D image, float blurAmount){
        vec3 blurredImage = vec3(0.);
        #define repeats 40.

        for (float i = 0.; i < repeats; i++) { 
            vec2 q = vec2(cos(degrees((i / repeats) * 360.)), sin(degrees((i / repeats) * 360.))) * (rand(vec2(i, uv.x + uv.y)) + blurAmount); 
            vec2 uv2 = uv + (q * blurAmount);
            blurredImage += draw(image, uv2) / 2.;
            q = vec2(cos(degrees((i / repeats) * 360.)), sin(degrees((i / repeats) * 360.))) * (rand(vec2(i + 2., uv.x + uv.y + 24.)) + blurAmount); 
            uv2 = uv + (q * blurAmount);
            blurredImage += draw(image, uv2) / 2.;
        }
        
        return blurredImage / repeats;
    }

    void main(){
        vec4 tex = texture2D(uTexture, vUv);
		// Convert normalized values into regular unit vector
        float vx = -(tex.r *2. - 1.);
        float vy = -(tex.g *2. - 1.);
		// Normalized intensity works just fine for intensity
        float intensity = tex.b;
        float maxAmplitude = 0.05;
        vec2 newUv = vUv;

        newUv.x += vx * intensity * maxAmplitude;
        newUv.y += vy * intensity * maxAmplitude;

        vec4 tMap = texture2D(tDiffuse, newUv);

        newUv.y += sin(vUv.x * 30.0 + (uTime * .0025)) * uBendStrength;

        vec4 color = vec4(blueEffect(newUv, tDiffuse, uBlueStrength), 1.0);

        gl_FragColor = color;
    }
`

}

export { WaterEffect };