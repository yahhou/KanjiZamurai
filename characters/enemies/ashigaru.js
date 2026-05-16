import { Enemy } from './enemy.js';

  export class Ashigaru extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Ashigaru-Sheet.png", 
        hp: 32,
        mp: 0,
        atk: 25,
        def: 25,
        mdf: 5,
        eva: 5,
        critRate: 10,
        width: 48,  // 個別の幅
        height: 48,  // 個別の高さ
        sizeRatio: 30,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Ashigaru";
      this.expReward = 245;
    }

  // 専用のスキルを作りたくなったらここに追加
  }