/**
 * Gets a move from the AI.
 * This is a placeholder for the Gemini API integration.
 *
 * @param {Array<Array<string>>} boardState - The current state of the board.
 * @returns {string} The move in algebraic notation (e.g., "e4").
 */
function getAIMove(boardState) {
    // TODO: Connect to Gemini API to get the AI's move.
    console.log("AI is thinking...");

    // Placeholder: return a random move for now
    const moves = ['e4', 'd4', 'c4', 'Nf3'];
    const randomMove = moves[Math.floor(Math.random() * moves.length)];

    console.log(`AI chose move: ${randomMove}`);
    return randomMove;
}
