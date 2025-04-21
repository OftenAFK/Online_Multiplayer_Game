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
            
            createParticles(738, ballY + ballSize/2, 'var(--secondary-color)');
        }
    }