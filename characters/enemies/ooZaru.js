import { Enemy } from './enemy.js';

  export class OoZaru extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/OoZaru-Sheet.png", 
        hp: 63,
        mp: 0,
        atk: 52,
        def: 35,
        mdf: 5,
        eva: 0,
        critRate: 10,
        width: 40,  // 個別の幅
        height: 40,  // 個別の高さ
        sizeRatio: 30,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "OoZaru";
      this.expReward = 22;
    }

  // 専用のスキルを作りたくなったらここに追加
  }