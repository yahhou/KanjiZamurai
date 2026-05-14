import { Enemy } from './enemy.js';

  export class Genin extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Genin-Sheet.png", 
        hp: 38,
        mp: 0,
        atk: 21,
        def: 15,
        mdf: 5,
        eva: 5,
        critRate: 10,
        width: 40,  // 個別の幅
        height: 40,  // 個別の高さ
        sizeRatio: 25,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Genin";
      this.expReward = 30;
    }

  // 専用のスキルを作りたくなったらここに追加
  }