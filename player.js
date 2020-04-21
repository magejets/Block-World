//Player class. The dude that moves around and does stuff
function Player(x, y, width, height, color, world){
    //Passed in variables
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.world = world;
    this.realX = this.x;
    this.realY = this.y;

    //Predetermined variables
    this.speedY = 0;
    this.speedX = 0;
    this.jumpKey = 0;
    this.jumpSpeed = 10;
    this.dead = false;

    //Draws the player, just a simple rectangle for now
    this.draw = function(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.rect(this.x,this.y,this.width,this.height);
        ctx.fill();
        ctx.closePath();
    }

    //Walks forward, checks for walls with a slope of more than 8
    this.walk = function(speed){
        this.x += speed;
        var slope;
        for(var i = 0; i < WORLD_HEIGHT; i++){
            for(var j = 0; j < WORLD_WIDTH; j++){
                var b = this.world.map[i][j];
                slope = 0;
                while(slope < 8 && collisionDetection(this,b) && b.material != 0){
                    this.y -= 1;
                    slope +=1;
                }
                    
                if(slope >= 8){
                    this.x -= speed;
                    this.y += slope;
                }
            }
        }
    }

    //Handles collisions with floor and ceiling
    this.touchGround = function(up){
        this.falling += 1;
        for(var i = 0; i < WORLD_HEIGHT; i++){
            for(var j = 0; j < WORLD_WIDTH; j++){
                var b = this.world.map[i][j];
                while(collisionDetection(this,b) && b.material != 0){
                    if(up){
                        this.y += .5
                    }else {
                        this.y -= .5; //this number must be equal to what speedY changes each time
                        this.falling = 0;
                    }
                    this.speedY = 0;
                }
            }
        }
    }

    //This function just consolidates the draw & touchground functions that need to be called each frame
    this.update = function(){
        this.touchGround(this.speedY > 0);
        this.draw();
    }
    //I'm not exactly sure where I will use it, but I am just keeping it for now, it was useful in WSODL
    this.kill = function(){
        console.log("killing")
        this.dead = true;
    }
}

//Inventory class. Stores what items you have & how much, also tells the placing handler what block to place
function Inventory(size){
    this.storage = {'1':{quantity:0, color: "#583609"}, '2': {quantity:0, color: "#838383"}, '3':{quantity:0, color: "#292929"}};
    this.ordered = [];
    this.selected = 1;
    this.size = size;
    this.draw = function(){
        for(var i = 9; i > 0; i--){
            ctx.beginPath();
            if(this.selected == i){
                ctx.fillStyle = "#333333";
            }else{
                ctx.fillStyle = "#888888";
            }
            ctx.fillRect(((i)*this.size)+200-(3*this.size),canvas.height-(this.size+5),this.size,this.size);
            ctx.fill();
            ctx.fillStyle = "#BBBBBB";
            ctx.fillRect(((i)*this.size)+202-(3*this.size),canvas.height-((this.size-3)+7),this.size-3,this.size-3);
            ctx.fill();
            if(this.ordered[i-1] != null && this.storage[this.ordered[i-1]].quantity > 0){
                ctx.fillStyle = this.storage[this.ordered[i-1]].color;
                ctx.fillRect((i*this.size)+205-(3*this.size),canvas.height-((this.size-5)+5),this.size-10,this.size-10);
                ctx.fill();
            }
            ctx.closePath();
        }
    }
}