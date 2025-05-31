import type { Point, Direction, PipeType, RotatableTypes } from '../constants.ts'
import { DIRECTIONS, Pipe } from '../constants.ts'

function generateRandomEndPointCoordinates(gridSize: number) {
    const allEndPointOptions = []

    // all possible Y options
    for (let i = 0; i < gridSize; i++) {
        allEndPointOptions.push({x: i, y: -1})
        allEndPointOptions.push({x: i, y: gridSize})
    }

    // all possible X options
    for (let i = 0; i < gridSize; i++) {
        allEndPointOptions.push({x: -1, y: i})
        allEndPointOptions.push({x: gridSize, y: i})
    }
    
    const startPointCoords = allEndPointOptions[Math.floor(Math.random() * allEndPointOptions.length)]
    const endPointCoords = { // so that the end point is always mirrored and is on the other side 
        x: (gridSize - 1) - startPointCoords.x,
        y: (gridSize - 1) - startPointCoords.y
    } 

    return [startPointCoords, endPointCoords]
}

export function generateRandomEndPoints(gridSize: number) {
    const [startPointCoords, endPointCoords] = generateRandomEndPointCoordinates(gridSize)

    const startPipe = new Pipe(0, -1, "start", startPointCoords.x, startPointCoords.y)
    const endPipe = new Pipe(0, -1, "end", endPointCoords.x, endPointCoords.y)

    return {
        startPipe: startPipe, 
        endPipe: endPipe
    }
}

function returnClosestPipeInside(x: number, y: number, gridSize: number) {
    if (x < 0) {
        return {x: 0, y: y}
    }
    if (x >= gridSize) {
        return {x: x - 1, y: y}
    }
    if (y < 0) {
        return {x: x, y: 0}
    }
    if (y >= gridSize) {
        return {x: x, y: gridSize - 1}
    }
}

function extractEndGridPositions(startPipe: Pipe, endPipe: Pipe, gridSize: number): [{x: number, y: number}, {x: number, y: number}] | null {
    const gridStartCoords = returnClosestPipeInside(startPipe.x, startPipe.y, gridSize)
    const gridEndCoords = returnClosestPipeInside(endPipe.x, endPipe.y, gridSize)

    if (gridEndCoords && gridStartCoords) return [gridStartCoords, gridEndCoords]
    return null;
}

export function generateRandomGrid(startPipe: Pipe, endPipe: Pipe, gridSize: number) {
    const positions = extractEndGridPositions(startPipe, endPipe, gridSize)
    if (!positions) {
        console.error('No positions found')
        return;
    }

    const [startCoords, endCoords] = positions;
    
    const initialArray: Point[][] = []
    for (let i = 0; i < gridSize; i++) {
        initialArray.push([])
        for (let j = 0; j < gridSize; j++) {
            initialArray[i].push({x: j, y: i})
        }
    }

    const visited = new Set()
    const root = initialArray[startCoords.y][startCoords.x]
    const path = [root]
    const queue = [root]

    while (queue.length > 0) {
        const current = queue.shift()
        visited.add(current)
        const neighbours: Point[] = []

        for (const direction in DIRECTIONS) {
            const {dx, dy} = DIRECTIONS[direction as Direction];
            if (current) {
                if ((current.y + dy < 0 || current.y + dy >= gridSize) || (current.x + dx < 0 || current.x + dx >= gridSize)) continue;
                const possibleNeighbor = initialArray[current.y + dy][current.x + dx]

                if ((current.x + dx >= 0 && current.x + dx < gridSize) && (current.y + dy >= 0 && current.y + dy < gridSize) && !visited.has(possibleNeighbor)) {
                    neighbours.push(possibleNeighbor)
                }
            }
        }

        const randomChoice = neighbours[Math.floor(Math.random() * neighbours.length)]
        if (randomChoice) {
            queue.push(randomChoice)
            path.push(randomChoice)
            if (randomChoice && randomChoice.x === endCoords.x && randomChoice.y === endCoords.y) break; // reached the end
        } else {
            path.pop() // backtrack
            if (path.length > 0) {
                queue.unshift(path[path.length - 1])
            }
        }
    }

    return path;
}

export function convertPathToPipes(path: Point[], startPipe: Pipe, endPipe: Pipe) {
    const startCoords = {x: startPipe.x, y: startPipe.y}
    const endCoords = {x: endPipe.x, y: endPipe.y}
    const initialPipeCoords = [startCoords, ...path, endCoords]
    const convertedPipes: {x: number, y: number, type: PipeType}[] = []

    for (let i = 1; i < initialPipeCoords.length - 1; i++) {
        const deltaPrev: Point = {x: initialPipeCoords[i].x - initialPipeCoords[i - 1].x, y: initialPipeCoords[i].y - initialPipeCoords[i - 1].y}
        const deltaNext: Point = {x: initialPipeCoords[i + 1].x - initialPipeCoords[i].x, y: initialPipeCoords[i + 1].y - initialPipeCoords[i].y}
        
        const prevAxisChange = (Object.keys(deltaPrev) as (keyof Point)[]).filter(axis => deltaPrev[axis] !== 0)
        const nextAxisChange = (Object.keys(deltaPrev) as (keyof Point)[]).filter(axis => deltaNext[axis] !== 0)

        if (prevAxisChange.length > 0 && nextAxisChange.length > 0 && prevAxisChange[0] === nextAxisChange[0]) {
            convertedPipes.push({
                x: initialPipeCoords[i].x,
                y: initialPipeCoords[i].y,
                type: 'straight' as PipeType
            })
        } else {
            convertedPipes.push({
                x: initialPipeCoords[i].x,
                y: initialPipeCoords[i].y,
                type: 'elbow' as PipeType
            })
        }
    }
    return convertedPipes;
}

export function fillTheWholeGrid(validPipePath: {x: number, y: number, type: PipeType}[], gridSize: number): Pipe[][] {
    const completePipeArray: Pipe[][] = [];
    const types: RotatableTypes[] = ['elbow', 'straight']

    let id = 0;
    for (let i = 0; i < gridSize; i++) {
        completePipeArray.push([])
        for (let j = 0; j < gridSize; j++) {
            const randomRotation = 90 * (Math.floor(Math.random() * 4))
            const randomType = types[Math.floor(Math.random() * types.length)]
            const validPipe = validPipePath.find(validPipe => validPipe.x === j && validPipe.y === i)
            if (validPipe) {
                const newPipe = new Pipe(randomRotation, id, validPipe.type, j, i);
                completePipeArray[i].push(newPipe)
            } else {
                const newPipe = new Pipe(randomRotation, id, randomType, j, i);
                completePipeArray[i].push(newPipe)
            }
            id++;
        }
    }
    return completePipeArray;
}