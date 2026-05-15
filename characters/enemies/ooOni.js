import { Enemy } from './enemy.js';

  export class OoOni extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/OoOni-Sheet.png", 
        hp: 62,
        mp: 0,
        atk: 35,
        def: 32,
        mdf: 5,
        eva: 0,
        critRate: 10,
        width: 48,  // 個別の幅
        height: 48,  // 個別の高さ
        sizeRatio: 35,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "OoOni";
      this.expReward = 200;
    }

  // 専用のスキルを作りたくなったらここに追加
  }