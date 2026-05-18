import { Enemy } from './enemy.js';

  export class OoZaru extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/OoZaru-Sheet.png", 
        width: 40,  // 個別の幅
        height: 40,  // 個別の高さ
        sizeRatio: 30,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "OoZaru";
    }

  // 専用のスキルを作りたくなったらここに追加
  }