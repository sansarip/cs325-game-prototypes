"use strict";

window.onload = function() {
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    var pepper1P = "assets/Sprites/house_pepper_interact12.png"
	var pepper2P = "assets/Sprites/house_pepper_interact22.png"
	var ballP = "assets/Sprites/ball.png"
	var chocoP = "assets/Sprites/choco.png"
	var boneP = "assets/Sprites/bone.png"
	
    function preload() {
        game.load.image( 'pepper1', pepper1P );
		game.load.image( 'pepper2', pepper1P );
		game.load.image('ball', ballP);
		game.load.image('bone', boneP);
		game.load.image('choco', chocoP);
		//game.load.image('heart', heart);
		
    }
    
    var pepper;
	var flipLeft = true;
	var random;
	var points = 0;
	var hearts = 3;
	var bones;
    
    function create() {
		game.stage.backgroundColor = "#4488AA"
        // Create a sprite at the center of the screen using the 'logo' image.
        pepper = game.add.sprite( game.randomX, game.world.randomY, 'pepper1' );
        // Anchor the sprite at its center, as opposed to its top-left corner.
        // so it will be truly centered.
        pepper.anchor.setTo( 0.5, 0.5 );
        pepper.width = 200;
		pepper.height = 200;
		
		bones = game.add.group();
		bones.enableBody = true;
		bones.physicsBodyType = Phaser.Physics.ARCADE;
		//createBones();
		
        // Turn on the arcade physics engine for this sprite.
        game.physics.enable( pepper, Phaser.Physics.ARCADE );
		this.game.physics.arcade.gravity.y = 300
        // Make it bounce off of the world bounds.
        pepper.body.collideWorldBounds = true;
        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
        var text = game.add.text( game.world.centerX, 15, "Build something amazing.", style );
        text.anchor.setTo( 0.5, 0.0 );
		
		game.time.events.repeat(Phaser.Timer.SECOND * 2, 100, spawnItems, this);
    }
    
    function update() {
        // Accelerate the 'logo' sprite towards the cursor,
        // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
        // in X or Y.
        // This function returns the rotation angle that makes it visually match its
        // new trajectory.
		if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
		{
			if (!flipLeft) {
				pepper.scale.x *= -1;
				flipLeft = true;
			}
			pepper.x -= 4;
		}
		else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
		{
			if (flipLeft) {
				pepper.scale.x *= -1;
				flipLeft = false;
			}
			pepper.x += 4;
		}

		if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
		{
			pepper.y -= 4;
		}
		else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
		{
			pepper.y += 4;
		}
    }
	
	function createBones() {
		var bone = bones.create(game.world.randomX * 10, game.world.centerY - 400, 'bone');
		bone.anchor.setTo(0.5, 0.5);
		bone.x = 100;
		bone.y = 100;
	}
	
	function spawnItems() {
		random = Math.floor(Math.random() * 10);
		if (random >= 5) {
			createBones();
			//game.add.sprite(new bone(game));
			//new bone(game);
			// spawn bones
		} else if (random > 2 && random < 5) {
			// spawn balls
		} else if (random <= 2) {
			// spawn chocolate
		}
	}
};
