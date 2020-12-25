uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform vec4 resolution;
varying vec2 vUv;
varying vec4 vPosition;
varying float vFrontShadow;
// varying float vBackShadow;
// varying float vProgress;

void main()	{
    gl_FragColor = vec4(vUv,0.0,1.);
}
