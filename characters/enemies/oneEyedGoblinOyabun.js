import { Enemy } from './enemy.js';

  export class OneEyedGoblinOyabun extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/OneEyedGoblinOyabun-Sheet.png", 
        hp: 35,
        mp: 0,
        atk: 20,
        def: 15,
        mdf: 10,
        eva: 10,
        critRate: 10,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 53,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "OneEyedGoblinOyabun";
      this.expReward = 8;
      
    }

  // 専用のスキルを作りたくなったらここに追加
  }