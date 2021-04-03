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
    
    let game = new Phaser.Game( 768, 576, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
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
	const WORD_ARRAY = ["algorithm","analog","app","application","array","backup","bandwidth","binary","bit","bitmap","bite","blog","blogger","bookmark","boot","broadband","browser","buffer","bug","bus","byte","cache","caps lock","captcha","cd","cdrom","client","clip art","clip board","cloud computing","command","compile","compress","computer","computer program","configure","cookie","copy","cpu central processing unit","cybercrime","cyberspace","dashboard","data","database","data mining","debug","decompress","delete","desktop","development","digital","disk","dns domain name system","document","domain","domain name","dot","dot matrix","download","drag","dvd digital versatile disc","dynamic","email","emoticon","encrypt","encryption","enter","exabyte","faq frequently asked questions","file","finder","firewall","firmware","flaming","flash","flash drive","floppy disk","flowchart","folder","font","format","frame","freeware","gigabyte","graphics","hack","hacker","hardware","home page","host","html","hyperlink","hypertext","icon","inbox","integer","interface","internet","ip address","iteration","java","joystick","junk mail","kernel","key","keyboard","keyword","laptop","laser printer","link","login","log out","logic","lurking","mainframe","macro","malware","media","memory","mirror","modem","monitor","motherboard","mouse","multimedia","net","network","node","notebook computer","offline","online","open source","operating system","option","output","page","password","paste","path","phishing","piracy","pirate","platform","plugin","podcast","popup","portal","print","printer","privacy","process","program","programmer","protocol","queue","qwerty","ram random access memory","realtime","reboot","resolution","restore","rom read only memory","root","router","runtime","save","scan","scanner","screen","screenshot","script","scroll","scroll bar","search engine","security","server","shareware","shell","shift","shift key","snapshot","social networking","software","spam","spammer","spreadsheet","status bar","storage","spyware","supercomputer","surf","syntax","table","tag","template","terabyte","terminal","text editor","thread","toolbar","trash","trojan horse","typeface","undo","unix","upload","user interface","username","url","user","utility","version","virtual","virtual memory","virus","web","web host","webmaster","website","widget","window","wireless","wiki","word processor","workstation","world wide web","worm","www","xml","zip"];
	const NUM_WORDS = 230;
	const MAX_BAD = 10;
	const MAX_HEARTS = 3;
	const LEVEL_UP_TIME = 30;	// actually 60 seconds because enemies spawn every 2 seconds and that's when the time till next level also gets updated
	const MAX_LEVEL = LEVEL_UP_TIME * 5;
	const SPEED_INCREASE = 7;
	let timeToNextLevel = 1;
	let enemySpeed = 25;
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
	let difficulty = 1;
	let difficultyText;
	let charIndex = 0;
	let nextEnemy = 0;
	let gameStart = false;
	let theme;
	let ouch;
	let kill;
	let dead;
	let q; let w; let e; let r; let t; let y; let u; let i; let o; let p; let a; let s; let d; let f; let g; let h; let j; let k; let l; let z; let x; let c; let v; let b; let n; let m; let spacebar;
    let q1 = false; let w1 = false; let e1 = false; let r1 = false; let t1 = false; let y1 = false; let u1 = false; let i1 = false; let o1 = false; let p1 = false; let a1 = false; let s1 = false; let d1 = false; let f1 = false; let g1 = false; let h1 = false; let j1 = false; let k1 = false; let l1 = false; let z1 = false; let x1 = false; let c1 = false; let v1 = false; let b1 = false; let n1 = false; let m1 = false; let spacebar1 = false;
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
		header3 = { font: "20px Press Start 2P", fill: "#8800FF", align: "center" };
        header2 = { font: "30px Press Start 2P", fill: "#8800FF", align: "center" };
		header1 = { font: "50px Press Start 2P", fill: "#6600FF", align: "center" };
		header1R = { font: "40px Press Start 2P", fill: "#8800FF", align: "center" };
		header0 = { font: "60px Press Start 2P", fill: "#FFFFFF", align: "center" };
		
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
		difficultyText = game.add.text(0, 0, "      x1", header1);
		difficultyText.anchor.setTo( 0.5, 0.0 );
		
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
		
		// add keys
		q = game.input.keyboard.addKey(Phaser.Keyboard.Q);
		w = game.input.keyboard.addKey(Phaser.Keyboard.W);
		e = game.input.keyboard.addKey(Phaser.Keyboard.E);
		r = game.input.keyboard.addKey(Phaser.Keyboard.R);
		t = game.input.keyboard.addKey(Phaser.Keyboard.T);
		y = game.input.keyboard.addKey(Phaser.Keyboard.Y);
		u = game.input.keyboard.addKey(Phaser.Keyboard.U);
		i = game.input.keyboard.addKey(Phaser.Keyboard.I);
		o = game.input.keyboard.addKey(Phaser.Keyboard.O);
		p = game.input.keyboard.addKey(Phaser.Keyboard.P);
		a = game.input.keyboard.addKey(Phaser.Keyboard.A);
		s = game.input.keyboard.addKey(Phaser.Keyboard.S);
		d = game.input.keyboard.addKey(Phaser.Keyboard.D);
		f = game.input.keyboard.addKey(Phaser.Keyboard.F);
		g = game.input.keyboard.addKey(Phaser.Keyboard.G);
		h = game.input.keyboard.addKey(Phaser.Keyboard.H);
		j = game.input.keyboard.addKey(Phaser.Keyboard.J);
		k = game.input.keyboard.addKey(Phaser.Keyboard.K);
		l = game.input.keyboard.addKey(Phaser.Keyboard.L);
		z = game.input.keyboard.addKey(Phaser.Keyboard.Z);
		x = game.input.keyboard.addKey(Phaser.Keyboard.X);
		c = game.input.keyboard.addKey(Phaser.Keyboard.C);
		v = game.input.keyboard.addKey(Phaser.Keyboard.V);
		b = game.input.keyboard.addKey(Phaser.Keyboard.B);
		n = game.input.keyboard.addKey(Phaser.Keyboard.N);
		m = game.input.keyboard.addKey(Phaser.Keyboard.M);
		spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		
		// set hearts
		resetHearts();
		
		// spawn enemies
		game.time.events.repeat(Phaser.Timer.SECOND * 2, 99999999, createAndManageEnemies, this);
		
		// move enemies 
		game.time.events.repeat(Phaser.Timer.SECOND * .25, 99999999, moveEnemies, this);
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
		if (q.isDown) {
			letter = "q";
			if (!q1 && typed.length < randomWord.length) {
				typed+=letter;
				q1 = true;
				flipflop = true;
			}
		} else {
			q1 = false;
		}
		if (w.isDown) {
			letter = "w";
			if (!w1 && typed.length < randomWord.length) {
				typed+=letter;
				w1 = true;
				flipflop = true;
			}
		} else {
			w1 = false;
		}
		if (e.isDown) {
			letter = "e";
			if (!e1 && typed.length < randomWord.length) {
				typed+=letter;
				e1 = true;
				flipflop = true;
			}
		} else {
			e1 = false;
		}
		if (r.isDown) {
			letter = "r";
			if (!r1 && typed.length < randomWord.length) {
				typed+=letter;
				r1 = true;
				flipflop = true;
			}
		} else {
			r1 = false;
		}
		if (t.isDown) {
			letter = "t";
			if (!t1 && typed.length < randomWord.length) {
				typed+=letter;
				t1 = true;
				flipflop = true;
			}
		} else {
			t1 = false;
		}
		if (y.isDown) {
			letter = "y";
			if (!y1 && typed.length < randomWord.length) {
				typed+=letter;
				y1 = true;
				flipflop = true;
			}
		} else {
			y1 = false;
		}
		if (u.isDown) {
			letter = "u";
			if (!u1 && typed.length < randomWord.length) {
				typed+=letter;
				u1 = true;
				flipflop = true;
			}
		} else {
			u1 = false;
		}
		if (i.isDown) {
			letter = "i";
			if (!i1 && typed.length < randomWord.length) {
				typed+=letter;
				i1 = true;
				flipflop = true;
			}
		} else {
			i1 = false;
		}
		if (o.isDown) {
			letter = "o";
			if (!o1 && typed.length < randomWord.length) {
				typed+=letter;
				o1 = true;
				flipflop = true;
			}
		} else {
			o1 = false;
		}
		if (p.isDown) {
			letter = "p";
			if (!p1 && typed.length < randomWord.length) {
				typed+=letter;
				p1 = true;
				flipflop = true;
			}
		} else {
			p1 = false;
		}
		if (a.isDown) {
			letter = "a";
			if (!a1 && typed.length < randomWord.length) {
				typed+=letter;
				a1 = true;
				flipflop = true;
			}
		} else {
			a1 = false;
		}
		if (s.isDown) {
			letter = "s";
			if (!s1 && typed.length < randomWord.length) {
				typed+=letter;
				s1 = true;
				flipflop = true;
			}
		} else {
			s1 = false;
		}
		if (d.isDown) {
			letter = "d";
			if (!d1 && typed.length < randomWord.length) {
				typed+=letter;
				d1 = true;
				flipflop = true;
			}
		} else {
			d1 = false;
		}
		if (f.isDown) {
			letter = "f";
			if (!f1 && typed.length < randomWord.length) {
				typed+=letter;
				f1 = true;
				flipflop = true;
			}
		} else {
			f1 = false;
		}
		if (g.isDown) {
			letter = "g";
			if (!g1 && typed.length < randomWord.length) {
				typed+=letter;
				g1 = true;
				flipflop = true;
			}
		} else {
			g1 = false;
		}
		if (h.isDown) {
			letter = "h";
			if (!h1 && typed.length < randomWord.length) {
				typed+=letter;
				h1 = true;
				flipflop = true;
			}
		} else {
			h1 = false;
		}
		if (j.isDown) {
			letter = "j";
			if (!j1 && typed.length < randomWord.length) {
				typed+=letter;
				j1 = true;
				flipflop = true;
			}
		} else {
			j1 = false;
		}
		if (k.isDown) {
			letter = "k";
			if (!k1 && typed.length < randomWord.length) {
				typed+=letter;
				k1 = true;
				flipflop = true;
			}
		} else {
			k1 = false;
		}
		if (l.isDown) {
			letter = "l";
			if (!l1 && typed.length < randomWord.length) {
				typed+=letter;
				l1 = true;
				flipflop = true;
			}
		} else {
			l1 = false;
		}
		if (z.isDown) {
			letter = "z";
			if (!z1 && typed.length < randomWord.length) {
				typed+=letter;
				z1 = true;
				flipflop = true;
			}
		} else {
			z1 = false;
		}
		if (x.isDown) {
			letter = "x";
			if (!x1 && typed.length < randomWord.length) {
				typed+=letter;
				x1 = true;
				flipflop = true;
			}
		} else {
			x1 = false;
		}
		if (c.isDown) {
			letter = "c";
			if (!c1 && typed.length < randomWord.length) {
				typed+=letter;
				c1 = true;
				flipflop = true;
			}
		} else {
			c1 = false;
		}
		if (v.isDown) {
			letter = "v";
			if (!v1 && typed.length < randomWord.length) {
				typed+=letter;
				v1 = true;
				flipflop = true;
			}
		} else {
			v1 = false;
		}
		if (b.isDown) {
			letter = "b";
			if (!b1 && typed.length < randomWord.length) {
				typed+=letter;
				b1 = true;
				flipflop = true;
			}
		} else {
			b1 = false;
		}
		if (n.isDown) {
			letter = "n";
			if (!n1 && typed.length < randomWord.length) {
				typed+=letter;
				n1 = true;
				flipflop = true;
			}
		} else {
			n1 = false;
		}
		if (m.isDown) {
			letter = "m";
			if (!m1 && typed.length < randomWord.length) {
				typed+=letter;
				m1 = true;
				flipflop = true;
			}
		} else {
			m1 = false;
		}
		if (spacebar.isDown) {
			letter = " ";
			if (!spacebar1 && typed.length < randomWord.length) {
				typed+=" ";
				spacebar1 = true;
				flipflop = true;
			}
		} else {
			spacebar1 = false;
		}
		
		// prevent key from being registered when held down
		/*
		if (!q.isDown && !w.isDown && !e.isDown && !r.isDown && !t.isDown && !y.isDown && !u.isDown && !i.isDown && !o.isDown && !p.isDown && !a.isDown && !s.isDown && !d.isDown && !f.isDown && !g.isDown && !h.isDown && !j.isDown && !k.isDown && !l.isDown && !z.isDown && !x.isDown && !c.isDown && !v.isDown && !b.isDown && !n.isDown && !m.isDown && !spacebar.isDown) {
			flipflop = false;
		}
		*/

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
				bad1.badObj.y += enemySpeed;
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
			if (timeToNextLevel < MAX_LEVEL && timeToNextLevel%LEVEL_UP_TIME == 0) {
				enemySpeed += SPEED_INCREASE;
				difficulty += 1;
				difficultyText.text = "      x" + difficulty;
			} 
			if (timeToNextLevel < MAX_LEVEL && timeToNextLevel%(LEVEL_UP_TIME*3) == 0) {
				// spawn additional enemies
				game.time.events.repeat(Phaser.Timer.SECOND * 2.5, 99999999, createAndManageEnemies, this);
			}
			if (timeToNextLevel < MAX_LEVEL) {
				timeToNextLevel += 1;
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
