/********************
 * To Do List
 * 1.Random World generator--DONE
 *  a.build the block class--DONE
 *  b.make a matrix to store the blocks--DONE
 *  c.develop algorithms to make a believable terrain--DONEish(but more later to make better. perlin noise)
 * 2.Port platform code, and setup player--DONE
 *  a.Copy player class from WSODL--DONE
 *  b.change draw function--DONE
 *  c.put into main.js and add keyboard interactivity--DONE
 * 3.Deletion & addition of blocks--DONE
 *  a.Deletion--DONE
 *  b.Addition/(rudamentary inventory)--DONE
 * 4.Survival (health, hunger limited blocks etc.)
 *  a.add a draw function to the inventory--DONE
 *  b.add a health property to the player, and make it display
 *  c.add a hunger property that slowly ticks down over time, when at zero starts taking health
 *  d.make a death state
 * 5.Crafting
 *  a.make an expanded inventory screen popup
 *  b.crafting logic & tools
 * 6.Refine mining & building
 *  a.different breaking times for harder materials
 *  BONUS: rework controls for placing & breaking. eg. only able to place/mine adjacent
 * 7.Monsters
 * 8.User interface
 *  a.start screen
 *  b.death screen
 *  c.in game menus
 * 9.Publish on github & github.io
 * 10.Extra tweaks & play around
 *  a.Nether/End
 *  b.Textures
 *  c.Infinite World (expands as you go)
 *******************/

//Canvas Setup
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d"); //ctx stands for context

//World constants
const BLOCK_SIZE = 25;
const WORLD_WIDTH = 100;
const BUILDING_LIMIT = 10;
const WORLD_HEIGHT = 30+BUILDING_LIMIT;
const GRAVITY = .8;
const FRICTION = .8;

//Keyboard vars
var up = false;
var down = false;
var left = false;
var right = false;
var space = false;

//For the mouse
var mousePos = {x:0,y:0};
var scrollPos = {x:canvas.width/2,y:canvas.width/2};

//Camera Var. TODO: convert this to an instance of a 'Camera class'. You can never go wrong with OOP
var myCamera = {
    x:0,
    y:0
};

//Define the instance of, then generate the world
var myWorld = new World(WORLD_WIDTH,WORLD_HEIGHT,myCamera,BLOCK_SIZE, BUILDING_LIMIT);
myWorld.generate();

//Player instance & inventory setup
var myPlayer = new Player((WORLD_WIDTH/2)*BLOCK_SIZE,(BUILDING_LIMIT+3)*BLOCK_SIZE,BLOCK_SIZE*.9, 1.8*BLOCK_SIZE, "#4e0f7a", myWorld);
var myInventory = new Inventory(40);

//Keyboard functionality. I am sure there is a better way to do this, but I am too lazy to find out.
function keyDownHandler(e){
    if(e.key == "Up" || e.key == "ArrowUp" || e.key == "w"){
        up = true;
    }
    if(e.key == "Right" || e.key == "ArrowRight" || e.key == "d"){
        right = true;
    }
    if(e.key == "Left" || e.key == "ArrowLeft" || e.key == "a"){
        left = true;
    }
    if(e.key == "Down" || e.key == "ArrowDown" || e.key == "s"){
        down = true;
    }
    if(e.key == " "){
        space = true;
    }
    //This next part is to switch between materials in your inventory
    if(e.keyCode >= 49 && e.keyCode <=57){
        myInventory.selected = e.keyCode-48;
    }
}
function keyUpHandler(e){
    if(e.key == "Up" || e.key == "ArrowUp" || e.key == "w"){
        up = false;
    }
    if(e.key == "Right" || e.key == "ArrowRight" || e.key == "d"){
        right = false;
    }
    if(e.key == "Left" || e.key == "ArrowLeft" || e.key == "a"){
        left = false;
    }
    if(e.key == " " /*space bar*/){
        space = false;
    }
}

//This function converts world coordinates to actual pixel coordinates based on world coordinates
function convertCoordinates(gridX, gridY, blockSize){
    return {
        x:gridX*blockSize,
        y:gridY*blockSize
    };
}

function reverseConvertCoords(x,y,blockSize){
    return {
        gridX:Math.floor(x/blockSize),
        gridY:Math.floor(y/blockSize)
    };
}

//Update Camera
function updateCamera(x,y){
    myCamera.x += x-canvas.width/2;
    myCamera.y += y-canvas.height/2;
    myPlayer.realX = myPlayer.x + myCamera.x;
    myPlayer.realY = myPlayer.y + myCamera.y;
}

//This function takes in 2 objects with x, y, width, and height and tells you if they are overlapping
function collisionDetection(body1,body2){
    return body1.x+body1.width > body2.x-myCamera.x && body1.x < body2.x+body2.width-myCamera.x && 
           body1.y+body1.height > body2.y-myCamera.y && body1.y < body2.y+body2.height-myCamera.y;
}

//Like the collision detection, but a point inside a rectangle.
function isInside(pos, rect){
    return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
}

//Just to clean up the code I put the stuff that makes the player move in here
function playerController(){
    if(Math.abs(myPlayer.speedX)>0.2){
        myPlayer.walk(myPlayer.speedX);
    }
    if(up == true){
        if(myPlayer.falling<3 && myPlayer.jumpKey==0){
            myPlayer.speedY = 10;
            myPlayer.jumpKey = 1;
        }
    } else {
        myPlayer.jumpKey = 0;
    }
    myPlayer.y -= myPlayer.speedY;
    if(myPlayer.speedY<4 || up == true){
        myPlayer.speedY -= GRAVITY;
    } else {
        myPlayer.speedY -= GRAVITY*2;
    }
    if(left){
        myPlayer.speedX -= .5;
    }
    if(right){
        myPlayer.speedX += .5;
    }
    myPlayer.speedX *= FRICTION;
    myPlayer.update();
}

//Main game loop. loops 100 times per second I think?
function main(){
    ctx.clearRect(0,0,canvas.width,canvas.height);//Clears the canvas so things don't smear
    myWorld.render();//Draws everything
    playerController();//Controls the player
    updateCamera(myPlayer.x, myPlayer.y);//Changes the camera based on how much the player has moved
    scrollPos = {//Updates scroll pos so that if you don't move the mouse your pointer still moves with you
        x: mousePos.x + myCamera.x,
        y: mousePos.y + myCamera.y
    };
    //console.log(myInventory.selected);
    myInventory.draw();    
    myPlayer.x = canvas.width/2;//Returns the player to the center of the screen
    myPlayer.y = canvas.height/2;//Same
}
setInterval(main,10);

//Keyboard event listeners
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//Function to get the mouse position
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
//Function to check whether a point is inside a rectangle
function isInside(pos, rect){
    return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
}

//Binding the click event on the canvas and controls breaking & placing logic
canvas.addEventListener('click', function(evt) {
    mousePos = getMousePos(canvas, evt);
    scrollPos = {
        x:mousePos.x+myCamera.x,
        y:mousePos.y+myCamera.y
    }
    for(var i=0; i<WORLD_HEIGHT; i++){
        for(var j = 0; j < WORLD_WIDTH; j++){
            playerGridPos = reverseConvertCoords(myPlayer.realX,myPlayer.realY,BLOCK_SIZE);
            /*You might need this later
            !(i == playerGridPos.gridY && j == playerGridPos.gridX) && 
                    !(i == playerGridPos.gridY+1 && j == playerGridPos.gridX)
                    */
            if (isInside(scrollPos,myWorld.map[i][j])){
                    if (myWorld.map[i][j].material != 0){
                        myInventory.storage[myWorld.map[i][j].material].quantity += 1;
                        myWorld.map[i][j] = new Block(j,i,0,BLOCK_SIZE);
                        myWorld.render();    
                    }else{
                        if(!collisionDetection(myPlayer,myWorld.map[i][j])){
                        if(myInventory.storage[myInventory.ordered[myInventory.selected-1]].quantity>0){
                            myWorld.map[i][j] = new Block(j,i,myInventory.selected,BLOCK_SIZE);
                            myInventory.storage[myInventory.ordered[myInventory.selected-1]].quantity -= 1;
                        }
                        }
                    }
                
            }
        }
    }
}, false);