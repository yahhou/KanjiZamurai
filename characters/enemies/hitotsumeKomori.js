import { Enemy } from './enemy.js';

  export class HitotsumeKomori extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/HitotsumeKomori-Sheet.png", 
        hp: 35,
        mp: 0,
        atk: 19,
        def: 10,
        mdf: 5,
        eva: 0,
        critRate: 10,
        width: 40,  // 個別の幅
        height: 40,  // 個別の高さ
        sizeRatio: 25,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "HitotsumeKomori";
      this.expReward = 220;
    }

  // 専用のスキルを作りたくなったらここに追加
  }