import { Enemy } from './enemy.js';

  export class Peasant extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/peasant-Sheet.png", 
        hp: 15,
        mp: 0,
        atk: 20,
        def: 4,
        mdf: 3,
        spd: 5,
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