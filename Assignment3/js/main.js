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
    
    var game = new Phaser.Game( 1024, 768, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    var cloudP = "assets/Sprites/clouds.png"
	var goodP = "assets/Sprites/ball.png"
	var themeP = "assets/Audio/maintheme.ogg"
	var backgroundP = "assets/Backgrounds/bluesky.png"
	
    function preload() {
        game.load.spritesheet("clouds", cloudP, 1539, 866);
        game.load.image("good", goodP);
		game.load.image("sky", backgroundP);
		game.load.audio("theme", [themeP]);
    }
    
    var player;
	var theme;
	var background;
	var goodArray = [];
	var goodCount = 0;
	const MAX_GOOD = 10;
	
    function create() {
		theme = game.add.audio("theme");
		background = game.add.sprite(game.world.centerX, game.world.centerY, "sky");
		background.anchor.setTo(0.5, 0.5);
		background.width = 1024;
		background.height = 768;
		this.game.physics.arcade.gravity.y = 0;
		game.stage.backgroundColor = "#4488AA";
		player = game.add.sprite(game.world.centerX, game.world.centerY, "clouds");
		player.anchor.setTo(0.5, 0.5);
		player.width = 50;
		player.height = 50;
		player.name = "player";
		player.animations.add("float");
		player.animations.play("float", 10, true);
		game.physics.enable(player, Phaser.Physics.ARCADE);
			
		// spawn good clouds
		game.time.events.repeat(Phaser.Timer.SECOND * 2, 10000, spawnGoodClouds, this);
		
		theme.loop = true;
		theme.play();
    }
   
    function update() {
		movePlayer();
		overlap();
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
	
	// checks collision between objects
	function collisionHandler(obj1, obj2) {
		if (obj2.name === "player" && obj1.name === "good") {
			Good.destroy(obj1);
			player.width *= 1.1;
			player.height *= 1.1;
		}
	}
	
	function overlap() {
		var i;
		for (i = 0; i < goodArray.length; i++) {
			try {
				game.physics.arcade.overlap(goodArray[i].goodObj, player, collisionHandler, null, this);
			} catch (err) {
				
			}
		}
	}
	
	// allows player to move using mouse input
	function movePlayer() {
		if (game.input.activePointer.leftButton.isDown) {
			game.physics.arcade.moveToXY(player, game.input.mousePointer.x, game.input.mousePointer.y, 0, 150);
		} else if (!game.input.activePointer.leftButton.isDown) {
			player.body.velocity.setTo(1, 1);
		}
	}
	
	function spawnGoodClouds() {
		if (goodCount < MAX_GOOD) {
			var g = new Good(100, 100);
			goodArray.push(g);
			goodCount += 1;
		}
	}
}