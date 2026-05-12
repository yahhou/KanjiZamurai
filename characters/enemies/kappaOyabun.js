import { Enemy } from './enemy.js';

  export class KappaOyabun
   extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/KappaOyabun-Sheet.png", 
        hp: 25,
        mp: 0,
        atk: 17,
        def: 8,
        mdf: 8,
        eva: 0,
        critRate: 10,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 47,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "KappaOyabun";
      this.expReward = 25;
    }

  // 専用のスキルを作りたくなったらここに追加
  }