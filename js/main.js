import { testStateOne, testStateTwo, testStateThree } from './testing.js'

const BLACK = 2
const WHITE = 1

class GameState{

    constructor(){
        this.grid
    }

    requestNewStone(x,y){
        
    }

    requestTurn(){
        
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
        this.updateGameState(x,y)
        this.handleUI()
    }

    updateGameState(x,y){
        this.state.requestNewStone(x,y)
    }

    handleUI(){
        for (let x = 0; x < 19; x++){
            for (let y = 0; y < 19; y++){
                this.updateDOMGridIndex(x,y)
            }
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
        this.startxy = 1.1
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
    gameInstance.state.grid = testStateOne()
}

document.addEventListener('DOMContentLoaded', main)