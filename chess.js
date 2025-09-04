// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initBoard();
});

// Unicode pieces for easy reference
const pieces = {
    w_king: '♔', w_queen: '♕', w_rook: '♖', w_bishop: '♗', w_knight: '♘', w_pawn: '♙',
    b_king: '♚', b_queen: '♛', b_rook: '♜', b_bishop: '♝', b_knight: '♞', b_pawn: '♟'
};

// Initial board setup using algebraic notation
const initialBoardSetup = {
    'a8': pieces.b_rook, 'b8': pieces.b_knight, 'c8': pieces.b_bishop, 'd8': pieces.b_queen, 'e8': pieces.b_king, 'f8': pieces.b_bishop, 'g8': pieces.b_knight, 'h8': pieces.b_rook,
    'a7': pieces.b_pawn, 'b7': pieces.b_pawn, 'c7': pieces.b_pawn, 'd7': pieces.b_pawn, 'e7': pieces.b_pawn, 'f7': pieces.b_pawn, 'g7': pieces.b_pawn, 'h7': pieces.b_pawn,
    'a2': pieces.w_pawn, 'b2': pieces.w_pawn, 'c2': pieces.w_pawn, 'd2': pieces.w_pawn, 'e2': pieces.w_pawn, 'f2': pieces.w_pawn, 'g2': pieces.w_pawn, 'h2': pieces.w_pawn,
    'a1': pieces.w_rook, 'b1': pieces.w_knight, 'c1': pieces.w_bishop, 'd1': pieces.w_queen, 'e1': pieces.w_king, 'f1': pieces.w_bishop, 'g1': pieces.w_knight, 'h1': pieces.w_rook
};

/**
 * Initializes the board: draws the squares and places the pieces.
 */
function initBoard() {
    console.log("Initializing chessboard...");
    drawBoard();
    placePieces();
    // TODO: Add logic for piece movement and valid moves
}

/**
 * Draws the 8x8 chessboard squares and assigns IDs.
 */
function drawBoard() {
    const container = document.getElementById('chessboard-container');
    if (!container) {
        console.error("Chessboard container not found!");
        return;
    }
    container.innerHTML = ''; // Clear board before drawing to ensure it's clean

    // Loop from rank 8 down to 1
    for (let row = 0; row < 8; row++) {
        // Loop from file 'a' to 'h'
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');

            // Generate algebraic notation ID (e.g., a8, h1)
            const file = String.fromCharCode('a'.charCodeAt(0) + col);
            const rank = 8 - row;
            square.id = `${file}${rank}`;

            // Set square color
            if ((row + col) % 2 === 0) {
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }
            container.appendChild(square);
        }
    }
    console.log("Chessboard drawn.");
}

/**
 * Places the pieces in their initial positions on the board.
 */
function placePieces() {
    console.log("Placing pieces...");
    // Clear any existing pieces before placing new ones
    document.querySelectorAll('.square').forEach(sq => sq.innerHTML = '');

    for (const squareId in initialBoardSetup) {
        const square = document.getElementById(squareId);
        if (square) {
            square.innerHTML = initialBoardSetup[squareId];
        }
    }
    console.log("Pieces placed.");
}

/**
 * Resets the game to the initial state.
 * Can be attached to a "Reset" button in the future.
 */
function resetGame() {
    console.log("Resetting game...");
    placePieces();
    // TODO: Future logic to reset game state, timers, captured pieces etc.
}

// TODO: Implement game state management
// TODO: Implement move validation logic (the core of the game)
// TODO: Add event listeners for user interaction (clicking on squares)
