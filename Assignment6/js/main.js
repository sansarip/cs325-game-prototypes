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
    
    let game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    let bad1P = "assets/Sprites/enemy1.png";
    let effect1P = "assets/Sprites/lightning.png";
	let tile1P = "assets/Background/circuit.png";
	let heartP = "assets/Sprites/heart.png";
	let themeP = "assets/Audio/maintheme.ogg";
	let ouchP = "assets/Audio/ouch.ogg";
	let killP = "assets/Audio/kill.ogg";
	let deadP = "assets/Audio/dead.ogg"
	
    function preload() {
        game.load.spritesheet( "bad1", bad1P, 128, 128);
        game.load.spritesheet( "effect1", effect1P, 128, 128);
		game.load.image("tile1", tile1P);
		game.load.image("heart", heartP);
		game.load.audio("theme", [themeP]);
		game.load.audio("ouch", [ouchP]);
		game.load.audio("kill", [killP]);
		game.load.audio("dead", [deadP]);
    }
    
	const WORLD_WIDTH = 800;
	const WORLD_HEIGHT = 600;
	const WORD_ARRAY = ["algorithm","analog","app","application","array","backup","bandwidth","binary","bit","bitmap","bite","blog","blogger","bookmark","boot","broadband","browser","buffer","bug","bus","byte","cache","caps lock","captcha","cd","cdrom","client","clip art","clip board","cloud computing","command","compile","compress","computer","computer program","configure","cookie","copy","cpu central processing unit","cybercrime","cyberspace","dashboard","data","database","data mining","debug","decompress","delete","desktop","development","digital","disk","dns domain name system","document","domain","domain name","dot","dot matrix","download","drag","dvd digital versatile disc","dynamic","email","emoticon","encrypt","encryption","enter","exabyte","faq frequently asked questions","file","finder","firewall","firmware","flaming","flash","flash drive","floppy disk","flowchart","folder","font","format","frame","freeware","gigabyte","graphics","hack","hacker","hardware","home page","host","html","hyperlink","hypertext","icon","inbox","integer","interface","internet","ip address","iteration","java","joystick","junk mail","kernel","key","keyboard","keyword","laptop","laser printer","link","login","log out","logic","lurking","mainframe","macro","malware","media","memory","mirror","modem","monitor","motherboard","mouse","multimedia","net","network","node","notebook computer","offline","online","open source","operating system","option","output","page","password","paste","path","phishing","piracy","pirate","platform","plugin","podcast","popup","portal","print","printer","privacy","process","program","programmer","protocol","queue","qwerty","ram random access memory","realtime","reboot","resolution","restore","rom read only memory","root","router","runtime","save","scan","scanner","screen","screenshot","script","scroll","scroll bar","search engine","security","server","shareware","shell","shift","shift key","snapshot","social networking","software","spam","spammer","spreadsheet","status bar","storage","spyware","supercomputer","surf","syntax","table","tag","template","terabyte","teminal","text editor","thread","toolbar","trash","trojan horse","typeface","undo","unix","upload","user interface","username","url","user","utility","version","virtual","virtual memory","virus","web","web host","webmaster","website","widget","window","wireless","wiki","word processor","workstation","world wide web","worm","www","xml","zip"];
	const NUM_WORDS = 230;
	const MAX_BAD = 10;
	const MAX_HEARTS = 3;
	let endText = [];
    let bad1Array = [];
	let bad1EffectArray = [];
	let bad1Count = 0;
	let bad1EffectCount = 0;
	let endgame = false;
	let header0;
	let header1;
	let header2;
	let header3;
	let header1R;
	let scoreText;
	let wordText;
	let typedText;
	let heartsArray = [];
	let hearts = MAX_HEARTS;
	let cursors;
	let randomWordIndex;
	let randomWord;
	let flipflop = false;
	let typed = "";
	let score = 0;
	let charIndex = 0;
	let nextEnemy = 0;
	let gameStart = false;
	let theme;
	let ouch;
	let kill;
	let dead;
    function create() {
		
		// add audio
		theme = game.add.audio("theme");
		ouch = game.add.audio("ouch");
		kill = game.add.audio("kill");
		dead = game.add.audio("dead");
		
		this.game.physics.arcade.gravity.y = 0;
		
		// add background
		game.stage.backgroundColor = "#006600"
		let gridTile = game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'tile1');
		gridTile.alpha = 0.7;
		
        
        // add text styles
		header3 = { font: "20px Calibri", fill: "#8800FF", align: "center" };
        header2 = { font: "30px Calibri", fill: "#8800FF", align: "center" };
		header1 = { font: "50px Calibri", fill: "#6600FF", align: "center" };
		header1R = { font: "40px Calibri", fill: "#8800FF", align: "center" };
		header0 = { font: "60px Calibri", fill: "#FFFFFF", align: "center" };
		
		// random word
		randomWordIndex = Math.floor(Math.random() * NUM_WORDS);
		randomWord = WORD_ARRAY[randomWordIndex];
		
		// initialize text
		scoreText = game.add.text(game.world.width/2, 0, "Score: 0", header1);
		scoreText.anchor.setTo( 0.5, 0.0 );
		wordText = game.add.text(game.world.width/2, game.world.height/3, randomWord, header1);
		wordText.anchor.setTo( 0.5, 0.0 );
		wordText.visible = false;
		typedText = game.add.text(game.world.width/2, game.world.height/2.4, "test", header1R);
		typedText.anchor.setTo( 0.5, 0.0 );
		typedText.visible = false;

		
		// set hearts
		resetHearts();
		
		// spawn enemies
		game.time.events.repeat(Phaser.Timer.SECOND * 2, 99999999, createAndManageEnemies, this);
		
		// move enemies 
		game.time.events.repeat(Phaser.Timer.SECOND * .25, 99999999, moveEnemies, this);
		
		// audio setting
		theme.loop = true;
		theme.volume = 0.20;
		theme.play();		
		ouch.volume = .6;	
		kill.volume = .7;
		dead.volume = .8;
		
		cursors = game.input.keyboard.createCursorKeys();
		
		//  stop the following keys from propagating up to the browser
		game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.BACKSPACE ]);
    }
   
    function update() {
		if (!endgame && gameStart) {
			checkEnemyReachEnd();
			checkTyping();
			checkEnemyEffectTimeOut();
			checkHearts();
		} else if (endgame) {
			game.input.onDown.addOnce(restart, this);
		}
		bringUIToTop();
	}
	
	// restarts game
	function restart() {
		location.reload();
	}
	
	class Bad1 {
		constructor(width, height) {
			this.move = true;
			this.timeToLive = 2;
			this.bad = game.add.sprite(game.world.randomX, 0, "bad1");
			this.bad.width = width;
			this.bad.height = height;
			this.bad.name = "bad1";
			this.bad.anchor.setTo(0.5, 0.5);
			this.bad.loadTexture("bad1", 0);
			this.bad.animations.add("bad1_idle", [0,1]);
			this.bad.animations.play("bad1_idle", 4, true);
			game.physics.enable(this.bad, Phaser.Physics.ARCADE);
			// this.bad.body.velocity.setTo(0, 100);
		}
		
		get badObj() {
			return this.bad;
		}
		
		get width() {
			return this.bad.width;
		}
		
		get height() {
			return this.bad.height;
		}
		
		get canMove() {
			return this.move;
		}
		
		get timeToLiveVal() {
			return this.timeToLive;
		}
		
		set timeToLiveVal(value) {
			this.timeToLive = value;
		}
		
		die() {
			this.move = false;
			this.bad.loadTexture("effect1", 0);
			this.bad.animations.add("effect1_anim", [0,1]);
			this.bad.animations.play("effect1_anim", 5, true);
		}
		
		static destroy(obj) {
			obj.destroy();
		}
	}
	
	// shows the end game message
	function displayEndText() {
		endText[0] = game.add.text(game.world.width/2, game.world.height/2, "You've been compromised!", header1);
		endText[0].anchor.setTo( 0.5, 0.0 );		
		endText[1] = game.add.text(game.world.width/2, game.world.height/2 + 75, "CLICK to play again!", header2);
		endText[1].anchor.setTo( 0.5, 0.0 );
	}
	
	// damages the player
	function damagePlayer() {
		try {
			heartsArray[heartsArray.length-1].destroy();
			heartsArray.pop();
			hearts -= 1;
			ouch.play();
			game.camera.shake(0.025, 500);
		} catch (err) {
			console.log(err.message);
		}
	}
	
	// checks if player is out of lives
	function checkHearts() {
		if (hearts <= 0) {
			endgame = true;
			displayEndText();
			wordText.visible = false;
			typedText.visible = false;
			dead.play();
			theme.fadeTo(100, .10)
		}
	}
	
	function checkTyping() {
		let previouslyTyped = typed;
		let letter = "";
		if (game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
			letter = "q";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
			letter = "w";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.E)) {
			letter = "e";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.R)) {
			letter = "r";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.T)) {
			letter = "t";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
			letter = "y";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
			letter = "u";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.I)) {
			letter = "i";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.O)) {
			letter = "o";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.P)) {
			letter = "p";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
			letter = "a";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
			letter = "s";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
			letter = "d";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.F)) {
			letter = "f";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.G)) {
			letter = "g";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.H)) {
			letter = "h";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.J)) {
			letter = "j";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.K)) {
			letter = "k";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) {
			letter = "l";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
			letter = "z";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.X)) {
			letter = "x";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.C)) {
			letter = "c";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.V)) {
			letter = "v";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
			letter = "b";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.N)) {
			letter = "n";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.M)) {
			letter = "m";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=letter;
				flipflop = true;
			}
		}  else if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			letter = " ";
			if (!flipflop && typed.length < randomWord.length) {
				typed+=" ";
				flipflop = true;
			}
		}
		else {
			flipflop = false;
		}
		
		// update typed text
		if (flipflop) {
			// check if phrases partially match
			let i;
			for (i = 0; i < typed.length; i++) {
				if (typed.charAt(i) !== randomWord.charAt(i)) {
					typed = previouslyTyped;
					break;
				}
			}
			
			typedText.visible = true;
			typedText.text = typed;
			
			// check if phrases match
			if (typed === randomWord) {
				typed = "";
				typedText.visible = false;
				try {
					killenemy();
					incrementScore();
					nextRandomWord();
				} catch (err) {
					console.log(err.message);
				}
			}
			
			charIndex += 1;
		}
	}
	
	// increments score by one
	function incrementScore() {
		score+=1;
		scoreText.text = "Score: " + score;
	}
	
	function killenemy() {
		let bad1 = bad1Array[0];
		bad1.die();
		bad1EffectArray.push(bad1);
		bad1EffectCount += 1;
		bad1Array.splice(nextEnemy, 1);
		bad1Count -= 1;
		kill.play();
	}
	
	function nextRandomWord() {
		randomWordIndex = Math.floor(Math.random()*NUM_WORDS);
		randomWord = WORD_ARRAY[randomWordIndex];
		wordText.text = randomWord;
	}
	
	// reset player lives
	function resetHearts()  {
		hearts = MAX_HEARTS;
		var i;
		var size = 64;
		for (i = 0; i < hearts; i++) {
			heartsArray.push(game.add.sprite(game.camera.width-((i+1)*size), 0, 'heart'));
			heartsArray[i].width = size;
			heartsArray[i].height = size;
		}
	}
	
	// makes sure the hearts are always visible
	function bringUIToTop() {
		var i;
		for (i = 0; i < hearts; i++) {
			heartsArray[i].bringToTop();
		}
		scoreText.bringToTop();
		wordText.bringToTop();
		typedText.bringToTop();
	}

	
	// moves enemies
	function moveEnemies() {
		let i;
		for (i = 0; i < bad1Count; i++) {
			let bad1 = bad1Array[i];
			if (bad1.canMove) {
				bad1.badObj.y += 20;
			}
		}
	}
	
	function createAndManageEnemies() {
		if (!endgame) {
			gameStart = true;
			wordText.visible = true;
			if (bad1Count < MAX_BAD) {
				var b = new Bad1(128, 128);
				bad1Array.push(b);
				bad1Count += 1;
			}
		}
	}
	
	function checkEnemyReachEnd() {
		let i;
		for (i = 0; i < bad1Count; i++) {
			let bad1 = bad1Array[i];
			if (bad1.badObj.y >= game.world.height+bad1.height/2) {
				Bad1.destroy(bad1.badObj);
				bad1Count -= 1;
				bad1Array.splice(i,1);
				damagePlayer();
			}
		}
	}
	
	function checkEnemyEffectTimeOut() {
		let i;
		for (i = 0; i < bad1EffectCount; i++) {
			let bad1 = bad1EffectArray[i];
			if (bad1.timeToLiveVal <= 0) {
				Bad1.destroy(bad1.badObj);
				bad1EffectCount -= 1;
				bad1EffectArray.splice(i, 1);
			} else {
				bad1.timeToLiveVal -= game.time.elapsed/1000;
			}
		}
	}
};
