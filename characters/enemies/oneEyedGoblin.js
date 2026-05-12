import { Enemy } from './enemy.js';

  export class OneEyedGoblin extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/OneEyedGoblin-Sheet.png", 
        hp: 10,
        mp: 0,
        atk: 15,
        def: 5,
        mdf: 10,
        eva: 10,
        critRate: 10,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 47,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "OneEyedGoblin";
      this.expReward = 8;
      
    }

  // 専用のスキルを作りたくなったらここに追加
  }