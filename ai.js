// --- AI LOGIC ---

function getAIMove(gameState) {
    const allPossibleMoves = [];
    const aiColor = gameState.currentPlayer;
    const board = gameState.board;
    const ROWS = 8;
    const COLS = 4;

    // 1. Find all possible moves (flip, move, capture)
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const piece = board[r][c];
            if (piece) {
                if (piece.isHidden) {
                    // Type 1: Flip a hidden piece
                    allPossibleMoves.push({ type: 'flip', r, c });
                } else if (piece.color === aiColor) {
                    // Type 2: Move or capture with one of our pieces.
                    // CALL THE AUTHORITATIVE FUNCTION FROM CHESS.JS
                    const available = getAvailableMoves(r, c, board);
                    for (const move of available) {
                        allPossibleMoves.push({ type: 'move', from: { r, c }, to: { r: move.r, c: move.c } });
                    }
                }
            }
        }
    }

    // 2. If there are no moves, return null
    if (allPossibleMoves.length === 0) {
        return null;
    }

    // 3. Choose a random move from the list
    const randomMove = allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];

    // --- Basic Strategy ---
    // If a capture is possible, prefer it over other moves.
    const captureMoves = allPossibleMoves.filter(move => {
        if (move.type !== 'move') return false;
        const targetPiece = board[move.to.r][move.to.c];
        // A move is a capture if the target square is not empty.
        // The getAvailableMoves function already guarantees it's a valid capture.
        return !!targetPiece;
    });

    if (captureMoves.length > 0) {
        // Choose a random capture move
        return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }

    // Otherwise, return the previously selected random move
    return randomMove;
}
