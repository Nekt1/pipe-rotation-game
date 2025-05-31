import type { PipeType, Difficulties, Direction, ConnectionRules } from "./types"

export class Pipe {
    rotation: number;
    id: number;
    type: PipeType;
    x: number;
    y: number;

    constructor(rotation: number, id: number, type: "elbow" | "straight" | "start" | "end", x: number, y: number) {
        this.rotation = rotation;
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
    }
}

export const GRID_SIZE = 6; // this can be changed to adjust the grid size (n x n)
export const DIFFICULTIES: Difficulties = {
    easy: { timer: 90, gridSize: 5 },
    normal: { timer: 60, gridSize: 7 },
    hard: { timer: 30, gridSize: 9 }
} 

export const DRAW_ROTATION_SPEED = 10;
export const BORDER_SIZE = 100;
export const CANVAS_SIZE = 950;
export const SQUARE_SIZE = (CANVAS_SIZE - BORDER_SIZE) / GRID_SIZE;

export const DIRECTIONS = {
    top: {
        dx: 0,
        dy: -1
    },
    bottom: {
        dx: 0,
        dy: +1
    },
    left: {
        dx: -1,
        dy: 0
    },
    right: {
        dx: +1,
        dy: 0
    }
}

export const OPPOSITE_DIRECTIONS: {[key in Direction]: Direction} = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left'
}

export const CONNECTION_RULES: ConnectionRules = {
    elbow: {
        0: ['top', 'right'],
        90: ['right', 'bottom'],
        180: ['bottom', 'left'],
        270: ['left', 'top']
    },
    straight: {
        0: ['top', 'bottom'],
        90: ['left', 'right'],
        180: ['top', 'bottom'],
        270: ['left', 'right']
    },
    start: {
        0: ['top', 'bottom', 'left', 'right']
    },
    end: {
        0: ['top', 'bottom', 'left', 'right']
    }
}