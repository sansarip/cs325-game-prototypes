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
	var chickenP = "assets/Sprites/chicken.png"
	var heartP = "assets/Sprites/heart.png"
	
    function preload() {
        game.load.image( 'pepper1', pepper1P );
		game.load.image( 'pepper2', pepper1P );
		game.load.image('ball', ballP);
		game.load.image('bone', boneP);
		game.load.image('choco', chocoP);
		game.load.image('chicken', chickenP);
		game.load.image('heart', heartP);
		//game.load.image('heart', heart);
		
    }
    
    var pepper;
	var chicken;
	var flipLeft = true;
	var random;
	var points = 0;
	var heartsNum = 3;
	var bones;
	var chocos;
	var chickenDir;
	var hearts = [];
	var pointsText;
    
    function create() {
		game.stage.backgroundColor = "#4488AA"
		
		// spawn player
        pepper = game.add.sprite( game.world.randomX, game.world.centerY, 'pepper1' );
        pepper.anchor.setTo( 0.5, 0.5 );
        pepper.width = 200;
		pepper.height = 200;
		
		// spawn chicken
		chicken = game.add.sprite( 0, 40, 'chicken');
		chicken.anchor.setTo( 0.5, 0.5 );
        chicken.width = 200;
		chicken.height = 200;
		chicken.scale.x *= -1;
		chickenDir = true;
		
		// add player lives
		var i;
		var size = 35;
		for (i = 0; i < 3; i++) {
			hearts.push(game.add.sprite( game.world.width-((i+1)*size), 0, 'heart' ));
			hearts[i].width = size;
			hearts[i].height = size;
		}
		
		// create bone item group
		bones = game.add.group();
		bones.enableBody = true;
		bones.physicsBodyType = Phaser.Physics.ARCADE;
		
		// create chocolate item group
		chocos = game.add.group();
		chocos.enableBody = true;
		chocos.physicsBodyType = Phaser.Physics.ARCADE;
        
		// turn on the arcade physics engine for this sprite.
        game.physics.enable( pepper, Phaser.Physics.ARCADE );
		this.game.physics.arcade.gravity.y = 300
        
		// make player bounce off of the world bounds
        pepper.body.collideWorldBounds = true;
        
        // add some text using a CSS style.
        // center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "30px Verdana", fill: "#000000", align: "center" };
        pointsText = game.add.text(game.world.centerX, 0, "0", style);
        pointsText.anchor.setTo( 0.5, 0.0 );
		
		// spawn items
		game.time.events.repeat(Phaser.Timer.SECOND * 1, 100, spawnItems, this);
    }
    
    function update() {
		movePlayer();
		moveChicken();
		game.physics.arcade.overlap(bones, pepper, collisionHandler, null, this);
		game.physics.arcade.overlap(chocos, pepper, collisionHandler, null, this);
		checkHearts();
    }
	
	function collisionHandler(obj1, obj2) {
		if (obj2.name === "bone") {
			points += 1;
			pointsText.text = points;
		} else if (obj2.name === "choco") {
			heartsNum -= 1;
			try {
				hearts[hearts.length-1].destroy();
				hearts.pop();
			} catch (err) {
				console.log(err.message);
			}
			
		}
		obj2.destroy();
	}
	
	
	function checkHearts() {
		if (heartsNum <= 0) {
			game.destroy();
		}
	}
	
	/*
	 * allows player to move using keyboard arrow keys
	 */
	function movePlayer() {
		if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
		{
			if (!flipLeft) {
				pepper.scale.x *= -1;
				flipLeft = true;
			}
			pepper.x -= 8;
		}
		else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
		{
			if (flipLeft) {
				pepper.scale.x *= -1;
				flipLeft = false;
			}
			pepper.x += 8;
		}

		if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
		{
			pepper.y -= 8;
		}
		else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
		{
			pepper.y += 8;
		}
	}
	
	/*
	 * moves the chicken from left to right
	 */
	function moveChicken() {
		if(chicken.x <= 0) {
			chickenDir = true
			chicken.scale.x *= -1;
		} else if (chicken.x >= game.world.width) {
			chickenDir = false
			chicken.scale.x *= -1;
		}
		
		if (chickenDir) {
			chicken.x += 6
		} else {
			chicken.x -= 6
		}
	}
	
	/*
	 * spawns bones
	 */
	function createBones() {
		var bone = bones.create(chicken.x, chicken.y, 'bone');
		bone.anchor.setTo(0.5, 0.5);
		bone.width = 70;
		bone.height = 70;
		bone.name = "bone";
		game.add.tween(bone).to( { angle: 360 }, 1000, Phaser.Easing.Linear.None, true, 0, -1, false);
	}
	
	/*
	 * spawns chocolates
	 */
	function createChocos() {
		var choco = chocos.create(chicken.x, chicken.y, 'choco');
		choco.anchor.setTo(0.5, 0.5);
		choco.width = 75;
		choco.height = 75;
		choco.name = "choco"
		game.add.tween(choco).to( { angle: 360 }, 2000, Phaser.Easing.Linear.None, true, 0, -1, false);
	}
	
	
	/*
	 * spawns items
	 */
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
			createChocos();
		}
	}
};
