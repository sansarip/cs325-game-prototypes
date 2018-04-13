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
	var heartP = "assets/Sprites/heart.png";
    var bad1P = "assets/Sprites/bad-1.png";
	var bad1AttackP = "assets/Sprites/bad-attack.png"
	var backgroundP = "assets/Background/background.png";
	var projectileP = "assets/Sprites/projectile.png"
	var gridP = "assets/Sprites/grid.png"
	var themeP = "assets/Audio/maintheme.ogg";
	
    function preload() {
        game.load.spritesheet( "player", playerP, 64, 64);
        game.load.spritesheet( "bad1", bad1P, 64, 64);
        game.load.spritesheet( "bad1Attack", bad1AttackP, 64, 64);
		game.load.image("background", backgroundP);
		game.load.image("heart", heartP);
		game.load.image("projectile", projectileP);
		game.load.image("grid", gridP);
		game.load.audio("theme", [themeP]);
    }
    
	const WORLD_WIDTH = 960;
	const WORLD_HEIGHT = 960;
	const MAX_BAD = 15;
	const iLimit = Math.floor(WORLD_WIDTH/64)-1;
	const jLimit = Math.floor(WORLD_HEIGHT/64)-1;
	const INVUL_TIME = 1;
	const LEVELUP_TIME = 60;
	var score = 0;
	var hearts = 3;
	var bad1Count = 0;
	var bad1Cursor = 0;
	var projCursor = 0;
	var invulTime = 0;
	var endgame = false;
	var flipRight = false;
	var moveKeyDown = false;
	var attackKeyA = false;
	var attackKeyD = false;
	var background;
	var gridTile;
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
	var heartsArray = [];
	var bad1Array = [];
	var projArray = [];
	var endText = [];
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
		gridTile = game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'grid');
		gridTile.alpha = 0.7;
		
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
		
		// set hearts
		resetHearts();
		
		// spawn enemies
		game.time.events.repeat(Phaser.Timer.SECOND * 1, 100000, createAndManageEnemies, this);
		
		theme.loop = true;
		theme.volume = 0.5;
		theme.play();
		
		cursors = game.input.keyboard.createCursorKeys();
    }
   
    function update() {
		if (!endgame) {
			checkHearts();
			countDownInvuln();
			move();
			attack();
			overlap();
			destroyProjectiles();
			scoreText.bringToTop();
			bringHeartsToTop();
		} else {
			game.input.onDown.addOnce(restart, this);
		}
	}
	
	// restarts game
	function restart() {
		location.reload();
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
			damagePlayer();
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
	
	// checks if objects overlap
	function overlap() {
		var i;
		var j;
		for (i = 0; i < bad1Array.length; i++) {
			bad1Cursor = i;
			for (j = 0; j < projArray.length; j++) {
				projCursor = j;
				try {
					game.physics.arcade.overlap(bad1Array[i].badObj, projArray[j], collisionHandler, null, this);
				} catch (e) {
					
				}
			}
		}
	}
	
	// checks collision between objects
	function collisionHandler(obj1, obj2) {
	if (obj2.name === "projectile" && obj1.name === "bad1") {
			Bad1.destroy(obj1);
			obj2.destroy(obj2);
			bad1Array.splice(bad1Cursor, 1);
			projArray.splice(projCursor, 1);
			incrementScore();
		}
	}
	
	// shows the end game message
	function displayEndText() {
		endText[0] = game.add.text(game.camera.width/2, game.camera.height/2, "Egads! The bears got you!", header1);
		endText[0].anchor.setTo( 0.5, 0.0 );
		endText[0].fixedToCamera = true;			
		endText[1] = game.add.text(game.camera.width/2, game.camera.height/2 + 75, "CLICK to play again!", header3);
		endText[1].anchor.setTo( 0.5, 0.0 );
		endText[1].fixedToCamera = true;
	}
	
	// damages the player
	function damagePlayer() {
		if (invulTime <= 0) {
			try {
				heartsArray[heartsArray.length-1].destroy();
				heartsArray.pop();
				hearts -= 1;
				invulTime = INVUL_TIME;
			} catch (err) {
				console.log(err.message);
			}
		}
	}
	
	// counts down the player's invulnerability time
	function countDownInvuln() {
		if (invulTime > 0) {
			invulTime -= game.time.elapsed/1000;
		} else if (invulTime < 0) {
			invulTime = 0;
		}
	}
	
	// checks if player is out of lives
	function checkHearts() {
		if (hearts <= 0) {
			endgame = true;
			displayEndText();
		}
	}
	
	// increments score by one
	function incrementScore() {
		score+=1;
		scoreText.text = "Score: " + score;
	}
	
	// checks if player is next to enemy
	function checkNeighborPlayer(point) {
		if (Math.abs(point.x-pos.x) <= 1 && Math.abs(point.y-pos.y) <= 1) {
			return true;
		}
		return false;
	}
	
	// reset player lives
	function resetHearts()  {
		hearts = 3;
		var i;
		var size = 32;
		for (i = 0; i < hearts; i++) {
			heartsArray.push(game.add.sprite(game.camera.width-((i+1)*size), 0, 'heart'));
			heartsArray[i].width = size;
			heartsArray[i].height = size;
			heartsArray[i].fixedToCamera = true;
		}
	}
	
	// makes sure the hearts are always visible
	function bringHeartsToTop() {
		var i;
		for (i = 0; i < hearts; i++) {
			heartsArray[i].bringToTop();
		}
	}
	
	// creates the grid array
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
	
	// sets enemy spawns
	function spawnLocations() {
		bad1Spawns.push(new Phaser.Point(0, 0));
		bad1Spawns.push(new Phaser.Point(iLimit, 0));
		bad1Spawns.push(new Phaser.Point(0, jLimit));
		bad1Spawns.push(new Phaser.Point(iLimit, jLimit));
	}
	
	// moves player
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
		if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
			if (flipRight) {
				player.scale.x *= -1;
				flipRight = false;
			}
			attackKeyA = true;
		} else if (attackKeyA) {
			var s = game.add.sprite(grid[pos.x][pos.y].x-32, grid[pos.x][pos.y].y, "projectile");
			s.anchor.setTo(0.5, 0.5);
			s.width = 16;
			s.height = 16;
			s.name = "projectile";
			game.physics.enable(s, Phaser.Physics.ARCADE );
			s.body.velocity.setTo(-600, 0);
			projArray.push(s);
			attackKeyA = false;
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
			if (!flipRight) {
				player.scale.x *= -1;
				flipRight = true;
			}
			attackKeyD = true;
		} else if (attackKeyD) {
			var s = game.add.sprite(grid[pos.x][pos.y].x+32, grid[pos.x][pos.y].y, "projectile");
			s.anchor.setTo(0.5, 0.5);
			s.width = 16;
			s.height = 16;
			s.name = "projectile";
			game.physics.enable(s, Phaser.Physics.ARCADE);
			s.body.velocity.setTo(600, 0);
			projArray.push(s);
			attackKeyD = false;
		}
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
