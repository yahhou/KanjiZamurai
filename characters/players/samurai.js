import { Player } from  './characterManager.js';

  export class Samurai extends Player {
    constructor() {
    // superの中で、スライムのデータをすべて決めてしまう
      super({
        id: "player",           // 
        imgSrc: "assets.images.samurai.src", 
        hp: 20,
        mp: 0,
        atk: 10,
        def: 5,
        mdf: 5,
        spd: 5,
        frameCount: 2    
      });
      this.name = "Samurai";
    }
  }