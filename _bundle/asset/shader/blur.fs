precision mediump float;

uniform sampler2D srcTexture;
uniform vec2 direction;

varying vec2 vUv;

float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}

void main() {

	vec4 color = vec4(0.0);
	float total = 0.0;
	float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
	for(float t = -30.0; t <= 30.0; t++){
		float percent = (t + offset - 0.5) / 30.0;
		float weight = 1.0 - abs(percent);
		vec4 sample = texture2D(srcTexture, vUv + direction * percent);
		sample.rgb *= sample.a;
		color += sample * weight;
		total += weight;
	}
	
	gl_FragColor = color / total;
	gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
	
}

// vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
//   vec4 color = vec4(0.0);
//   vec2 off1 = vec2(1.3846153846) * direction;
//   vec2 off2 = vec2(3.2307692308) * direction;
//   color += texture2D(image, uv) * 0.2270270270;
//   color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
//   color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
//   color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
//   color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
//   return color;
// }

// void main(void){
//   vec2 iResolution = vec2(1024.0, 512.0);
//   vec2 uv = vec2(gl_FragCoord.xy / iResolution);
//   gl_FragColor = blur9(srcTexture, uv, iResolution, direction);
// }
