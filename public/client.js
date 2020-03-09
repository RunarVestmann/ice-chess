const socket = io();

const gameStatus = document.getElementById('game-status');
const promotionMenu = document.getElementById('promotion-menu');
const queenButton = document.getElementById('queen-button');
const bishopButton = document.getElementById('bishop-button');
const knightButton = document.getElementById('knight-button');
const rookButton = document.getElementById('rook-button');

let board;
let playerRole = 'white';
let currentPlayerTurn = 'w';
let preferredPromotion = 'q';

let inPromotionMove = false;
let promotionMove;

function onDragStart(source, piece){
    //Player has been assigned either black or white (length === 5) and it's his turn
    if(playerRole.length === 5 && playerRole[0] === currentPlayerTurn){
        if ((currentPlayerTurn === 'w' && piece.search(/^b/) !== -1) || (currentPlayerTurn === 'b' && piece.search(/^w/) !== -1)) 
            return false;
    }
    else return false;
}

function handleMove(from, to, piece){

    if(!inPromotionMove && playerRole.length === 5 && to.length === 2 && from.length === 2){
        if(playerRole === 'white' &&  playerRole[0] === currentPlayerTurn && piece === 'wP' && from[1] === '7' && to[1] === '8'){
            inPromotionMove = true;
            promotionMove = {from, to, promotion: preferredPromotion};
            showPromotionMenu();
        }
        else if(playerRole === 'black' &&  playerRole[0] === currentPlayerTurn && piece === 'bP' && from[1] === '2' && to[1] === '1'){
            inPromotionMove = true;
            promotionMove = {from, to, promotion: preferredPromotion};
            showPromotionMenu();
        }
        else
            socket.emit('move', ({from, to, promotion: preferredPromotion}));
    }
}

function showPromotionMenu(){
    
    promotionMenu.style.display ='block';

    const imageLinkPrefix = 'img/chesspieces/wikipedia/';

    const queenImage = playerRole === 'white' ? imageLinkPrefix + 'wQ.png' :  imageLinkPrefix + 'bQ.png';

    queenButton.style.backgroundImage = 'url(' + queenImage + ')';

    const bishopImage = playerRole === 'white' ? imageLinkPrefix + 'wB.png' :  imageLinkPrefix + 'bB.png';

    bishopButton.style.backgroundImage = 'url(' + bishopImage + ')';

    const knightImage = playerRole === 'white' ? imageLinkPrefix + 'wN.png' :  imageLinkPrefix + 'bN.png';

    knightButton.style.backgroundImage = 'url(' + knightImage + ')';

    const rookImage = playerRole === 'white' ? imageLinkPrefix + 'wR.png' :  imageLinkPrefix + 'bR.png';

    rookButton.style.backgroundImage = 'url(' + rookImage + ')';
}

function selectPromotion(promotionPiece){
    preferredPromotion = promotionPiece;
    promotionMenu.style.display = 'none';
    promotionMove.promotion = preferredPromotion;
    inPromotionMove = false;
    socket.emit('move', (promotionMove));
}

function updateBoard(game){
    board.position(game.fen);
    currentPlayerTurn = game.turn;
    let player;
    if(game.turn === 'w'){
        player = 'White';
        gameStatus.style.color = 'gray';
    }
    else{
        player = 'Black';
        gameStatus.style.color = 'black';
    }
    if(game.in_checkmate)
        gameStatus.textContent = 'Game over, ' + player + ' is in checkmate'; 
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
            onDrop: handleMove,
            onDragStart: onDragStart
    });
    updateBoard(game);
    if(role === 'black'){
        board.orientation(role);
    }  
    playerRole = role;
});

socket.on('move', (game) => {
    updateBoard(game);
});