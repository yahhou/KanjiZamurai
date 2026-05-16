import { Enemy } from './enemy.js';

  export class IwaAtama extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/IwaAtama-Sheet.png", 
        hp: 30,
        mp: 0,
        atk: 25,
        def: 45,
        mdf: 5,
        eva: 0,
        critRate: 10,
        width: 40,  // 個別の幅
        height: 40,  // 個別の高さ
        sizeRatio: 25,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "IwaAtama";
      this.expReward = 350;
    }

  // 専用のスキルを作りたくなったらここに追加
  }