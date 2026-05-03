import { Enemy } from './enemy.js';

  export class Ninja extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Ninja-Sheet.png", 
        hp: 10,
        mp: 0,
        atk: 10,
        def: 10,
        mdf: 5,
        spd: 99,
        critRate: 50,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 48,
        frameCount: 3,
        frameInterval: 50,
        idleFrameCount: 3,
        idleFrames: [0, 1, 2, 1]
      });
      this.name = "Ninja";
      this.expReward = 12;
    }

  // 専用のスキルを作りたくなったらここに追加
  }
