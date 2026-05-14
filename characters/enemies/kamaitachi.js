import { Enemy } from './enemy.js';

  export class Kamaitachi extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Kamaitachi-Sheet.png", 
        hp: 27,
        mp: 0,
        atk: 32,
        def: 12,
        mdf: 5,
        eva: 5,
        critRate: 10,
        width: 40,  // 個別の幅
        height: 40,  // 個別の高さ
        sizeRatio: 25,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Kamaitachi";
      this.expReward = 26;
    }

  // 専用のスキルを作りたくなったらここに追加
  }