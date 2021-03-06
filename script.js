"use strict";

//var PIXI = require('./pixi');

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


/*====== In game variables - changing in game ======*/

//Values for board fields; 0 = vacant, 1 = P1, 2 = P2, ...
var ArrayFieldValues = [];
function fillArrayFieldValues() {
    var i,
        j;
    for (i = 0; i < InitBoardWidth; i += 1) {
        ArrayFieldValues[i] = [];
        for (j = 0; j < InitBoardHeight; j += 1) {
            ArrayFieldValues[i][j] = 0;
        }
    }
}

//Amount of free fields per slot; 0 = no free field
var ArraySlotVacancy = [];
function fillArraySlotVacancy() {
    var i;
    for (i = 0; i < InitBoardWidth; i += 1) {
        ArraySlotVacancy[i] = InitBoardHeight;
    }
}

//Array for position of winning chips
var ArrayWinX = [],
    ArrayWinY = [],
    maxChipRow = (2 * InitWinCondition) - 1;
function fillArrayWin() {
    var i;
    for (i = 0; i < maxChipRow; i += 1) {
        ArrayWinX[i] = -1;
        ArrayWinY[i] = -1;
    }
}

//ID of the player who currently takes turn; 1 = P1, 2 = P2, ...
var PlayerTurn;

//Empty fields left
var FieldsVacant;

//Set to true when game is over
var GameOver;

//Sets background logic to start conditions
function setInitLogic() {
    fillArrayFieldValues();
    fillArraySlotVacancy();
    fillArrayWin();
    PlayerTurn = 1;
    FieldsVacant = getFieldAmount();
    GameOver = false;
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



/* G  R  A  P  H  I  C  S */

//Duration of one frame in milliseconds
var animFrameLength = 60;

//For how many frames the try again message is shown
var messageTime = 7;

//How many frames after the chip has landed before input is enabled
var impactDelay = 5;

//How many frames after the game ends before the result screen pops up
var resultDelay = 15;

//How many pixels the replay button is offset on y axis after centered
var replayBtnOffset = 54;

//How many pixels a button measures in height
var btnHeight = 52;

//For how many frames a button shows his pressed state
var btnDelay = 3;

//Shortcuts & aliases
var resources = PIXI.loader.resources;
var Div = document.getElementById('display');

var FieldVac = "img/field.png";
var ChipBlu = "img/chip_blue.png";
var ChipRed = "img/chip_red.png";
var DropBlu = "img/chip_blue_drop.png";
var DropRed = "img/chip_red_drop.png";
var Arrow = "img/arrow.png";
var ShadowBlu = "img/chip_blue_shadow.png";
var ShadowRed = "img/chip_red_shadow.png";
var MessageBoard = "img/message_board.png";
var TryAgainBlu = "img/tryagain_blue.png";
var TryAgainRed = "img/tryagain_red.png";
var WinBlu = "img/chip_blue_win.png";
var WinRed = "img/chip_red_win.png";
var RocketBlu = "img/rocket_blue.png";
var RocketRed = "img/rocket_red.png";
var ResultBlu = "img/result_blue.png";
var ResultRed = "img/result_red.png";
var ResultTie = "img/result_tie.png";
var ButtonReplay = "img/btn_replay.png";

//Root container object
var Stage;

//Chip container & slot container
var chipContainer;
var slotContainer;

//Message board container
var sprMessage;
var sprBtnReplay;
var rectBtnReplay;
var messageContainer;

//Input helper arrow and preview chip container
var sprArrow;
var sprShadow;
var rectArrow;
var arrowContainer;

//Renderer / canvas element
var renderer;

//Set a given sprite to a given texture and center it to the screen
function centeredSprite(nTex) {
    var spr = new PIXI.Sprite(nTex);
    spr.anchor.set(0.5, 0.5);
    spr.position.set(0.5 * getCanvasWidth(), 0.5 * getCanvasHeight());
    return spr;
}

//Disables board's interactivity
function noBoardInteractivity() {
    var i;
    for (i = 0; i < InitBoardWidth; i += 1) {
        unclickable(slotContainer.children[i]);
    }
}

//Canvas setup - create canvas element with dark background, append it to div and create mouse position variable relative to it
function setupCanvas() {
    console.log("setupCanvas");
    renderer = new PIXI.CanvasRenderer(getCanvasWidth(), getCanvasHeight(), {
        antialias: false,
        transparent: false,
        resolution: 1
    });
    renderer.backgroundColor = 0x140C1C;
    Div.appendChild(renderer.view);
}

//Board setup - create the board and interactive slot containers
function setupBoard() {
    console.log("setupBoard");
    var i,
        j,
        slot,
        texField = resources[FieldVac].texture,
        sprField;
    slotContainer = new PIXI.Container();
    for (i = 0; i < InitBoardWidth; i += 1) {
        slot = new PIXI.Container();
        clickable(slot, false, undefined);
        for (j = 0; j < InitBoardHeight; j += 1) {
            sprField = new PIXI.Sprite(texField);
            sprField.x = InitFieldSize * i;
            sprField.y = InitFieldSize * j;
            slot.addChild(sprField);
        }
        slotContainer.addChild(slot);
    }
    Stage.addChild(slotContainer);
    Stage.setChildIndex(slotContainer, 0);
    chipContainer = new PIXI.Container();
    Stage.addChild(chipContainer);
}

//Messages setup - create message board for result and try again messages
function setupMessages() {
    console.log("setupMessages");
    var texBoard = resources[MessageBoard].texture,
        texMessage = resources[TryAgainBlu].texture,
        texBtnReplay = resources[ButtonReplay].texture,
        sprBoard = centeredSprite(texBoard);
    sprMessage = centeredSprite(texMessage);
    rectBtnReplay = new PIXI.Rectangle(0, 0, texBtnReplay.width, btnHeight);
    texBtnReplay.frame = rectBtnReplay;
    sprBtnReplay = centeredSprite(texBtnReplay);
    sprBtnReplay.y += replayBtnOffset;
    messageContainer = new PIXI.Container();
    messageContainer.addChild(sprBoard);
    messageContainer.addChild(sprMessage);
    messageContainer.addChild(sprBtnReplay);
    messageContainer.visible = false;
    Stage.addChild(messageContainer);
}

//Preview setup - create arrow to feedback input and shadow chip to clarify options
function setupPreview() {
    console.log("setupPreview");
    var texArrow = resources[Arrow].texture,
        texShadow = resources[ShadowBlu].texture;
    rectArrow = new PIXI.Rectangle(0, InitFieldSize, InitFieldSize, InitFieldSize);
    texArrow.frame = rectArrow;
    sprArrow = new PIXI.Sprite(texArrow);
    sprShadow = new PIXI.Sprite(texShadow);
    sprShadow.y = (InitBoardHeight - 1) * InitFieldSize;
    arrowContainer = new PIXI.Container();
    arrowContainer.addChild(sprArrow);
    arrowContainer.addChild(sprShadow);
    arrowContainer.setChildIndex(sprShadow, 0);
    Stage.addChild(arrowContainer);
}

//Stage setup - create new stage and setup sprites
function setupStage() {
    console.log("setupStage");
    Stage = new PIXI.Container();
    setupBoard();
    setupMessages();
    setupPreview();
}

//Feedback function - render the stage continuously
function feedbackLoop() {
    requestAnimationFrame(feedbackLoop);
    renderer.render(Stage);
}

//Setup function - call setup and feedback loop functions
function setup() {
    console.log("setup");
    setupCanvas();
    newGameScene();
    feedbackLoop();
}

//Starts a new game
function newGameScene() {
    console.log("newGameScene");
    setInitControls();
    setInitLogic();
    setupStage();
}

//Load sprites, call setup function
PIXI.loader
    .add([
        FieldVac,
        ChipBlu,
        ChipRed,
        DropBlu,
        DropRed,
        Arrow,
        ShadowBlu,
        ShadowRed,
        MessageBoard,
        TryAgainBlu,
        TryAgainRed,
        WinBlu,
        WinRed,
        RocketBlu,
        RocketRed,
        ResultBlu,
        ResultRed,
        ResultTie,
        ButtonReplay
    ])
    .load(setup);

//Render pressing the replay button
function feedbackReplay() {
    var delayCounter = 0,
        replayDelay = setInterval(function () {
            if (delayCounter === btnDelay) {
                newGameScene();
                clearInterval(replayDelay);
            }
            delayCounter += 1;
        }, animFrameLength);
    rectBtnReplay.y = btnHeight * 2;
    sprBtnReplay.texture.frame = rectBtnReplay;
}

//Render result message
function feedbackGameOver() {
    var texNameMessage,
        texNameRocket,
        texSizeRocket = InitFieldSize * 2,
        rect = new PIXI.Rectangle(0, 0, texSizeRocket, texSizeRocket),
        texRocket,
        sprRocket,
        rocketDest,
        rocketSpeed = 0.5,
        rockets = true,
        traveling = false,
        firstLoop = true,
        animFrameCount = 8,
        animRocket,
        animDelayCounter = 0,
        animLoopCounter = 0;
    switch (PlayerTurn) {
    case 0:
        texNameMessage = ResultTie;
        rockets = false;
        break;
    case 1:
        texNameMessage = ResultBlu;
        texNameRocket = RocketBlu;
        break;
    case 2:
        texNameMessage = ResultRed;
        texNameRocket = RocketRed;
        break;
    }
    sprMessage.texture = resources[texNameMessage].texture;
    noBoardInteractivity();
    clickable(sprBtnReplay, true, "replay");
    sprBtnReplay.visible = true;
    if (rockets) {
        texRocket = resources[texNameRocket].texture;
        sprRocket = new PIXI.Sprite(texRocket);
        sprRocket.texture.frame = rect;
        sprRocket.y = InitBoardHeight * InitFieldSize;
        Stage.addChild(sprRocket);
    }

    animRocket = setInterval(function () {
        if (animDelayCounter < resultDelay) {
            animDelayCounter += 1;
        } else {
            if (firstLoop) {
                messageContainer.visible = true;
                firstLoop = false;
            }
            if (rockets) {
                if (animLoopCounter % animFrameCount === 0) {
                    rect.x = 0;
                    sprRocket.x = Math.floor(Math.random() * (InitBoardWidth - 1)) * InitFieldSize;
                    rocketDest = Math.floor(Math.random() * (InitBoardHeight - 1)) + 2;
                    sprRocket.y = InitBoardHeight * InitFieldSize;
                } else if (animLoopCounter % animFrameCount === 1) {
                    traveling = true;
                    rocketDest -= rocketSpeed;
                    sprRocket.y -= rocketSpeed * InitFieldSize;
                    if (rect.y === 0) {
                        rect.y = texSizeRocket;
                    } else {
                        rect.y = 0;
                    }
                    if (rocketDest === 0) {
                        traveling = false;
                    }
                } else if (animLoopCounter % (animFrameCount * 0.5) === 0) {
                    rect.x = texSizeRocket;
                }
                if (!traveling) {
                    rect.y = (animLoopCounter % (animFrameCount * 0.5)) * texSizeRocket;
                    animLoopCounter += 1;
                }
                sprRocket.texture.frame = rect;
            }
            if (!GameOver || !rockets) {
                clearInterval(animRocket);
            }
        }
    }, animFrameLength);
}

//After a short impact delay, present winner chips or re-enable input
function feedbackWin(chipColor) {
    var texName,
        texEffect,
        sprEffect,
        rect = new PIXI.Rectangle(0, 0, InitFieldSize, InitFieldSize),
        animWin,
        delayCounter = 0,
        animLoopCounter = 0,
        animFrameCount = 6,
        animRunCount,
        animCounterStop = animFrameCount * maxChipRow;
    switch (chipColor) {
    case 1:
        texName = WinBlu;
        break;
    case 2:
        texName = WinRed;
        break;
    }
    texEffect = resources[texName].texture;
    sprEffect = new PIXI.Sprite(texEffect);
    sprEffect.texture.frame = rect;
    sprEffect.visible = false;
    if (GameOver) {
        console.log("win");
        chipContainer.addChild(sprEffect);
    }

    animWin = setInterval(function () {
        if (delayCounter < impactDelay) {
            delayCounter += 1;
        } else {
            if (GameOver) {
                if (animLoopCounter < animCounterStop) {
                    rect.y = (animLoopCounter % animFrameCount) * InitFieldSize;
                    sprEffect.texture.frame = rect;
                    animRunCount = Math.floor(animLoopCounter / animFrameCount);
                    if (animLoopCounter % animFrameCount === 0) {
                        sprEffect.x = ArrayWinX[animRunCount] * InitFieldSize;
                        sprEffect.y = ArrayWinY[animRunCount] * InitFieldSize;
                        sprEffect.visible = true;
                    }
                    if (ArrayWinX[animRunCount] === -1) {
                        animLoopCounter += animFrameCount;
                    } else {
                        animLoopCounter += 1;
                    }
                } else {
                    sprEffect.visible = false;
                    feedbackGameOver();
                    clearInterval(animWin);
                }
            } else {
                setPlayerInput(true);
                feedbackInputAllowed();
                clearInterval(animWin);
            }
        }
    }, animFrameLength);
}

//The impact effect
function feedbackImpact(sprChip, rect, chipColor) {
    var texName,
        animImpact,
        animLoopCounter = 0,
        animCounterStop = 3;
    switch (chipColor) {
    case 1:
        texName = ChipBlu;
        break;
    case 2:
        texName = ChipRed;
        break;
    }
    rect.x = InitFieldSize;
    rect.y = 0;
    sprChip.texture.frame = rect;

    animImpact = setInterval(function () {
        animLoopCounter += 1;
        if (animLoopCounter < animCounterStop) {
            rect.y = animLoopCounter * InitFieldSize;
            sprChip.texture.frame = rect;
        } else {
            sprChip.texture = resources[texName].texture;
            rect.x = 0;
            rect.y = 0;
            feedbackWin(chipColor);
            clearInterval(animImpact);
        }
    }, animFrameLength);
}

//The falling animation
function feedbackDrop(vx, vy) {
    var texName,
        chipColor = ArrayFieldValues[vx][vy],
        rect = new PIXI.Rectangle(0, 0, InitFieldSize, InitFieldSize),
        texChip,
        sprChip,
        firstLoop = true,
        animDrop,
        animLoopCounter = 0;
    switch (chipColor) {
    case 1:
        texName = DropBlu;
        break;
    case 2:
        texName = DropRed;
        break;
    }
    texChip = resources[texName].texture;
    sprChip = new PIXI.Sprite(texChip);
    sprChip.texture.frame = rect;
    sprChip.x = InitFieldSize * vx;
    sprChip.y = 0;
    chipContainer.addChild(sprChip);

    animDrop = setInterval(function () {
        if (firstLoop) {
            firstLoop = false;
        } else {
            animLoopCounter += 0.5;
        }
        if (animLoopCounter < vy) {
            if (rect.y === InitFieldSize * 2) {
                rect.y = 0;
            }
            rect.y += InitFieldSize;
        } else {
            rect.x = InitFieldSize;
            rect.y = 0;
            console.log("impact");
            feedbackImpact(sprChip, rect, chipColor);
            clearInterval(animDrop);
        }
        sprChip.y = animLoopCounter * InitFieldSize;
        sprChip.texture.frame = rect;
    }, animFrameLength);
}

//Arrow responds to input
function feedbackInput(vx, vy) {
    var animInput,
        animLoopCounter = 2,
        animCounterStop = 4;

    animInput = setInterval(function () {
        if (animLoopCounter < animCounterStop) {
            rectArrow.y = animLoopCounter * InitFieldSize;
            sprArrow.texture.frame = rectArrow;
            animLoopCounter += 1;
        } else {
            feedbackInputAllowed();
            feedbackDrop(vx, vy);
            clearInterval(animInput);
        }
    }, animFrameLength);
}

//Render try again message for limited time
function feedbackTryAgain() {
    var texName,
        showAndHide,
        showCounter = 0;
    switch (PlayerTurn) {
    case 1:
        texName = TryAgainBlu;
        break;
    case 2:
        texName = TryAgainRed;
        break;
    }
    sprMessage.texture = resources[texName].texture;
    messageContainer.visible = true;
    sprBtnReplay.visible = false;

    showAndHide = setInterval(function () {
        if (showCounter === messageTime) {
            messageContainer.visible = false;
            setPlayerInput(true);
            feedbackInputAllowed();
            clearInterval(showAndHide);
        }
        showCounter += 1;
    }, animFrameLength);
}

//Render the arrow and the chip preview
function feedbackSelection() {
    var rectPosX,
        texName;
    switch (PlayerTurn) {
    case 1:
        rectPosX = 0;
        texName = ShadowBlu;
        break;
    case 2:
        rectPosX = InitFieldSize;
        texName = ShadowRed;
        break;
    }
    rectArrow.x = rectPosX;
    if (isSlotOccupied(SelectionInput)) {
        rectArrow.y = 0;
    } else {
        rectArrow.y = InitFieldSize;
    }
    sprArrow.texture.frame = rectArrow;
    sprShadow.texture = resources[texName].texture;
    arrowContainer.x = SelectionInput * InitFieldSize;
    sprShadow.y = (ArraySlotVacancy[SelectionInput] - 1) * InitFieldSize;
}

//Sets visibility of the arrow and shadow according to whether or not input is allowed
function feedbackInputAllowed() {
    if (AllowInput) {
        feedbackSelection();
        arrowContainer.visible = true;
    } else {
        arrowContainer.visible = false;
    }
}



/* L  O  G  I  C */

//Execute when game ends in a tie
function tieGame() {
    console.log("tieGame");
    PlayerTurn = 0;
    GameOver = true;
}

//Execute when game is won
function winGame() {
    console.log("winGame");
    GameOver = true;
}

//If checkWin is false, check for vacant fields, return true if 0
function checkTie() {
    console.log("checkTie");
    if (FieldsVacant < 1) {
        return true;
    } else {
        return false;
    }
}

//After player turns, check for win condition and fill winner chip array, return boolean
function checkWin(vx, vy) {
    console.log("checkWin -> " + vx + ", " + vy);
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
        checkY,
        arrayStart = maxLength - 1;
    ArrayWinX[arrayStart] = vx;
    ArrayWinY[arrayStart] = vy;

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
                    ArrayWinX[arrayStart + i] = checkX;
                    ArrayWinY[arrayStart + i] = checkY;
                } else {
                    positiveCount = false;
                }
            }
            if (negativeCount) {
                checkX = vx - i * dx;
                checkY = vy - i * dy;
                if (isIndexValid(checkX, 'x') && isIndexValid(checkY, 'y') && ArrayFieldValues[checkX][checkY] === PlayerTurn) {
                    counter += 1;
                    ArrayWinX[arrayStart - i] = checkX;
                    ArrayWinY[arrayStart - i] = checkY;
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
    if (!winCondFulfilled) {
        fillArrayWin();
    }
    return winCondFulfilled;
}

//Set the turn to the next player
function nextPlayersTurn() {
    console.log("nextPlayersTurn");
    var nextPlayer = PlayerTurn + 1;
    if (nextPlayer > InitPlayers) {
        nextPlayer = 1;
    }
    PlayerTurn = nextPlayer;
}

//Trigger Try Again Message on attempting to drop a chip into an occupied slot
function invalidInput() {
    console.log("invalidInput");
    feedbackTryAgain();
}

//Drop a chip into given slot
function validInput(SlotIndex) {
    console.log("validInput -> " + SlotIndex);
    ArraySlotVacancy[SlotIndex] -= 1;
    var SlotField = ArraySlotVacancy[SlotIndex];
    FieldsVacant -= 1;
    ArrayFieldValues[SlotIndex][SlotField] = PlayerTurn;
    if (!checkWin(SlotIndex, SlotField)) {
        if (!checkTie()) {
            nextPlayersTurn();
        } else {
            tieGame();
        }
    } else {
        winGame();
    }
    feedbackInput(SlotIndex, SlotField);
}

//Try dropping a chip - trigger actual drop or try again
function branchInputValid(SlotIndex) {
    console.log("branchInputValid -> " + SlotIndex);
    if (isSlotOccupied(SlotIndex)) {
        invalidInput();
    } else {
        validInput(SlotIndex);
    }
}



/* C  O  N  T  R  O  L  S */

/*====== Mouse ======*/

//The position of the mouse inside of the canvas
var MousePos;
function enableMouseListener() {
    MousePos = renderer.plugins.interaction.mouse.global;
}

//The currently selected slot
var SelectionInput;

//Whether or not the player can create input - disable while simulating
var AllowInput;

//Set controls to start condition
function setInitControls() {
    SelectionInput = 0;
    setPlayerInput(true);
    enableMouseListener();
}

//Disable player input while simulating, enable afterwards
function setPlayerInput(playerInput) {
    AllowInput = playerInput;
}

//Called when Enter is pressed or the mouse clicked
function hardInput() {
    if (AllowInput) {
        setPlayerInput(false);
        branchInputValid(SelectionInput);
    }
}

//Returns true if the mouse pointer is between the canvas' x and y values
function isMouseInsideCanvas() {
    if (MousePos.x < getCanvasWidth() && MousePos.x > -1 && MousePos.y < getCanvasHeight() && MousePos.y > -1) {
        return true;
    } else {
        return false;
    }
}

//Return index of the slot by given mouse position while IsMouseInsideCanvas equals true
function mouseToSelection() {
    if (isMouseInsideCanvas()) {
        return Math.floor(MousePos.x / InitFieldSize);
    }
}

//When mouse (or other pointer) hovers over a slot
function onPointSlot() {
    SelectionInput = mouseToSelection();
    if (AllowInput) {
        feedbackSelection();
    }
}

//When a slot is clicked (or tapped)
function onClickSlot() {
    hardInput();
}

//When mouse (or other pointer) hovers over a button
function onPointButton(sprBtn) {
    sprBtn.texture.frame.y += btnHeight;
    //console.log("point");
}

//When mouse (or other pointer) stops hovering over a button
function onUnpointButton(sprBtn) {
    sprBtn.texture.frame.y -= btnHeight;
    //console.log("no point");
}

//When the replay button is clicked (or tapped)
function onClickReplay() {
    feedbackReplay();
}

//Enable button interactivity for mouse/touch
function clickable(dispObj, isButton, buttonValue) {
    dispObj.interactive = true;
    dispObj.buttonMode = true;
    if (isButton) {
        //dispObj.on('pointerover', onPointButton(dispObj));
        //dispObj.on('pointerout', onUnpointButton(dispObj));
        switch (buttonValue) {
        case "replay":
            dispObj.on('pointerdown', onClickReplay);
            break;
        }
    } else {
        dispObj.on('pointerover', onPointSlot);
        dispObj.on('pointerdown', onClickSlot);
    }
}

//Disable button interactivity for mouse/touch
function unclickable(dispObj) {
    dispObj.interactive = false;
    dispObj.buttonMode = false;
}


/*====== Keyboard ======*/

//Left key is pressed
function selectionToLeft() {
    var newInput = SelectionInput;
    if (!isMouseInsideCanvas()) {
        if (newInput === 0) {
            newInput = InitBoardWidth;
        }
        newInput -= 1;
        SelectionInput = newInput;
        feedbackSelection();
    }
}

//Right key is pressed
function selectionToRight() {
    var newInput = SelectionInput;
    if (!isMouseInsideCanvas()) {
        newInput += 1;
        if (newInput === InitBoardWidth) {
            newInput = 0;
        }
        SelectionInput = newInput;
        feedbackSelection();
    }
}

//General keyboard setup
function keyboard(keyCode) {
    var key  = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    key.downHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) {
                key.press();
            }
            key.isDown = true;
            key.isUp = false;
        }
    };

    key.upHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) {
                key.release();
            }
            key.isDown = false;
            key.isUp = true;
        }
    };

    window.addEventListener(
        "keydown",
        key.downHandler.bind(key),
        false
    );

    window.addEventListener(
        "keyup",
        key.upHandler.bind(key),
        false
    );

    return key;
}

//Left arrow key event
var keyLeft = keyboard(37);
keyLeft.press = function () {
    selectionToLeft();
};

//Right arrow key event
var keyRight = keyboard(39);
keyRight.press = function () {
    selectionToRight();
};

//Enter key event
var keyEnter = keyboard(13);
keyEnter.press = function () {
    hardInput();
};

//'R' key event
var keyR = keyboard(82);
keyR.press = function () {
    newGameScene();
};
