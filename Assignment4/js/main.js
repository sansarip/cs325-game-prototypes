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
    
    var game = new Phaser.Game( 832, 640, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    var playerP = "assets/Sprites/clouds.png";
    var bad1P = "assets/Sprites/bad-1.png";
	var tile1P = "assets/Sprites/tile-1.png";
	var themeP = "assets/Audio/maintheme.ogg";
	
    function preload() {
        game.load.spritesheet( "player", playerP, 64, 64);
        game.load.spritesheet( "bad1", bad1P, 64, 64);
		game.load.image("tile1", tile1P);
		game.load.audio("theme", [themeP]);
    }
    
	const WORLD_WIDTH = 832;
	const WORLD_HEIGHT = 640;
	const MAX_BAD = 20;
	const iLimit = Math.floor(WORLD_WIDTH/64)-1;
	const jLimit = Math.floor(WORLD_HEIGHT/64)-1;
	var bad1Count = 0;
	var keyDown = false;
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
		
		// add tiles
		tile1 = game.add.tileSprite(0, 0, 1920, 1920, "tile1");
		
		// spawn player 
		player = game.add.sprite(grid[pos.x][pos.y].x, grid[pos.x][pos.y].y, "player");
		player.anchor.setTo(0.5, 0.5);
		player.width = 50;
		player.height = 50;
		player.name = "player";
		player.animations.add("float");
		player.animations.play("float", 10, true);
		
		// turn on the arcade physics engine for sprites
        game.physics.enable(player, Phaser.Physics.ARCADE );
        
		// make objects collide with world bounds
        player.body.collideWorldBounds = true;
        
        // add text styles
		header3 = { font: "20px Calibri", fill: "#000000", align: "center" };
        header2 = { font: "30px Calibri", fill: "#000000", align: "center" };
		header1 = { font: "60px Calibri", fill: "#000000", align: "center" };
		
		// set camera
		//game.camera.follow(player, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
		//game.input.mouse.capture = true;
		
		// initialize text
		scoreText = game.add.text(game.camera.width/2, 0, "Score: 0", header2);
		scoreText.anchor.setTo( 0.5, 0.0 );
		scoreText.fixedToCamera = true;
		
		// spawn enemies
		game.time.events.repeat(Phaser.Timer.SECOND * 2, 10000, spawnEnemies, this);
		
		theme.loop = true;
		theme.play();
		
		cursors = game.input.keyboard.createCursorKeys();
    }
   
    function update() {
		movePlayer();
	}
	
	class Bad1 {
		constructor(width, height) {
			var random = Math.floor(Math.random()*(bad1Spawns.length+1));
			this.pos = bad1Spawns[random];
			this.life = 10;
			this.bad = game.add.sprite(grid[this.pos.x][this.pos.y].x, grid[this.pos.x][this.pos.y].y, "bad1");
			this.bad.width = width;
			this.bad.height = height;
			this.bad.name = "bad1";
			this.bad.anchor.setTo(0.5, 0.5);
			this.bad.animations.add("bad1_idle");
			this.bad.animations.play("bad1_idle", 10, true);
			game.physics.enable(this.bad, Phaser.Physics.ARCADE);
		}
		
		get badObj() {
			return this.bad;
		}
		
		get lifeVal() {
			return this.life;
		}
		
		set lifeVal(newLife) {
			this.life = newLife;
		}
		
		static destroy(obj) {
			obj.destroy();
			bad1Count -= 1;
		}
		
		static chase(bool) {
			var i;
			for (i = 0; i < badArray.length; i++) {
				if (bool) {
					
					// kill enemy
					if (badArray[i].lifeVal <= 0) {
						Bad.destroy(badArray[i].badObj);
						badArray.splice(i, 1);
					}
				} 
			}
		}
		
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
	
	function movePlayer() {
		if (cursors.left.isDown)
		{
			if (pos.x - 1 >= 0 && !keyDown) {
				pos.x -= 1;
				player.x = grid[pos.x][pos.y].x
			}
			keyDown = true;
			return;
		}
		else if (cursors.right.isDown)
		{
			if (pos.x + 1 <= iLimit && !keyDown) {
				pos.x += 1;
				player.x = grid[pos.x][pos.y].x
			}
			keyDown = true;
			return;
		}
		if (cursors.up.isDown)
		{
			if (pos.y - 1 >= 0 && !keyDown) {
				pos.y -= 1;
				player.y = grid[pos.x][pos.y].y
			}
			keyDown = true;
			return;
		}
		else if (cursors.down.isDown)
		{
			if (pos.y + 1 <= jLimit && !keyDown) {
				pos.y += 1;
				player.y = grid[pos.x][pos.y].y
			}
			keyDown = true;
			return;
		}
		keyDown = false;
	}
	
	function spawnEnemies() {
		if (bad1Count < MAX_BAD) {
			var b = new Bad1(64, 64);
			bad1Array.push(b);
			bad1Count += 1;
		}
	}
};
