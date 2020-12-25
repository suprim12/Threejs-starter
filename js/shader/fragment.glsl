// uniform float time;
// uniform float progress;
// uniform sampler2D texture1;
// uniform sampler2D texture2;
// uniform vec4 resolution;
// varying vec2 vUv;
// varying vec4 vPosition;
// varying float vFrontShadow;
// // varying float vBackShadow;
// // varying float vProgress;

// void main()	{
//     gl_FragColor = vec4(vUv,0.0,1.);
// }

uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;


void main()	{
	vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	// newUV.x += 0.02*sin(newUV.y*20. + time);
	gl_FragColor = texture2D(texture1,newUV);
}