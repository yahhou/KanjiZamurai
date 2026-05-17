import { Enemy } from './enemy.js';

  export class HitokuiBana extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/HitokuiBana-Sheet.png", 
        hp: 45,
        mp: 0,
        atk: 32,
        def:18,
        mdf: 5,
        eva: 0,
        critRate: 10,
        width: 48,  // 個別の幅
        height: 48,  // 個別の高さ
        sizeRatio: 30,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "HitokuiBana";
      this.expReward = 400;
    }

  // 専用のスキルを作りたくなったらここに追加
  } 