import { Enemy } from './enemy.js';

  export class SamuraiTaishou extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/SamuraiTaishou-Sheet.png", 
        hp: 70,
        mp: 0,
        atk: 45,
        def: 42,
        mdf: 5,
        eva: 0,
        critRate: 10,
        width: 48,  // 個別の幅
        height: 48,  // 個別の高さ
        sizeRatio: 33,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "SamuraiTaishou";
      this.expReward = 650;
    }

  // 専用のスキルを作りたくなったらここに追加
  }