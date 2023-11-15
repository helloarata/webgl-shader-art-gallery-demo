precision highp float;

uniform vec2 uWindowResolution;
uniform float uTime;

float fractSin21(vec2 p){
  return fract(sin(dot(p, vec2(12.9898, 78.233))));
}

vec2 smoothstepFunction(vec2 pixCoord){
  vec2 smooths = vec2(0.0);
  return smooths = floor(pixCoord) + smoothstep(0.45, 0.65, fract(pixCoord));
}

// hsv色空間
vec3 hsv2rgb(float hue, float saturation, float value){
  vec3 a = fract(hue + vec3(0.0, 2.0, 1.0)/3.0) * 6.0 - 3.0;
  a = clamp(abs(a) - 1.0, 0.0, 1.0) - 1.0;
  a = a * saturation + 1.0;
  return a * value;
}

void main(){
  vec2 pixCoord1 = gl_FragCoord.xy / uWindowResolution.xy;
  vec2 pixCoord2 = (gl_FragCoord.xy * 2.0 - uWindowResolution) / min(uWindowResolution.x, uWindowResolution.y);
  float tone = 5.0;
  pixCoord2 *= tone;
  vec2 pixCoord = vec2(0.0);
  pixCoord = smoothstepFunction(pixCoord);
  pixCoord = pixCoord / tone;
  vec2 f = floor(pixCoord2);
  float rn = fractSin21(f);
  float hue = rn;
  vec3 rgb = hsv2rgb(hue*uTime*0.35, 0.624444, 1.0);
  float gn = fractSin21(f+vec2(123.34, 32.34));
  float bn = fractSin21(f+vec2(23.0, 342.0));
  vec2 s = step(0.5, pixCoord1);
  vec2 fr = fract(pixCoord1);
  vec2 sm = smoothstep(0.25,0.75,pixCoord1);

  gl_FragColor = vec4(vec2(pixCoord)+rgb.xy ,0.75,1.0);
}