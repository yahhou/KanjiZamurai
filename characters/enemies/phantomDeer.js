import { Enemy } from './enemy.js';

  export class PhantomDeer extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/PhantomDeer-Sheet.png", 
        hp: 55,
        mp: 0,
        atk: 34,
        def:31,
        mdf: 5,
        eva: 0,
        critRate: 10,
        width: 56,  // 個別の幅
        height: 48,  // 個別の高さ
        sizeRatio: 30,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "PhantomDeer";
      this.expReward = 460;
    }

  // 専用のスキルを作りたくなったらここに追加
  } 