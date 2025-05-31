import type { Direction, RotationAngle } from "../types.ts"
import { Pipe } from "../constants.ts"
import { DIRECTIONS, CONNECTION_RULES, OPPOSITE_DIRECTIONS } from '../constants.ts'

function listPipeConnections(pipe: Pipe): Direction[] {
    const rotation = pipe.rotation % 360 as RotationAngle;
    return CONNECTION_RULES[pipe.type][rotation] ?? CONNECTION_RULES[pipe.type][0];
}

function validateNeighbor(pipeArray: Pipe[][], row: number, col: number, direction: Direction) {
    const { dx, dy } = DIRECTIONS[direction]
    if ((row + dy >= 0 && row + dy < pipeArray.length) && (pipeArray[row + dy] && col + dx >= 0 && col + dx < pipeArray[0].length)) {
        return pipeArray[row + dy][col + dx] 
    }
    return null;
}

function checkPipeConnection(pipe: Pipe, neighbor: Pipe, direction: Direction) {
    const initialPipeConnections = listPipeConnections(pipe)
    const targetPipeConnections = listPipeConnections(neighbor)
    return initialPipeConnections.includes(direction) && targetPipeConnections.includes(OPPOSITE_DIRECTIONS[direction])
}

function validateEndConnected(pipeData: Pipe[][], lastSetElement: Pipe, endPipe: Pipe) {
    const endConnections = listPipeConnections(endPipe);
    if (!pipeData) return;
    for (const direction of endConnections) {
        const neighbor = validateNeighbor(pipeData, endPipe.y, endPipe.x, direction)
            if (neighbor && lastSetElement.id === neighbor.id) {
                const validConnection = checkPipeConnection(endPipe, neighbor, direction)
                return validConnection;
            }
    }
}

export function validateGrid(pipeData: Pipe[][], startPipe: Pipe, endPipe: Pipe) {
    if (!pipeData) return;
    const root = startPipe
    const queue = [root]

    const visited = new Set<Pipe>()

    while (queue.length > 0) {
        const current = queue.shift()
        if (!current) continue;

        visited.add(current)

        if (current) {
            const connections = listPipeConnections(current)
            for (const direction of connections) {
                const neighbor = validateNeighbor(pipeData, current.y, current.x, direction)
                if (neighbor) {
                    const validConnection = checkPipeConnection(current, neighbor, direction)
                    if (validConnection) {
                        if (!visited.has(neighbor)) {
                            queue.push(neighbor)
                        }
                    }
                }
            }
        }
    }

    const lastSetElement = [...visited][visited.size - 1]
    if (validateEndConnected(pipeData, lastSetElement, endPipe)) {
        visited.add(endPipe)
    }
    
    const isSuccessful = (visited.has(startPipe) && visited.has(endPipe))
    return isSuccessful
}