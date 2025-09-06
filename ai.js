/**
 * Gets a move from the AI.
 * This function can be extended to call the Gemini API.
 * For now, it implements a simple random-move AI as a fallback.
 *
 * @param {object} gameState - The entire current game state.
 * @returns {Promise<object|null>} A promise that resolves to the AI's move { from, to } or null if no moves are available.
 */
async function getAIMove(gameState) {
    // TODO: Connect to Gemini API to get the AI's move.
    console.log("AI is thinking...");

    // Simulate network delay for a more realistic feel
    await new Promise(resolve => setTimeout(resolve, 500));

    // --- Fallback AI: Random Mover ---
    const aiColor = gameState.currentPlayer;
    const allMoves = [];

    // Find all possible moves for the AI
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.color === aiColor) {
                const fromId = coordsToId([r, c]);
                const availableMoves = getAvailableMoves(fromId); // Assuming getAvailableMoves is globally available from chess.js
                if (availableMoves.length > 0) {
                    availableMoves.forEach(toId => {
                        allMoves.push({ from: fromId, to: toId });
                    });
                }
            }
        }
    }

    if (allMoves.length === 0) return null; // No legal moves

    const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    console.log(`AI chose move: ${randomMove.from} to ${randomMove.to}`);
    return randomMove;
}
