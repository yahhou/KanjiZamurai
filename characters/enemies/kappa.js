import { Enemy } from './enemy.js';

  export class Kappa
   extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Kappa-Sheet.png", 
        hp: 20,
        mp: 0,
        atk: 12,
        def: 2,
        mdf: 5,
        eva: 0,
        critRate: 10,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 47,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Kappa";
      this.expReward = 8;
    }

  // 専用のスキルを作りたくなったらここに追加
  }