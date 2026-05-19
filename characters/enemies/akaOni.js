import { Enemy } from './enemy.js';

  export class AkaOni extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/AkaOni-Sheet.webp", 
        width: 40,  // 個別の幅
        height: 40,  // 個別の高さ
        sizeRatio: 25,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "AkaOni";
    }

  // 専用のスキルを作りたくなったらここに追加
  }