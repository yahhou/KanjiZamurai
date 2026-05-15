import { Enemy } from './enemy.js';

  export class AoOni extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/AoOni-Sheet.png", 
        hp: 34,
        mp: 0,
        atk: 18,
        def: 22,
        mdf: 5,
        eva: 0,
        critRate: 10,
        width: 40,  // 個別の幅
        height: 40,  // 個別の高さ
        sizeRatio: 25,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "AoOni";
      this.expReward = 22;
    }

  // 専用のスキルを作りたくなったらここに追加
  }