import { Enemy } from './enemy.js';

  export class ObakeKinoko extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/ObakeKinoko-Sheet.png", 
        hp: 27,
        mp: 0,
        atk: 13,
        def: 16,
        mdf: 10,
        eva: 0,
        critRate: 10,
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 52,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "ObakeKinoko";
      this.expReward = 27;
      
    }

  // 専用のスキルを作りたくなったらここに追加
  }