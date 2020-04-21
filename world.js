//This is the world class, it stores all the blocks in the world, and has the methods to randomly generate a terrain
function World(width,height,camera,blockSize,skyHeight){
    this.width = width;
    this.height = height;
    this.blockSize = blockSize;
    this.offset = skyHeight;
    //The map will be made of larger blocks (maybe 20x20px), and their block objects will be stored in this matrix
    this.map = [];
    this.camera = camera;
    
    //Takes in the y of the layer being generated, and returns a block type. The x is for modifications based on surrounding blocks
    this.getBlockId = function(y, x){
        /***************
         * The top 5 levels will be 100% probability air, 6 will be 50% chance air v dirt, 7 will be 25% air v dirt
         *8 and 9 will be 100% dirt, 10-12 will be 50% dirt v stone, 13-14 will be 75% stone v dirt, the rest will be stone
         *but 20 will be bedrock.
         ***************/
         if(y<=5+this.offset){
             return 0;
         }else if(y==6+this.offset){
             if(Math.random() < .75){
                 return 0;
             }else{
                 return 1;
             }
         }else if(y==7+this.offset){
             if(Math.random() < .5 && this.map[y-1][x].material == 0){
                 return 0;
             }else{
                 return 1;
             }
        }else if(y==8+this.offset){
             if(Math.random() < .25 && this.map[y-1][x].material == 0){
                 return 0;
             }else{
                 return 1;
             }
         }else if(y<=10+this.offset){
             return 1;
         }else if(y<=12+this.offset){
             if(Math.random() < .5){
                 return  1;
             }else{
                 return 2;
             }
         }else if(y<=14+this.offset){
             if(Math.random() < .25){
                 return 1;
             }else{
                 return 2;
             }
         }else if(y<=20+this.offset){
             return 2;
         }else if(y<=22+this.offset){
             return 3;
         }else if(y>=23+this.offset){
             return 0;
         }


    }

    //Nested for loops that go through the world coordinates and put a block in the map using the getBlockId function
    this.generate = function(){
        for(var i = 0; i<this.height; i++){
            this.map.push([]);
            for(var j = 0; j<this.width; j++){
                var bID = this.getBlockId(i,j);
                this.map[i].push(new Block(j,i,bID,this.blockSize));
            }
        }
    }

    //Loops through the map matrix and calls the draw function for each block
    this.render = function(){
        for(var i = 0; i<this.height; i++){
            for(var j = 0; j<this.width; j++){
                this.map[i][j].draw(this.camera);
            }
        }
    }
}

//This is the block class, it stores the attributes like type, color, destroyed, and the draw function
function Block(gridX,gridY,material,blockSize){ //The x and y will be in world coordinates
    /***************
     * Block Material Guide:
     * 0:air
     * 1:dirt
     * 2:stone
     * 3:bedrock
     ***************/
    this.gridX = gridX;
    this.gridY = gridY;
    this.blockSize = blockSize;
    this.x = this.gridX*this.blockSize;
    this.y = this.gridY*this.blockSize;
    this.width = this.blockSize;
    this.height = this.blockSize;
    this.material = material;

    //Determine the color based on the material
    if(this.material == 0){
        this.color = null;
    }else if(this.material == 1){
        this.color = "#583609";
    }else if(this.material == 2){
        this.color = "#838383";
    }else if(this.material == 3){
        this.color = "#292929";
    }

    //Draw the block based on its color, grid pos and camera position.
    this.draw = function(camera){
        if(material != 0){
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x-camera.x, this.y-camera.y, this.blockSize+1, this.blockSize+1);
            ctx.fill();
            ctx.closePath();
        }
    }
}
