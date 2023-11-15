import Config from '../state/Config.js';
import { Utility } from '../lib/utility.js';
import { WebGLMath }     from '../lib/math.js';

export default class BaseBoard {
  constructor() {
    this.setConfig();
    this.mMatrix     = WebGLMath.Mat4.identity(WebGLMath.Mat4.create());
    this.vMatrix     = WebGLMath.Mat4.identity(WebGLMath.Mat4.create());
    this.pMatrix     = WebGLMath.Mat4.identity(WebGLMath.Mat4.create());
    this.vpMatrix    = WebGLMath.Mat4.identity(WebGLMath.Mat4.create());
    this.mvpMatrix   = WebGLMath.Mat4.identity(WebGLMath.Mat4.create());
    this.setModelViewProjectionMatrix();
  }

  setModelViewProjectionMatrix() {
    const cameraPosition = WebGLMath.Vec3.create(0, 0, 0.1);
    const cameraPoint = WebGLMath.Vec3.create(0, 0, 0);
    const cameraUpDirection = WebGLMath.Vec3.create(0, 1, 0);
    // view 座標変換行列
    this.vMatrix = WebGLMath.Mat4.lookAt(cameraPosition, cameraPoint, cameraUpDirection);
    // Projection 座標変換行列
    this.left = -Config.width / 2;
    this.right = Config.width / 2;
    this.top = Config.height / 2;
    this.bottom = -Config.height / 2;
    this.near = 0.1;
    this.far = 1;
    this.pMatrix = WebGLMath.Mat4.ortho(this.left, this.right, this.top, this.bottom, this.near, this.far);
    // viewProjection 座標変換行列
    this.vpMatrix = WebGLMath.Mat4.multiply(this.pMatrix, this.vMatrix);
    this.camera = new Utility.InteractionCamera();
    this.camera.update();
    let quaternionMatrix = WebGLMath.Mat4.identity(WebGLMath.Mat4.create());
    quaternionMatrix = WebGLMath.Qtn.toMatIV(this.camera.qtn, quaternionMatrix);
    this.vpMatrix = WebGLMath.Mat4.multiply(this.vpMatrix, quaternionMatrix);
    // model 座標変換行列
    this.mMatrix = WebGLMath.Mat4.identity(this.mMatrix);
    // modelViewProjection 座標変換行列
    this.mvpMatrix = WebGLMath.Mat4.multiply(this.vpMatrix, this.mMatrix);
  }

  setConfig() {
    this.containerEl = document.querySelector('.container');
    const {width, height} = this.containerEl.getBoundingClientRect();

    Config.width = width;
    Config.height = height;
    Config.halfWidth = Config.width / 2;
    Config.halfHeight = Config.height / 2;
    Config.devicePixelRatio = Math.min(window.devicePixelRatio, 2);
    Config.aspectRatio = Config.width / Config.height;
  }

  resizeScreen() {
    if(window.innerWidth >= window.innerHeight) {
      Config.screenWidth = 2;
      Config.screenHeight = 2 / Config.aspectRatio;
    } else {
      Config.screenWidth = 2 * Config.aspectRatio;
      Config.screenHeight = 2;
    }
    this.left = -Config.width / 2;
    // this.left = -Config.screenWidth * 0.5;
    this.right = Config.height / 2;
    // this.right = Config.screenWidth * 0.5;
    this.top = Config.height / 2;
    // this.top = Config.screenHeight * 0.5;
    this.bottom = -Config.height / 2;
    // this.bottom = -Config.screenHeight * 0.5;
    this.pMatrix = WebGLMath.Mat4.ortho(this.left, this.right, this.top, this.bottom, this.near, this.far);
    this.vpMatrix = WebGLMath.Mat4.multiply(this.pMatrix, this.vMatrix);
  }
}