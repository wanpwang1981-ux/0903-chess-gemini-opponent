document.addEventListener('DOMContentLoaded', () => {
    initBoard();
});

/**
 * Initializes the board.
 */
function initBoard() {
    console.log("Initializing chessboard...");
    drawBoard();
    // TODO: Place pieces on the board
    // TODO: Add logic for piece movement
}

/**
 * Draws the 8x8 chessboard squares.
 */
function drawBoard() {
    const container = document.getElementById('chessboard-container');
    if (!container) {
        console.error("Chessboard container not found!");
        return;
    }

    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        const row = Math.floor(i / 8);
        const col = i % 8;

        if ((row + col) % 2 === 0) {
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }
        container.appendChild(square);
    }
    console.log("Chessboard drawn.");
}

// TODO: Implement game state management
// TODO: Implement move validation logic
// TODO: Add event listeners for user interaction
