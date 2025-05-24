import { useState, useRef, useEffect } from 'react'
import styles from './styles/styles.module.css'
import clsx from 'clsx';
import EndGameMessage from './EndGameMessage/EndGameMessage.tsx';
import PopUpMessage from './PopUpMessage/PopUpMessage.tsx';
import DifficultyButton from './DifficultyButton/DifficultyButton.tsx';
import { DIFFICULTIES, CANVAS_SIZE, BORDER_SIZE, type DifficultyValues, Pipe } from './constants.ts';
import { ElbowDrawable, StraightDrawable, type Drawable, drawGrid } from './DrawHelpers/drawHelpers.ts'
import { convertPathToPipes, fillTheWholeGrid, generateRandomEndPoints, generateRandomGrid } from './RandomGridGenerator/randomGridGenerator.ts';
import { validateGrid } from './GridValidator/gridValidator.ts';

function populateDrawables(pipes: Pipe[][], SQUARE_SIZE: number) {
    drawables.length = 0;
    for (let row = 0; row < pipes.length; row++) {
        for (let col = 0; col < pipes[row].length; col++) {
            const pipe = pipes[row][col];
            const x = pipe.x * SQUARE_SIZE;
            const y = pipe.y * SQUARE_SIZE;
            switch (pipe.type) {
                case 'straight':
                    drawables.push(new StraightDrawable(x, y, pipe, SQUARE_SIZE))
                    break;
                case 'elbow':
                    drawables.push(new ElbowDrawable(x, y, pipe, SQUARE_SIZE))
                    break;
            }
        }
    }
}

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
    const timerRef = useRef<number | null>(null)
    const animationRef = useRef<number | null>(null)

    const SQUARE_SIZE = (CANVAS_SIZE - BORDER_SIZE) / difficulty.gridSize;

    useEffect(() => {
		timerRef.current = setInterval(() => {
			setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
		}, 1000);

		if (timeLeft === 0 && timerRef.current) {
            setGameOver('You Lost')
			clearInterval(timerRef.current);
		}

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [timeLeft]);


    function rotatePipe(pipeData: Pipe) {
        if (!pipeData) return;
        const { rotation, id, type, x, y } = pipeData;
        setPipeData(prevData => prevData.map(row => row.map(pipe => {
            return pipe.id === pipeData.id ? new Pipe(rotation + 90, id, type, x, y) : pipe
        })))
    }

    useEffect(() => {
        if (pipeData) populateDrawables(pipeData, SQUARE_SIZE)
    }, [])

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.height = CANVAS_SIZE;
        canvas.width = CANVAS_SIZE;

        if (!ctxRef.current) ctxRef.current = canvas.getContext('2d')
        const ctx = ctxRef.current;

        function handleFrame() {
            if (!ctx) return;

            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            for (const drawable of drawables) {
                if (!pipeData) return;
                const pipeState = pipeData.flat().find(pipe => pipe.id === drawable.pipeData.id)
                ctx.save()
                ctx.translate(SQUARE_SIZE / 2, SQUARE_SIZE / 2);
                if (pipeState && drawable.drawAngle < pipeState.rotation) {
                    drawable.drawAngle += 10;
                }
                drawable.draw(ctx, SQUARE_SIZE)
                ctx.restore()
            }
            drawGrid(pipeData, ctx, pipeEndPoints.startPipe, pipeEndPoints.endPipe, difficulty.gridSize, SQUARE_SIZE)
            animationRef.current = requestAnimationFrame(handleFrame)
        }
        
        requestAnimationFrame(handleFrame)

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [pipeData])


    function cleanTheGrid() {
        const ctx = ctxRef.current;
        if (ctx) ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    }

    function getRequiredTime(updatedGridSize: number) {
        for (const options of Object.values(DIFFICULTIES)) {
            if (options.gridSize === updatedGridSize) return options.timer
        }
    }

    function restartGame(newDifficulty: number, newSquareSize: number) {
        const newEndPoints = generateRandomEndPoints(newDifficulty)
        setPipeEndPoints(newEndPoints)
        const newGrid = initializePipes(newEndPoints.startPipe, newEndPoints.endPipe, newDifficulty)
        if (newGrid) {
            setGameOver(null)
            setPipeData(newGrid)
            cleanTheGrid()
            populateDrawables(newGrid, newSquareSize)
        }
        const updatedTimer = getRequiredTime(newDifficulty)
        if (updatedTimer) setTimeLeft(updatedTimer)
        setPopUp('Game restarted')
    }

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
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
        setTimeout(() => setIsPopUpToggled(false), 1000)
    }

    function checkValidity(pipeData: Pipe[][]) {
        const result = validateGrid(pipeData, pipeEndPoints.startPipe, pipeEndPoints.endPipe)
        if (!result) setPopUp('Grid is not valid, try again!')

        if (result) {
            setGameOver('YOU WON')
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }

    function handleOptionChange(updatedDifficulty: DifficultyValues) {
        const newDifficulty = DIFFICULTIES[updatedDifficulty]
        const updatedSquareSize = (CANVAS_SIZE - BORDER_SIZE) / newDifficulty.gridSize;
        setDifficulty(newDifficulty)
        setTimeLeft(newDifficulty.timer)
        restartGame(newDifficulty.gridSize, updatedSquareSize)
        setPopUp(`Grid size changed to: ${newDifficulty.gridSize}x${newDifficulty.gridSize}\n Good luck!`)
    }

    return (
        <>
            <div className="container">
                <PopUpMessage message={popUpMessage} isToggled={isPopUpToggled}/>
                <div className={styles.canvasContainer}>
                    {gameOver && <EndGameMessage message={gameOver}/>}
                    <canvas ref={canvasRef} onClick={handleClick} className={clsx({
                        [styles.gameOver]: gameOver
                    })}/>
                </div>
                <div className={styles.sidePanel}>
                    <div className={styles.item}>
                        <button className={styles.btn} type="button" onClick={() => (pipeData ? checkValidity(pipeData) : console.error('No pipe data'))}>validate grid</button>
                    </div>
                    <div className={styles.item}>
                        <button className={styles.btn} type="button" onClick={() => restartGame(difficulty.gridSize, SQUARE_SIZE)}>restart game</button>
                    </div>
                    <div className={styles.item}>
                        <div className={styles.timer}>{timeLeft}</div>
                    </div>
                    <div className={styles.item}>
                        <DifficultyButton handleOptionChange={handleOptionChange} difficulty={difficulty.gridSize}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App
