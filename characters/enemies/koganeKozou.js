import { Enemy } from './enemy.js';

  export class KoganeKozou extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/KoganeKozou-Sheet.png", 
        width: 40,  // 個別の幅
        height: 40,  // 個別の高さ
        sizeRatio: 18,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "KoganeKozou";
    }

  // 専用のスキルを作りたくなったらここに追加
  }