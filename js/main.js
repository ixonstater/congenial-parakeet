const BLACK = 2
const WHITE = 1
const EMPTY = 0
const SERVER_IP = 'http://192.168.1.154:8080/'


class GameState{

    constructor(){
        this.grid
        this.userToken
        this.myColor
        this.accessToken
        this.whosTurn
        this.endPoints = {
            requestMatch: SERVER_IP + 'requestMatch',
            joinMatch: SERVER_IP + 'joinMatch',
            submitTurn: SERVER_IP + 'requestTurn',
            requestState: SERVER_IP + 'requestState'
        }
    }

    async requestMatch(e, handleUI){
        let userName = document.getElementById('user-string').value
        let requestBody = {
            blackToken: userName
        }
        let request = JSON.stringify(requestBody)
        const resp = await fetch(
            this.endPoints.requestMatch,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: request
            })

        let jsonResp = await resp.json()
        if (jsonResp.length == 5){
            this.accessToken = jsonResp
            this.userToken = userName
            this.whosTurn = BLACK
            this.myColor = BLACK
            handleUI()
        } else {
            alert('Failed to request match')
        }
    }

    async joinMatch(e, handleUI){
        let userName = document.getElementById('user-string').value
        let accessToken = document.getElementById('access-string').value

        let requestBody = {
            whiteToken: userName,
            accessToken: accessToken
        }
        let request = JSON.stringify(requestBody)
        const resp = await fetch(
            this.endPoints.joinMatch,
            {
                method: 'POST',
                header: {
                    'Content-Type': 'application/json'
                },
                body: request
            }
        )

        let jsonResp = await resp.json()
        if(jsonResp.length == 5){
            this.accessToken = jsonResp
            this.whosTurn = BLACK
            this.myColor = WHITE
            this.userToken = userName
            handleUI()
        }else {
            alert('Failed to join match')
        }

    }

    async submitTurn(x,y){
        
    }

    async requestState(){

    }
}

class GameInstance{
    

    constructor(){
        this.state = new GameState
        this.domGrid
    }

    boardClicked(e){
        let x
        let y
        [x, y] = e.target.dataset.index.split(',').map(i => {
            return parseInt(i, 10)
        })
        this.state.submitTurn(x,y)
    }

    updateGameState(x,y){
        this.state.submitTurn(x,y)
    }

    waitForStateChange(){
        
    }

    handleUI(){
        for (let x = 0; x < 19; x++){
            for (let y = 0; y < 19; y++){
                this.updateDOMGridIndex(x,y)
            }
        }
        let accessTokenP = document.getElementById('access-token')
        accessTokenP.innerHTML = this.state.accessToken ? 'Access token: ' + this.state.accessToken : ''
        let userTokenP = document.getElementById('user-token')
        userTokenP.innerHTML = this.state.userToken ? 'User token: ' + this.state.userToken : ''
        let whosTurnP = document.getElementById('whos-turn')
        if(this.state.whosTurn){
            whosTurnP.innerHTML = (this.state.whosTurn == BLACK) ? 'Black\'s turn' : 'White\'s turn'
        }
    }

    updateDOMGridIndex(x,y){
        let color = this.state.grid[x][y]

        if(color == 0){
            this.removeStone(x,y)
        } else {
            this.appendStone(x,y,color)
        }
    }

    appendStone(x, y, color){
        let stone = document.createElement('img')
        stone.classname = 'board-piece'
        if(color == WHITE){
            stone.src = 'resources/images/white_piece.svg'
        } else if(color == BLACK){
            stone.src = 'resources/images/black_piece.svg'
        }
        this.domGrid[x][y].appendChild(stone)
    }

    removeStone(x,y){
        if(this.domGrid[x][y].firstChild){
            this.domGrid[x][y].removeChild(this.domGrid[x][y].firstChild)
        }
    }

}


class BoardMaker{

    constructor(handler){
        this.handler = handler
        this.offset = 5.18
        this.startxy = 1.4
    }

    makeBoard(){
        [this.handler.domGrid, this.handler.state.grid] = this.makeGrids()
    }

    makeGrids(){
        let domGrid = []
        let grid = []
        let appendPoint = document.getElementById('board-widget')

        for (let x = 0; x < 19; x++){
            domGrid.push([])
            grid.push([])
            for (let y = 0; y < 19; y++){
                let index = this.makeIndex(x, y)
                appendPoint.appendChild(index)
                grid[x][y] = 0
                domGrid[x][y] = index
            }
        }
        return [domGrid, grid]
    }

    makeIndex(x, y){
        let div = document.createElement('div')
        div.className = 'grid-index'
        div.dataset.index = `${x},${y}`
        div.style = 
            `
                left: ${this.offset * (x) + this.startxy}%;
                top: ${this.offset * (y) + this.startxy}%;
            `
        this.addEvent(div)
        return div
    }

    addEvent(div){
        div.addEventListener('click', this.handler.boardClicked.bind(this.handler))
    }
}


function main(){
    let gameInstance = new GameInstance
    let boardMaker = new BoardMaker(gameInstance)
    boardMaker.makeBoard()

    document.getElementById('join-match').addEventListener('click', (e) => {
        gameInstance.state.joinMatch.bind(gameInstance.state)(e, gameInstance.handleUI.bind(gameInstance))
    })
    document.getElementById('request-match').addEventListener('click', (e) => {
        gameInstance.state.requestMatch.bind(gameInstance.state)(e, gameInstance.handleUI.bind(gameInstance))
    })
}

document.addEventListener('DOMContentLoaded', main)