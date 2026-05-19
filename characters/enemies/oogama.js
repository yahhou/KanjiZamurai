import { Enemy } from './enemy.js';

  export class Oogama extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Oogama-Sheet.webp", 
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 48,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Oogama";
    }

  // 専用のスキルを作りたくなったらここに追加
  }
