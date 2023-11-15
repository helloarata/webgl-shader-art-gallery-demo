import BaseBoard from './BaseBoard.js';
import { WebGLUtility }  from '../lib/webgl.js';
import { WebGLGeometry } from '../lib/geometry.js';
import { WebGLMath }     from '../lib/math.js';
import { Pointer } from '../utils/Pointer.js';
import Config from '../state/Config.js';

export default class ArtBoard extends BaseBoard{
  constructor() {
    super();
    this.isReady = false;
    this.isRenderingTarget = false;
    this.webGLUtil  = new WebGLUtility();
    this.webGLGeo = new WebGLGeometry();
    const {gl, canvas} = this.webGLUtil.getWebGLRenderingContext('webgl-canvas');
    this.gl = gl;
    this.canvas = canvas;
  }

  init() {
    const gl = this.gl;
    gl.clearColor(0.12, 0.12, 0.12, 1.0);
    this.resize();
    this.setGeometry();
    this.setOffscreenRendering();
    this.isReady = true;
    this.setGridLayout();
    document.addEventListener('mousemove', this.isPointerInRect.bind(this));
  }

  setCanvasSize() {
    this.canvas.width = Config.width;
    this.canvas.height = Config.height;
  }

  resize() {
    this.setConfig();
    this.resizeScreen();
    this.setCanvasSize();
    this.setGridLayout(); // リサイズ時にグリット配置を再計算 @@@
  }

  load() {
    return new Promise((resolve) => {
      this.loadShader([
        './js/shader/common.vert',
        './js/shader/waveform.frag',
        './js/shader/pixelCircle.frag',
        './js/shader/duplicate.frag',
        './js/shader/abstractColor.frag',
        './js/shader/gradation.frag',
        './js/shader/staircaseArt.frag',
        './js/shader/moonlight.frag',
        './js/shader/fractalRipple.frag',
        './js/shader/spark.frag',
        './js/shader/output.vert',
        './js/shader/output.frag'
      ])
      .then((shaders) => {
        const gl = this.gl;

        this.artPObjects = [];
        const artSObjects = [
          this.webGLUtil.createWebGLShaderObject(shaders[0], gl.VERTEX_SHADER),
          this.webGLUtil.createWebGLShaderObject(shaders[1], gl.FRAGMENT_SHADER),
          this.webGLUtil.createWebGLShaderObject(shaders[2], gl.FRAGMENT_SHADER),
          this.webGLUtil.createWebGLShaderObject(shaders[3], gl.FRAGMENT_SHADER),
          this.webGLUtil.createWebGLShaderObject(shaders[4], gl.FRAGMENT_SHADER),
          this.webGLUtil.createWebGLShaderObject(shaders[5], gl.FRAGMENT_SHADER),
          this.webGLUtil.createWebGLShaderObject(shaders[6], gl.FRAGMENT_SHADER),
          this.webGLUtil.createWebGLShaderObject(shaders[7], gl.FRAGMENT_SHADER),
          this.webGLUtil.createWebGLShaderObject(shaders[8], gl.FRAGMENT_SHADER),
          this.webGLUtil.createWebGLShaderObject(shaders[9], gl.FRAGMENT_SHADER),
        ];
        
        shaders.forEach((shader, i) => {
          if((i !== 0) && (i !== 10) && (i !== 11)){
            this.artPObjects.push(this.webGLUtil.createWebGLProgramObject(artSObjects[0], artSObjects[i]));
          }
        });
        const outputVsObject = this.webGLUtil.createWebGLShaderObject(shaders[10], gl.VERTEX_SHADER);
        const outputFsObject = this.webGLUtil.createWebGLShaderObject(shaders[11], gl.FRAGMENT_SHADER);
        this.outputProgramObject = this.webGLUtil.createWebGLProgramObject(outputVsObject, outputFsObject);

        this.setLocation();

        resolve();
      });
    });
  }

  loadShader(pathArray){
    if(!Array.isArray(pathArray)) {
      throw new Error('invalid argument');
    }
    const promises = pathArray.map((path) => {
      return fetch(path)
      .then((response) => {
        return response.text(); 
      });
    });
    return Promise.all(promises);
  }

  setLocation() {
    const gl = this.gl;
    
    // art locationとuniform設定
    this.artAttLocations = [];
    this.artStride = [3];
    this.artUniLocations = [];
    this.artUniType = ['uniform2fv', 'uniform1f'];
    for(let i=0; i< this.artPObjects.length; i++){
      this.artAttLocations.push(
        [
          gl.getAttribLocation(this.artPObjects[i], 'position'),
        ]
      );
      this.artUniLocations.push(
        [
          gl.getUniformLocation(this.artPObjects[i], 'uWindowResolution'),
          gl.getUniformLocation(this.artPObjects[i], 'uTime'),
        ]
      );
    }

    // 既定location設定
    this.outputAttLocation = [
      gl.getAttribLocation(this.outputProgramObject, 'position'),
      gl.getAttribLocation(this.outputProgramObject, 'color'),
      gl.getAttribLocation(this.outputProgramObject, 'texCoord'),
    ];
    this.outputAttLocation.forEach((attL, index) => {
      if(attL === -1) throw new Error(`array number ${index} not be retrieved from attribute location.`);
    });
    this.outputAttStride = [3, 4, 2];
    // 既定 uniform設定
    this.outputUniLocation = [
      gl.getUniformLocation(this.outputProgramObject, 'uWindowResolution'),
      gl.getUniformLocation(this.outputProgramObject, 'uTime'),
      gl.getUniformLocation(this.outputProgramObject, 'uTextureUnit0'),
      gl.getUniformLocation(this.outputProgramObject, 'uTextureFlag'),
      gl.getUniformLocation(this.outputProgramObject, 'uMvpMatrix'),
    ];
    this.outputUniLocation.forEach((uniL, index) => {
      if(uniL === null) throw new Error(`array number ${index} not be retrieved from uniform location.`);
    });
    this.outputUniType = ['uniform2fv', 'uniform1f', 'uniform1i', 'uniform1i', 'uniformMatrix4fv'];
  }

  setOffscreenRendering() {
    const gl = this.gl;
    const size = 512;
    const artIndexLength = this.art.index.length;
    gl.clearColor(0.5, .5, .5, 1.0);

    this.frameBufferObjects = [];
    for(let i = 0; i < this.artPObjects.length; i++) {
      this.frameBufferObjects.push(this.webGLUtil.createWebGLFrameBuffer(size, size));
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferObjects[i].f);
      gl.viewport(0, 0, size, size);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(this.artPObjects[i]);
      this.webGLUtil.setWebGLAttribute(this.artVBO, this.artAttLocations[i], this.artStride, this.artIBO);
      this.webGLUtil.setWebGLUniform([
        [size, size],
        0.5,
      ],
      this.artUniLocations[i],
      this.artUniType
      );
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.frameBufferObjects[i].t);
      gl.drawElements(gl.TRIANGLES, artIndexLength, gl.UNSIGNED_SHORT, 0);
    }
   
    this.textures = [
      this.frameBufferObjects[0].t,
      this.frameBufferObjects[1].t,
      this.frameBufferObjects[2].t,
      this.frameBufferObjects[3].t,
      this.frameBufferObjects[4].t,
      this.frameBufferObjects[5].t,
      this.frameBufferObjects[6].t,
      this.frameBufferObjects[7].t,
      this.frameBufferObjects[8].t,
    ];
  }

  setGeometry() {
    const tileColor = [1.0, 1.0, 1.0, 1.0];
    const artColor = [0.0, 0.0, 0.0, 1.0];
    
    // 額縁
    this.tile = this.webGLGeo.plane(2, 2, tileColor);
    this.tileVBO = [
      this.webGLUtil.createWebGLVBO(this.tile.position),
      this.webGLUtil.createWebGLVBO(this.tile.color),
      this.webGLUtil.createWebGLVBO(this.tile.texCoord),
    ];
    this.tileIBO = this.webGLUtil.createWebGLIBO(this.tile.index);

    // アートを貼り付ける板
    this.artBoard = this.webGLGeo.plane(2, 2, artColor);
    this.artBoardVBO = [
      this.webGLUtil.createWebGLVBO(this.artBoard.position),
      this.webGLUtil.createWebGLVBO(this.artBoard.color),
      this.webGLUtil.createWebGLVBO(this.artBoard.texCoord),
    ];
    this.artBoardIBO = this.webGLUtil.createWebGLIBO(this.artBoard.index);

    // アート
    this.art = {
      position: [
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
      ],
      index: [0, 1, 2, 2, 1, 3],
    };
    this.artVBO = [this.webGLUtil.createWebGLVBO(this.art.position)];
    this.artIBO = this.webGLUtil.createWebGLIBO(this.art.index);
  }

  setGridLayout() {
    if(!this.isReady) return;
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.05, 0.05, 0.05, 1.0);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.outputProgramObject);
    this.setModelViewProjectionMatrix();
    
    const screenPercentage = 0.85;
    const div = 3; // タイルの行と列の数
    const spacing = 20.5; // タイル間の間隔
    const size = (screenPercentage * Math.min(Config.width, Config.height)) / div;
    const artBoardScaleSize = size * 0.85; // タイルの85%のサイズでスケーリング
    const range = size * div + spacing * (div - 1); // タイル全体の幅と高さ
    this.tileRects = []; // 各tileの中心座標と寸法
    this.artBoardRects = []; // 各artBoardの中心座標 x,y とscale size を保持

    const t = WebGLMath.Mat4.identity();
    const commonMatrix = WebGLMath.Mat4.identity(t);
    const tileIndexLength = this.tile.index.length;
    const artBoardIndexLength = this.artBoard.index.length;
    let index = 0;

    // 3*3のtileとartBoardを描画
    for(let xi = 0; xi < div; xi++) {
      for(let yi = 0; yi < div; yi++) {
        const x = -range / 2 + xi * (size + spacing) + size / 2;
        const y = -range / 2 + yi * (size + spacing) + size / 2;
  
        // tileの描画
        WebGLMath.Mat4.identity(commonMatrix);
        WebGLMath.Mat4.translate(commonMatrix, [x, y, 0.0], commonMatrix);
        this.mMatrix = commonMatrix;
        WebGLMath.Mat4.scale(this.mMatrix, [size*0.5, size*0.5, 0.0], this.mMatrix);
        
        this.mvpMatrix = WebGLMath.Mat4.multiply(this.vpMatrix, this.mMatrix);
        this.webGLUtil.setWebGLUniform(
          [
            [this.canvas.width, this.canvas.height],
            0,
            0, // texture unit 番号
            0, // フラグ
            [...this.mvpMatrix],
          ],
          this.outputUniLocation,
          this.outputUniType
        );
        this.webGLUtil.setWebGLAttribute(this.tileVBO, this.outputAttLocation, this.outputAttStride, this.tileIBO);
        gl.drawElements(gl.TRIANGLES, tileIndexLength, gl.UNSIGNED_SHORT, 0);

        // 各tileの 中心座標 x,y と寸法 size を保持
        this.tileRects.push({originX:x, originY:y, halfRectX: size * 0.5, halfRectY: size * 0.5});

        // artBoardの描画
        WebGLMath.Mat4.identity(commonMatrix);
        WebGLMath.Mat4.translate(commonMatrix, [x, y, 0.0], commonMatrix);
        this.mMatrix = commonMatrix;
        WebGLMath.Mat4.scale(this.mMatrix, [artBoardScaleSize*0.5, artBoardScaleSize*0.5, 0.0], this.mMatrix);
        this.mvpMatrix = WebGLMath.Mat4.multiply(this.vpMatrix, this.mMatrix);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[index]);
        this.webGLUtil.setWebGLUniform(
          [
            [this.canvas.width, this.canvas.height],
            0,
            0, // texture unit 番号
            1, // フラグ
            [...this.mvpMatrix],
          ],
          this.outputUniLocation,
          this.outputUniType
        );
        this.webGLUtil.setWebGLAttribute(this.artBoardVBO, this.outputAttLocation, this.outputAttStride, this.artBoardIBO);
        gl.drawElements(gl.TRIANGLES, artBoardIndexLength, gl.UNSIGNED_SHORT, 0);
        // 各artBoardの 中心座標 x,y とscale size を保持
        this.artBoardRects.push({originX:x, originY:y, sizeX: artBoardScaleSize * 0.5, sizeY: artBoardScaleSize * 0.5});

        index++;
      }
    }
  }
  
  // ポインターとの2D衝突判定
  isPointerInRect() {
    // マウス座標を正規化
    const mouseXNormalized = (Pointer.x / Config.width) * Config.width - Config.width / 2;
    const mouseYNormalized = -((Pointer.y / Config.height) * Config.height - Config.height / 2);
    
    // マウスと各タイルの交差を判定
    if((mouseXNormalized > this.tileRects[0].originX - this.tileRects[0].halfRectX &&
      mouseXNormalized < this.tileRects[0].originX + this.tileRects[0].halfRectX &&
      mouseYNormalized > this.tileRects[0].originY - this.tileRects[0].halfRectY &&
      mouseYNormalized < this.tileRects[0].originY + this.tileRects[0].halfRectY)) {
        this.isRenderingTarget = 0;
    }else if((mouseXNormalized > this.tileRects[1].originX - this.tileRects[1].halfRectX &&
      mouseXNormalized < this.tileRects[1].originX + this.tileRects[1].halfRectX &&
      mouseYNormalized > this.tileRects[1].originY - this.tileRects[1].halfRectY &&
      mouseYNormalized < this.tileRects[1].originY + this.tileRects[1].halfRectY)) {
        this.isRenderingTarget = 1;

    } else if((mouseXNormalized > this.tileRects[2].originX - this.tileRects[2].halfRectX &&
      mouseXNormalized < this.tileRects[2].originX + this.tileRects[2].halfRectX &&
      mouseYNormalized > this.tileRects[2].originY - this.tileRects[2].halfRectY &&
      mouseYNormalized < this.tileRects[2].originY + this.tileRects[2].halfRectY)) {
        this.isRenderingTarget = 2;
        
    } else if((mouseXNormalized > this.tileRects[3].originX - this.tileRects[3].halfRectX &&
      mouseXNormalized < this.tileRects[3].originX + this.tileRects[3].halfRectX &&
      mouseYNormalized > this.tileRects[3].originY - this.tileRects[3].halfRectY &&
      mouseYNormalized < this.tileRects[3].originY + this.tileRects[3].halfRectY)) {
        this.isRenderingTarget = 3;

    } else if((mouseXNormalized > this.tileRects[4].originX - this.tileRects[4].halfRectX &&
      mouseXNormalized < this.tileRects[4].originX + this.tileRects[4].halfRectX &&
      mouseYNormalized > this.tileRects[4].originY - this.tileRects[4].halfRectY &&
      mouseYNormalized < this.tileRects[4].originY + this.tileRects[4].halfRectY)) {
        this.isRenderingTarget = 4;

    } else if((mouseXNormalized > this.tileRects[5].originX - this.tileRects[5].halfRectX &&
      mouseXNormalized < this.tileRects[5].originX + this.tileRects[5].halfRectX &&
      mouseYNormalized > this.tileRects[5].originY - this.tileRects[5].halfRectY &&
      mouseYNormalized < this.tileRects[5].originY + this.tileRects[5].halfRectY)) {
        this.isRenderingTarget = 5;

    } else if((mouseXNormalized > this.tileRects[6].originX - this.tileRects[6].halfRectX &&
      mouseXNormalized < this.tileRects[6].originX + this.tileRects[6].halfRectX &&
      mouseYNormalized > this.tileRects[6].originY - this.tileRects[6].halfRectY &&
      mouseYNormalized < this.tileRects[6].originY + this.tileRects[6].halfRectY)) {
        this.isRenderingTarget = 6;

    } else if((mouseXNormalized > this.tileRects[7].originX - this.tileRects[7].halfRectX &&
      mouseXNormalized < this.tileRects[7].originX + this.tileRects[7].halfRectX &&
      mouseYNormalized > this.tileRects[7].originY - this.tileRects[7].halfRectY &&
      mouseYNormalized < this.tileRects[7].originY + this.tileRects[7].halfRectY)) {
        this.isRenderingTarget = 7;

    } else if((mouseXNormalized > this.tileRects[8].originX - this.tileRects[8].halfRectX &&
      mouseXNormalized < this.tileRects[8].originX + this.tileRects[8].halfRectX &&
      mouseYNormalized > this.tileRects[8].originY - this.tileRects[8].halfRectY &&
      mouseYNormalized < this.tileRects[8].originY + this.tileRects[8].halfRectY)) {
        this.isRenderingTarget = 8;

    } else {
      this.isRenderingTarget = false;
    }
  }


  
  update({time, deltaTime}) {
    if(!this.isReady) return;

    if(Number.isInteger(this.isRenderingTarget)){
      const gl = this.gl;
      const size = 512;
      const targetNumber =  this.isRenderingTarget;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferObjects[targetNumber].f);
      gl.viewport(0, 0, size, size);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(this.artPObjects[targetNumber]);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.frameBufferObjects[targetNumber].t);
      this.webGLUtil.setWebGLAttribute(this.artVBO, this.artAttLocations[targetNumber], this.artStride, this.artIBO);
      this.webGLUtil.setWebGLUniform([
        [size, size],
        time,
      ],
      this.artUniLocations[targetNumber],
      this.artUniType
      );
      gl.drawElements(gl.TRIANGLES, this.art.index.length, gl.UNSIGNED_SHORT, 0);
      this.setGridLayout();
    }
  }
}