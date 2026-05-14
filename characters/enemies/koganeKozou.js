import { Enemy } from './enemy.js';

  export class KoganeKozou extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/koganeKozou-Sheet.png", 
        hp: 10,
        mp: 0,
        atk: 1,
        def: 1,
        mdf: 5,
        eva: 5,
        critRate: 10,
        width: 40,  // 個別の幅
        height: 40,  // 個別の高さ
        sizeRatio: 18,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "KoganeKozou";
      this.expReward = 777;
    }

  // 専用のスキルを作りたくなったらここに追加
  }