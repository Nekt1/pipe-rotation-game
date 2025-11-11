import { useState, useRef, useEffect } from 'react'
import styles from './styles.module.scss'
import clsx from 'clsx';
import EndGameMessage from './Components/EndGameMessage/EndGameMessage.tsx';
import PopUpMessage from './Components/PopUpMessage/PopUpMessage.tsx';
import DifficultyButton from './Components/DifficultyButton/DifficultyButton.tsx';
import type { DifficultyValues } from './types.ts';
import { DIFFICULTIES, CANVAS_SIZE, BORDER_SIZE, DRAW_ROTATION_SPEED, Pipe } from './constants.ts';
import { Drawable, drawGrid, cleanTheGrid, populateDrawables } from './utils/drawHelpers.ts'
import { convertPathToPipes, fillTheWholeGrid, generateRandomEndPoints, generateRandomGrid } from './utils/randomGridGenerator.ts';
import { validateGrid } from './utils/gridValidator.ts';
import Timer from './Components/Timer/Timer.tsx';

function initializePipes(startPipe: Pipe, endPipe: Pipe, gridSize: number) {
    const randomizedPath = generateRandomGrid(startPipe, endPipe, gridSize)
    if (!randomizedPath) {
        console.error('No path generated')
        return;
    }

    const validPipePath = convertPathToPipes(randomizedPath, startPipe, endPipe)
    if (!validPipePath) {
        console.error('Could not convert')
        return;
    }

    const filledGrid = fillTheWholeGrid(validPipePath, gridSize)
    if (!filledGrid) {
        console.error('Could not fill the grid')
        return;
    }

    return filledGrid
}

function getUpdatedTimeLimit(updatedGridSize: number) {
    for (const options of Object.values(DIFFICULTIES)) {
        if (options.gridSize === updatedGridSize) return options.timer
    }
}

const drawables: Drawable[] = []

function App() {
    const [difficulty, setDifficulty] = useState(DIFFICULTIES.normal)
    const [pipeEndPoints, setPipeEndPoints] = useState(() => generateRandomEndPoints(difficulty.gridSize))
    const [pipeData, setPipeData] = useState(() => initializePipes(pipeEndPoints.startPipe, pipeEndPoints.endPipe, difficulty.gridSize))
    const [timeLeft, setTimeLeft] = useState(DIFFICULTIES.normal.timer)
    const [gameOver, setGameOver] = useState<string | null>('')
    const [isPopUpToggled, setIsPopUpToggled] = useState(false)
    const [popUpMessage, setPopUpMessage] = useState('')
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
    const animationRef = useRef<number | null>(null)

    const SQUARE_SIZE = (CANVAS_SIZE - BORDER_SIZE) / difficulty.gridSize;

    function rotatePipe(pipeToRotate: Pipe) {
        const { rotation, id, type, x, y } = pipeToRotate;
        setPipeData(prevData => (prevData || []).map(row => row.map(pipe => {
            return pipe.id === pipeToRotate.id ? new Pipe(rotation + 90, id, type, x, y) : pipe
        })))
    }

    useEffect(() => {
        if (pipeData) populateDrawables(pipeData, SQUARE_SIZE, drawables)
    }, [])

    function handleFrame() {
        const ctx = ctxRef.current;

        if (!ctx || !pipeData) return;
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        for (const drawable of drawables) {
            const pipeState = pipeData.flat().find(pipe => pipe.id === drawable.pipeData.id)
            ctx.save()
            ctx.translate(SQUARE_SIZE / 2, SQUARE_SIZE / 2);
            if (pipeState && drawable.drawAngle < pipeState.rotation) {
                drawable.drawAngle += DRAW_ROTATION_SPEED;
            }
            drawable.draw(ctx, SQUARE_SIZE)
            ctx.restore()
        }

        drawGrid(pipeData, ctx, pipeEndPoints.startPipe, pipeEndPoints.endPipe, difficulty.gridSize, SQUARE_SIZE)
        animationRef.current = requestAnimationFrame(handleFrame)
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (!ctxRef.current) ctxRef.current = canvas.getContext('2d')

        animationRef.current = requestAnimationFrame(handleFrame);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        }
    }, [pipeData])

    function restartGame(newDifficulty: number, newSquareSize: number) {
        const newEndPoints = generateRandomEndPoints(newDifficulty)
        setPipeEndPoints(newEndPoints)
        const newGrid = initializePipes(newEndPoints.startPipe, newEndPoints.endPipe, newDifficulty)
        if (newGrid && ctxRef.current) {
            setGameOver(null)
            setPipeData(newGrid)
            cleanTheGrid(ctxRef.current)
            populateDrawables(newGrid, newSquareSize, drawables)
        }
        const updatedTimer = getUpdatedTimeLimit(newDifficulty)
        if (updatedTimer) setTimeLeft(updatedTimer)
        setPopUp('Game restarted')
    }

    function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect || !pipeData) return;

        const clickX = e.clientX - rect.left - BORDER_SIZE / 2;
        const clickY = e.clientY - rect.top - BORDER_SIZE / 2;

        const row = Math.floor(clickY / SQUARE_SIZE);
        const col = Math.floor(clickX / SQUARE_SIZE);
        if ((row >= 0 && row < pipeData.length) && (col >= 0 && col < pipeData[0].length)) {
            rotatePipe(pipeData[row][col])
        }
    }

    function setPopUp(message: string) {
        setPopUpMessage(message)
        setIsPopUpToggled(true)
        setTimeout(() => setIsPopUpToggled(false), 2000)
    }

    function checkValidity(pipeData: Pipe[][]) {
        const result = validateGrid(pipeData, pipeEndPoints.startPipe, pipeEndPoints.endPipe)
        if (result) setGameOver('YOU WON')
        else setPopUp('Grid is not valid, try again!')
    }

    function handleOptionChange(updatedDifficulty: DifficultyValues) {
        const newDifficulty = DIFFICULTIES[updatedDifficulty]
        const updatedSquareSize = (CANVAS_SIZE - BORDER_SIZE) / newDifficulty.gridSize;
        setDifficulty(newDifficulty)
        setTimeLeft(newDifficulty.timer)
        restartGame(newDifficulty.gridSize, updatedSquareSize)
        setPopUp(`Grid size changed to: ${newDifficulty.gridSize}x${newDifficulty.gridSize}`)
    }

    return (
        <>
            <div className={clsx(styles.container)}>
                <PopUpMessage message={popUpMessage} isToggled={isPopUpToggled}/>
                <div className={clsx(styles.canvasContainer)}>
                    {gameOver && <EndGameMessage message={gameOver}/>}
                    <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} onClick={handleClick} className={clsx({
                        [styles.gameOver]: gameOver
                    })}/>
                </div>
                <div className={clsx(styles.sidePanel)}>
                    <div className={clsx(styles.item)}>
                        <button className={clsx(styles.btn)} type="button" onClick={() => (pipeData ? checkValidity(pipeData) : console.error('No pipe data'))}>validate grid</button>
                    </div>
                    <div className={clsx(styles.item)}>
                        <button className={clsx(styles.btn)} type="button" onClick={() => restartGame(difficulty.gridSize, SQUARE_SIZE)}>restart game</button>
                    </div>
                    <div className={clsx(styles.item)}>
                        <DifficultyButton handleOptionChange={handleOptionChange} difficulty={difficulty.gridSize}/>
                    </div>
                    <div className={clsx(styles.item)}>
                        <Timer timeLeft={timeLeft} setTimeLeft={setTimeLeft} gameOver={gameOver} setGameOver={setGameOver}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App
