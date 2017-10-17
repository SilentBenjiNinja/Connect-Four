/* L  O  G  I  C */

/*====== Init variables - initially set ======*/

//Amount of players participating
var InitPlayers = 2;

//Amount of slots available for input
var InitBoardWidth = 7;

//Maximum chip stack size
var InitBoardHeight = 6;

//Connect 4, 5, 6, ...
var InitWinCondition = 4;

//Measurements of a field in pixels
var InitFieldSize = 64;


/*====== In game variables - changing in game ======*/

//Values for board fields; 0 = vacant, 1 = P1, 2 = P2, ...
var ArrayFieldValues = [],
    i,
    j;
for (i = 0; i < InitBoardWidth; i += 1) {
    ArrayFieldValues[i] = [];
    for (j = 0; j < InitBoardHeight; j += 1) {
        ArrayFieldValues[i][j] = 0;
    }
}

//Amount of free fields per slot; 0 = no free field
var ArraySlotVacancy = [],
    i;
for (i = 0; i < InitBoardWidth; i += 1) {
    ArraySlotVacancy[i] = InitBoardHeight;
}

//ID of the player who currently takes turn; 1 = P1, 2 = P2, ...
var PlayerTurn = 1;

//Empty fields left
var FieldsVacant = getFieldAmount();

//Set to true when game is over
var GameOver = false;


/*====== Getters & Setters ======*/

//Return total pixel height of the board
function getCanvasHeight() {
    var canvasHeight = InitBoardHeight * InitFieldSize;
    return canvasHeight;
}

//Return total pixel width of the board
function getCanvasWidth() {
    var canvasWidth = InitBoardWidth * InitFieldSize;
    return canvasWidth;
}

//Return total amount of fields on the board
function getFieldAmount() {
    var fieldAmount = InitBoardHeight * InitBoardWidth;
    return fieldAmount;
}

//Return true if slot of given index has no vacant field
function isSlotOccupied(SlotIndex) {
    if (ArraySlotVacancy[SlotIndex] < 1) {
        return true;
    } else {
        return false;
    }
}

//Return true if given index is in bounds of width or height (depending on given axis)
function isIndexValid(Index, Axis) {
    var comp,
        isValid;
    switch (Axis) {
        case 'x':
            comp = InitBoardWidth;
            break;
        case 'y':
            comp = InitBoardHeight;
            break;
    }
    isValid = (Index > -1 && Index < comp) ? true : false;
    return isValid;
}

//Set the turn to the next player
function nextPlayersTurn() {
    var nextPlayer = PlayerTurn + 1;
    if (nextPlayer > InitPlayers) {
        nextPlayer = 1;
    }
    PlayerTurn = nextPlayer;
}


/*====== Functions ======*/

//Trigger Try Again Message on attempting to drop a chip into an occupied slot
function tryAgainMessage(SlotIndex) {
    console.log("Try again!");
}

//If checkWin is false, check for each slot if occupied, return true if every slot is occupied
function checkTie() {
    if (FieldsVacant < 1) {
        return true;
    } else {
        return false;
    }
}

//Execute when game is won
function winGame() {
    console.log("Player " + PlayerTurn + " won the game.");
    GameOver = true;
}

//Execute when game ends in a tie
function tieGame() {
    console.log("Tie Game");
    GameOver = true;
}

//After player turns, check for win condition, return boolean
function checkWin(vx, vy) {
    var winCondFulfilled = false,
        maxLength = InitWinCondition,
        direction,
        dx,
        dy,
        i,
        counter,
        positiveCount,
        negativeCount,
        checkX,
        checkY;
        
    for (direction = 0; direction < 4; direction += 1) {
        counter = 1;
        positiveCount = true;
        negativeCount = true;
            
        switch (direction) {
            case 0:             //Horizontal
                dx = 1;
                dy = 0;
                break;
            case 1:             //Positive diagonal
                dx = 1;
                dy = 1;
                break;
            case 2:             //Negative diagonal
                dx = 1;
                dy = -1;
                break;
            case 3:             //Vertical
                dx = 0;
                dy = 1;
                break;
        }
        
        for (i = 1; i < maxLength; i += 1) {
            if (positiveCount) {
                checkX = vx + i * dx;
                checkY = vy + i * dy;
                if (isIndexValid(checkX, 'x') && isIndexValid(checkY, 'y') && ArrayFieldValues[checkX][checkY] === PlayerTurn) {
                    counter += 1;
                } else {
                    positiveCount = false;
                }
            }
            if (negativeCount) {
                checkX = vx - i * dx;
                checkY = vy - i * dy;
                if (isIndexValid(checkX, 'x') && isIndexValid(checkY, 'y') && ArrayFieldValues[checkX][checkY] === PlayerTurn) {
                    counter += 1;
                } else {
                    negativeCount = false;
                }
            }
        }
        
        if (counter >= maxLength) {
            winCondFulfilled = true;
            break;
        }
    }
    return winCondFulfilled;
}

//Drop a chip into given slot
function dropChip(SlotIndex) {
    ArraySlotVacancy[SlotIndex] -= 1;
    var SlotField = ArraySlotVacancy[SlotIndex];
    FieldsVacant -= 1;
    ArrayFieldValues[SlotIndex][SlotField] = PlayerTurn;
    chipToBoard(SlotIndex, SlotField);
    //console.log("Fields left: " + FieldsVacant + "; Player " + PlayerTurn + " dropped at [x: " + SlotIndex + "; y: " + SlotField + "]");
    if (!checkWin(SlotIndex, SlotField)) {
        if (!checkTie()) {
            nextPlayersTurn();
        } else {
            tieGame();
        }
    } else {
        winGame();
    }
}

//Try dropping a chip - trigger actual drop or try again message
function testSlotDrop(SlotIndex) {
    setPlayerInput(false);
    if (isSlotOccupied(SlotIndex)) {
        tryAgainMessage(SlotIndex);
    } else {
        dropChip(SlotIndex);
    }
    if (!GameOver) {
        setPlayerInput(true);
    }
}



/* G  R  A  P  H  I  C  S */

//Shortcuts
var resources = PIXI.loader.resources;

//Create canvas element, with dark background
var renderer = PIXI.autoDetectRenderer(getCanvasWidth(), getCanvasHeight(), {
    antialias: false,
    transparent: false,
    resolution: 1
});
renderer.backgroundColor = 0x140C1C;

//Append canvas element to div 'display'
document.getElementById('display').appendChild(renderer.view);

//Create container/root object
var Stage = new PIXI.Container();

//Resource aliases
var FieldVac = "img/field.png";
var ChipBlu = "img/chip_blue.png";
var ChipRed = "img/chip_red.png";
var DropBlu = "img/chip_drop_blue.png";
var DropRed = "img/chip_drop_red.png";
var ShadowBlu = "img/chip_shadow_blue.png";
var ShadowRed = "img/chip_shadow_red.png";

//Create chip container
var chips = new PIXI.Container();
Stage.addChild(chips);

//Set sprites for falling and landing animation
function chipToBoard(vx, vy) {
    var sourceAnim,
        sourceFinal,
        rect = new PIXI.Rectangle(0, 0, InitFieldSize, InitFieldSize),
        texChip,
        sprChip,
        falling = true,
        anim,
        animSpeed = 100,
        animLoopCounter = 0;
    switch (PlayerTurn) {
        case 1:
            sourceAnim = DropBlu;
            sourceFinal = ChipBlu;
            break;
        case 2:
            sourceAnim = DropRed;
            sourceFinal = ChipRed;
            break;
    }
    
    texChip = resources[sourceAnim].texture;
    texChip.frame = rect;
    sprChip = new PIXI.Sprite(texChip);
    sprChip.x = InitFieldSize * vx;
    sprChip.y = 0;
    
    anim = setInterval(function() {
        if (animLoopCounter == vy && falling) {
            rect.x = InitFieldSize;
            rect.y = 0;
            falling = false;
        }
        if (rect.y > InitFieldSize * 2) {
            if (falling) {
                rect.y = InitFieldSize;
            } else {
                sprChip.texture = resources[sourceFinal].texture;
                rect.x = 0;
                rect.y = 0;
                clearInterval(anim);
            }
        }
        sprChip.texture.frame = rect;
        rect.y += InitFieldSize;
        if (falling) {
            animLoopCounter += .5;
            sprChip.y = animLoopCounter * InitFieldSize;
        }
    }, animSpeed);
    
    chips.addChild(sprChip);
}

//Load sprites for the board and chips, call setup function
PIXI.loader
    .add([
        FieldVac,
        ChipBlu,
        ChipRed,
        DropBlu,
        DropRed,
        ShadowBlu,
        ShadowRed
    ])
    .load(setup);

//Setup function - add the board to the stage, create interactive slot containers, call feedback loop function
function setup() {
    var i,
        j,
        slot,
        texField = resources[FieldVac].texture,
        sprField;
    for (i = 0; i < InitBoardWidth; i += 1) {
        slot = new PIXI.Container();
        clickable(slot);
        for (j = 0; j < InitBoardHeight; j += 1) {
            sprField = new PIXI.Sprite(texField);
            sprField.x = InitFieldSize * i;
            sprField.y = InitFieldSize * j;
            slot.addChild(sprField);
        }
        Stage.addChild(slot);
        Stage.setChildIndex(slot, 0);
    }
    
    feedbackLoop();
}

//Feedback function - render the stage
function feedbackLoop() {
    requestAnimationFrame(feedbackLoop);
    
    renderer.render(Stage);
}



/* C  O  N  T  R  O  L  S */

/*====== Mouse ======*/

var MousePos = renderer.plugins.interaction.mouse.global;
var SelectionInput = 0;

//Whether or not the player can create input - disable while simulating
var AllowInput = true;

//Disable player input while simulating, enable afterwards
function setPlayerInput(playerInput) {
    AllowInput = playerInput;
}

//Returns true if the mouse pointer is between the canvas' x and y values
function isMouseInsideCanvas() {
    if (0 < MousePos.x < getCanvasWidth() && 0 < MousePos.y < getCanvasHeight()) {
        return true;
    } else {
        return false;
    }
}

//Enable interactivity for mouse/touch
function clickable(dispObj) {
    dispObj.interactive = true;
    dispObj.buttonMode = true;
    dispObj.on('pointerover', onPoint);
    dispObj.on('pointerdown', onClick);
}

//Return index of the slot by given mouse position while IsMouseInsideCanvas equals true
function mouseToSelection() {
    if (isMouseInsideCanvas()) {
        return Math.floor(MousePos.x / InitFieldSize);
    }
}

function onPoint() {
    SelectionInput = mouseToSelection();
}

function onClick() {
    if (AllowInput) {
        testSlotDrop(SelectionInput);
    }
}


/*====== Keyboard ======*/

/*
function keyboard(keyCode) {
    var key  = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    
    key.downHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) {
                key.press();
            }
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };
    
    key.upHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) {
                key.release();
            }
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };
    
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    
    return key;
}

var keyLeft = keyboard(37);
var keyRight = keyboard(39);

keyLeft.press = function() {
    
};

keyRight.press = function() {
    
}; */