import { Enemy } from './enemy.js';

  export class OneEyedGoblinOyabun extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/OneEyedGoblinOyabun-Sheet.webp", 
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 53,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "OneEyedGoblinOyabun";
      
    }

  // 専用のスキルを作りたくなったらここに追加
  }