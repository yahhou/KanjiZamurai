import { Enemy } from './enemy.js';

  export class Oogama extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Oogama-Sheet.png", 
        hp: 25,
        mp: 0,
        atk: 15,
        def: 7,
        mdf: 10,
        eva: 0,
        critRate: 10,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 48,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Oogama";
      this.expReward = 22;
      
    }

  // 専用のスキルを作りたくなったらここに追加
  }