import Phaser from "phaser";

export class Frog {
    constructor(imgKey, width, height, pos_x, pos_y){
        this.imgKey = imgKey;
        this.width = width;
        this.height = height;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
    }

    draw(game){
        game.add.image(this.pos_x, this.pos_y, this.imgKey).setScale(0.1);
    }

    key_listener(keyDict){
        if (keyDict['Up'].isDown){
            console.log('Up');
            this.pos_y -= 2;
        }

        if (keyDict['Down'].isDown){
            console.log('Down');
            this.pos_y += 2;
        }

        if (keyDict['Left'].isDown){
            console.log('Left');
            this.pos_x -= 2;
        }

        if (keyDict['Right'].isDown){
            console.log('Right');
            this.pos_x += 2;
        }
    }
}