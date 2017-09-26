PIXI.utils.sayHello();  //test

/* L  O  G  I  C */

/*====== Init variables - initially set ======*/

var InitPlayers = 2;        //Amount of players participating
var InitBoardWidth = 7;     //Amount of slots available for input
var InitBoardHeight = 6;    //Maximum chip stack size
var InitWinCondition = 4;   //Connect 4, 5, 6, ...
var InitFieldSize = 64;     //Measurements of a field in pixels


/*====== In game variables - changing in game ======*/

var ArrayFieldValues = new Array();
for (i = 0; i < InitBoardWidth; i++) {
    ArrayFieldValues[i] = new Array();
    for (j = 0; j < InitBoardHeight; j++) {
        ArrayFieldValues[i][j] = 0;
    }
}       //Values for board fields; 0 = vacant, 1 = P1, 2 = P2, ...

var ArraySlotVacancy = new Array();
for (i = 0; i < InitBoardWidth; i++) {
    ArraySlotVacancy[i] = InitBoardHeight;
}       //Amount of free fields per slot; 0 = no free field

var PlayerTurn = 1;         //ID of the player who currently takes turn; 1 = P1, 2 = P2, ...

var AllowInput = true;     //Set to false while simulating, true when player's input is expected

var FieldsVacant = InitBoardHeight * InitBoardWidth;    //Empty fields left


/*====== Functions & Getters ======*/

function getCanvasHeight() {
    var canvasHeight = InitBoardHeight * InitFieldSize;
    return canvasHeight;
}

function getCanvasWidth() {
    var canvasWidth = InitBoardWidth * InitFieldSize;
    return canvasWidth;
}

function getFieldAmount() {
    var fieldAmount = InitBoardHeight * InitBoardWidth;
    return fieldAmount;
}

function nextPlayersTurn() {
    var nextPlayer = PlayerTurn + 1;
    if (nextPlayer > InitPlayers) {
        nextPlayer = 1;
    }
    PlayerTurn = nextPlayer;
}



/* G  R  A  P  H  I  C  S */

//Create canvas element
var renderer = PIXI.autoDetectRenderer(getCanvasWidth(), getCanvasHeight(), {
    antialias: false,
    transparent: false,
    resolution: 1
});

renderer.backgroundColor = 0xDAD45E;

//Append canvas element to div 'display'
document.getElementById('display').appendChild(renderer.view);

//Create container/root object
var stage = new PIXI.Container();

//Load spritesheet for the board fields
PIXI.loader
    .add("field", "img/field_vacant.png")
    .load(setup);

function setup() {
    fieldTexture = PIXI.loader.resources["field"].texture;
    
    for (i = 0; i < InitBoardWidth; i++) {
        for (j = 0; j < InitBoardHeight; j++) {
            field = new PIXI.Sprite(fieldTexture);
            field.x = InitFieldSize * i;
            field.y = InitFieldSize * j;
            stage.addChild(field);
        }
    }
    
    feedbackLoop();
}

function feedbackLoop() {
    requestAnimationFrame(feedbackLoop);
    
    //Render it
    renderer.render(stage);
}