import { Enemy } from './enemy.js';

  export class SamuraiTaishou extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/SamuraiTaishou-Sheet.webp", 
        width: 48,  // 個別の幅
        height: 48,  // 個別の高さ
        sizeRatio: 33,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "SamuraiTaishou";
    }

  // 専用のスキルを作りたくなったらここに追加
  }