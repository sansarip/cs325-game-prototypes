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
	var floorP = "assets/Sprites/floor.png"
	
    function preload() {
        game.load.image( 'pepper1', pepper1P );
		game.load.image( 'pepper2', pepper1P );
		game.load.image('ball', ballP);
		game.load.image('bone', boneP);
		game.load.image('choco', chocoP);
		game.load.image('chicken', chickenP);
		game.load.image('heart', heartP);
		game.load.image('floor', floorP);
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
	var endGameText = [];
	var header1;
	var header2;
	var header3;
	var endGame;
	var floor;
	var gravity = 300;
    
    function create() {
		this.game.physics.arcade.gravity.y = 0;
		endGame = false;
		game.stage.backgroundColor = "#4488AA"
		
		// spawn invisible floor
		floor = game.add.sprite(game.world.centerX, game.world.height, 'floor');
		floor.anchor.setTo( 0.5, 0.5 );
		floor.width = game.world.width;
		floor.height = 100;
		
		// spawn player
        pepper = game.add.sprite( game.world.randomX, game.world.centerY, 'pepper1' );
        pepper.anchor.setTo( 0.5, 0.5 );
        pepper.width = 150;
		pepper.height = 150;
		pepper.name = "pepper";
		
		// spawn chicken
		chicken = game.add.sprite( 0, 40, 'chicken');
		chicken.anchor.setTo( 0.5, 0.5 );
        chicken.width = 200;
		chicken.height = 200;
		chicken.scale.x *= -1;
		chickenDir = true;
		
		// create bone item group
		bones = game.add.group();
		bones.enableBody = true;
		
		// create chocolate item group
		chocos = game.add.group();
		chocos.enableBody = true;
        
		// turn on the arcade physics engine for sprites
        game.physics.enable( pepper, Phaser.Physics.ARCADE );
		game.physics.enable( floor, Phaser.Physics.ARCADE );
		
		// turn on sprite gravity
		pepper.body.gravity.y = gravity;
		// turn off sprite gravity
		floor.body.gravity.y = 0;
        
		// make objects collide with world bounds
        pepper.body.collideWorldBounds = true;
        
        // add text styles
		header3 = { font: "20px Calibri", fill: "#000000", align: "center" };
        header2 = { font: "30px Calibri", fill: "#000000", align: "center" };
		header1 = { font: "60px Calibri", fill: "#000000", align: "center" };
		
		// initialize points
		pointsText = game.add.text(game.world.centerX, 0, '0', header2);
		pointsText.anchor.setTo( 0.5, 0.0 );
        resetPoints();
		
		// initialize hearts/lives
		resetHearts();
		
		// spawn items
		game.time.events.repeat(Phaser.Timer.SECOND * 1, 10000, spawnItems, this);
    }
   
    function update() {
		moveChicken();
		game.physics.arcade.overlap(chocos, floor, collisionHandler, null, this);
		game.physics.arcade.overlap(bones, floor, collisionHandler, null, this);
		if(!endGame) {
			movePlayer();
			game.physics.arcade.overlap(bones, pepper, collisionHandler, null, this);
			game.physics.arcade.overlap(chocos, pepper, collisionHandler, null, this);
			checkHearts();
		} else {
			restartGame();
		}
    }
	
	// checks collision between pepper and items
	function collisionHandler(obj1, obj2) {
		if (obj1.name === "pepper") {
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
		}
		obj2.destroy();
	}
	
	// resets fields necessary for new game
	function restartGame() {
		if (endGame) {
			if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
				game.add.tween(pepper).to( { angle: 0 }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
				resetHearts();
				resetPoints();
				endGameText[0].visible = false;
				endGameText[1].visible = false;
				endGame = false;
			}
		}
	}
	
	// reset points
	function resetPoints() {
		points = 0;
		pointsText.text = points;
	}
	
	// reset player lives
	function resetHearts()  {
		heartsNum = 3;
		var i;
		var size = 35;
		for (i = 0; i < heartsNum; i++) {
			hearts.push(game.add.sprite( game.world.width-((i+1)*size), 0, 'heart' ));
			hearts[i].width = size;
			hearts[i].height = size;
		}
	}
	
	// checks if player has run out of lives
	function checkHearts() {
		if (heartsNum <= 0) {
			endGameText[0] = game.add.text(game.world.centerX, game.world.centerY, "Game Over!\n", header1);
			endGameText[0].anchor.setTo( 0.5, 0.0 );
			endGameText[1] = game.add.text(game.world.centerX, game.world.centerY+75, "Press ENTER to play again!", header3)
			endGameText[1].anchor.setTo( 0.5, 0.0 );
			endGame = true;
			game.add.tween(pepper).to( { angle: -90 }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
		}
	}
	
	
	// allows player to move using keyboard arrow keys
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
			pepper.y -= 6;
		}
		else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
		{
			pepper.y += 2;
		}
	}
	

	// moves the chicken from left to right
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
	
	// spawns bones
	function createBones() {
		var bone = bones.create(chicken.x, chicken.y, 'bone');
		bone.anchor.setTo(0.5, 0.5);
		bone.width = 70;
		bone.height = 70;
		bone.name = "bone";
		bone.body.bounce.set(0.6);
		bone.body.collideWorldBounds = true;
		bone.body.gravity.y = gravity;
		if (chickenDir) {
			bone.body.velocity.setTo(600, 0);
		} else {
			bone.body.velocity.setTo(-600, 0);
		}
		game.add.tween(bone).to( { angle: 360 }, 1000, Phaser.Easing.Linear.None, true, 0, -1, false);
	}
	
	 // spawns chocolates
	function createChocos() {
		var choco = chocos.create(chicken.x, chicken.y, 'choco');
		choco.anchor.setTo(0.5, 0.5);
		choco.width = 75;
		choco.height = 75;
		choco.name = "choco"
		choco.body.bounce.set(0.8);
		choco.body.collideWorldBounds = true;
		choco.body.gravity.y = gravity;
		if (chickenDir) {
			choco.body.velocity.setTo(500, 0);
		} else {
			choco.body.velocity.setTo(-500, 0);
		}
		game.add.tween(choco).to( { angle: 360 }, 2000, Phaser.Easing.Linear.None, true, 0, -1, false);
	}
	
	// spawns items
	function spawnItems() {
		random = Math.floor(Math.random() * 10);
		if (random >= 5) {
			createBones();
		} else if (random > 3 && random < 5) {
			// do nothing - makes chicken behavior harder to predict
		} else if (random <= 3) {
			createChocos();
		}
	}
};
