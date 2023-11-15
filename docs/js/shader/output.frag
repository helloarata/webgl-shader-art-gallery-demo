precision mediump float;

uniform vec2 uWindowResolution;
uniform float uTime;
uniform sampler2D uTextureUnit0;
uniform bool uTextureFlag;

varying vec4 vColor;
varying vec2 vTexCoord;

void main() {
  vec4 color = vColor;
  vec2 st = vTexCoord;
  
  if(uTextureFlag){
    vec4 artColor = texture2D(uTextureUnit0, st);
    color = artColor;
  } 
  gl_FragColor = vec4(uWindowResolution, .4, 1.0) * uTime;
  gl_FragColor = vec4(color.rgb, 1.0);
  
}