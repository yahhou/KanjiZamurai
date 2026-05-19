import { Enemy } from './enemy.js';

  export class Youko extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Youko-Sheet.webp", 
        width: 56,  // 個別の幅
        height: 48,  // 個別の高さ
        sizeRatio: 30,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Youko";
    }

  // 専用のスキルを作りたくなったらここに追加
  } 