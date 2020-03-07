const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const { Chess } = require('chess.js');

const game = Chess();
let whiteId;
let blackId;

let gameInReset = false;

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));

server.listen(port);

io.on('connection', (socket) => {

    let role = 'white';

    if(!whiteId)
        whiteId = socket.id;
    else if(!blackId){
        blackId = socket.id;
        role = 'black';
    }
        
    socket.emit('start', {
        fen: game.fen(),
        turn: game.turn(),
        in_checkmate: game.in_checkmate(),
        in_draw: game.in_draw(),
        in_check: game.in_check()
    }, role);
    
    socket.on('disconnect', (reason) => {
        if(socket.id === whiteId)
            whiteId = '';
        else if(socket.id === blackId)
            blackId = '';
    });
    
    socket.on('move', (move) => {
        const whiteMoving = (socket.id === whiteId) && (game.turn() === 'w');
        const blackMoving = (socket.id === blackId) && (game.turn() === 'b');

        let gameObj = getGameObject(game);

        if(whiteMoving || blackMoving){
            const moveObj = game.move({from : move.from, to: move.to, promotion:move.promotion});
            gameObj = getGameObject(game);
            if(moveObj !== null)
                socket.broadcast.emit('move', gameObj);
        }
        socket.emit('move', gameObj);  

        if(game.game_over() && !gameInReset){
            gameInReset = true;
            setTimeout(() => {
                game.reset();
                let role = "white";
                if(socket.id === blackId){
                    role = "black";
                }
                io.sockets.emit('start', getGameObject(game), role);
                gameInReset = false;
            },10000);
        }
    });
});

function getGameObject(game){
    return{
        fen: game.fen(),
        turn: game.turn(),
        in_checkmate: game.in_checkmate(),
        in_draw: game.in_draw(),
        in_check: game.in_check()
    };
}