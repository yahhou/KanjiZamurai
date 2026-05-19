import { Enemy } from './enemy.js';

  export class Kappa
   extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Kappa-Sheet.webp", 
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 47,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Kappa";
    }

  // 専用のスキルを作りたくなったらここに追加
  }