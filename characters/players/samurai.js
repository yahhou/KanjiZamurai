
class Samurai extends Character {
  constructor() {
    // superの中で、スライムのデータをすべて決めてしまう
    super({
      id: "player",           // 
      imgSrc: "images.samurai.src,", 
      hp: 20,
      mp: 0,
      atk: 10,
      def: 5,
      mdf: 5,
      spd: 5,
 });
      frameCount: 2          // 2コマアニメ
      this.name = "Samurai";
  }
}