const socket = io();

const gameStatus = document.getElementById('game-status');

const handleMove = (from, to) => {
    socket.emit('move', ({from, to, promotion: 'q'}));
}

let board;

function updateBoard(game){
    board.position(game.fen);

    let player;
    if(game.turn === 'w'){
        player = 'White';
        gameStatus.style.color = "gray";
    }
    else{
        player = 'Black';
        gameStatus.style.color = "black";
    }
    if(game.in_checkmate)
        gameStatus.textContent = "Game over, " + player + ' is in checkmate'; 
    else if(game.in_draw)
        gameStatus.textContent = "Game over, it's a draw";
    else{
        gameStatus.textContent = `It's ${player}'s turn`; 
        if(game.in_check)
            gameStatus.textContent += `, ${player} is in check`;   
    }
}

socket.on('start', (game, role) => {
    board = Chessboard('board', {
            position: game.fen,
            draggable:true,
            onDrop: handleMove
    });
    updateBoard(game);
    board.orientation(role);
});

socket.on('move', (game) => {
    updateBoard(game);
});