class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");
    this.leaderBoardTitle = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.leftKeyActive = false;
    this.playerMoving = false;
  }
  getState(){
    var gameStateref = database.ref("gameState")
    gameStateref.on("value",function(data){
      gameState = data.val();
    })
  }
  update(state){
    database.ref("/").update({
      gameState: state
    })
  }
  start() {
    form = new Form();
    form.display();
    player = new Player();
    playerCount = player.getCount();

    car1 = createSprite(width/2-50,height-100);
    car1.addImage("car1",car1_img);
    car1.addImage("blast",blast);
    car1.scale = 0.07

    car2 = createSprite(width/2 + 100,height-100);
    car2.addImage("car2",car2_img);
    car2.addImage("blast",blast);
    car2.scale = 0.07



    cars = [car1,car2];
    obstaclesPositions = [
      {x: width/2+250, y:height-800,image:ob2},
      {x: width/2-150, y:height-1300,image:ob1}, 
      {x: width/2+250, y:height-1800,image:ob1}, 
      {x: width/2-180, y:height-2300,image:ob2}, 
      {x: width/2, y:height-2800,image:ob2}, 
      {x: width/2-180, y:height-3300,image:ob1}, 
      {x: width/2+180, y:height-3300,image:ob2}, 
      {x: width/2+250, y:height-3800,image:ob2}, 
      {x: width/2-150, y:height-4300,image:ob1}, 
      {x: width/2+250, y:height-4800,image:ob2}, 
      {x: width/2, y:height-5300,image:ob1}, 
      {x: width/2-180, y:height-5500,image:ob2}, 
      
    ]

    fuels = new Group();
    coins = new Group();
    obstacles = new Group();

    this.addSprites(fuels,4,fuel,0.02);
    this.addSprites(coins,18,gold,0.09);
    this.addSprites(obstacles,obstaclesPositions.length,ob1,0.04,obstaclesPositions);
  }
  handleElements(){
    form.hide()
    form.titleImage.position(40,50);
    form.titleImage.class("gameTitle2");
    this.resetTitle.html("Reset Game")
    this.resetTitle.class("resetText")
    this.resetTitle.position(width/2+200,40);
    this.resetButton.position(width/2+200,15);
    this.resetButton.class("resetButton");
    this.leaderBoardTitle.html("Leader Board");
    this.leaderBoardTitle.class("resetText");
    this.leaderBoardTitle.position(width/3-60,40);
    this.leader1.class("leadersText");
    this.leader1.position(width/3-50,80);
    this.leader2.class("leadersText");
    this.leader2.position(width/3-50,130);
  }
  play(){
    this.handleElements();
    this.handleResetButton();
    Player.getPlayersInfo();
    player.getCarsAtEnd();
    if(allPlayers !== undefined){
      image(track,0,-height*5,width,height*6);
      this.showLeaderboard();
      var index = 0
      for(var plr in allPlayers){
        index = index+1
        //Use data from the database to display the cars in x and y direction
        var x = allPlayers[plr].positionx
        var y = height-allPlayers[plr].positiony
        var currentLife = allPlayers[plr].life
        if(currentLife <= 0){
          cars[index-1].changeImage("blast");
          cars[index-1].scale = 0.3;
        }
        cars[index-1].position.x = x;
        cars[index-1].position.y = y;
        if(index === player.index){
          stroke(10)
          fill("yellow")
          ellipse(x,y,60,60);
          this.handleFuel(index)
          this.handlePowerCoins(index)
          this.handleObstacles(index)
          this.handleCarCollision(index);
          if(player.fuel > 0){
          this.decreaseFuel();
          }

          else{
            swal({
              title:  `Out Of Fuel!`,
              text: "You ran out of fuel!",
              imageUrl: "https://thumbs.dreamstime.com/b/empty-gas-tank-illustration-18241072.jpg" ,
              imageSize: "100x100",
              confirmButtonText: "I accept defeat. :("
          })
          gameState = 2
        }

          //changing camera position in Y direction
          //camera.position.x = cars[index-1].position.x
          camera.position.y = cars[index-1].position.y
         
        }
      }
      this.handlePlayercontrols();
      //finish line
      const finishLine = height*6 -100;
      if(player.positiony > finishLine){
        gameState = 2;
        player.rank +=1 ;
        Player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }

      drawSprites();
      this.showLife();
      this.showFuel();
      console.log(cars)

      
    }
    
  }
  showLeaderboard(){
    var leader1, leader2
    var players = Object.values(allPlayers);
    if(
      (players[0].rank === 0 && players[1].rank === 0) || players[0].rank === 1
    )
    {
      leader1 = 
      players[0].rank + 
      "&emsp;" + 
      players[0].name +
      "&emsp;" +
      players[0].score

      leader2 = 
      players[1].rank + 
      "&emsp;" + 
      players[1].name +
      "&emsp;" +
      players[1].score
    }
    if(
      players[1].rank === 1
    )
    {
      leader1 = 
      players[1].rank + 
      "&emsp;" + 
      players[1].name +
      "&emsp;" +
      players[1].score

      leader2 = 
      players[0].rank + 
      "&emsp;" + 
      players[0].name +
      "&emsp;" +
      players[0].score
      
    }
    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }
  handleResetButton(){
    this.resetButton.mousePressed(() =>{
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {},
        carsAtEnd: 0
      })
    window.location.reload();
    })
  }
  handlePlayercontrols(){
    if(player.life > 0){
      if(keyIsDown(UP_ARROW)){
        player.positiony += 10;
        player.update();
      }
      if(keyIsDown(LEFT_ARROW) && player.positionx > width/3 - 50 ){
        this.leftKeyActive = true;
        player.positionx -= 5;
        player.update();
      }
      if(keyIsDown(RIGHT_ARROW) && player.positionx < width/2 + 300){
        this.leftKeyActive = false;
        player.positionx += 5;
        player.update();
      }
    }
   
  }

  addSprites(spriteGrp, NumberOfSprites, spriteImg, scale, positions = []){
    for(var i = 0; i < NumberOfSprites; i++){
      var x,y
      if(positions.length>0){
        x = positions[i].x
        y = positions[i].y
        spriteImg = positions[i].image
      }
      else{
        x = random(width/2+150,width/2-150);
        y = random(-height*4.5,height-400)
      }
      var sprite = createSprite(x,y)
      sprite.addImage("sprite",spriteImg);
      sprite.scale = scale;
      spriteGrp.add(sprite);
    }
  }

  handleFuel(index){
  
    cars[index-1].overlap(fuels,function(collector,collected){
      if(player.fuel < 186){
      player.fuel = player.fuel + 10
      collected.remove()
    }
    else{
      collected.remove();
      swal({
        title:  `Full Fuel!`,
        text: "You cannot collect fuel if you are already full!",
        imageUrl: "https://image.shutterstock.com/image-vector/no-action-required-grunge-rubber-260nw-180270647.jpg" ,
        imageSize: "100x100",
        confirmButtonText: "Okay",
        
   
       })
    }
    })
  }
  handlePowerCoins(index){
    cars[index-1].overlap(coins,function(collector,collected){
      player.score += 5
      player.update();
      collected.remove();
    })
  }
  handleObstacles(index){
    if(cars[index-1].collide(obstacles)){
      if(player.life > 123){
      player.life = player.life - 62
      }
      else{
        player.life = 0;
        swal({
          title:  `Sorry!`,
          text: "You lost the game because you hit three obstacles! Drive safe!",
          imageUrl: "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png" ,
          imageSize: "100x100",
          confirmButtonText: "Okay", 
         })
         
         
      }
      if(this.leftKeyActive){
        player.positionx += 100;
      }
      else{
        player.positionx -= 100;
      }
      player.update();
    }
  }
  handleCarCollision(index){
    if(index === 1){
      if(cars[index-1].collide(cars[1])){
        if(player.life > 0){
          player.life -= 62;
        }
        if(this.leftKeyActive){
          player.positionx += 100;
        }
        else{
          player.positionx -= 100;
        }
        player.update();
      }
    }
    if(index === 2){
      if(cars[index-1].collide(cars[0])){
        if(player.life > 0){
          player.life -= 62;
        }
        if(this.leftKeyActive){
          player.positionx += 100;
        }
        else{
          player.positionx -= 100;
        }
        player.update();
      }
    }
  }

  showRank(){
    swal({
     title:  `Awesome!${"\n"}Rank${"\n"}${player.rank}`,
     text: "CONGRATULATIONS! YOU FINISHED THE GAME!",
     imageUrl: "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png" ,
     imageSize: "100x100",
     confirmButtonText: "Okay",


    })
  }
  decreaseFuel(){
    if(player.positiony % 300 === 0 && player.positiony > 0 ){
      player.fuel = player.fuel - 3;
    }
  }
  showLife(){
    push();
    image(lifee,width/2-130,height-player.positiony-350,20,20)
    fill("white");
    rect(width/2 - 100, height-player.positiony-350,186,20)
    fill("red");
    rect(width/2-100,height-player.positiony-350,player.life,20)
    
  }
  showFuel(){
    push();
    image(fuel,width/2-130,height-player.positiony-320,20,20)
    fill("white");
    rect(width/2-100,height-player.positiony-320,186,20);
    fill("yellow");
    rect(width/2-100,height-player.positiony-320,player.fuel,20)
  }
  endGame(){
    
  }
}
