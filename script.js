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
    
    // Game state
    let gameRunning = false;
    let animationFrameId = null;
    
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
        arrowdown: false
    };
    
    // Set up key event listeners
    window.addEventListener('keydown', function(e) {
        const key = e.key.toLowerCase();
        if (key in keysPressed) {
            keysPressed[key] = true;
            e.preventDefault();
            }
        });
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
        
        // Create winner announcement
        const winnerAnnouncement = document.createElement('div');
        winnerAnnouncement.className = 'winner-announcement';
        winnerAnnouncement.innerHTML = `
            <h2>${winner} Wins!</h2>
            <p>Final Score: ${player1Score} - ${player2Score}</p>
        `;
        gameArea.appendChild(winnerAnnouncement);
        
        // Update button
        startButton.textContent = "PLAY AGAIN";
        startButton.classList.add("pulse-animation");
    }