precision highp float;
uniform vec2 uWindowResolution;
uniform float uTime;
const   float PI = 3.141592653589793;

// 偏角(Xに相当する角θ)を求める関数
float atan2(float y, float x){
  return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}
// 直交座標を極座標に変換する関数
vec2 xy2pol(vec2 xy){
  return vec2(atan2(xy.y, xy.x), length(xy));
}
// 極座標を直交座標に変換する関数
vec2 pol2xy(vec2 pol){ // 引数は(偏角, 動径)の組み合わせからなるベクトル
  return pol.y * vec2(cos(pol.x), sin(pol.x));
}
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
float bump(float x) {
	return abs(x) > 1.0 ? 0.0 : 1.0 - x * x;
}
// 擬似乱数
float fractSin11(float x){
  return fract(1000.0 * sin(x));
}
float fractSin21(vec2 xy){
  return fract(sin(dot(xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
// 階段関数
vec2  stepFunction(vec2 pixCoord){
  vec2   steps = vec2(0.0);
  // ピクセル座標を階段化
  return steps = floor(pixCoord) + step(0.5, fract(pixCoord));
}
// なめらか階段関数
vec2 smoothstepFunction(vec2 pixCoord){
  vec2 smooths = vec2(0.0);
  return smooths = floor(pixCoord) + smoothstep(0.45, 0.65, fract(pixCoord));
}
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - uWindowResolution.xy) / min(uWindowResolution.x, uWindowResolution.y);
  float tone = 8.0;
  p *= tone;
  p = stepFunction(p);
  p = p/tone;
  vec3 o =  -3.1416 * vec3(0.0,0.5,1.0);
  float g= p.x+uTime*0.5/2.0;
  g+= p.y+uTime*0.3/2.0;
  vec3 col = 0.6 + 0.41 * -sin(g)*cos(g+o);
  gl_FragColor = vec4(vec3(col.r,col.g,col.b) + col, 1.0);
}