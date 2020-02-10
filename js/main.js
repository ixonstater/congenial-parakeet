const BLACK = 1
const WHITE = 2
const EMPTY = 0

const SERVER_IP = 'http://codefordays.io/'
//const SERVER_IP = 'http://192.168.1.154:8080/'
const MAX_STATE_REQUESTS = 345
//const MAX_STATE_REQUESTS = 100


class GameState{

    constructor(){
        this.whosTurn
        this.grid
        this.previousMove
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

    async joinMatch(e, handleUI, waitForStateChange){
        if(!this.getDataFromUI()){
            return
        }
        await this.requestState()
        handleUI()
        if(this.whosTurn != this.color){
            waitForStateChange()
        }
    }

    async submitTurn(e,x,y,handleUI, waitForStateChange){
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

        if(resp === '{}'){
            return false
        } else {
            this.whosTurn = resp.whosTurn
            this.grid = resp.boardState
        }
        handleUI()
        waitForStateChange()
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

        if(resp === '{}'){
            return false
        } else {
            this.whosTurn = resp.state.whosTurn
            this.grid = resp.state.boardState
            this.previousMove = resp.previousMove
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
            this.color = (colorInput.value == 'white') ? WHITE : BLACK
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
        this.previousIndex = null
        this.requestStateTotal = 0
    }

    boardClicked(e){
        if(this.state.color != this.state.whosTurn){
            return
        } else if (e.target.tagName !== 'DIV'){
            alert ('There\'s already a stone there')
            return
        }

        let [x, y] = e.target.dataset.index.split(',').map(i => {
            return parseInt(i, 10)
        })
        this.state.submitTurn(e, x, y, this.handleUI.bind(this), this.waitForStateChange.bind(this))
    }

    updateGameState(x,y){
        this.state.submitTurn(x,y)
    }

    async waitForStateChange(){
        let newState = await this.state.requestState()
        if(newState){
            this.handleUI()
            this.requestStateTotal = 0
        }
        
        else if(this.requestStateTotal > MAX_STATE_REQUESTS){
            let wait = confirm("You're opponent has been gone for a while, want to continue waiting?")
            if(wait){
                this.requestStateTotal = 0
                setTimeout(this.waitForStateChange.bind(this), 2000)
            } else {
                location.reload()
            }
        }

        else {
            this.requestStateTotal++
            setTimeout(this.waitForStateChange.bind(this), 2000)
        }
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
        let myColorP = document.getElementById('my-color')
        myColorP.innerHTML = (this.state.color == BLACK) ? 'You are black' : 'You are white'
        this.markPreviousTurn(this.state.previousMove)
    }

    updateDOMGridIndex(x,y){
        let color = this.state.grid[x][y]
        this.clearIndex(x,y)

        if(color != 0){
            this.appendStone(x,y,color)
        }
    }

    appendStone(x, y, color){
        let stone = document.createElement('img')
        stone.className = 'board-piece'
        if(color == WHITE){
            stone.src = 'resources/images/white_piece.svg'
        } else if(color == BLACK){
            stone.src = 'resources/images/black_piece.svg'
        }
        this.domGrid[x][y].appendChild(stone)
    }

    markPreviousTurn(previousMove){
        if(!previousMove){
            return
        }
        
        let x = previousMove[0]
        let y = previousMove[1]
        if (!this.previousIndex){
            this.domGrid[x][y].className = 'grid-index previous-move'
            this.previousIndex = this.domGrid[x,y]
        }

        this.previousIndex.className = 'grid-index'
        this.previousIndex = this.domGrid[x][y]
        this.previousIndex.className = 'grid-index previous-move'
    }

    clearIndex(x,y){
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
        gameInstance.state.joinMatch.bind(gameInstance.state)(e, gameInstance.handleUI.bind(gameInstance), gameInstance.waitForStateChange.bind(gameInstance))
    })
    document.getElementById('request-match').addEventListener('click', (e) => {
        gameInstance.state.requestMatch.bind(gameInstance.state)(e, gameInstance.handleUI.bind(gameInstance))
    })
}

document.addEventListener('DOMContentLoaded', main)
