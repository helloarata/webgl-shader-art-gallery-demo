precision mediump float;

uniform vec2 uWindowResolution;
uniform float uTime;

// 複数の波線を描くshader
void main() {
    vec2 st = (gl_FragCoord.xy * 2.0 - uWindowResolution.xy ) / uWindowResolution.xy;
    float lines;
    float speed     = 1.0;
    float xScale    = 0.9;
    float yScale    = 0.4;
    float lineThick = 0.0010;
    for(float i = 0.0; i < 5.0; i++){
        speed  += -0.112;
        xScale += i * 0.08;
        yScale += i * 0.04;
        float x         = (st.x + uTime * speed) * xScale;
        float y         = st.y + sin(x) * yScale;
        float line      = lineThick / abs(y);
        line *= (st.x + 1.0);
        lines += line;
    }
    vec4 orange = vec4( 1.0, 0.7, 0.2, 1.0 );
    gl_FragColor = orange * vec4(vec3(lines), 1.0);
    gl_FragColor.a = 0.888;
}