module.exports = {
    initGame,
    gameLoop,
    UpdateMovement,
}

const GRID_SIZE = 20;

function initGame(){            //게임이 시작 되었을 때 
    const state = createGameState();
    randomBox(state);
    return state;
}

function createGameState()  //게임 State 생성
{
    return{
        players: [{
            pos:{
                x : 3,
                y : 10,
            }
        }, {
            pos : {
                x : 18,
                y : 10,
            }
        }],
        box: {},
        scoreblue : 0,
        scorered : 0,
        gridsize : GRID_SIZE,

    };
}

function randomBox(state)   //랜덤으로 박스 생성
{
    box = {
        x : Math.floor(Math.random() * GRID_SIZE),
        y : Math.floor(Math.random() * GRID_SIZE),
    }

    //각각의 플레이어와 겹처지지 않게 생성 
    if(state.players[0].pos.x === box.x && state.players[0].pos.y === box.y)
    {
        return randomBox(state);
    }

    if(state.players[1].pos.x === box.x && state.players[1].pos.y === box.y)
    {
        return randomBox(state);
    }

    state.box = box;

}

function gameLoop(state)
{
    if(!state) {
        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    //Box와 캐릭터 충돌 검사 
    if(state.box.x === playerOne.pos.x && state.box.y === playerOne.pos.y) {
        state.scoreblue += 1;
        randomBox(state);
    }

    if(state.box.x === playerTwo.pos.x && state.box.y === playerTwo.pos.y) {
        state.scorered += 1;
        randomBox(state);
    }

    return false;
}

//유저의 이동 
function UpdateMovement(state, clientNumber , keyCode){

    if(keyCode == 37) // 왼쪽 화살표 
    {
        if(state.players[clientNumber - 1].pos.x > 0)
        {
            state.players[clientNumber - 1].pos.x -= 1;
        }

    }
    if(keyCode == 38) // 아래 화살표 
    {
        if(state.players[clientNumber - 1].pos.y > 0)
        {
            state.players[clientNumber - 1].pos.y -= 1;
        }

    }
    if(keyCode == 39) // 오른쪽 화살표 
    {
        if(state.players[clientNumber - 1].pos.x < GRID_SIZE - 1)
        {
            state.players[clientNumber - 1].pos.x += 1;
        }

    }
    if(keyCode == 40) // 위쪽 화살표 
    {
        if(state.players[clientNumber - 1].pos.y < GRID_SIZE - 1)
        {
            state.players[clientNumber - 1].pos.y += 1;
        }

    }

}