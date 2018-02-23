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
    
    var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render} );
    var cloudP = "assets/Sprites/clouds.png";
	var goodP = "assets/Sprites/good.png";
	var badP = "assets/Sprites/bad.png";
	var shineP = "assets/Sprites/shine.png";
	var themeP = "assets/Audio/maintheme.ogg";
	var hitP = "assets/Audio/hit.wav";
	var backgroundP = "assets/Backgrounds/bluesky.png";
	
    function preload() {
        game.load.spritesheet("clouds", cloudP, 64, 64);
		game.load.spritesheet("bad", badP, 64, 64);
        game.load.spritesheet("good", goodP, 64, 64);
		game.load.spritesheet("shine", shineP, 128, 128);
		game.load.image("sky", backgroundP);
		game.load.audio("theme", [themeP]);
		game.load.audio("hit", [hitP]);
    }
    
    const MAX_GOOD = 50;
	const TIME_LIMIT = 10;
	const MAX_BAD = TIME_LIMIT/2;
	const BASE_SPEED = 200;
	const WORLD_WIDTH = 1920;
	const WORLD_HEIGHT = 1920;
	const SCALAR = 1.05;
	const MAX_SPEEDBOOST = 12;	// max speed <= speed * boost^MAX_SPEEDBOOST
	const SCORE_INCR = 100;
	var player;
	var shine;
	var theme;
	var hit;
	var background;
	var goodArray = [];
	var badArray = [];
	var goodCount = 0;
	var badCount = 0;
	var boostCount = 0;
	var score = 0;
	var endGame = false;
	var shiny = false;
	var boost = 1;
	var header1;
	var header2;
	var header3;
	var scoreText;
	var endText = [];
	
    function create() {
		// set world bounds
		game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
		
		// set background
		background = game.add.sprite(game.world.centerX, game.world.centerY, "sky");
		background.anchor.setTo(0.5, 0.5);
		background.width = WORLD_WIDTH;
		background.height = WORLD_HEIGHT;
		game.stage.backgroundColor = "#4488AA";
		
		// add player sprite
		player = game.add.sprite(game.world.centerX, game.world.centerY, "clouds");
		player.anchor.setTo(0.5, 0.5);
		player.width = 50;
		player.height = 50;
		player.name = "player";
		player.animations.add("float");
		player.animations.play("float", 10, true);
		
		// enable physics
		game.physics.enable(player, Phaser.Physics.ARCADE);
		this.game.physics.arcade.gravity.y = 0;
			
		// spawn good clouds
		game.time.events.repeat(Phaser.Timer.SECOND * 2, 10000, spawnGoodClouds, this);
		game.time.events.repeat(Phaser.Timer.SECOND * 2, 10000, spawnBadClouds, this);
		
		// music fields
		theme = game.add.audio("theme");
		hit = game.add.audio("hit");
		hit.volume = .25;
		theme.onDecoded.add(start, this);
		
		// set camera
		game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON);
		game.input.mouse.capture = true;
		
		// add text styles
		header3 = { font: "20px Calibri", fill: "#000000", align: "center" };
        header2 = { font: "30px Calibri", fill: "#000000", align: "center" };
		header1 = { font: "60px Calibri", fill: "#000000", align: "center" };
		
		// initialize text
		scoreText = game.add.text(game.camera.width/2, 0, "Score: 0", header2);
		scoreText.anchor.setTo( 0.5, 0.0 );
		scoreText.fixedToCamera = true;
		
		
    }
   
    function update() {
		if (!endGame) {
			addShine();
			movePlayer();
			overlap();
	} else {
			game.input.onDown.addOnce(restart, this);
		}
    }
	
	function render() {
		//game.debug.cameraInfo(game.camera, 32, 32);
		//game.debug.spriteCoords(player, 32, 500);
	}
	
	// plays main theme
	function start() {
		theme.loop = true;
		theme.play();
	}
	
	// restarts game
	function restart() {
		location.reload();
	}
	
	class Good {
		constructor(width, height) {
			var random = Math.random();
			if (random < 0.5) {
				this.good = game.add.sprite(game.world.randomX * 3, game.world.randomY * 3, "good");
			} else {
				this.good = game.add.sprite(-game.world.randomX * 3, -game.world.randomY * 3, "good");
			}
			this.good.width = width;
			this.good.height = height;
			this.good.name = "good";
			this.good.anchor.setTo(0.5, 0.5);
			this.good.animations.add("good_float");
			this.good.animations.play("good_float", 10, true);
			game.physics.enable(this.good, Phaser.Physics.ARCADE);
			this.tweenToXY();
		}
		
		tweenToXY() {
			var demoTween = game.add.tween(this.good).to({x:game.world.randomX,y:game.world.randomY},5000);
			demoTween.start();
		}
		
		get goodObj() {
			return this.good;
		}
		
		static destroy(obj) {
			obj.destroy();
			goodCount -= 1;
		}
	}
	
	class Bad {
		constructor(width, height) {
			this.life = TIME_LIMIT;
			var random = Math.random();
			if (player.x >= WORLD_WIDTH/2 && player.y < WORLD_HEIGHT/2) {	// upper right corner
				this.bad = game.add.sprite(player.x + WORLD_WIDTH/2, game.world.randomY - WORLD_HEIGHT/2, "bad");
			} else if (player.x >= WORLD_WIDTH/2 && player.y >= WORLD_HEIGHT/2) {	// lower right corner
				this.bad = game.add.sprite(player.x + WORLD_WIDTH/2, game.world.randomY + WORLD_HEIGHT/2, "bad");
			} else if (player.x < WORLD_WIDTH/2 && player.y >= WORLD_HEIGHT/2) {	// lower left corner
				this.bad = game.add.sprite(player.x - WORLD_WIDTH/2, game.world.randomY + WORLD_HEIGHT/2, "bad");
			} else if (player.x < WORLD_WIDTH/2 && player.y < WORLD_HEIGHT/2) {	// lower right corner
				this.bad = game.add.sprite(player.x - WORLD_WIDTH/2, game.world.randomY - WORLD_HEIGHT/2, "bad");	// upper left corner
			}
			this.bad.width = width;
			this.bad.height = height;
			this.bad.name = "bad";
			this.bad.alpha = 1;
			this.bad.anchor.setTo(0.5, 0.5);
			this.bad.animations.add("bad_float");
			this.bad.animations.play("bad_float", 10, true);
			this.speed = random * BASE_SPEED + BASE_SPEED;
			game.physics.enable(this.bad, Phaser.Physics.ARCADE);
		}
		
		get badObj() {
			return this.bad;
		}
		
		get speedVal() {
			return this.speed;
		}
		
		get lifeVal() {
			return this.life;
		}
		
		set lifeVal(newLife) {
			this.life = newLife;
		}
		
		static destroy(obj) {
			obj.destroy();
			badCount -= 1;
		}
		
		static chase(bool) {
			var i;
			for (i = 0; i < badArray.length; i++) {
				if (bool) {
					game.physics.arcade.moveToXY(badArray[i].badObj, player.x, player.y, badArray[i].speedVal*boost-(boostCount*(SCALAR/2)));
					badArray[i].lifeVal -= game.time.elapsed/1000;
					if (badArray[i].badObj.alpha > 0) {
						badArray[i].badObj.alpha -= 0.00125;
					}
					if (badArray[i].lifeVal <= 0) {
						badArray[i].badObj.destroy();
						badArray.splice(i, 1);
						badCount -= 1;
					}
				} else {
					badArray[i].badObj.body.velocity.setTo(0,0);
				}
			}
		}
		
	}
	
	// increments score
	function updateScore(big) {
		if (big) {
			score += Math.ceil(SCORE_INCR * boost);
		} else {
			score += Math.ceil(boost);
		}
		scoreText.text = "Score: " + score;
	}
	
	// checks collision between objects
	function collisionHandler(obj1, obj2) {
		if (obj2.name === "player" && obj1.name === "good") {
			Good.destroy(obj1);
			updateScore(true);
			if (boostCount < MAX_SPEEDBOOST) {
				player.width *= SCALAR;
				player.height *= SCALAR;
				boost *= SCALAR;
				boostCount += 1;
			}
		} else if (obj2.name === "player" && obj1.name === "bad") {
			if (shiny) {
				shine.destroy();
				shiny = false;
			}
			Bad.destroy(obj1);
			player.body.velocity.setTo(0,0);
			player.loadTexture("bad");
			player.animations.add("dead");
			player.animations.play("dead", 10, true);
			endGame = true;
			game.camera.shake(0.05, 500);
			theme.fadeTo(100, .25);
			hit.play();
			endText[0] = game.add.text(game.camera.width/2, game.camera.height/2, "Oh no! You've turned into a thunder boi!", header1);
			endText[0].anchor.setTo( 0.5, 0.0 );
			endText[0].fixedToCamera = true;			
			endText[1] = game.add.text(game.camera.width/2, game.camera.height/2 + 75, "CLICK to play again!", header2);
			endText[1].anchor.setTo( 0.5, 0.0 );
			endText[1].fixedToCamera = true;
		}
	}
	
	// checks if objects overlap
	function overlap() {
		var i;
		for (i = 0; i < goodArray.length; i++) {
			game.physics.arcade.overlap(goodArray[i].goodObj, player, collisionHandler, null, this);
		}
		for (i = 0; i < badArray.length; i++) {
			game.physics.arcade.overlap(badArray[i].badObj, player, collisionHandler, null, this);
		}
	}
	
	// allows player to move using mouse input
	function movePlayer() {
		if (game.input.activePointer.leftButton.isDown) {
			game.physics.arcade.moveToXY(player, game.input.activePointer.worldX, game.input.activePointer.worldY, BASE_SPEED * 2 * boost);
			if (shiny) {
				game.physics.arcade.moveToXY(shine, game.input.activePointer.worldX, game.input.activePointer.worldY, BASE_SPEED * 2 * boost);
			}
			updateScore(false);
			Bad.chase(true);
		} else if (!game.input.activePointer.leftButton.isDown) {
			player.body.velocity.x=0;
			player.body.velocity.y=0;
			if (shiny) {
				shine.body.velocity.setTo(0,0);
			}
			Bad.chase(false);
		}
	}
	
	// spawns the good clouds
	function spawnGoodClouds() {
		if (goodCount < MAX_GOOD) {
			var g = new Good(50, 50);
			goodArray.push(g);
			goodCount += 1;
		}
	}
	
	// spawns the bad clouds
	function spawnBadClouds() {
		if (badCount < MAX_BAD) {
			var b = new Bad(75, 75);
			badArray.push(b);
			badCount += 1;
		}
	}
	
	// adds shining effect to player cloud
	function addShine() {
		if (boostCount == MAX_SPEEDBOOST-1 && !shiny) {
			shine = game.add.sprite(player.x, player.y, "shine");
			shine.anchor.setTo(0.5, 0.5);
			shine.width = 250;
			shine.height = 250;
			shine.name = "shine";
			shine.animations.add("shining");
			shine.animations.play("shining", 10, true);
			game.physics.enable(shine, Phaser.Physics.ARCADE);
			shiny = true;
		}
	}
}