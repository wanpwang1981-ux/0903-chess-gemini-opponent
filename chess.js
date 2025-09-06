document.addEventListener('DOMContentLoaded', () => {
    init();

    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', resetGame);
    }
});

// --- Constants ---
const PIECE_TYPES = { PAWN: 'pawn', KNIGHT: 'knight', BISHOP: 'bishop', ROOK: 'rook', QUEEN: 'queen', KING: 'king' };
const COLORS = { WHITE: 'white', BLACK: 'black' };

const MOVE_VALIDATION_RESULTS = {
    VALID: { isValid: true, reason: null },
    INVALID_PIECE_MOVE: { isValid: false, reason: 'INVALID_PIECE_MOVE' },
    PATH_BLOCKED: { isValid: false, reason: 'PATH_BLOCKED' },
    MOVE_EXPOSES_KING_TO_CHECK: { isValid: false, reason: 'MOVE_EXPOSES_KING_TO_CHECK' },
    INVALID_STATE_NO_KING: { isValid: false, reason: 'INVALID_STATE_NO_KING' },
};

const ERROR_MESSAGES = {
    'INVALID_PIECE_MOVE': "這個棋子不能這樣走。",
    'PATH_BLOCKED': "路徑被其他棋子擋住了。",
    'MOVE_EXPOSES_KING_TO_CHECK': "這個移動會讓您的國王陷入危險。",
    'INVALID_STATE_NO_KING': "發生內部錯誤：找不到國王。",
};

const UNICODE_PIECES = {
    [COLORS.WHITE]: { [PIECE_TYPES.KING]: '♔', [PIECE_TYPES.QUEEN]: '♕', [PIECE_TYPES.ROOK]: '♖', [PIECE_TYPES.BISHOP]: '♗', [PIECE_TYPES.KNIGHT]: '♘', [PIECE_TYPES.PAWN]: '♙' },
    [COLORS.BLACK]: { [PIECE_TYPES.KING]: '♚', [PIECE_TYPES.QUEEN]: '♛', [PIECE_TYPES.ROOK]: '♜', [PIECE_TYPES.BISHOP]: '♝', [PIECE_TYPES.KNIGHT]: '♞', [PIECE_TYPES.PAWN]: '♟' }
};

const INITIAL_SETUP = {
    'a8': 'b_rook', 'b8': 'b_knight', 'c8': 'b_bishop', 'd8': 'b_queen', 'e8': 'b_king', 'f8': 'b_bishop', 'g8': 'b_knight', 'h8': 'b_rook',
    'a7': 'b_pawn', 'b7': 'b_pawn', 'c7': 'b_pawn', 'd7': 'b_pawn', 'e7': 'b_pawn', 'f7': 'b_pawn', 'g7': 'b_pawn', 'h7': 'b_pawn',
    'a2': 'w_pawn', 'b2': 'w_pawn', 'c2': 'w_pawn', 'd2': 'w_pawn', 'e2': 'w_pawn', 'f2': 'w_pawn', 'g2': 'w_pawn', 'h2': 'w_pawn',
    'a1': 'w_rook', 'b1': 'w_knight', 'c1': 'w_bishop', 'd1': 'w_queen', 'e1': 'w_king', 'f1': 'w_bishop', 'g1': 'w_knight', 'h1': 'w_rook'
};

let gameState = {};

function init() {
    drawBoard();
    setTimeout(resetGame, 0);
}

function resetGame() {
    gameState = { board: initializeBoardState(), currentPlayer: COLORS.WHITE, selectedSquare: null, lastMove: null, isGameOver: false, availableMoves: [] };
    renderBoard();
    showMessage("輪到白方下棋");
}

function initializeBoardState() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (const id in INITIAL_SETUP) {
        const [row, col] = idToCoords(id);
        const pieceStr = INITIAL_SETUP[id];
        const [colorStr, typeStr] = pieceStr.split('_');
        board[row][col] = { color: colorStr === 'w' ? COLORS.WHITE : COLORS.BLACK, type: PIECE_TYPES[typeStr.toUpperCase()] };
    }
    return board;
}

function drawBoard() {
    const container = document.getElementById('chessboard-container');
    container.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.id = coordsToId([row, col]);
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            container.appendChild(square);
        }
    }
    container.addEventListener('click', handleSquareClick);
}

function renderBoard() {
    const { board, selectedSquare, lastMove, availableMoves } = gameState;
    document.querySelectorAll('.square').forEach(sq => {
        sq.innerHTML = '';
        sq.classList.remove('selected', 'last-move', 'available-move');
    });
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                document.getElementById(coordsToId([row, col])).innerHTML = UNICODE_PIECES[piece.color][piece.type];
            }
        }
    }
    if (selectedSquare) document.getElementById(selectedSquare).classList.add('selected');
    if (lastMove) {
        document.getElementById(lastMove.from).classList.add('last-move');
        document.getElementById(lastMove.to).classList.add('last-move');
    }
    if (availableMoves.length > 0) {
        availableMoves.forEach(moveId => {
            document.getElementById(moveId).classList.add('available-move');
        });
    }
}

function handleSquareClick(e) {
    if (gameState.isGameOver) {
        showMessage("遊戲已結束。請點擊「重新開局」。", true);
        return;
    }
    const square = e.target.closest('.square');
    if (!square) return;
    const squareId = square.id;
    const pieceOnSquare = getPieceAtId(squareId);

    if (gameState.selectedSquare) {
        if (squareId === gameState.selectedSquare) {
            gameState.selectedSquare = null;
            gameState.availableMoves = [];
            showMessage("取消選取");
        } else {
            const fromId = gameState.selectedSquare;
            const movingPiece = getPieceAtId(fromId);
            const moveResult = isValidMove(movingPiece, fromId, squareId);

            if (moveResult.isValid) {
                movePiece(fromId, squareId);
            } else {
                const message = ERROR_MESSAGES[moveResult.reason] || "不合法的移動";
                showMessage(message, true);
                gameState.selectedSquare = null;
                gameState.availableMoves = [];
            }
        }
    } else if (pieceOnSquare) {
        if (pieceOnSquare.color === gameState.currentPlayer) {
            gameState.selectedSquare = squareId;
            gameState.availableMoves = getAvailableMoves(squareId);
            showMessage("選取棋子，請選擇目標位置");
        } else {
            const playerText = gameState.currentPlayer === 'white' ? '白方' : '黑方';
            showMessage(`現在是${playerText}的回合，不能移動對方的棋子。`, true);
        }
    }
    renderBoard();
}

function movePiece(fromId, toId) {
    const [fromRow, fromCol] = idToCoords(fromId);
    const [toRow, toCol] = idToCoords(toId);
    gameState.board[toRow][toCol] = gameState.board[fromRow][fromCol];
    gameState.board[fromRow][fromCol] = null;
    gameState.lastMove = { from: fromId, to: toId };
    gameState.selectedSquare = null;
    gameState.availableMoves = [];
    gameState.currentPlayer = gameState.currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    updateGameStatus();
}

function updateGameStatus() {
    const player = gameState.currentPlayer;
    const opponent = player === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    const kingId = findKing(player);
    if (!kingId) {
        gameState.isGameOver = true;
        showMessage("錯誤：找不到國王！", true);
        return;
    }
    const isInCheck = isSquareUnderAttack(kingId, opponent, gameState.board);
    const hasMoves = hasAnyValidMoves(player);
    if (!hasMoves) {
        gameState.isGameOver = true;
        if (isInCheck) {
            const winnerText = opponent === 'white' ? '白方' : '黑方';
            showMessage(`將死！ ${winnerText}獲勝！`, true);
        } else {
            showMessage("逼和！遊戲平局。", true);
        }
    } else if (isInCheck) {
        const playerText = player === 'white' ? '白方' : '黑方';
        showMessage(`輪到${playerText}下棋，國王已被將軍！`);
    } else {
        const playerText = player === 'white' ? '白方' : '黑方';
        showMessage(`輪到${playerText}下棋。`);
    }
}

function hasAnyValidMoves(playerColor) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.color === playerColor) {
                const fromId = coordsToId([r, c]);
                for (let destR = 0; destR < 8; destR++) {
                    for (let destC = 0; destC < 8; destC++) {
                        const toId = coordsToId([destR, destC]);
                        if (isValidMove(piece, fromId, toId).isValid) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function getAvailableMoves(fromId) {
    const availableMoves = [];
    const piece = getPieceAtId(fromId);
    if (!piece) return availableMoves;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const toId = coordsToId([r, c]);
            if (isValidMove(piece, fromId, toId).isValid) {
                availableMoves.push(toId);
            }
        }
    }
    return availableMoves;
}

function isValidMove(piece, fromId, toId) {
    const canMoveResult = canPieceMove(piece, fromId, toId, gameState.board);
    if (!canMoveResult.isValid) {
        return canMoveResult;
    }
    const boardCopy = JSON.parse(JSON.stringify(gameState.board));
    const [fromRow, fromCol] = idToCoords(fromId);
    const [toRow, toCol] = idToCoords(toId);
    boardCopy[toRow][toCol] = boardCopy[fromRow][fromCol];
    boardCopy[fromRow][fromCol] = null;
    const kingSquareId = findKing(piece.color, boardCopy);
    if (!kingSquareId) {
        return { isValid: false, reason: 'INVALID_STATE_NO_KING' };
    }
    const opponentColor = piece.color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    if (isSquareUnderAttack(kingSquareId, opponentColor, boardCopy)) {
        return MOVE_VALIDATION_RESULTS.MOVE_EXPOSES_KING_TO_CHECK;
    }
    return MOVE_VALIDATION_RESULTS.VALID;
}

function isSquareUnderAttack(squareId, attackerColor, board) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.color === attackerColor) {
                if (canPieceMove(piece, coordsToId([r, c]), squareId, board).isValid) {
                    return true;
                }
            }
        }
    }
    return false;
}

function isPathClear(fromId, toId, board) {
    const [fromRow, fromCol] = idToCoords(fromId);
    const [toRow, toCol] = idToCoords(toId);
    const dRow = Math.sign(toRow - fromRow);
    const dCol = Math.sign(toCol - fromCol);
    let currentRow = fromRow + dRow;
    let currentCol = fromCol + dCol;
    while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol]) return MOVE_VALIDATION_RESULTS.PATH_BLOCKED;
        currentRow += dRow;
        currentCol += dCol;
    }
    return MOVE_VALIDATION_RESULTS.VALID;
}

function canPieceMove(piece, fromId, toId, board) {
    if (!piece) return { isValid: false };
    const [fromRow, fromCol] = idToCoords(fromId);
    const [toRow, toCol] = idToCoords(toId);
    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) return { isValid: false };
    const dRow = toRow - fromRow;
    const dCol = toCol - fromCol;

    switch (piece.type) {
        case PIECE_TYPES.PAWN:
            const forwardDir = piece.color === COLORS.WHITE ? -1 : 1;
            const startRow = piece.color === COLORS.WHITE ? 6 : 1;
            if (Math.abs(dCol) === 1 && dRow === forwardDir && targetPiece) return MOVE_VALIDATION_RESULTS.VALID;
            if (targetPiece) return MOVE_VALIDATION_RESULTS.INVALID_PIECE_MOVE;
            if (dCol === 0 && dRow === forwardDir) return MOVE_VALIDATION_RESULTS.VALID;
            if (dCol === 0 && fromRow === startRow && dRow === 2 * forwardDir) return isPathClear(fromId, toId, board);
            return MOVE_VALIDATION_RESULTS.INVALID_PIECE_MOVE;
        case PIECE_TYPES.KNIGHT:
            return (Math.abs(dRow) === 2 && Math.abs(dCol) === 1) || (Math.abs(dRow) === 1 && Math.abs(dCol) === 2) ? MOVE_VALIDATION_RESULTS.VALID : MOVE_VALIDATION_RESULTS.INVALID_PIECE_MOVE;
        case PIECE_TYPES.ROOK:
            return (dRow === 0 || dCol === 0) ? isPathClear(fromId, toId, board) : MOVE_VALIDATION_RESULTS.INVALID_PIECE_MOVE;
        case PIECE_TYPES.BISHOP:
            return Math.abs(dRow) === Math.abs(dCol) ? isPathClear(fromId, toId, board) : MOVE_VALIDATION_RESULTS.INVALID_PIECE_MOVE;
        case PIECE_TYPES.QUEEN:
            return ((dRow === 0 || dCol === 0) || (Math.abs(dRow) === Math.abs(dCol))) ? isPathClear(fromId, toId, board) : MOVE_VALIDATION_RESULTS.INVALID_PIECE_MOVE;
        case PIECE_TYPES.KING:
            return Math.abs(dRow) <= 1 && Math.abs(dCol) <= 1 ? MOVE_VALIDATION_RESULTS.VALID : MOVE_VALIDATION_RESULTS.INVALID_PIECE_MOVE;
        default:
            return { isValid: false };
    }
}

function findKing(playerColor, board) {
    const aBoard = board || gameState.board;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = aBoard[r][c];
            if (p && p.type === PIECE_TYPES.KING && p.color === playerColor) {
                return coordsToId([r, c]);
            }
        }
    }
    return '';
}

function idToCoords(id) {
    const col = id.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(id.substring(1), 10);
    return [row, col];
}

function coordsToId([row, col]) {
    const file = String.fromCharCode('a'.charCodeAt(0) + col);
    const rank = 8 - row;
    return `${file}${rank}`;
}

function getPieceAtId(id) {
    const [row, col] = idToCoords(id);
    return gameState.board[row][col];
}

function showMessage(text, isError = false) {
    const messageArea = document.getElementById('message-area');
    if (messageArea) {
        messageArea.textContent = text;
        messageArea.style.color = isError ? '#c0392b' : '#2c3e50';
    }
}
