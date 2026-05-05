import { Enemy } from './enemy.js';

  export class Shougun extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/Shougun-Sheet.png", 
        hp: 40,
        mp: 0,
        atk: 25,
        def: 10,
        mdf: 5,
        spd: 20,
        critRate: 10,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 55,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Shougun";
      this.expReward = 20;
    }

  // 専用のスキルを作りたくなったらここに追加
  }