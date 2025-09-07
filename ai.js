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
                    // Type 2: Move or capture with one of our pieces
                    const available = getAvailableMovesForAI(r, c, board, ROWS, COLS);
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

    // --- Basic Strategy (optional, can be improved) ---
    // If a capture is possible, prefer it over other moves.
    const captureMoves = allPossibleMoves.filter(move => {
        if (move.type !== 'move') return false;
        const targetPiece = board[move.to.r][move.to.c];
        return targetPiece && targetPiece.color !== aiColor;
    });

    if (captureMoves.length > 0) {
        // Choose a random capture move
        return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }

    // Otherwise, return the previously selected random move
    return randomMove;
}


// --- Helper functions copied from chess.js to make AI self-contained ---

function getAvailableMovesForAI(r, c, board, ROWS, COLS) {
    const piece = board[r][c];
    if (!piece || piece.isHidden) return [];

    const moves = [];
    const isCannon = piece.name === '炮' || piece.name === '包';

    // Normal moves (adjacent)
    const deltas = [{r: -1, c: 0}, {r: 1, c: 0}, {r: 0, c: -1}, {r: 0, c: 1}];
    for (const delta of deltas) {
        const newR = r + delta.r;
        const newC = c + delta.c;
        if (isValidSquare(newR, newC, ROWS, COLS)) {
            const target = board[newR][newC];
            if (!target) {
                moves.push({ r: newR, c: newC });
            } else if (canCapture(piece, target)) {
                moves.push({ r: newR, c: newC });
            }
        }
    }

    // Cannon moves
    if (isCannon) {
        for (let col = 0; col < COLS; col++) {
            if(col !== c) addCannonMoveForAI(r, c, r, col, moves, board, ROWS, COLS);
        }
        for (let row = 0; row < ROWS; row++) {
            if(row !== r) addCannonMoveForAI(r, c, row, c, moves, board, ROWS, COLS);
        }
    }
    return moves;
}

function addCannonMoveForAI(r1, c1, r2, c2, moves, board, ROWS, COLS) {
    const piece = board[r1][c1];
    const target = board[r2][c2];
    if (!target || target.color === piece.color) return;

    let jumpOverCount = 0;
    if (r1 === r2) { // Horizontal
        const start = Math.min(c1, c2) + 1;
        const end = Math.max(c1, c2);
        for (let i = start; i < end; i++) {
            if (board[r1][i]) jumpOverCount++;
        }
    } else { // Vertical
        const start = Math.min(r1, r2) + 1;
        const end = Math.max(r1, r2);
        for (let i = start; i < end; i++) {
            if (board[i][c1]) jumpOverCount++;
        }
    }

    if (jumpOverCount === 1) {
        moves.push({ r: r2, c: c2 });
    }
}

function canCapture(attacker, defender) {
    if (attacker.color === defender.color || defender.isHidden) {
        return false;
    }
    if ((attacker.name === '兵' || attacker.name === '卒') && (defender.name === '帥' || defender.name === '將')) {
        return true;
    }
    if ((attacker.name === '帥' || attacker.name === '將') && (defender.name === '兵' || defender.name === '卒')) {
        return false;
    }
    return attacker.rank >= defender.rank;
}

function isValidSquare(r, c, ROWS, COLS) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}
