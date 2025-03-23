// Game Constants
const GAME_CONSTANTS = {
	SCORE_BUBBLE: 10,
	SCORE_SUPER_BUBBLE: 50,
	SCORE_GHOST_COMBO: 200
};

// Game State
let gameState = {
	keydown: false,
	pause: false,
	lock: false,
	highscore: 0,
	score: 0,
	scoreBubble: 10,
	scoreSuperBubble: 50,
	scoreGhostCombo: 200,
	lives: 2,
	gameover: false,
	level: 1,
	levelNextTimer: -1,
	levelNextState: 0
};

// Time Management
let timeManager = {
	generalTimer: -1,
	gameTime: 0,
	levelTime: 0,
	lifeTime: 0,
	fruitsTime: 0
};

var KEYDOWN = false;
var PAUSE = false;
var LOCK = false;

var HIGHSCORE = 0;
var SCORE = 0;
var SCORE_BUBBLE = 10;
var SCORE_SUPER_BUBBLE = 50;
var SCORE_GHOST_COMBO = 200;

var LIFES = 2;
var GAMEOVER = false;

var LEVEL = 1;
var LEVEL_NEXT_TIMER = -1;
var LEVEL_NEXT_STATE = 0;

var TIME_GENERAL_TIMER = -1;
var TIME_GAME = 0;
var TIME_LEVEL = 0;
var TIME_LIFE = 0;
var TIME_FRUITS = 0;

var HELP_DELAY = 1500;
var HELP_TIMER = -1;
			
function blinkHelp() { 
	if ( $('.help-button').attr("class").indexOf("yo") > -1 ) { 
		$('.help-button').removeClass("yo");
	} else { 
		$('.help-button').addClass("yo");
	}
}

function initGame(newgame) { 
	if (newgame) { 
		stopPresentation();
		stopTrailer();
	
		HOME = false;
		GAMEOVER = false;

		$('#help').fadeOut("slow");
		
		score(0);
		clearMessage();
		$("#home").hide();
		$("#panel").show();
		
		drawPacmanTitle();
	}

	initBoard();
	drawBoard();
	drawBoardDoor();
	
	initPaths();
	drawPaths();
	
	initBubbles();
	drawBubbles();
	
	initFruits();
	
	initPacman();
	drawPacman();
	
	initGhosts();
	drawGhosts();
	
	lifes();
	
	ready();
}

function drawPacmanTitle() {
	const canvas = document.getElementById('canvas-panel-title-pacman');
	canvas.setAttribute('width', '38');
	canvas.setAttribute('height', '32');
	
	if (canvas.getContext) {
		const ctx = canvas.getContext('2d');
		
		// Draw Pacman
		ctx.fillStyle = "#fff200";
		ctx.beginPath();
		ctx.arc(15, 16, 14, (0.35 - (3 * 0.05)) * Math.PI, (1.65 + (3 * 0.05)) * Math.PI, false);
		ctx.lineTo(10, 16);
		ctx.fill();
		ctx.closePath();
		
		// Draw Dot
		ctx.fillStyle = "#dca5be";
		ctx.beginPath();
		ctx.arc(32, 16, 4, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.closePath();
	}
}

function win() { 
	stopAllSound();

	LOCK = true;
	stopPacman();
	stopGhosts();
	stopBlinkSuperBubbles();
	stopTimes();
	
	eraseGhosts();

	setTimeout("prepareNextLevel()", 1000);

}
function prepareNextLevel(i) { 
	if ( LEVEL_NEXT_TIMER === -1 ) { 
		eraseBoardDoor();
		LEVEL_NEXT_TIMER = setInterval("prepareNextLevel()", 250);
	} else { 
		LEVEL_NEXT_STATE ++;
		drawBoard( ((LEVEL_NEXT_STATE % 2) === 0) );
		
		if ( LEVEL_NEXT_STATE > 6) { 
			LEVEL_NEXT_STATE = 0;
			clearInterval(LEVEL_NEXT_TIMER);
			LEVEL_NEXT_TIMER = -1;
			nextLevel();
		}
	}
}
function nextLevel() { 
	LOCK = false;
	
	LEVEL ++;
	
	erasePacman();
	eraseGhosts();
	
	resetPacman();
	resetGhosts();

	initGame();
	
	TIME_LEVEL = 0;
	TIME_LIFE = 0;
	TIME_FRUITS = 0;
}


function retry() { 
	stopTimes();

	erasePacman();
	eraseGhosts();
	
	resetPacman();
	resetGhosts();
	
	drawPacman();
	drawGhosts();
	
	TIME_LIFE = 0;
	TIME_FRUITS = 0;
	
	ready();
}

function ready() { 
	LOCK = true;
	message("ready!");
	
	playReadySound();
	setTimeout("go()", "4100");
}
function go() { 
	playSirenSound();

	LOCK = false;
	
	startTimes();
	
	clearMessage();
	blinkSuperBubbles();

	movePacman();

	moveGhosts();
}
function startTimes() { 
	if (TIME_GENERAL_TIMER === -1) { 
		TIME_GENERAL_TIMER = setInterval("times()", 1000);
	}
}
function times() { 
	TIME_GAME ++;
	TIME_LEVEL ++;
	TIME_LIFE ++;
	TIME_FRUITS ++;
	
	fruit();
}
function pauseTimes() { 
	if (TIME_GENERAL_TIMER != -1) { 
		clearInterval(TIME_GENERAL_TIMER);
		TIME_GENERAL_TIMER = -1;
	}
	if (FRUIT_CANCEL_TIMER != null) FRUIT_CANCEL_TIMER.pause();
}
function resumeTimes() { 
	startTimes();
	if (FRUIT_CANCEL_TIMER != null) FRUIT_CANCEL_TIMER.resume();
}
function stopTimes() { 
	if (TIME_GENERAL_TIMER != -1) { 
		clearInterval(TIME_GENERAL_TIMER);
		TIME_GENERAL_TIMER = -1;
	}
	if (FRUIT_CANCEL_TIMER != null) { 
		FRUIT_CANCEL_TIMER.cancel();
		FRUIT_CANCEL_TIMER = null;
		eraseFruit();
	}
}

function pauseGame() { 

	if (!PAUSE) { 
		stopAllSound();
		PAUSE = true;
		
		message("pause");
		
		pauseTimes();
		pausePacman();
		pauseGhosts();
		stopBlinkSuperBubbles();
	}
}
function resumeGame() { 
	if (PAUSE) { 
		testStateGhosts();

		PAUSE = false;
		
		clearMessage();
		
		resumeTimes();
		resumePacman();
		resumeGhosts();
		blinkSuperBubbles();
	}
}

function lifes(l) { 
	if (l) { 
		if ( l > 0 ) { 
			playExtraLifeSound();
		}
		LIFES += l;
	}
	
	var canvas = document.getElementById('canvas-lifes');
	canvas.setAttribute('width', '120');
	canvas.setAttribute('height', '30');
	if (canvas.getContext) { 
		var ctx = canvas.getContext('2d');
		
		ctx.clearRect(0, 0, 120, 30);
		ctx.fillStyle = "#fff200";
		for (var i = 0, imax = LIFES; (i < imax && i < 4); i ++) { 
			ctx.beginPath();
			
			var lineToX = 13;
			var lineToY = 15;
			
			ctx.arc(lineToX + (i * 30), lineToY, 13, (1.35 - (3 * 0.05)) * Math.PI, (0.65 + (3 * 0.05)) * Math.PI, false);
			ctx.lineTo(lineToX + (i * 30) + 4, lineToY);
			ctx.fill();
			ctx.closePath();
		}
	}
}

function gameover() { 
	GAMEOVER = true;
	message("game over");
	stopTimes();

	erasePacman();
	eraseGhosts();
	
	resetPacman();
	resetGhosts();
	
	TIME_GAME = 0;
	TIME_LEVEL = 0;
	TIME_LIFE = 0;
	TIME_FRUITS = 0;

	// Show proof button if score is greater than 0
	if (SCORE > 0) {
		$("#proofBtn").show();
	} else {
		$("#proofBtn").hide();
	}

	LIFES = 2;
	LEVEL = 1;
}

function message(m) { 
	$("#message").html(m);
	if (m === "game over") $("#message").addClass("red");
}
function clearMessage() { 
	$("#message").html("");
	$("#message").removeClass("red");
}

function score(s, type) { 

	var scoreBefore = (SCORE / 10000) | 0;
	
	SCORE += s;
	if (SCORE === 0) { 
		$('#score span').html("00");
	} else { 
		$('#score span').html(SCORE);
	}
	
	var scoreAfter = (SCORE / 10000) | 0;
	if (scoreAfter > scoreBefore) { 
		lifes( +1 );
	}

	
	if (SCORE > HIGHSCORE) { 
		HIGHSCORE = SCORE;
		if (HIGHSCORE === 0) { 
			$('#highscore span').html("00");
		} else { 
			$('#highscore span').html(HIGHSCORE);
		}
	}
	
	if (type && (type === "clyde" || type === "pinky" || type === "inky" || type === "blinky") ) { 
		erasePacman(); 
		eraseGhost(type); 
		$("#board").append('<span class="combo">' + SCORE_GHOST_COMBO + '</span>');
		$("#board span.combo").css('top', eval('GHOST_' + type.toUpperCase() + '_POSITION_Y - 10') + 'px');
		$("#board span.combo").css('left', eval('GHOST_' + type.toUpperCase() + '_POSITION_X - 10') + 'px');
		SCORE_GHOST_COMBO = SCORE_GHOST_COMBO * 2;
	} else if (type && type === "fruit") { 
		$("#board").append('<span class="fruits">' + s + '</span>');
		$("#board span.fruits").css('top', (FRUITS_POSITION_Y - 14) + 'px');
		$("#board span.fruits").css('left', (FRUITS_POSITION_X - 14) + 'px');
	}
}

// Proof Generation Functions
function showProofPopup() {
    $('#proof-overlay').fadeIn();
    $('#proof-popup').fadeIn();
    startBinaryAnimation();
    startProgressBar();
}

function hideProofPopup() {
    $('#proof-overlay').fadeOut();
    $('#proof-popup').fadeOut();
    stopBinaryAnimation();
}

let binaryAnimationInterval;
function startBinaryAnimation() {
    const binaryContainer = $('#binary-animation');
    binaryContainer.empty();

    function generateBinary() {
        return Array.from({length: 70}, () => Math.random() < 0.5 ? '0' : '1').join('');
    }

    function addBinaryLine() {
        const lines = binaryContainer.children().length;
        if (lines >= 5) {
            binaryContainer.children().first().remove();
        }
        binaryContainer.append(`<div>${generateBinary()}</div>`);
    }

    // Initial lines
    for (let i = 0; i < 5; i++) {
        addBinaryLine();
    }

    // Start animation
    binaryAnimationInterval = setInterval(addBinaryLine, 100);
}

function stopBinaryAnimation() {
    if (binaryAnimationInterval) {
        clearInterval(binaryAnimationInterval);
    }
}

function startProgressBar() {
    const progress = $('#progress');
    progress.css('width', '0%');
    let width = 0;

    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            return;
        }
        width += 2;
        progress.css('width', width + '%');
    }, 100);
}

function showProofResult(data) {
    $('#game-score span').text(SCORE);
    $('#cycles-count').text(`Cycles: ${data.cycles}`);
    $('#proof-id').text(`Proof ID: ${data.proof_id}`);
    $('#proof-result').fadeIn();

    setTimeout(hideProofPopup, 5000);
}

// Document ready handler
$(document).ready(function() {
    // Hide proof button by default
    $("#proofBtn").hide();

    // Remove old help button blinking
    if (HELP_TIMER != -1) {
        clearInterval(HELP_TIMER);
        HELP_TIMER = -1;
    }
    // Hide old help button
    $(".help-button").hide();

    // Add click handler for help button
    $("#helpBtn").on("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!PACMAN_DEAD && !LOCK && !GAMEOVER) {
            $('#help-overlay').fadeIn();
            $('#help').fadeIn();
            if ($("#panel").css("display") !== "none") {
                pauseGame();
            }
        }
    });

    // Add click handler for continue button
    $("#continue-btn").on("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('#help-overlay').fadeOut();
        $('#help').fadeOut();
        if (PAUSE) {
            resumeGame();
        }
    });

    // Add click handler for proof button
    $("#proofBtn").on("click", async function() {
        console.log("Proof button clicked");
        const proofBtn = $(this);

        try {
            if (SCORE <= 0) {
                alert("Score is 0 or negative. Please play the game to earn points before generating proof!");
                return;
            }

            if (!GAMEOVER) {
                alert("You can only generate proof after game over (losing all lives)!");
                return;
            }

            proofBtn.prop('disabled', true);
            showProofPopup();

            const response = await fetch("http://pacman.tempestcrypto.net/api/prove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ score: SCORE })
            });

            if (!response.ok) {
                throw new Error("An error occurred while generating the proof on the server.");
            }

            const data = await response.json();
            console.log("Proof generation response:", data);
            showProofResult(data);

        } catch (err) {
            console.error("Core proof generation error:", err);
            alert("Failed to generate Core Proof: " + err.message);
            hideProofPopup();
        } finally {
            proofBtn.prop('disabled', false);
        }
    });

    // Add click handler for play again button
    $("#playAgainBtn").on("click", function() {
        $("#proofBtn").hide();
        initGame(true);
    });

    // Prevent clicks on popups from closing them
    $("#help, #proof-popup").click(function(e) {
        e.preventDefault();
        e.stopPropagation();
    });

    // Close popups when clicking overlay
    $("#help-overlay, #proof-overlay").click(function() {
        $('#help-overlay').fadeOut();
        $('#help').fadeOut();
        $('#proof-overlay').fadeOut();
        $('#proof-popup').fadeOut();
        if (PAUSE) {
            resumeGame();
        }
    });
});