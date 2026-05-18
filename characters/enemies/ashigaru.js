import { Enemy } from './enemy.js';

  export class Ashigaru extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Ashigaru-Sheet.png", 
        width: 48,  // 個別の幅
        height: 48,  // 個別の高さ
        sizeRatio: 30,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Ashigaru";
    }

  // 専用のスキルを作りたくなったらここに追加
  }