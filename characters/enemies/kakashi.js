import { Enemy } from './enemy.js';

  export class Kakashi extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Kakashi-Sheet.png", 
        hp: 38,
        mp: 0,
        atk: 21,
        def: 12,
        mdf: 5,
        eva: 0,
        critRate: 10,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 52,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "kakashi";
      this.expReward = 27;
    }

  // 専用のスキルを作りたくなったらここに追加
  }