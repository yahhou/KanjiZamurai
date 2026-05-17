import { Enemy } from './enemy.js';

  export class Monk extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Monk-Sheet.png", 
        hp: 30,
        mp: 0,
        atk: 30,
        def: 30,
        mdf: 5,
        eva: 0,
        critRate: 10,
        width: 40,  // 個別の幅
        height: 40,  // 個別の高さ
        sizeRatio: 27,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "AoOni";
      this.expReward = 333;
    }

  // 専用のスキルを作りたくなったらここに追加
  }