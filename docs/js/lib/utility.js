import { WebGLMath } from './math.js';
export class Utility {
  static get InteractionCamera() {return InteractionCamera;}
}

class InteractionCamera {
  constructor(){
    this.q = WebGLMath.Qtn;
    this.qtn               = this.q.identity(this.q.create());
    this.dragging          = false;
    this.prevMouse         = [0, 0];
    this.rotationScale     = Math.min(window.innerWidth, window.innerHeight);
    this.rotation          = 0.0;
    this.rotateAxis        = [0.0, 0.0, 0.0];
    this.rotatePower       = 2.0;
    this.rotateAttenuation = 0.9;
    this.scale             = 1.0;
    this.scalePower        = 0.0;
    this.scaleAttenuation  = 0.8;
    this.scaleMin          = 0.25;
    this.scaleMax          = 2.0;
    this.startEvent        = this.startEvent.bind(this);
    this.moveEvent         = this.moveEvent.bind(this);
    this.endEvent          = this.endEvent.bind(this);
    this.wheelEvent        = this.wheelEvent.bind(this);
    
  }
  // mouse down event
  startEvent(eve){
    
    this.dragging  = true;
    this.prevMouse = [eve.clientX, eve.clientY];
  }
  // mouse move event 
  moveEvent(eve){
  
    if(this.dragging !== true) { return };
    const x            = this.prevMouse[0] - eve.clientX;
    const y            = this.prevMouse[1] - eve.clientY;
    this.rotation      = Math.sqrt(x * x + y * y) / this.rotationScale * this.rotatePower;
    this.rotateAxis[0] = y;
    this.rotateAxis[1] = x;
    this.prevMouse     = [eve.clientX, eve.clientY];
  }
  // mouse up event
  endEvent(){
    this.dragging = false;
  }
  // wheel event
  wheelEvent(eve){
    const w = eve.wheelDelta;
    const s = this.scaleMin * 0.1;
    if(w > 0){
      this.scalePower = -s;
    } else {
      this.scalePower = s;
    }
  }
  // quaternion update
  update(){
    this.scalePower *= this.scaleAttenuation;
    this.scale       = Math.max(this.scaleMin, Math.min(this.scaleMax, this.scale + this.scalePower));
    if(this.rotation === 0.0) { return };
    this.rotation *= this.rotateAttenuation;
    const q = this.q.identity(this.q.create());
    this.q.rotate(this.rotation, this.rotateAxis, q);
    this.q.multiply(this.qtn, q, this.qtn);
  }
}