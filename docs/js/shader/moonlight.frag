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
float fractSin21(vec2 xy){
  return fract(sin(dot(xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 pixCoord = (gl_FragCoord.xy * 2.0 - uWindowResolution.xy) / min(uWindowResolution.x, uWindowResolution.y);
  float theta = atan2(pixCoord.y, pixCoord.x);
  float r = length(pixCoord);
  vec2 pol = vec2(theta, r);
  float pn = fractSin21(vec2(pixCoord.x, pixCoord.y) + uTime);
  float fn  = fractSin21(vec2(pol.x, pol.y) + uTime);
  float d = 0.4 * fn + sin(pol.y - uTime);
  float ligth = 0.05/length(pixCoord);

  float ry = bump(d*pol.y - 0.244444);
  float gy = bump(d*pol.y - 0.433333);
  float by = bump(d*pol.y - 0.6322222);

  gl_FragColor = vec4(vec3(ligth+0.18*vec3(ry,gy,by)), 1.0);
}