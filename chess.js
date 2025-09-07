document.addEventListener('DOMContentLoaded', init);

// --- Constants ---
const COLORS = { RED: 'red', BLACK: 'black' };
const PIECES = {
    '帥': { color: COLORS.RED, rank: 7, name: '帥' }, '將': { color: COLORS.BLACK, rank: 7, name: '將' },
    '仕': { color: COLORS.RED, rank: 6, name: '仕' }, '士': { color: COLORS.BLACK, rank: 6, name: '士' },
    '相': { color: COLORS.RED, rank: 5, name: '相' }, '象': { color: COLORS.BLACK, rank: 5, name: '象' },
    '俥': { color: COLORS.RED, rank: 4, name: '俥' }, '車': { color: COLORS.BLACK, rank: 4, name: '車' },
    '傌': { color: COLORS.RED, rank: 3, name: '傌' }, '馬': { color: COLORS.BLACK, rank: 3, name: '馬' },
    '炮': { color: COLORS.RED, rank: 2, name: '炮' }, '包': { color: COLORS.BLACK, rank: 2, name: '包' },
    '兵': { color: COLORS.RED, rank: 1, name: '兵' }, '卒': { color: COLORS.BLACK, rank: 1, name: '卒' },
};

const INITIAL_PIECE_POOL = [
    ...Array(1).fill('帥'), ...Array(2).fill('仕'), ...Array(2).fill('相'), ...Array(2).fill('俥'), ...Array(2).fill('傌'), ...Array(2).fill('炮'), ...Array(5).fill('兵'),
    ...Array(1).fill('將'), ...Array(2).fill('士'), ...Array(2).fill('象'), ...Array(2).fill('車'), ...Array(2).fill('馬'), ...Array(2).fill('包'), ...Array(5).fill('卒'),
];

const ROWS = 8;
const COLS = 4;

// --- Game State ---
let gameState = {};

function getDefaultGameState() {
    return {
        board: [],
        gameMode: null, // 'pvc' or 'pvp'
        currentPlayer: null,
        firstPlayerColor: null,
        selectedSquare: null,
        isGameOver: false,
        isAITurn: false,
        availableMoves: [],
        capturedPieces: { [COLORS.RED]: [], [COLORS.BLACK]: [] },
        moveHistory: [],
    };
}

// --- DOM Elements ---
const modeSelectionDiv = document.getElementById('mode-selection');
const gameContainerDiv = document.getElementById('game-container');
const chessboardContainer = document.getElementById('chessboard-container');
const messageArea = document.getElementById('message-area');

// --- Initialization ---
function init() {
    document.getElementById('pvc-button').addEventListener('click', () => startGame('pvc'));
    document.getElementById('pvp-button').addEventListener('click', () => startGame('pvp'));
    document.getElementById('reset-button').addEventListener('click', resetGame);
    document.getElementById('back-to-menu-button').addEventListener('click', showMenu);

    chessboardContainer.addEventListener('click', handleSquareClick);
    showMenu();
}

function showMenu() {
    modeSelectionDiv.classList.remove('hidden');
    gameContainerDiv.classList.add('hidden');
}

function startGame(mode) {
    gameState.gameMode = mode;
    modeSelectionDiv.classList.add('hidden');
    gameContainerDiv.classList.remove('hidden');
    resetGame();
}

function resetGame() {
    gameState = { ...getDefaultGameState(), gameMode: gameState.gameMode };
    initializeBoard();
    render();
    showMessage("遊戲開始！請先手翻棋。");
}

function initializeBoard() {
    let shuffledPieces = [...INITIAL_PIECE_POOL].sort(() => Math.random() - 0.5);
    gameState.board = Array(ROWS).fill(null).map((_, r) =>
        Array(COLS).fill(null).map((_, c) => {
            const pieceName = shuffledPieces.pop();
            return {
                ...PIECES[pieceName],
                id: `${r}-${c}`,
                isHidden: true,
            };
        })
    );
}

// --- Rendering ---
function render() {
    chessboardContainer.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.dataset.r = r;
            square.dataset.c = c;

            const pieceData = gameState.board[r][c];
            if (pieceData) {
                const pieceDiv = document.createElement('div');
                pieceDiv.className = 'piece';
                if (pieceData.isHidden) {
                    pieceDiv.classList.add('hidden-piece');
                } else {
                    pieceDiv.textContent = pieceData.name;
                    pieceDiv.classList.add(pieceData.color);
                }
                square.appendChild(pieceDiv);
            }
            chessboardContainer.appendChild(square);
        }
    }
    // Highlight selected and available moves
    if (gameState.selectedSquare) {
        const { r, c } = gameState.selectedSquare;
        const square = getSquareElement(r, c);
        if(square) square.classList.add('selected');
    }
    gameState.availableMoves.forEach(({r, c}) => {
        const square = getSquareElement(r, c);
        if(square) square.classList.add('available-move');
    });

    renderCapturedPieces();
}

function renderCapturedPieces() {
    document.getElementById('red-captured').innerHTML = gameState.capturedPieces[COLORS.RED].map(p => `<div class="piece ${p.color}">${p.name}</div>`).join('');
    document.getElementById('black-captured').innerHTML = gameState.capturedPieces[COLORS.BLACK].map(p => `<div class="piece ${p.color}">${p.name}</div>`).join('');
}


// --- Game Logic ---
function handleSquareClick(e) {
    if (gameState.isGameOver || gameState.isAITurn) return;

    const square = e.target.closest('.square');
    if (!square) return;

    const r = parseInt(square.dataset.r);
    const c = parseInt(square.dataset.c);
    const piece = gameState.board[r][c];

    if (gameState.selectedSquare) {
        // A piece is already selected, try to move
        const move = gameState.availableMoves.find(m => m.r === r && m.c === c);
        if (move) {
            movePiece(gameState.selectedSquare, { r, c });
        } else {
            // Deselect or select another piece
            gameState.selectedSquare = null;
            gameState.availableMoves = [];
            // If clicking another of your own pieces, select it
            if (piece && !piece.isHidden && piece.color === gameState.currentPlayer) {
                selectPiece(r, c);
            }
        }
    } else if (piece) {
        // No piece is selected, try to select or flip
        if (piece.isHidden) {
            flipPiece(r, c);
        } else if (piece.color === gameState.currentPlayer) {
            selectPiece(r, c);
        }
    }
    render();
}

function selectPiece(r, c) {
    gameState.selectedSquare = { r, c };
    gameState.availableMoves = getAvailableMoves(r, c, gameState.board);
}

// --- Core Action Logic (Internal, no turn management) ---

function _flipPiece(r, c) {
    const piece = gameState.board[r][c];
    if (!piece || !piece.isHidden) return;

    piece.isHidden = false;

    if (!gameState.firstPlayerColor) {
        gameState.firstPlayerColor = piece.color;
        gameState.currentPlayer = piece.color;
    }
}

function _movePiece(from, to) {
    const movingPiece = gameState.board[from.r][from.c];
    const targetPiece = gameState.board[to.r][to.c];

    if (targetPiece) { // Capture
        gameState.capturedPieces[targetPiece.color].push(targetPiece);
    }

    gameState.board[to.r][to.c] = movingPiece;
    gameState.board[from.r][from.c] = null;
    gameState.selectedSquare = null;
    gameState.availableMoves = [];
}

// --- Player-facing Action Wrappers (with turn management) ---

function flipPiece(r, c) {
    _flipPiece(r, c);
    endTurn();
}

function movePiece(from, to) {
    _movePiece(from, to);
    endTurn();
}

function endTurn() {
    // Switch player
    gameState.currentPlayer = (gameState.currentPlayer === COLORS.RED) ? COLORS.BLACK : COLORS.RED;

    checkGameOver();

    if (!gameState.isGameOver) {
        const playerText = gameState.currentPlayer === COLORS.RED ? "紅方" : "黑方";
        showMessage(`輪到 ${playerText} 行動`);

        if (gameState.gameMode === 'pvc' && gameState.currentPlayer !== gameState.firstPlayerColor) {
            gameState.isAITurn = true;
        }
    }
    render(); // Re-render after state changes

    if (gameState.isAITurn && !gameState.isGameOver) {
        triggerAIMove();
    }
}

async function triggerAIMove() {
    showMessage("電腦思考中...");
    await new Promise(resolve => setTimeout(resolve, 500));

    const aiMove = getAIMove(gameState);
    if (aiMove) {
        if (aiMove.type === 'flip') {
            _flipPiece(aiMove.r, aiMove.c);
        } else if (aiMove.type === 'move') {
            _movePiece(aiMove.from, aiMove.to);
        }
    }

    // AI has made its move (or has no moves). Its turn is over.
    // Set the flag to false BEFORE calling endTurn to prevent re-entry.
    gameState.isAITurn = false;

    // Now, formally end the turn to pass control to the player.
    endTurn();
}


// --- Rule Logic ---
function getAvailableMoves(r, c, board) {
    const piece = board[r][c];
    if (!piece || piece.isHidden) return [];

    const moves = [];
    const isCannon = piece.name === '炮' || piece.name === '包';

    // Normal moves (adjacent)
    const deltas = [{r: -1, c: 0}, {r: 1, c: 0}, {r: 0, c: -1}, {r: 0, c: 1}];
    for (const delta of deltas) {
        const newR = r + delta.r;
        const newC = c + delta.c;
        if (isValidSquare(newR, newC)) {
            const target = board[newR][newC];
            if (!target) { // Move to empty square
                moves.push({ r: newR, c: newC });
            } else if (canCapture(piece, target)) { // Capture
                moves.push({ r: newR, c: newC });
            }
        }
    }

    // Cannon moves
    if (isCannon) {
        // Horizontal
        for (let col = 0; col < COLS; col++) {
            if(col !== c) addCannonMove(r, c, r, col, moves, board);
        }
        // Vertical
        for (let row = 0; row < ROWS; row++) {
            if(row !== r) addCannonMove(r, c, row, c, moves, board);
        }
    }

    return moves;
}

function addCannonMove(r1, c1, r2, c2, moves, board) {
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
    // 兵/卒 can eat 帥/將
    if ((attacker.name === '兵' || attacker.name === '卒') && (defender.name === '帥' || defender.name === '將')) {
        return true;
    }
    // 帥/將 can be eaten by 兵/卒, but cannot eat them
    if ((attacker.name === '帥' || attacker.name === '將') && (defender.name === '兵' || defender.name === '卒')) {
        return false;
    }
    // General rule: higher or equal rank captures lower rank
    return attacker.rank >= defender.rank;
}


// --- Game Over Logic ---
function checkGameOver() {
    const redHasMoves = hasAnyValidMoves(COLORS.RED, gameState.board);
    const blackHasMoves = hasAnyValidMoves(COLORS.BLACK, gameState.board);

    if (!redHasMoves && gameState.currentPlayer === COLORS.RED) {
        endGame(COLORS.BLACK, "紅方已無棋可走");
        return;
    }
    if (!blackHasMoves && gameState.currentPlayer === COLORS.BLACK) {
        endGame(COLORS.RED, "黑方已無棋可走");
        return;
    }
}

function hasAnyValidMoves(color, board) {
    // Check for any possible flips
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] && board[r][c].isHidden) {
                return true;
            }
        }
    }
    // Check for any possible moves
    const pieces = getPlayerPieces(color); // This function still uses global state, but it's okay for now as it's only for getting piece locations.
    for (const piece of pieces) {
        if (getAvailableMoves(piece.r, piece.c, board).length > 0) {
            return true;
        }
    }
    return false;
}

function endGame(winner, reason) {
    gameState.isGameOver = true;
    const winnerText = winner === COLORS.RED ? "紅方" : "黑方";
    showMessage(`遊戲結束！${winnerText}獲勝！(${reason})`);
}

// --- Utility functions ---
function getPlayerPieces(color) {
    const pieces = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const piece = gameState.board[r][c];
            if (piece && !piece.isHidden && piece.color === color) {
                pieces.push({ r, c, ...piece });
            }
        }
    }
    return pieces;
}

function isValidSquare(r, c) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

function getSquareElement(r, c) {
    return chessboardContainer.querySelector(`[data-r='${r}'][data-c='${c}']`);
}

function showMessage(text) {
    messageArea.textContent = text;
}
