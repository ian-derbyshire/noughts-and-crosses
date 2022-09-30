// Make your changes to store and update game state in this file

let gameBoard = [[null, null, null], [null, null, null], [null, null, null]];

let cpuOpponent = 0;
let turn = 0;
let turnTaken = false;
let gameWon = false;
let current = 'nought';

const fireworkContainer = document.createElement('div');
fireworkContainer.setAttribute('id', 'fireworks-container');
document.querySelector('#winner-display').append(fireworkContainer);

const resetButton2 = document.querySelector('#reset-button');

// Create a new button to toggle CPU
const cpuButton = document.createElement('button');
cpuButton.innerText = "CPU - Off";
cpuButton.classList = ['cpu-button'];
// Add the CPU button to the DOM
resetButton2.parentNode.insertBefore(cpuButton, resetButton2.nextSibling);

// Add accessibility options, button tabbing and keyboard navigation
for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
    for (let columnIndex = 0; columnIndex < 3; columnIndex++) {
        const gridPosition = document.getElementById(`row-${rowIndex}-column-${columnIndex}`);
        gridPosition.setAttribute('tabindex', (rowIndex + 1) * 3 + columnIndex)

        gridPosition.addEventListener("keydown", e => {
            if (e.key === " " || e.key === "Enter" || e.key === "Spacebar") {
                positionClick(rowIndex, columnIndex)
            }
        });
    }
}

// Take the row and column number between 0 and 2 
// (inclusive) and update the game state.
function takeTurn(row, column) {
    if (gameWon) {
        return;
    }
    turnTaken = false;
    console.log("takeTurn was called with row: "+row+", column:"+column);
    if (gameBoard[row][column] !== null) {
        return;
    }
    gameBoard[row][column] = current;
    turnTaken = true;
    turn++;
}

function checkWinLine(b1, b2, b3) {
    return b1 === current && b2 === current && b3 === current;
}

function plural() {
    removeFireworks();
    makeFireworks();
    if (current === 'nought') {
        return 'noughts';
    }
    return 'crosses';
}
function removeFireworks() {
    const children = fireworkContainer.querySelectorAll('*');
    for (let i = 0; i < children.length; i++) {
        children[i].remove();
    }
}
function makeFireworks() {
    for (let i = 0; i < turn; i++) {
        const child = document.createElement('span');
        const emoji = i % 2 === 0 ? "⭕" : "❌";
        child.innerText = emoji;
        fireworkContainer.appendChild(child);
    }
}

// Check horizontal win lines
function checkHorizontalLines() {
    if (checkWinLine(gameBoard[0][0], gameBoard[0][1], gameBoard[0][2])) { // Top row
        gameWon = true;
        return plural();
    }
    if (checkWinLine(gameBoard[1][0], gameBoard[1][1], gameBoard[1][2])) { // middle row
        gameWon = true;
        return plural();
    }
    if (checkWinLine(gameBoard[2][0], gameBoard[2][1], gameBoard[2][2])) { // bottom row
        gameWon = true;
        return plural();
    }
    return null;
}

// Check vertical win lines
function checkVerticalLines() {
    if (checkWinLine(gameBoard[0][0], gameBoard[1][1], gameBoard[2][2])) { // top left to bottom right
        gameWon = true;
        return plural();
    }
    if (checkWinLine(gameBoard[2][0], gameBoard[1][1], gameBoard[0][2])) { // top right to bottom left
        gameWon = true;
        return plural();
    }
    if (checkWinLine(gameBoard[0][0], gameBoard[1][0], gameBoard[2][0])) { // first column
        gameWon = true;
        return plural();
    }
    return null;
}

// Check diagonal win lines
function checkDiagonalLines() {
    if (checkWinLine(gameBoard[0][1], gameBoard[1][1], gameBoard[2][1])) { // second column
        gameWon = true;
        return plural();
    }
    if (checkWinLine(gameBoard[0][2], gameBoard[1][2], gameBoard[2][2])) { // third column
        gameWon = true;
        return plural();
    }
    return null;
}

// Return either "noughts", "crosses" or "nobody" if the game is over.
// Otherwise return null to continue playing.
function checkWinner() {
    if (!turnTaken) {
        return null;
    }
    let winner = null;

    winner = checkHorizontalLines();
    if (winner !== null) {
        return winner;
    }

    winner = checkVerticalLines();
    if (winner !== null) {
        return winner;
    }

    winner = checkDiagonalLines();
    if (winner !== null) {
        return winner;
    }
    
    if (current === 'nought') {
        current = 'cross';
    } else {
        current = 'nought';
    }
    console.log("checkWinner was called");
    if (turn === 9) {
        return "nobody";
    }
    if (cpuOpponent === 1 && turn % 2 === 1) {
        cpuSimple();
    } else if (cpuOpponent === 2 && turn % 2 === 1) {
        cpuOptimal();
    }
    return null;
}

function cpuSimple() {
    let emptyBlocks = [];
    // Find all empty blocks and add to an array
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (gameBoard[i][j] === null) {
                emptyBlocks.push([i, j]);
            }
        }
    }
    // Randomly choose an empty square
    const randomBlock = Math.floor(Math.random() * emptyBlocks.length);
    // CPU places a piece
    positionClick(emptyBlocks[randomBlock][0],emptyBlocks[randomBlock][1]);
}

function filterOptimal(arr) {
    let nulls = 0; // The number of empty squares in win line
    let currentPlayer = 0; // The number of current player pieces in win line
    let otherPlayer = 0; // The number of other player pieces in win line
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === null) {
            nulls++;
        } else if (arr[i] === current) {
            currentPlayer++;
        } else {
            otherPlayer++;
        }
    }
    // const nulls = arr.filter(a => a === null).length;
    // const currentPlayer = arr.filter(a => a === current).length;
    // const otherPlayer = arr.filter(a => a !== current && a !== null).length;

    // Return an object with the count of pieces and the original win line
    return {
        nulls,
        currentPlayer,
        otherPlayer,
        arr
    };
}

function cpuOptimal() {
    // Prep potential win lines
    const topRow = filterOptimal(gameBoard[0]);
    const middleRow = filterOptimal(gameBoard[1]);
    const bottomRow = filterOptimal(gameBoard[2]);
    const leftCol = filterOptimal([gameBoard[0][0],gameBoard[1][0],gameBoard[2][0]]);
    const middleCol = filterOptimal([gameBoard[0][1],gameBoard[1][1],gameBoard[2][1]]);
    const rightCol = filterOptimal([gameBoard[0][2],gameBoard[1][2],gameBoard[2][2]]);
    const leftDia = filterOptimal([gameBoard[0][0], gameBoard[1][1], gameBoard[2][2]]);
    const rightDia = filterOptimal([gameBoard[0][2], gameBoard[1][1], gameBoard[2][0]]);
    // Put win lines into an array for quick manipulation
    // name - Used for dev to know which line it is.
    // col - counts of pieces and the original win line
    // indexes - the indexes where the win line is on the board
    const rowArray = [
        { name: 'topRow', col: topRow, indexes: [[0,0], [0,1], [0,2]]},
        { name: 'middleRow', col: middleRow, indexes: [[1,0], [1,1], [1,2]]},
        { name: 'bottomRow', col: bottomRow, indexes: [[2,0], [2,1], [2,2]]},
        { name: 'leftCol', col: leftCol, indexes: [[0,0], [1,0], [2,0]]},
        { name: 'middleCol', col: middleCol, indexes: [[0,1], [1,1], [2,1]]},
        { name: 'rightCol', col: rightCol, indexes: [[0,2], [1,2], [2,2]]},
        { name: 'leftDia', col: leftDia, indexes: [[0,0], [1,1], [2,2]]},
        { name: 'rightDia', col: rightDia, indexes: [[0,2], [1,1], [2,0]]}
    ];

    let highContestCols = [];
    let currentPlayerCols = [];
    for (let i = 0; i < rowArray.length; i++) {
        // Find any win lines where the other player has 2 and there is a null
        if (rowArray[i].col.otherPlayer === 2 && rowArray[i].col.nulls === 1) {
            highContestCols.push(rowArray[i]);
        } else if (rowArray[i].col.currentPlayer === 2 && rowArray[i].col.nulls === 1) {
            currentPlayerCols.push(rowArray[i]);
        }
    }
    // const highContestCols = rowArray.filter(row => row.col.otherPlayer === 2 && row.col.nulls === 1);
    if (currentPlayerCols.length !== 0) {
        determinePlacement(currentPlayerCols);
    } else if (highContestCols.length !== 0) {
        determinePlacement(highContestCols);
    } else { // Randomly pick on first cpu turn
        cpuSimple();
    }
    console.log(highContestCols);
}

function determinePlacement(cols) {
    // We found potential winning options for the other player
    // Block them, set to choose a random option if there is multiple
    // This will block at least 1 win line
    const randomColIndex = Math.floor(Math.random() * cols.length);
    const colToUse = cols[randomColIndex];
    let i;
    let j;
    // Check which square is empty on the selected win line
    // Set the indexes for the board to fill
    if (colToUse.col.arr[0] === null) {
        i = colToUse.indexes[0][0];
        j = colToUse.indexes[0][1];
    } else if (colToUse.col.arr[1] === null) {
        i = colToUse.indexes[1][0];
        j = colToUse.indexes[1][1];
    } else {
        i = colToUse.indexes[2][0];
        j = colToUse.indexes[2][1];
    }
    positionClick(i, j); // CPU places a piece
}

// Set the game state back to its original state to play another game.
function resetGame() {
    turn = 0;
    gameWon = false;
    current = 'nought';
    gameBoard = [[null, null, null], [null, null, null], [null, null, null]];
    removeFireworks();
    console.log("resetGame was called");
}

// Return the current board state with either a "nought" or a "cross" in
// each position. Put a null in a position that hasn't been played yet.
function getBoard() {
    console.log("getBoard was called");
    return gameBoard;
}

cpuButton.addEventListener('click', function() {
    cpuButton.classList = ['cpu-button'];
    cpuOpponent++;
    if (cpuOpponent > 2) {
        cpuOpponent = 0;
    }

    resetClick();
    // Change the look and text of the CPU button
    if (cpuOpponent === 0) {
        cpuButton.classList.add('cpu-off');
        cpuButton.innerText = 'CPU - Off';
    } else if (cpuOpponent === 1) {
        cpuButton.classList.add('cpu-random');
        cpuButton.innerText = 'CPU - Random';
    } else {
        cpuButton.classList.add('cpu-optimal');
        cpuButton.innerText = 'CPU - Optimal';
    }
});

if (typeof exports === 'object') {
    console.log("Running in Node")
    // Node. Does not work with strict CommonJS, but only CommonJS-like 
    // environments that support module.exports, like Node.
    module.exports = {
        takeTurn,
        checkWinner,
        resetGame,
        getBoard,
    }
} else {
    console.log("Running in Browser")
}
