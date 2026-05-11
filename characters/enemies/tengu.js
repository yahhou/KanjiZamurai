import { Enemy } from './enemy.js';

  export class Tengu extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/tengu-Sheet.png", 
        hp: 40,
        mp: 0,
        atk: 25,
        def: 10,
        mdf: 5,
        eva: 20,
        critRate: 10,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 52,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Tengu";
      this.expReward = 30;
    }

  // 専用のスキルを作りたくなったらここに追加
  }