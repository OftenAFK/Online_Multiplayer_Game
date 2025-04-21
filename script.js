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

    // Reset the game
    function resetGame() {
        console.log("Resetting game");
        
        // Reset scores
        player1Score = 0;
        player2Score = 0;
        updateScoreDisplay();
        
        // Reset positions
        player1Y = 210;
        player2Y = 210;
        ballX = 392;
        ballY = 242;
        ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
        
        // Update visual positions
        updatePositions();
        
        // Remove winner announcement if present
        const winnerAnnouncement = document.querySelector('.winner-announcement');
        if (winnerAnnouncement) {
            winnerAnnouncement.remove();
        }
        
        // Start the game
        gameRunning = true;
        startButton.textContent = "PAUSE GAME";
        startButton.classList.remove("pulse-animation");
        
        // Play start sound
        playSound(sounds.gameStart);
        if (!isMuted) {
            sounds.backgroundMusic.volume = volume;
            sounds.backgroundMusic.play();
        }
        
        // Start the game loop
        gameLoop();
    }

    // Update the score display
    function updateScoreDisplay() {
        player1ScoreDisplay.textContent = player1Score;
        player2ScoreDisplay.textContent = player2Score;
    }

    // Update visual positions of game elements
    function updatePositions() {
        player1Paddle.style.top = player1Y + 'px';
        player2Paddle.style.top = player2Y + 'px';
        ball.style.left = ballX + 'px';
        ball.style.top = ballY + 'px';
    }

    // Check for a winner
    function checkWinner() {
        if (player1Score >= 10) {
            endGame("Player 1");
            return true;
        } else if (player2Score >= 10) {
            endGame("Player 2");
            return true;
        }
        return false;
    }

    // End the game and declare a winner
    function endGame(winner) {
        console.log(`Game ended. ${winner} wins!`);
        gameRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Play win sound and pause background music
        playSound(sounds.win);
        sounds.backgroundMusic.pause();
        
        // Create winner announcement
        const winnerAnnouncement = document.createElement('div');
        winnerAnnouncement.className = 'winner-announcement';
        winnerAnnouncement.innerHTML = `
            <h2>${winner} WINS!</h2>
            <p>Final Score: ${player1Score} - ${player2Score}</p>
        `;
        gameArea.appendChild(winnerAnnouncement);
        
        // Update button
        startButton.textContent = "PLAY AGAIN";
        startButton.classList.add("pulse-animation");
    }

    // Create particle effect
    function createParticles(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.backgroundColor = color;
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            gameArea.appendChild(particle);
            
            // Random movement
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Animate particle
            let opacity = 1;
            const animation = setInterval(() => {
                // Move
                const currentLeft = parseFloat(particle.style.left);
                const currentTop = parseFloat(particle.style.top);
                particle.style.left = (currentLeft + vx) + 'px';
                particle.style.top = (currentTop + vy) + 'px';
                
                // Fade
                opacity -= 0.05;
                particle.style.opacity = opacity;
                
                // Remove when faded
                if (opacity <= 0) {
                    clearInterval(animation);
                    particle.remove();
                }
            }, 20);
        }
    }

    // Main game loop
    function gameLoop() {
        if (!gameRunning) return;

        // Move paddles based on key presses
        if (keysPressed.w && player1Y > 0) {
            player1Y -= 7;
        }
        if (keysPressed.s && player1Y < 500 - paddleHeight) {
            player1Y += 7;
        }
        if (keysPressed.arrowup && player2Y > 0) {
            player2Y -= 7;
        }
        if (keysPressed.arrowdown && player2Y < 500 - paddleHeight) {
            player2Y += 7;
        }

        // Move ball
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Ball collision with top/bottom walls
        if (ballY <= 0 || ballY >= 500 - ballSize) {
            ballSpeedY = -ballSpeedY;
            createParticles(ballX, ballY <= 0 ? 0 : 500, '#ffffff');
            
            // Play wall bounce sound
            playSound(sounds.wallHit);
        }

        // Ball collision with paddles
        // Player 1 paddle (left)
        if (
            ballX <= 62 && // 50 (paddle left) + 12 (paddle width)
            ballX >= 50 &&
            ballY + ballSize >= player1Y &&
            ballY <= player1Y + paddleHeight
        ) {
            // Reflect ball with angle based on where it hit the paddle
            const hitPos = (ballY + ballSize/2 - player1Y) / paddleHeight;
            const angle = (hitPos - 0.5) * 0.8; // -0.4 to 0.4 radians
            ballSpeedX = Math.abs(ballSpeedX);
            const speed = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY);
            ballSpeedX = speed * Math.cos(angle);
            ballSpeedY = speed * Math.sin(angle);

            // Increase speed slightly
            if (Math.abs(ballSpeedX) < 15) {
                ballSpeedX *= 1.05;
                ballSpeedY *= 1.05;
            }
            
            // Play paddle hit sound
            playSound(sounds.paddleHit);
            createParticles(62, ballY + ballSize/2, 'var(--primary-color)');
        }

        // Player 2 paddle (right)
        if (
            ballX + ballSize >= 738 && // 800 - 50 (distance from right) - 12 (paddle width)
            ballX <= 750 && // 800 - 50 (distance from right)
            ballY + ballSize >= player2Y &&
            ballY <= player2Y + paddleHeight
        ) {
            // Reflect ball with angle based on where it hit the paddle
            const hitPos = (ballY + ballSize/2 - player2Y) / paddleHeight;
            const angle = (hitPos - 0.5) * 0.8; // -0.4 to 0.4 radians
            ballSpeedX = -Math.abs(ballSpeedX);
            const speed = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY);
            ballSpeedX = -speed * Math.cos(angle);
            ballSpeedY = speed * Math.sin(angle);

            // Increase speed slightly
            if (Math.abs(ballSpeedX) < 15) {
                ballSpeedX *= 1.05;
                ballSpeedY *= 1.05;
            }
            
            // Play paddle hit sound
            playSound(sounds.paddleHit);
            createParticles(738, ballY + ballSize/2, 'var(--secondary-color)');
        }

        // Ball out of bounds (scoring)
        if (ballX <= 0) {
            // Player 2 scores
            player2Score++;
            updateScoreDisplay();
            createParticles(0, ballY, 'var(--secondary-color)', 15);
            
            // Play score sound
            playSound(sounds.score);
            
            // Flash score
            player2ScoreDisplay.classList.add('score-flash');
            setTimeout(() => {
                player2ScoreDisplay.classList.remove('score-flash');
            }, 500);

            // Check for winner
            if (checkWinner()) {
                return; // Game over
            }

            // Reset ball
            ballX = 392;
            ballY = 242;
            ballSpeedX = -5;
            ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
        } else if (ballX >= 800 - ballSize) {
            // Player 1 scores
            player1Score++;
            updateScoreDisplay();
            createParticles(800, ballY, 'var(--primary-color)', 15);
            
            // Play score sound
            playSound(sounds.score);
            
            // Flash score
            player1ScoreDisplay.classList.add('score-flash');
            setTimeout(() => {
                player1ScoreDisplay.classList.remove('score-flash');
            }, 500);

            // Check for winner
            if (checkWinner()) {
                return; // Game over
            }

            // Reset ball
            ballX = 392;
            ballY = 242;
            ballSpeedX = 5;
            ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
        }

        // Update visual positions
        updatePositions();

        // Continue the game loop
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Function to insert audio elements into the document
    function insertAudioElements() {
        const audioContainer = document.createElement('div');
        audioContainer.style.display = 'none';
        audioContainer.innerHTML = `
            <audio id="paddleHitSound" preload="auto">
                <source src="sounds/paddle-hit.mp3" type="audio/mpeg">
            </audio>
            <audio id="wallHitSound" preload="auto">
                <source src="sounds/wall-hit.mp3" type="audio/mpeg">
            </audio>
            <audio id="scoreSound" preload="auto">
                <source src="sounds/score.mp3" type="audio/mpeg">
            </audio>
            <audio id="winSound" preload="auto">
                <source src="sounds/win.mp3" type="audio/mpeg">
            </audio>
            <audio id="gameStartSound" preload="auto">
                <source src="sounds/game-start.mp3" type="audio/mpeg">
            </audio>
            <audio id="backgroundMusic" preload="auto" loop>
                <source src="sounds/background-music.mp3" type="audio/mpeg">
            </audio>
        `;
        document.body.appendChild(audioContainer);
    }

    // Function to insert audio controls
    function insertAudioControls() {
        const audioControlsContainer = document.createElement('div');
        audioControlsContainer.className = 'audio-controls';
        audioControlsContainer.innerHTML = `
            <button id="toggleAudio" class="audio-btn">
                <span class="audio-icon">🔊</span>
            </button>
            <div class="volume-slider-container">
                <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="0.7">
            </div>
        `;
        document.querySelector('.game-container').appendChild(audioControlsContainer);
        
        // Add CSS for audio controls if not already in stylesheet
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .audio-controls {
                position: absolute;
                bottom: 20px;
                right: 20px;
                display: flex;
                align-items: center;
                background: rgba(26, 31, 60, 0.7);
                padding: 8px;
                border-radius: 30px;
                backdrop-filter: blur(5px);
                box-shadow: 0 0 15px rgba(0, 194, 255, 0.2);
                z-index: 100;
            }
            
            .audio-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--primary-color);
                border: none;
                color: var(--background-color);
                font-size: 1.2rem;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: all 0.2s ease;
            }
            
            .audio-btn:hover {
                transform: scale(1.1);
                background: var(--secondary-color);
            }
            
            .volume-slider-container {
                width: 0;
                overflow: hidden;
                transition: width 0.3s ease;
                margin-left: 10px;
            }
            
            .volume-slider-container.active {
                width: 100px;
            }
            
            #volumeSlider {
                width: 100px;
                -webkit-appearance: none;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                outline: none;
            }
            
            #volumeSlider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 15px;
                height: 15px;
                background: var(--text-color);
                border-radius: 50%;
                cursor: pointer;
            }
            
            #volumeSlider::-moz-range-thumb {
                width: 15px;
                height: 15px;
                background: var(--text-color);
                border-radius: 50%;
                cursor: pointer;
                border: none;
            }
            
            @keyframes score-flash {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.8; color: var(--accent-color); }
            }
            
            .score-flash {
                animation: score-flash 0.5s ease;
            }
        `;
        document.head.appendChild(styleElement);
        
        // Add pause hint
        const pauseHint = document.createElement('p');
        pauseHint.textContent = 'Press P to pause';
        pauseHint.className = 'controls-info';
        document.querySelector('.controls').appendChild(pauseHint);
    }

    // Initialize positions
    updatePositions();
    console.log("Game initialized and ready to start");
});
