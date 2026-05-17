import { Enemy } from './enemy.js';

  export class Youko extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Youko-Sheet.png", 
        hp: 50,
        mp: 0,
        atk: 26,
        def:20,
        mdf: 5,
        eva: 0,
        critRate: 10,
        width: 56,  // 個別の幅
        height: 48,  // 個別の高さ
        sizeRatio: 30,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Youko";
      this.expReward = 400;
    }

  // 専用のスキルを作りたくなったらここに追加
  } 