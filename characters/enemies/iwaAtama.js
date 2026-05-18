import { Enemy } from './enemy.js';

  export class IwaAtama extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/IwaAtama-Sheet.png", 
        width: 40,  // 個別の幅
        height: 40,  // 個別の高さ
        sizeRatio: 25,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "IwaAtama";
    }

  // 専用のスキルを作りたくなったらここに追加
  }