import type { DifficultyValues } from '../constants';
import styles from './styles.module.css'
import { useState } from 'react'

interface DifficultyButtonProps {
    handleOptionChange: (difficulty: DifficultyValues) => void;
    difficulty: number;
}

export default function DifficultyButton(props: DifficultyButtonProps) {
    const { handleOptionChange, difficulty } = props;
    const [isToggleVisible, setIsToggleVisible] = useState(false)


    function toggleDifficultySelector() {
        setIsToggleVisible(prevValue => !prevValue)
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const updatedDifficulty = e.target.value
        if (updatedDifficulty) handleOptionChange(updatedDifficulty)
        setIsToggleVisible(false)
    }

    return (
        <div className={styles.difficultyBtnContainer}>
            <button className={`${styles.btn} ${styles.btnRed}`} type="button" onClick={toggleDifficultySelector}>difficulty</button>
            <div className={`${styles.popup} ${isToggleVisible ? styles.visible : ''}`}>
                <div className={styles.option}>
                    <input type="radio" name="difficulty" id="easy" onChange={handleChange} value={'easy'} checked={difficulty === 5} />
                    <label className={styles.optionOne} htmlFor="easy">EASY</label>
                </div>
                <div className={styles.option}>
                    <input type="radio" name="difficulty" id="normal" onChange={handleChange} value={'normal'} checked={difficulty === 7} />
                    <label htmlFor="normal">NORMAL</label>
                </div>
                <div className={styles.option}>
                    <input type="radio" name="difficulty" id="hard" onChange={handleChange} value={'hard'} checked={difficulty === 9}/>
                    <label htmlFor="hard">HARD</label>
                </div>
            </div>
        </div>
    )
}