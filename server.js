var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.set('view engine', 'ejs'); // 렌더링 엔진 모드를 ejs로 설정
app.set('views',  __dirname + '/views');    // ejs이 있는 폴더를 지정

const { initGame, gameLoop, UpdateMovement } = require('./game');

app.get('/', (req, res) => {
    res.render('index');    // index.ejs을 사용자에게 전달
})

const state = {};
const clientRooms = {};

io.on('connection', client => {
    console.log('소켓이 연결되었습니다')

    // "Create New Game" 버튼을 누르면 실행되는 이벤트
    client.on('newGame', () => {
        let roomId = makeid(5)
        client.join(roomId)
        console.log(client.rooms)
        
        client.emit('gameCode', roomId)

        // 처음 방 들어간 플레이어가 1번
        client.emit('init', 1)
        client.number = 1

        clientRooms[client.id] = roomId

        // let state = initGame()
        // console.log(JSON.stringify(state))
        // client.emit('gameState', JSON.stringify(state))
    })

    // "Join Game" 버튼을 누르면 실행되는 이벤트
    client.on('joinGame', (code) => {
        // 방 목록 불러오기
        let roomList = io.sockets.adapter.rooms
        try {
            // 방이 있는지 확인
            if (!roomList.has(code)){
                client.emit('unknownCode')
            } else {
                // 방에 두명이 연결되었는지 확인
                if(roomList.get(code).size >= 2) {
                    client.emit('tooManyPlayers')
                } else {
                    // 방에 존재하고 한명이 있으면 입장 가능
                    client.join(code)
                    client.emit('gameCode', code)
                    
                    clientRooms[client.id] = code

                    // 두번째로 방 들어간 플레이어가 2번
                    client.emit('init', 2)
                    client.number = 2

                    // 방에 두명있으면 게임 시작
                    state[code] = initGame()
                    io.to(code).emit('gameState', JSON.stringify(state[code]))
                    startGameInterval(code)
                }
            }
        } catch (error) {
            console.log(error)
            client.emit('unknownCode')
        }
    })

    // 키가 눌렸을 때 이벤트
    client.on('keydown', (keyCode) => {
        handleKeydown(keyCode, client)
    })
});

function handleKeydown(keyCode, client){    //client.on KeyDowm handleKeydown
    const roomName = clientRooms[client.id];


    UpdateMovement(state[roomName] , client.number , keyCode);
    // console.dir(state[roomName], {depth: null})
    io.to(roomName).emit('gameState', JSON.stringify(state[roomName]))
}

function startGameInterval(roomName)    //게임에 Join 이 되었을 룸을 시작 할 수 있게 제작
{
    const intervalID = setInterval(() =>{
        
        const winner = gameLoop(state[roomName])

        if (state[roomName].scoreblue === 5) {
            state[roomName].winner = 1
            io.to(roomName).emit('gameOver', JSON.stringify(state[roomName]))
        } else if (state[roomName].scorered === 5) {
            state[roomName].winner = 2
            io.to(roomName).emit('gameOver', JSON.stringify(state[roomName]))
        }

    }, 1000 / 30);
}

function makeid(length){
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for(let i = 0 ; i < length; i++)
    {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return result
}


server.listen(3000 , function() {
    console.log("3000 포트 대기중 ");

});