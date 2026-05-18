import { Enemy } from './enemy.js';

  export class OoOni extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/OoOni-Sheet.png", 
        width: 48,  // 個別の幅
        height: 48,  // 個別の高さ
        sizeRatio: 35,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "OoOni";
    }

  // 専用のスキルを作りたくなったらここに追加
  }