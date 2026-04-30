import { Enemy } from './enemy.js';

  export class Peasant extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/peasant-Sheet.png", 
        hp: 12,
        mp: 0,
        atk: 4,
        def: 2,
        mdf: 1,
        spd: 4,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 50,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "Peasant";
    }

  // 侍専用のスキルを作りたくなったらここに追加
  }