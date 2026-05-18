import { Enemy } from './enemy.js';

  export class ShiroOni extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/ShiroOni-Sheet.png", 
        width: 48,  // 個別の幅
        height: 56,  // 個別の高さ
        sizeRatio: 35,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Youko";
    }

  // 専用のスキルを作りたくなったらここに追加
  } 