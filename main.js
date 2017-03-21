/*jslint node: true */
/*jshint esversion: 6 */
/*globals $:false */

 "use strict";
function enable_hover(){
  $(document).ready(function(){
      $(".grid-col").hover(function(){

          let x = parseInt(this.id.substring(6, this.id.indexOf("-")).trim());
          let y = parseInt(this.id.substring(this.id.indexOf("-") + 1, this.id.length).trim());

          let color_class = ";";
          if((((x + game.currentShip) > game.size && game.horizontal === false) ||
                        (y + game.currentShip) > game.size && game.horizontal === true)){
              color_class = "invalidHover";
              $(".grid-col").removeAttr("onClick");
          }else{
              color_class = "validHover";
              $(".grid-col").attr("onClick","toggle(this.id)");
          }

          for(let i = 0; i < game.currentShip; ++i){
            const id = game.horizontal === true ? `#button${x}-${y + i}` : `#button${x + i}-${y}`;
            $(id).addClass(color_class);
          }

          }, function(){
          let x = parseInt(this.id.substring(6, this.id.indexOf("-")).trim());
          let y = parseInt(this.id.substring(this.id.indexOf("-") + 1, this.id.length).trim());
          for(let i = 0; i < game.currentShip; ++i){
            const id = game.horizontal === true ? `#button${x}-${y + i}` : `#button${x + i}-${y}`;
            $(id).removeClass("invalidHover validHover");
          }
      });
  });
}

 function Player(id, size){
   this.gameBoard = Array.apply(null, Array(size + 1)).map(function() { return 0 });

   this.ships = [ {name:"carier", number:1, size:1, horizontal:null, coordinates:[]} ,
                  {name:"battleship", number:2, size:2, horizontal:null, coordinates:[]} ,
                  {name:"cruiser", number:3, size:3, horizontal:null, coordinates:[]} ,
                  {name:"submarine", number:4, size:4,horizontal:null, coordinates:[]} ,
                  {name:"destroyer", number:5, size:5,horizontal:null, coordinates:[]}
                ];
  this.shipsInGame = [];
  this.id =  id;
  this.shots = 0;
  this.hits = 0;
  this.history = [];
 }

 function Game(size){
   this.player1 = new Player(1, size);
   this.player2 = new Player(2, size);
   this.stage =  "ship-placement";
   this.turn = 1;
   this.size = size;
   this.currentShip = 1;
   this.horizontal = true;
 }

 var game;

function createGrid(size){
  let gridString = "";

  gridString += `<div class="grid-row">`;
  for(let i = 0; i < game.size + 1; ++i){
    gridString += `<div class="grid-col-no-border text-info">${i}</div>`;
  }
  gridString += `</div>`;

  for(let i = 0; i < game.size ; ++i){
    gridString += `<div class="grid-row">`;
    for(let j = 0; j < game.size  + 1; ++j){
      if(j === 0){
        gridString += `<div class="grid-col-no-border text-info">${i + 1}</div>`;
      }else{
        gridString += `<div class="grid-col border-left-2 text-info"
                      onClick="toggle(this.id)" id="button${i}-${j - 1}"></div>`;
      }
    }
    gridString += `</div>`;
  }
  $('#grid-container').html(gridString);
}

function rotateShip(){
  game.horizontal = game.horizontal === true ? false : true;
}


function startGame(){
  $("#start-button").css("display", "none");
  const size = 9;

  game = new Game(size);

  createGrid(size);

  $("#status-text").html(`Player 1, place your ${game.player1.ships[0].name}!`);

  enable_hover();

  $("#rotateButton").css("display","block");


  for(let i = 0; i < game.size; ++i){
    game.player1.gameBoard[i] = [];
    game.player2.gameBoard[i] = [];
    for(let j = 0; j < game.size ; ++j){
      game.player1.gameBoard[i][j] = 0;
      game.player2.gameBoard[i][j] = 0;
    }
  }
}


function getBoatById(boatList, id){
  for(let i = 0; i < boatList.length; ++i){
    if(boatList[i].number === id) return boatList[i];
  }
  return -1;
}

function removeBoatById(boatList, id){
  for(let i = 0; i < boatList.length; ++i){
    console.log(boatList[i].number + " - " + id);
    if(boatList[i].number === id) {
      console.log("REMOVED");
      boatList.splice(i, 1);
    }
  }
}

function changeTurn(){
  $(".grid-col").html("");
  $(".grid-col").attr("onClick","toggle(this.id)");
  $(".grid-col").removeClass("hit miss sunkPart sunk");
  console.log("turn: " + game.turn);
  game.turn = game.turn === 1 ? 2 : 1;
  console.log("turn: " + game.turn);
  let player = game.turn === 1 ? game.player1 : game.player2;

/*  player.shipsInGame.forEach(function(boat){
    boat.coordinates.forEach(function(coordinate){
      $(`#button${coordinate.x}-${coordinate.y}`).html(boat.number);
    });
  });*/

  player.history.forEach(function(event){
    if(event.type === 1){
      $(`#button${event.x}-${event.y}`).html("x");
      $(`#button${event.x}-${event.y}`).addClass("sunkPart");
    }
    else if(event.type === 2){
      $(`#button${event.x}-${event.y}`).removeAttr("onClick");
      $(`#button${event.x}-${event.y}`).addClass("hit");
    }
    else if(event.type === 3){
      $(`#button${event.x}-${event.y}`).removeAttr("onClick");
      $(`#button${event.x}-${event.y}`).addClass("miss");
    }
  });
}


function placementDone(){
  changeTurn();
  if(game.turn === 1){
    game.stage = "main";
    $(".grid-col").unbind('mouseenter mouseleave');
    printStatus();
    $("#rotateButton").css("display","none");
  }else{
    $("#status-text").html(`Player ${game.turn}, place your ${game.player2.ships[0].name}!`);
  }

}

function printStatus(){
  $("#status-text").html(`Player ${game.player1.id}
                            ships: ${game.player1.shipsInGame.length}
                            shots: ${game.player1.shots}
                            hits: ${game.player1.hits} </br>
                          Player  ${game.player2.id}
                            ships: ${game.player2.shipsInGame.length}
                            shots: ${game.player2.shots}
                            hits: ${game.player2.hits}</br>
                            Turn: ${game.turn}
                          `);
}

function checkBoard(xIndex, yIndex, player){
  console.log(player.ships);
  const boat = player.ships[0];
  if(game.horizontal === true){
    for(let y = 0; y < boat.size; ++y){
      if(player.gameBoard[xIndex][yIndex + y] !== 0){
        return false;
      }
    }
  }
  return true;
}


function placeShip(player, elementId){
    const xIndex = parseInt(elementId.slice(6, elementId.indexOf("-")));
    const yIndex = parseInt(elementId.slice(elementId.indexOf("-") + 1, elementId.length));

    if(player.ships.length && checkBoard(xIndex, yIndex, player)) {
      let boat = player.ships.splice(0, 1)[0];
      boat.horizontal = game.horizontal;
      for(let i = 0; i < game.currentShip; ++i){
        const id = boat.horizontal === true ? `#button${xIndex}-${yIndex+ i}` : `#button${xIndex + i}-${yIndex}`;
        $(id).html(boat.number);
        if(boat.horizontal === true){
          player.gameBoard[xIndex][yIndex + i] = boat.number;
          boat.coordinates.push({x:xIndex,y:yIndex + i,alive:true});
        }else{
          player.gameBoard[xIndex + i][yIndex] = boat.number;
          boat.coordinates.push({x:xIndex + i,y:yIndex,alive:true});
        }
      }
      player.shipsInGame.push(boat);
      removeBoatById(player.ships, boat.number);
    }
    else if(player.gameBoard[xIndex][yIndex] !== 0){
      let boat = getBoatById(player.shipsInGame, player.gameBoard[xIndex][yIndex]);
      console.log(boat.coordinates);
      for(let i = 0; i < boat.size; ++i){
          player.gameBoard[boat.coordinates[i].x][boat.coordinates[i].y] = 0;
          $(`#button${boat.coordinates[i].x}-${boat.coordinates[i].y}`).html("");
          $(".grid-col").removeClass("validHover invalidHover");
        }
      boat.coordinates = [];
      removeBoatById(player.shipsInGame, boat.number);
      player.ships.unshift(boat);
      game.currentShip = boat.number;
    }

    if(player.ships.length === 0){
        $("#status-text").html(`<button type="button" class="btn-success"
                                onClick="placementDone()">Happy player ${game.turn}?</button>`);
        $(".grid-col").removeClass("validHover invalidHover");
        game.currentShip = 1;
    }
}

function makeMove(player, opponenet, elementId){
  const xIndex = elementId.slice(6, elementId.indexOf("-"));
  const yIndex = elementId.slice(elementId.indexOf("-") + 1, elementId.length);
  ++player.shots;
  if(opponenet.gameBoard[xIndex][yIndex] !== 0){
    ++player.hits;
    // Get boat is a bit buggy
    console.log(opponenet.gameBoard[xIndex][yIndex]);
    const boat = getBoatById(opponenet.shipsInGame, opponenet.gameBoard[xIndex][yIndex]);
    console.log(boat);
    for(let i = 0; i < boat.coordinates.length; ++i){
      if(boat.coordinates[i].x === parseInt(xIndex) && boat.coordinates[i].y === parseInt(yIndex) && boat.coordinates[i].alive === true){
        boat.coordinates[i].alive = false;
        opponenet.history.push({x:xIndex, y:yIndex, type:1});
      }
    }
    let stillAlive = false;
    for(let i = 0; i < boat.coordinates.length; i++){
      if(boat.coordinates[i].alive) {
        stillAlive = true;
      }
    }
    if(!stillAlive){
      removeBoatById(opponenet.shipsInGame, opponenet.gameBoard[xIndex][yIndex]);
    }
    player.history.push({x:xIndex, y:yIndex, type:2});
    $(`#${elementId}`).addClass("hit");

  }else{
    player.history.push({x:xIndex, y:yIndex, type:3});
    $(`#${elementId}`).addClass("miss");
  }
}

function toggle(elementId){

  if(game.stage === "ship-placement"){
    if(game.turn === 1){
      placeShip(game.player1, elementId);
    }
    else if(game.turn === 2){
      placeShip(game.player2, elementId);
    }
    const player = game.turn === 1 ? game.player1 : game.player2;
    if(player.ships.length !== 0){
      game.currentShip = player.ships[0].number;
      $("#status-text").html(`Player ${game.turn}, place your ${player.ships[0].name}!`);
    }
  }

  if(game.stage === "main"){

    if(game.turn === 1){
      makeMove(game.player1, game.player2, elementId);
    }
    else if(game.turn === 2){
      makeMove(game.player2, game.player1, elementId);
    }
    if(game.player1.shipsInGame.length === 0 ){
      $("#status-text").html(`Player 2 wins!`);
      $("#start-button").css("display","block");
      $("#grid-container").html("");
      $("#rotateButton").css("display","none");

      return;
    }

    if(game.player2.shipsInGame.length === 0){
      $("#status-text").html(`Player 1 wins!`);
      $("#start-button").css("display","block");
      $("#grid-container").html("");
      $("#rotateButton").css("display","none");

      return;

    }
    setTimeout(function(){
      changeTurn(elementId);
      printStatus();
    }, 750);
  }
}
