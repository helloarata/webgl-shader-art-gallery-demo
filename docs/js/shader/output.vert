attribute vec3  position;
attribute vec4  color;
attribute vec2  texCoord;

uniform   mat4  uMvpMatrix;

varying   vec4  vColor;
varying   vec2  vTexCoord;

float easeInOutQuart(float x){
  return x < 0.5 ? 8.0 * x * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 4.0) / 2.0;
}

void main() {
  vColor     = color;
  vTexCoord  = vec2(texCoord.x, 1.0 - texCoord.y);
  gl_Position = uMvpMatrix * vec4(position, 1.0);
}