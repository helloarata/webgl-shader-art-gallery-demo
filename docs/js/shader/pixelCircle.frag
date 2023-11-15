precision highp float;
uniform vec2 uWindowResolution;
uniform float uTime;

// ピクセル状の円を描きます
void main(){
  // 縦横比を考慮した正規化
  vec2 pixelCoord = (gl_FragCoord.xy * 2.0 - uWindowResolution) / min(uWindowResolution.x, uWindowResolution.y);
  // 座標を低解像度にする
  vec2 lowPixelCoord = floor(pixelCoord * 30.0) / 30.0;
  vec3 color = vec3(0.0);
  for(float i = 1.0; i < 6.0; i++){
    float j = i + 10.0;
    vec2 r = lowPixelCoord + vec2(cos(uTime*j),sin(uTime*j)) * 0.6 * (1.0 + 0.01);
    vec2 g = lowPixelCoord + vec2(cos(uTime*j),sin(uTime*j)) * 0.6;
    vec2 b = pixelCoord + vec2(cos(uTime*j),sin(uTime*j)) * 0.6 * (1.0 - 0.01);
    color.r += 0.06 / length(r);
    color.g += 0.06 / length(g);
    color.b += 0.06 / length(b);
  }
  gl_FragColor = vec4(.1, .1, .1, 1.0) * vec4(color,1.0);
}