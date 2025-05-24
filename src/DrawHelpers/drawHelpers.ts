import { BORDER_SIZE, CANVAS_SIZE } from "../constants.ts";
import type { Direction, Pipe } from "../constants.ts"

interface Drawable {
    x: number;
    y: number;
    drawAngle: number;
    size: number;
    pipeData: Pipe;
    draw(ctx: CanvasRenderingContext2D, SQUARE_SIZE: number): void;
}

class ElbowDrawable implements Drawable {
    x: number;
    y: number;
    drawAngle: number;
    size: number;
    width: number;
    pipeData: Pipe;

    constructor(x: number, y: number, pipeData: Pipe, SQUARE_SIZE: number) {
        this.x = x;
        this.y = y;
        this.drawAngle = pipeData.rotation;
        this.pipeData = pipeData;
        this.size = SQUARE_SIZE;
        this.width = SQUARE_SIZE / 4;
    }

    draw(ctx: CanvasRenderingContext2D, SQUARE_SIZE: number) {
        ctx.clearRect(this.x, this.y, SQUARE_SIZE, SQUARE_SIZE);
        ctx.beginPath();
        ctx.translate(this.x + (BORDER_SIZE / 2), this.y + (BORDER_SIZE / 2));
        ctx.rotate(this.drawAngle * Math.PI / 180)
        ctx.rect(-this.width / 2, - this.width / 2, SQUARE_SIZE / 2 + this.width / 2, this.width)
        ctx.rect(-this.width / 2, -SQUARE_SIZE / 2, this.width, SQUARE_SIZE / 2)
        ctx.fillStyle = '#808080';
        ctx.fill();
    }
}

class StraightDrawable implements Drawable {
    x: number;
    y: number;
    drawAngle: number;
    size: number; // square size
    width: number; // square size / 4
    pipeData: Pipe;
    id: number;

    constructor(x: number, y: number, pipeData: Pipe, SQUARE_SIZE: number) {
        this.x = x;
        this.y = y;
        this.drawAngle = pipeData.rotation;
        this.pipeData = pipeData;
        this.id = pipeData.id;
        this.size = SQUARE_SIZE;
        this.width = SQUARE_SIZE / 4;
    }

    draw(ctx: CanvasRenderingContext2D, SQUARE_SIZE: number) {
        ctx.clearRect(this.x, this.y, SQUARE_SIZE, SQUARE_SIZE)
        ctx.beginPath()
        ctx.translate(this.x + (BORDER_SIZE / 2), this.y + (BORDER_SIZE / 2));
        ctx.rotate(this.drawAngle * Math.PI / 180)
        ctx.rect(-this.width / 2, -SQUARE_SIZE / 2, this.width, SQUARE_SIZE)
        ctx.fillStyle = '#808080';
        ctx.fill()
    }
}

function drawCrucialPipes(pipe: Pipe, ctx: CanvasRenderingContext2D, difficulty: number, pipeData: Pipe[][], SQUARE_SIZE: number) {
    if (!ctx) return;
    let drawPipePosition: Direction = 'top';
    if (pipe.x < 0) {
        drawPipePosition = 'left';
    } else if (pipe.x >= difficulty) {
        drawPipePosition = 'right';
    } else if (pipe.y < 0) {
        drawPipePosition = 'top';
    } else if (pipeData && pipe.y >= pipeData[0].length) {
        drawPipePosition = 'bottom'
    }

    const START_SQUARE_SIZE = BORDER_SIZE / 2;
    let startDrawX: number;
    let startDrawY: number;

    switch (drawPipePosition) {
        case 'top':
            startDrawX = SQUARE_SIZE * pipe.x + (SQUARE_SIZE / 2 - START_SQUARE_SIZE / 2);
            startDrawY = SQUARE_SIZE * (pipe.y + 1) - START_SQUARE_SIZE;
            break;
        case 'bottom':
            startDrawX = SQUARE_SIZE * pipe.x + (SQUARE_SIZE / 2 - START_SQUARE_SIZE / 2);
            startDrawY = SQUARE_SIZE * pipe.y;
            break;
        case 'left':
            startDrawX = SQUARE_SIZE * (pipe.x + 1) - START_SQUARE_SIZE;
            startDrawY = SQUARE_SIZE * pipe.y + (SQUARE_SIZE / 2 - START_SQUARE_SIZE / 2);
            break;
        case 'right':
            startDrawX = SQUARE_SIZE * pipe.x;
            startDrawY = SQUARE_SIZE * pipe.y + (SQUARE_SIZE / 2 - START_SQUARE_SIZE / 2);
            break;
    }

    ctx.save()
    ctx.translate(BORDER_SIZE / 2, BORDER_SIZE / 2)
    ctx.beginPath()
    ctx.fillStyle = 'yellow'
    ctx.fillRect(startDrawX, startDrawY, START_SQUARE_SIZE, START_SQUARE_SIZE);
    ctx.fillStyle = 'red'
    ctx.font = '18px Rajdhani'
    ctx.fillText(pipe.type, startDrawX + START_SQUARE_SIZE / 4, startDrawY + START_SQUARE_SIZE / 2)
    ctx.stroke();
    ctx.restore()
}

function drawGrid(pipeData: Pipe[][], ctx: CanvasRenderingContext2D, startPipe: Pipe, endPipe: Pipe, difficulty: number, SQUARE_SIZE: number) {
    ctx.save()
    ctx.lineWidth = 100;
    ctx.strokeStyle = '#CA7842'
    ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.restore()
    drawCrucialPipes(startPipe, ctx, difficulty, pipeData, SQUARE_SIZE)
    drawCrucialPipes(endPipe, ctx, difficulty, pipeData, SQUARE_SIZE)

    for (let i = 0; i < difficulty; i++) {
        for (let j = 0; j < difficulty; j++) {
            ctx.save()
            ctx.translate(BORDER_SIZE / 2, BORDER_SIZE / 2)
            const row = i * SQUARE_SIZE;
            const col = j * SQUARE_SIZE;
            ctx.beginPath()
            ctx.fillStyle = 'white'
            ctx.rect(row, col, SQUARE_SIZE, SQUARE_SIZE)
            ctx.stroke()
            ctx.restore()
        }
    }
}

export { ElbowDrawable, StraightDrawable, type Drawable, drawGrid }

