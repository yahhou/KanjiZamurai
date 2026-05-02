import { Enemy } from './enemy.js';

  export class Peasant extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/peasant-Sheet.png", 
        hp: 15,
        mp: 0,
        atk: 10,
        def: 5,
        mdf: 10,
        spd: 10,
        critRate: 10,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 47,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Peasant";
    }

  // 侍専用のスキルを作りたくなったらここに追加
  }