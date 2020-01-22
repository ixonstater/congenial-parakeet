const BLACK = 1
const WHITE = 2
const EMPTY = 0
const SERVER_IP = 'http://192.168.1.154:8080/'


class GameState{

    constructor(){
        this.whosTurn
        this.grid
        this.color
        this.accessToken
        this.endPoints = {
            requestMatch: SERVER_IP + 'requestMatch',
            submitTurn: SERVER_IP + 'submitTurn',
            requestState: SERVER_IP + 'requestState'
        }
    }

    async requestMatch(e, handleUI){
        if(!this.getDataFromUI()){
            return
        }
        this.whosTurn = this.color
        let requestBody = JSON.stringify({
            whosTurn: this.whosTurn
        })
        const req = await fetch(
            this.endPoints.requestMatch,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestBody
            })

        let resp = await req.json()
        if (resp.length == 5){
            this.accessToken = resp
        } else {
            alert('Failed to request match')
        }
        handleUI()
    }

    async joinMatch(e, handleUI){
        if(!this.getDataFromUI()){
            return
        }
        await this.requestState()
        handleUI()
    }

    async submitTurn(e,x,y,handleUI){
        let requestBody = JSON.stringify({
            "x": x,
            "y": y,
            "accessToken": this.accessToken,
            "whosTurn": this.whosTurn
        })

        const req = await fetch(
            this.endPoints.submitTurn,
            {
                method: 'POST',
                'Content-Type': 'application/json',
                body: requestBody
            }
        )

        let resp = await req.json()

        if(Object.entries(resp).length === 0){
            return false
        } else {
            this.whosTurn = resp.whosTurn
            this.grid = resp.boardState
        }
        handleUI()
    }

    async requestState(){
        let stateReq = JSON.stringify({
            accessToken: this.accessToken,
            whosTurn: this.whosTurn
        })
        const req = await fetch(
            this.endPoints.requestState,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: stateReq
            }
        )
        let resp = await req.json()

        if(Object.entries(resp).length === 0){
            return false
        } else {
            this.whosTurn = resp.whosTurn
            this.grid = resp.boardState
            return true
        }
    }

    getDataFromUI(){
        let colorInput = document.getElementById('your-color')
        let accessTokenInput = document.getElementById('access-token')
        if(accessTokenInput.value){
            this.accessToken = accessTokenInput.value
        }
        if(colorInput.value == 'white' || colorInput.value == 'black'){
            this.color = colorInput.value == 'white' ? WHITE : BLACK
            return true
        }
        alert('Invalid color')
        return false
    }
}

class GameInstance{
    

    constructor(){
        this.state = new GameState
        this.boardIsShowing = false
        this.domGrid
    }

    boardClicked(e){
        if(this.state.color != this.state.whosTurn){
            return
        }

        let [x, y] = e.target.dataset.index.split(',').map(i => {
            return parseInt(i, 10)
        })
        this.state.submitTurn(e, x, y, this.handleUI.bind(this))
    }

    updateGameState(x,y){
        this.state.submitTurn(x,y)
    }

    waitForStateChange(){
        
    }

    showBoardHideButtons(){
        document.getElementById('board-widget').style = 'display: block'
        document.getElementById('game-input').style = 'display: none'
        this.boardIsShowing = true
    }

    handleUI(){
        if(!this.boardIsShowing){
            this.showBoardHideButtons()
        }
        for (let x = 0; x < 19; x++){
            for (let y = 0; y < 19; y++){
                this.updateDOMGridIndex(x,y)
            }
        }
        let accessTokenP = document.getElementById('access-token-display')
        accessTokenP.innerHTML = this.state.accessToken ? 'Access token: ' + this.state.accessToken : ''
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