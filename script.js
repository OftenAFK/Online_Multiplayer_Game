// Initialize game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");

    // Game elements
    const gameArea = document.getElementById('gameArea');
    const player1Paddle = document.getElementById('player1Paddle');
    const player2Paddle = document.getElementById('player2Paddle');
    const ball = document.getElementById('ball');
    const startButton = document.getElementById('startButton');
    const player1ScoreDisplay = document.querySelector('.player1-score');
    const player2ScoreDisplay = document.querySelector('.player2-score');

    console.log("Elements loaded:", {
        gameArea, player1Paddle, player2Paddle, ball, startButton, 
        player1ScoreDisplay, player2ScoreDisplay
    });

    // Add audio elements to the DOM
    insertAudioElements();
    
    // Initialize audio components
    const sounds = {
        paddleHit: document.getElementById('paddleHitSound'),
        wallHit: document.getElementById('wallHitSound'),
        score: document.getElementById('scoreSound'),
        win: document.getElementById('winSound'),
        gameStart: document.getElementById('gameStartSound'),
        backgroundMusic: document.getElementById('backgroundMusic')
    };

    // Add audio controls
    insertAudioControls();
    
    const toggleAudioBtn = document.getElementById('toggleAudio');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeContainer = document.querySelector('.volume-slider-container');

    // Game state
    let gameRunning = false;
    let animationFrameId = null;

    // Audio state
    let isMuted = false;
    let volume = 0.7; // Default volume

    // Scorekeeping
    let player1Score = 0;
    let player2Score = 0;

    // Player paddle positions
    let player1Y = 210;
    let player2Y = 210;
    const paddleHeight = 80;

    // Ball position and speed
    let ballX = 392;
    let ballY = 242;
    let ballSpeedX = 5;
    let ballSpeedY = 5;
    const ballSize = 15;

    // Key tracking
    const keysPressed = {
        w: false,
        s: false,
        arrowup: false,
        arrowdown: false,
        p: false  // Added for pause functionality
    };

    // Set up key event listeners
    window.addEventListener('keydown', function(e) {
        const key = e.key.toLowerCase();
        if (key in keysPressed) {
            keysPressed[key] = true;
            e.preventDefault();
        }
        
        // Handle pause key separately
        if (key === 'p') {
            toggleGame();
        }
        
        console.log("Key down:", key, keysPressed);
    });

    window.addEventListener('keyup', function(e) {
        const key = e.key.toLowerCase();
        if (key in keysPressed) {
            keysPressed[key] = false;
            e.preventDefault();
        }
    });

    // Start/pause button handler
    startButton.addEventListener('click', function() {
        console.log("Button clicked");
        toggleGame();
    });

    // Audio control events
    toggleAudioBtn.addEventListener('click', function() {
        toggleMute();
        volumeContainer.classList.toggle('active');
    });

    volumeSlider.addEventListener('input', function() {
        setVolume(this.value);
    });

    // Sound management functions
    function playSound(sound) {
        if (!isMuted && sound) {
            try {
                // Clone and play for overlapping sounds
                const soundClone = sound.cloneNode(true);
                soundClone.volume = volume;
                soundClone.play();
                
                // Remove after playing to prevent memory leaks
                soundClone.onended = function() {
                    soundClone.remove();
                };
            } catch (e) {
                console.log("Audio error:", e);
            }
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        toggleAudioBtn.querySelector('.audio-icon').textContent = isMuted ? '🔈' : '🔊';
        
        if (isMuted) {
            sounds.backgroundMusic.pause();
        } else {
            if (gameRunning) {
                sounds.backgroundMusic.play();
            }
        }
    }

    function setVolume(value) {
        volume = value;
        sounds.backgroundMusic.volume = volume;
    }

    // Toggle game state
    function toggleGame() {
        if (!gameRunning) {
            // Start game
            if (startButton.textContent === "PLAY AGAIN") {
                resetGame();
            } else {
                startGame();
            }
        } else {
            // Pause game
            pauseGame();
        }
    }

    // Start the game
    function startGame() {
        console.log("Starting game");
        gameRunning = true;
        startButton.textContent = "PAUSE GAME";
        startButton.classList.remove("pulse-animation");
        
        // Play start sound and background music
        playSound(sounds.gameStart);
        if (!isMuted) {
            sounds.backgroundMusic.volume = volume;
            sounds.backgroundMusic.play();
        }
        
        // Start the game loop
        gameLoop();
    }

    // Pause the game
    function pauseGame() {
        console.log("Pausing game");
        gameRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        startButton.textContent = "RESUME GAME";
        startButton.classList.add("pulse-animation");
        
        // Pause background music
        sounds.backgroundMusic.pause();
    }
})
