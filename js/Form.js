class Form{
  constructor(){
    this.input = createInput("").attribute("placeholder", "Enter your name: ")
    this.playButton = createButton("PLAY")
    this.titleImage = createImg("./assets/title.png", "Game Title")
    this.greeting = createElement("h2")
  }
  setElementposition(){
    this.titleImage.position(120,50)
    this.input.position(width/2-110,height/2-80)
    this.playButton.position(width/2-90,height/2-20)
    this.greeting.position(width/2-300,height/2-100)
  }
  setElementStyle(){
    this.titleImage.class("gameTitle")
    this.input.class("customInput")
    this.playButton.class("customButton")
    this.greeting.class("greeting")
  }
  hide(){
    this.greeting.hide();
    this.playButton.hide();
    this.input.hide();
  }
  handleMousePressed(){
    this.playButton.mousePressed(() => {
      this.input.hide();
      this.playButton.hide();
      var message = ` Hello ${this.input.value()} </br>Wait for another player to join...`;
      this.greeting.html(message)
      playerCount += 1
      player.name = this.input.value()
      player.index = playerCount
      player.addPlayer();
      player.updateCount(playerCount);
      player.getDistance();
    })
  }
  display(){
    this.setElementposition();
    this.setElementStyle();
    this.handleMousePressed();
  }
}