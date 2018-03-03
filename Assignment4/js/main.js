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
    
    var game = new Phaser.Game( 768, 576, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    var playerP = "assets/Sprites/clouds.png";
    var bad1P = "assets/Sprites/bad-1.png";
	var bad1AttackP = "assets/Sprites/bad-attack.png"
	var backgroundP = "assets/Background/background.png";
	var projectileP = "assets/Sprites/projectile.png"
	var themeP = "assets/Audio/maintheme.ogg";
	
    function preload() {
        game.load.spritesheet( "player", playerP, 64, 64);
        game.load.spritesheet( "bad1", bad1P, 64, 64);
        game.load.spritesheet( "bad1Attack", bad1AttackP, 64, 64);
		game.load.image("background", backgroundP);
		game.load.image("projectile", projectileP);
		game.load.audio("theme", [themeP]);
    }
    
	const WORLD_WIDTH = 960;
	const WORLD_HEIGHT = 960;
	const MAX_BAD = 20;
	const iLimit = Math.floor(WORLD_WIDTH/64)-1;
	const jLimit = Math.floor(WORLD_HEIGHT/64)-1;
	var bad1Count = 0;
	var flipRight = false;
	var moveKeyDown = false;
	var attackKeyDown = false;
	var background;
    var player;
	var tile1;
	var scoreText;
	var header1;
	var header2;
	var header3;
	var theme;
	var cursors;
	var grid = [];
	var bad1Spawns = [];
	var bad1Array = [];
	var projArray = [];
	var pos = new Phaser.Point(Math.floor(iLimit/2), Math.floor(jLimit/2));	// pos.x is the i'th index, pos.j is the j'th index
    
    function create() {
		// set world bounds
		game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
		
		// create grid
		createGrid();
		
		// create spawns
		spawnLocations();
		
		theme = game.add.audio("theme");
		this.game.physics.arcade.gravity.y = 0;
		game.stage.backgroundColor = "#4488AA"
		
		// add background
		background = game.add.sprite(game.world.centerX, game.world.centerY, "background");
		background.anchor.setTo(0.5, 0.5);
		
		// spawn player 
		player = game.add.sprite(grid[pos.x][pos.y].x, grid[pos.x][pos.y].y, "player");
		player.anchor.setTo(0.5, 0.5);
		player.width = 50;
		player.height = 50;
		player.name = "player";
		player.animations.add("float");
		player.animations.play("float", 5, true);
		
		// turn on the arcade physics engine for sprites
        game.physics.enable(player, Phaser.Physics.ARCADE );
        
		// make objects collide with world bounds
        player.body.collideWorldBounds = true;
        
        // add text styles
		header3 = { font: "20px Calibri", fill: "#000000", align: "center" };
        header2 = { font: "30px Calibri", fill: "#000000", align: "center" };
		header1 = { font: "60px Calibri", fill: "#000000", align: "center" };
		
		// set camera
		game.camera.follow(player, Phaser.Camera.FOLLOW_TOPDOWN);
		//game.input.mouse.capture = true;
		
		// initialize text
		scoreText = game.add.text(game.camera.width/2, 0, "Score: 0", header2);
		scoreText.anchor.setTo( 0.5, 0.0 );
		scoreText.fixedToCamera = true;
		
		// spawn enemies
		game.time.events.repeat(Phaser.Timer.SECOND * 1, 10000, createAndManageEnemies, this);
		
		theme.loop = true;
		theme.volume = 0.5;
		theme.play();
		
		cursors = game.input.keyboard.createCursorKeys();
    }
   
    function update() {
		move();
		attack();
		destroyProjectiles();
	}
	
	class Bad1 {
		constructor(width, height) {
			var random = Math.floor(Math.random()*(bad1Spawns.length));
			this.attacking = false;
			this.pos = new Phaser.Point();
			this.pos.x = bad1Spawns[random].x;
			this.pos.y = bad1Spawns[random].y;
			this.life = 10;
			this.bad = game.add.sprite(grid[this.pos.x][this.pos.y].x, grid[this.pos.x][this.pos.y].y, "bad1");
			this.bad.width = width;
			this.bad.height = height;
			this.bad.name = "bad1";
			this.bad.anchor.setTo(0.5, 0.5);
			this.bad.animations.add("bad1_idle", [0,1]);
			this.bad.animations.play("bad1_idle", 5, true);
			game.physics.enable(this.bad, Phaser.Physics.ARCADE);
		}
		
		get badObj() {
			return this.bad;
		}
		
		get iPos() {
			return this.pos.x;
		}		
		
		get jPos() {
			return this.pos.y;
		}
		
		get lifeVal() {
			return this.life;
		}
		
		get isAttacking() {
			return this.attacking;
		}
		
		set isAttacking(val) {
			this.attacking = val;
		}
		
		set lifeVal(newLife) {
			this.life = newLife;
		}
		
		set iPos(i) {
			this.pos.x = i;
		}
		
		set jPos(j) {
			this.pos.y = j;
		}
		
		idle() {
			this.attacking = false;
			this.bad.loadTexture("bad1", 0);
			this.bad.animations.add("bad1_idle", [0,1]);
			this.bad.animations.play("bad1_idle", 5, true);
		}
		
		attack() {
			this.attacking = true;
			this.bad.loadTexture("bad1Attack", 0);
			this.bad.animations.add("bad1_attack", [0,1]);
			this.bad.animations.play("bad1_attack", 5, true);
		}
		
		static destroy(obj) {
			obj.destroy();
			bad1Count -= 1;
		}
		
		static chase(bool) {
			var i;
			for (i = 0; i < bad1Array.length; i++) {
				if (bool) {
					var bad1 = bad1Array[i];
					// move enemies to player
					if (pos.x+1 < bad1.iPos) {
						bad1.iPos -= 1;
						bad1.badObj.x = grid[bad1.iPos][bad1.jPos].x;
					} else if (pos.x-1 > bad1.iPos) {
						bad1.iPos += 1;
						bad1.badObj.x = grid[bad1.iPos][bad1.jPos].x;
					} else if (pos.y+1 < bad1.jPos) {
						bad1.jPos -= 1;
						bad1.badObj.y = grid[bad1.iPos][bad1.jPos].y;
					} else if (pos.y-1 > bad1.jPos) {
						bad1.jPos += 1;
						bad1.badObj.y = grid[bad1.iPos][bad1.jPos].y;
					}
					// kill enemy
					if (bad1Array[i].lifeVal <= 0) {
						Bad.destroy(bad1Array[i].badObj);
						bad1Array.splice(i, 1);
					}
					// attack player
					if (checkNeighborPlayer(new Phaser.Point(bad1.iPos, bad1.jPos))) {
						bad1.attack();
					} else if (bad1.isAttacking) {
						bad1.idle();
					}
				} 
			}
		}
		
	}
	
	function checkNeighborPlayer(point) {
		if (Math.abs(point.x-pos.x) <= 1 && Math.abs(point.y-pos.y) <= 1) {
			return true;
		}
		return false;
	}
	
	function createGrid() {
		var i;
		var j;
		for (i = 32; i < WORLD_WIDTH; i+=64) {
			var subGrid = [];
			for (j = 32; j < WORLD_HEIGHT; j+=64) {
				var p = new Phaser.Point(i, j);
				subGrid.push(p);
			}
			grid.push(subGrid);
		}
	}
	
	function spawnLocations() {
		bad1Spawns.push(new Phaser.Point(0, 0));
		bad1Spawns.push(new Phaser.Point(iLimit, 0));
		bad1Spawns.push(new Phaser.Point(0, jLimit));
		bad1Spawns.push(new Phaser.Point(iLimit, jLimit));
	}
	
	function move() {
		if (cursors.left.isDown)
		{
			if (pos.x - 1 >= 0 && !moveKeyDown) {
				if (flipRight) {
					player.scale.x *= -1;
					flipRight = false;
				}	
				pos.x -= 1;
				player.x = grid[pos.x][pos.y].x
			}
			moveKeyDown = true;
			return;
		}
		else if (cursors.right.isDown)
		{
			if (pos.x + 1 <= iLimit && !moveKeyDown) {
				if (!flipRight) {
					player.scale.x *= -1;
					flipRight = true;
				}
				pos.x += 1;
				player.x = grid[pos.x][pos.y].x
			}
			moveKeyDown = true;
			return;
		}
		else if (cursors.up.isDown)
		{
			if (pos.y - 1 >= 0 && !moveKeyDown) {
				pos.y -= 1;
				player.y = grid[pos.x][pos.y].y
			}
			moveKeyDown = true;
			return;
		}
		else if (cursors.down.isDown)
		{
			if (pos.y + 1 <= jLimit && !moveKeyDown) {
				pos.y += 1;
				player.y = grid[pos.x][pos.y].y
			}
			moveKeyDown = true;
			return;
		}
		moveKeyDown = false;
	}
	
	function attack() {
		if (game.input.keyboard.isDown(Phaser.Keyboard.A) && !attackKeyDown) {
			if (flipRight) {
				player.scale.x *= -1;
				flipRight = false;
			}
			var s = game.add.sprite(grid[pos.x][pos.y].x-32, grid[pos.x][pos.y].y, "projectile");
			s.anchor.setTo(0.5, 0.5);
			s.width = 16;
			s.height = 16;
			game.physics.enable(s, Phaser.Physics.ARCADE );
			s.body.velocity.setTo(-600, 0);
			projArray.push(s);
			attackKeyDown = true;
			return;
		}
		else if (game.input.keyboard.isDown(Phaser.Keyboard.D) && !attackKeyDown) {
			if (!flipRight) {
				player.scale.x *= -1;
				flipRight = true;
			}
			var s = game.add.sprite(grid[pos.x][pos.y].x+32, grid[pos.x][pos.y].y, "projectile");
			s.anchor.setTo(0.5, 0.5);
			s.width = 16;
			s.height = 16;
			game.physics.enable(s, Phaser.Physics.ARCADE);
			s.body.velocity.setTo(600, 0);
			projArray.push(s);
			attackKeyDown = true;
			return;
		}
		attackKeyDown = false;
	}
	
	function createAndManageEnemies() {
		if (bad1Count < MAX_BAD) {
			var b = new Bad1(64, 64);
			bad1Array.push(b);
			bad1Count += 1;
		}
		Bad1.chase(true);
	}
	
	function destroyProjectiles() {
		var i;
		for (i = 0; i < projArray.length; i++) {
			if (projArray[i].x >= WORLD_WIDTH || projArray[i] <= 0) {
				projArray[i].destroy();
				projArray.splice(i, 1);
			}
		}
	}
};
