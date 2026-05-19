import { Enemy } from './enemy.js';

  export class PhantomDeer extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/PhantomDeer-Sheet.webp", 
        width: 56,  // 個別の幅
        height: 48,  // 個別の高さ
        sizeRatio: 30,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "PhantomDeer";
    }

  // 専用のスキルを作りたくなったらここに追加
  } 