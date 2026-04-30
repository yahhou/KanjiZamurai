import { Player } from './player.js';

  export class Samurai extends Player {
    constructor() {
      super({
        id: "player",          
        imgSrc: "assets/images/Samurai-Sheet.png", 
        hp: 20,
        mp: 0,
        atk: 10,
        def: 5,
        mdf: 5,
        spd: 5,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 45,
        frameCount: 5,
        idleFrameCount: 2
      });
      this.name = "Samurai";
    }

  // 侍専用のスキルを作りたくなったらここに追加
  }