import { Enemy } from './enemy.js';

  export class ObakeKinoko extends Enemy {
    constructor() {
      super({
        id: "enemy",          
        imgSrc: "assets/images/ObakeKinoko-Sheet.png", 
        width: 80,  // 個別の幅
        height: 80,  // 個別の高さ
        sizeRatio: 52,
        frameCount: 2,
        idleFrameCount: 2
      });
      this.name = "ObakeKinoko";
      
    }

  // 専用のスキルを作りたくなったらここに追加
  }