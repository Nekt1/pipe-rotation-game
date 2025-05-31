export type DifficultyValues = "easy" | "normal" | "hard"

export type Direction = "top" | "bottom" | "left" | "right";

export type Difficulties = {
    [key in DifficultyValues]: {timer: number, gridSize: number}
}

export type Point = {
    x: number,
    y: number
}

export type PipeType = "elbow" | "straight" | "start" | "end";

export type RotatableTypes = Extract<PipeType, "elbow" | "straight">

export type RotationAngle = 0 | 90 | 180 | 270;

export type PipeConnectionRules = {
    [angle in RotationAngle]?: Direction[]
}

export type ConnectionRules = {
    [type in PipeType]: PipeConnectionRules
}