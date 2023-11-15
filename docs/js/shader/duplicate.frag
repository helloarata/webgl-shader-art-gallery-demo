precision highp float;

uniform vec2 uWindowResolution;
uniform float uTime;

float fractSin21(vec2 p){
  return fract(sin(dot(p, vec2(12.9898, 78.233))));
}

// 複製を描画します
void main(){
  float radius = 0.25;
  float speed  = 0.75;
  vec2 pixCoord = (gl_FragCoord.xy * 2.0 - uWindowResolution) / min(uWindowResolution.x, uWindowResolution.y);
  pixCoord *= 3.0;
  vec2 id = floor(pixCoord);
  pixCoord = fract(pixCoord) * 2.0 - 1.0;
  float threshold = exp(-length(id));
  float n = fractSin21(id);
  float l3 = abs(sin(uTime * speed) * n) / length(pixCoord);
  gl_FragColor = vec4(vec3(l3),1.0);
}