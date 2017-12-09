var buttonStartLeft = 281.75;
var buttonStartTop = -22.25;
var stoneStartLeft = 278.25;
var stoneStartTop = -25.75;
var turnCounter = 0;
var arrayRow = new Array();
function stonePlacer(xIndex, yIndex){
  if (turnCounter % 2 == 0){
    var whiteStone = document.createElement("img");
    whiteStone.className = "stone-image";
    whiteStone.id = xIndex + "w" + yIndex;
    whiteStone.style = "top:"+(stoneStartTop+yIndex*31.25)+"px; left:"+(stoneStartLeft+xIndex*31.25)+"px";
    whiteStone.src = "images/white_piece.svg";
    var gameHolder = document.getElementById('game_holder');
    gameHolder.appendChild(whiteStone);
    arraySet(xIndex,yIndex,"w");
    deadStoneChecker(xIndex, yIndex);
  }
  else if (turnCounter % 2 != 0){
    var blackStone = document.createElement("img");
    blackStone.className = "stone-image";
    blackStone.id = xIndex + "b" + yIndex;
    blackStone.style = "top:"+(stoneStartTop+yIndex*31.25)+"px; left:"+(stoneStartLeft+xIndex*31.25)+"px";
    blackStone.src = "images/black_piece.svg";
    var gameHolder = document.getElementById('game_holder');
    gameHolder.appendChild(blackStone);
    arraySet(xIndex,yIndex,"b");
    deadStoneChecker(xIndex, yIndex);
  }
  turnCounter++;
}
function divCreator(xIndex,yIndex){
    var d = document.createElement("div")
    d.id = xIndex+"x"+yIndex;
    d.className = "cross-button";
    d.style = "top:"+(buttonStartTop+yIndex*31.25)+"px; left:"+(buttonStartLeft+xIndex*31.25)+"px";
    d.addEventListener("mousedown", function (){stonePlacer(xIndex,yIndex);});
    var gameHolder = document.getElementById('game_holder');
    gameHolder.appendChild(d);
}
function squareMaker(xIndex, yIndex){
  this.xIndex = xIndex;
  this.yIndex = yIndex;
  divCreator(xIndex, yIndex);
}
function initializer(){
  for(x=1; x<20; x++){
    for(y=1; y<20; y++){
      squareMaker(x,y);
    }
  }
  for(x=0; x<21; x++){
    var arrayColumn = new Array();
    for(y=0; y<21; y++){
      if (x == 0 || x == 20){arrayColumn[y] = "e";}
      else if (y == 0 || y== 20) {arrayColumn[y] = "e";}
      else {arrayColumn[y] = 0;}
    }
    arrayRow[x] = arrayColumn;
  }
}
initializer();
function arrayGet(xIndex, yIndex){
  var arrayColumnTemp = arrayRow[xIndex];
  return arrayColumnTemp[yIndex];
}
function arraySet(xIndex, yIndex, value){
  var arrayColumnTemp = arrayRow[xIndex];
  arrayColumnTemp[yIndex] = value;
  arrayRow[xIndex] = arrayColumnTemp;
}

//Stone Remover Algorithm

//Runs each turn to check for stones that are potentially dead.
var stoneGroupFinderTrigger = false;

function deadStoneChecker(xIndex, yIndex){
    eSkipper(xIndex, yIndex);
    eSkipper(xIndex + 1, yIndex);
    eSkipper(xIndex - 1, yIndex);
    eSkipper(xIndex, yIndex + 1);
    eSkipper(xIndex, yIndex - 1);
    runDeadStoneFinder();
}
function runDeadStoneFinder(){
  if (stoneGroupFinderTrigger == true){
    stoneGroupFinder();
  }
}

function eSkipper (xIndex, yIndex){
  if (arrayGet(xIndex, yIndex) == "e"){
    return false;
  }
  else {
    stoneDead(xIndex, yIndex, -1, 0)
  }
}
function stoneDead(xIndex, yIndex, xVar, yVar){
  if (arrayGet(xIndex, yIndex) == 0){
    return false;
  }
  else if (arrayGet(xIndex + xVar, yIndex + yVar) == "w" || arrayGet(xIndex + xVar, yIndex + yVar) == "b" || arrayGet(xIndex + xVar, yIndex + yVar) == "e"){
    if (xVar == -1){
      xVar = 1;
      stoneDead(xIndex, yIndex, xVar, yVar);
    }
    else if (xVar == 1){
      xVar = 0
      yVar = -1;
      stoneDead(xIndex, yIndex, xVar, yVar);
    }
    else if (yVar == -1){
      yVar = 1;
      stoneDead(xIndex, yIndex, xVar, yVar);
    }
    else if (yVar == 1){
      stoneGroupFinderTrigger = true;
    }
  }
  else {
    return false;
  }
}

//Runs when the above code completes, assigns positions of stone groups to array container and calls stoneRemover on necessary indexes.
function singleStoneRemover(xIndex,yIndex){

}
function alertTest(xIndex,yIndex){
  alert("function ran at " + xIndex + " and " + yIndex);
}
function stoneRemover(xIndex,yIndex){
 var parent = document.getElementById("game_holder");
 var white = document.getElementById(xIndex + "w" + yIndex);
 var black = document.getElementById(xIndex + "b" + yIndex);
 if (turnCounter % 2 == 0){
   parent.removeChild(white);
 }
 else if (turnCounter % 2 != 0){
   parent.removeChild(black);
 }
}
