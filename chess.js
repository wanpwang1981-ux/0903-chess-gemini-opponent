document.addEventListener('DOMContentLoaded', () => {
    init();
});

// --- Constants ---
const PIECE_TYPES = {
    PAWN: 'pawn', KNIGHT: 'knight', BISHOP: 'bishop', ROOK: 'rook', QUEEN: 'queen', KING: 'king'
};
const COLORS = {
    WHITE: 'white', BLACK: 'black'
};

// Unicode pieces for rendering
const UNICODE_PIECES = {
    [COLORS.WHITE]: {
        [PIECE_TYPES.KING]: '♔', [PIECE_TYPES.QUEEN]: '♕', [PIECE_TYPES.ROOK]: '♖',
        [PIECE_TYPES.BISHOP]: '♗', [PIECE_TYPES.KNIGHT]: '♘', [PIECE_TYPES.PAWN]: '♙'
    },
    [COLORS.BLACK]: {
        [PIECE_TYPES.KING]: '♚', [PIECE_TYPES.QUEEN]: '♛', [PIECE_TYPES.ROOK]: '♜',
        [PIECE_TYPES.BISHOP]: '♝', [PIECE_TYPES.KNIGHT]: '♞', [PIECE_TYPES.PAWN]: '♟'
    }
};

// Initial setup mapping from square ID to a simple piece identifier
const INITIAL_SETUP = {
    'a8': 'b_rook', 'b8': 'b_knight', 'c8': 'b_bishop', 'd8': 'b_queen', 'e8': 'b_king', 'f8': 'b_bishop', 'g8': 'b_knight', 'h8': 'b_rook',
    'a7': 'b_pawn', 'b7': 'b_pawn', 'c7': 'b_pawn', 'd7': 'b_pawn', 'e7': 'b_pawn', 'f7': 'b_pawn', 'g7': 'b_pawn', 'h7': 'b_pawn',
    'a2': 'w_pawn', 'b2': 'w_pawn', 'c2': 'w_pawn', 'd2': 'w_pawn', 'e2': 'w_pawn', 'f2': 'w_pawn', 'g2': 'w_pawn', 'h2': 'w_pawn',
    'a1': 'w_rook', 'b1': 'w_knight', 'c1': 'w_bishop', 'd1': 'w_queen', 'e1': 'w_king', 'f1': 'w_bishop', 'g1': 'w_knight', 'h1': 'w_rook'
};

// --- Game State ---
let gameState = {};

// --- Core Functions ---

function init() {
    console.log("Initializing game...");
    drawBoard();
    setTimeout(resetGame, 0);
}

function resetGame() {
    console.log("Resetting game...");
    gameState = {
        board: initializeBoardState(),
        currentPlayer: COLORS.WHITE,
        selectedSquare: null,
        lastMove: null,
    };
    renderBoard();
    showMessage("輪到白方下棋");
}

function initializeBoardState() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (const id in INITIAL_SETUP) {
        const [row, col] = idToCoords(id);
        const pieceStr = INITIAL_SETUP[id];
        const [colorStr, typeStr] = pieceStr.split('_');
        board[row][col] = {
            color: colorStr === 'w' ? COLORS.WHITE : COLORS.BLACK,
            type: PIECE_TYPES[typeStr.toUpperCase()]
        };
    }
    return board;
}

function drawBoard() {
    const container = document.getElementById('chessboard-container');
    if (!container) {
        console.error("Chessboard container not found!");
        return;
    }
    container.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.id = coordsToId([row, col]);
            if ((row + col) % 2 === 0) {
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }
            container.appendChild(square);
        }
    }
    container.addEventListener('click', handleSquareClick);
    console.log("Chessboard drawn and event listener attached.");
}

function renderBoard() {
    const { board, selectedSquare, lastMove } = gameState;
    document.querySelectorAll('.square').forEach(sq => {
        sq.innerHTML = '';
        sq.classList.remove('selected', 'last-move');
    });
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                document.getElementById(coordsToId([row, col])).innerHTML = UNICODE_PIECES[piece.color][piece.type];
            }
        }
    }
    if (selectedSquare) {
        document.getElementById(selectedSquare).classList.add('selected');
    }
    if (lastMove) {
        document.getElementById(lastMove.from).classList.add('last-move');
        document.getElementById(lastMove.to).classList.add('last-move');
    }
}

// --- Event Handling ---

function handleSquareClick(e) {
    const square = e.target.closest('.square');
    if (!square) return;
    const squareId = square.id;
    const [row, col] = idToCoords(squareId);
    const pieceOnSquare = gameState.board[row][col];

    if (gameState.selectedSquare) {
        if (squareId === gameState.selectedSquare) {
            gameState.selectedSquare = null;
            showMessage("取消選取");
        } else {
            const fromId = gameState.selectedSquare;
            const [fromRow, fromCol] = idToCoords(fromId);
            const movingPiece = gameState.board[fromRow][fromCol];
            if (isValidMove(movingPiece, fromId, squareId)) {
                movePiece(fromId, squareId);
            } else {
                showMessage("不合法的移動", true);
                gameState.selectedSquare = null;
            }
        }
    } else if (pieceOnSquare) {
        if (pieceOnSquare.color === gameState.currentPlayer) {
            gameState.selectedSquare = squareId;
                showMessage("選取棋子，請選擇目標位置");
        } else {
                const playerText = gameState.currentPlayer === 'white' ? '白方' : '黑方';
                showMessage(`現在是${playerText}的回合，不能移動對方的棋子。`, true);
        }
    }
    renderBoard();
}

// --- Game Logic ---

function movePiece(fromId, toId) {
    const [fromRow, fromCol] = idToCoords(fromId);
    const [toRow, toCol] = idToCoords(toId);
    const piece = gameState.board[fromRow][fromCol];
    gameState.board[toRow][toCol] = piece;
    gameState.board[fromRow][fromCol] = null;
    gameState.lastMove = { from: fromId, to: toId };
    gameState.selectedSquare = null;
    gameState.currentPlayer = gameState.currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    const playerText = gameState.currentPlayer === 'white' ? '白方' : '黑方';
    showMessage(`移動成功！輪到${playerText}下棋。`);
}

function isPathClear(fromId, toId) {
    const [fromRow, fromCol] = idToCoords(fromId);
    const [toRow, toCol] = idToCoords(toId);
    const dRow = Math.sign(toRow - fromRow);
    const dCol = Math.sign(toCol - fromCol);
    let currentRow = fromRow + dRow;
    let currentCol = fromCol + dCol;
    while (currentRow !== toRow || currentCol !== toCol) {
        if (gameState.board[currentRow][currentCol]) return false;
        currentRow += dRow;
        currentCol += dCol;
    }
    return true;
}

function isValidMove(piece, fromId, toId) {
    if (!piece) return false;
    const [fromRow, fromCol] = idToCoords(fromId);
    const [toRow, toCol] = idToCoords(toId);
    const targetPiece = gameState.board[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) return false;
    const dRow = toRow - fromRow;
    const dCol = toCol - fromCol;

    switch (piece.type) {
        case PIECE_TYPES.PAWN:
            const forwardDir = piece.color === COLORS.WHITE ? -1 : 1;
            const startRow = piece.color === COLORS.WHITE ? 6 : 1;
            if (dCol === 0 && dRow === forwardDir && !targetPiece) return true;
            if (dCol === 0 && fromRow === startRow && dRow === 2 * forwardDir && !targetPiece) return isPathClear(fromId, toId);
            if (Math.abs(dCol) === 1 && dRow === forwardDir && targetPiece) return true;
            return false;
        case PIECE_TYPES.KNIGHT:
            return (Math.abs(dRow) === 2 && Math.abs(dCol) === 1) || (Math.abs(dRow) === 1 && Math.abs(dCol) === 2);
        case PIECE_TYPES.ROOK:
            return (dRow === 0 || dCol === 0) && isPathClear(fromId, toId);
        case PIECE_TYPES.BISHOP:
            return Math.abs(dRow) === Math.abs(dCol) && isPathClear(fromId, toId);
        case PIECE_TYPES.QUEEN:
            return ((dRow === 0 || dCol === 0) || (Math.abs(dRow) === Math.abs(dCol))) && isPathClear(fromId, toId);
        case PIECE_TYPES.KING:
            return Math.abs(dRow) <= 1 && Math.abs(dCol) <= 1;
        default:
            return false;
    }
}

// --- Helper Functions ---

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

function showMessage(text, isError = false) {
    const messageArea = document.getElementById('message-area');
    if (messageArea) {
        messageArea.textContent = text;
        messageArea.style.color = isError ? '#c0392b' : '#2c3e50';
    }
}
