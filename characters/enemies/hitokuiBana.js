import { Enemy } from './enemy.js';

  export class HitokuiBana extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/HitokuiBana-Sheet.png", 
        width: 48,  // 個別の幅
        height: 48,  // 個別の高さ
        sizeRatio: 30,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "HitokuiBana";
    }

  // 専用のスキルを作りたくなったらここに追加
  } 