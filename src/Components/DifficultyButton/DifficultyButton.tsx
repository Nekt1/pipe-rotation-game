import type { DifficultyValues } from '../../types.ts';
import styles from './styles.module.scss'
import commonStyles from '../../styles.module.scss'
import { useState } from 'react'
import clsx from 'clsx';

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
        if (updatedDifficulty) handleOptionChange(updatedDifficulty as DifficultyValues)
        setIsToggleVisible(false)
    }

    return (
        <div className={clsx(styles.difficultyBtnContainer)}>
            <button className={clsx(commonStyles.btn)} type="button" onClick={toggleDifficultySelector}>difficulty</button>
            <div className={clsx(styles.popup, {[styles.visible]: isToggleVisible})}>
                <div className={clsx(styles.option)}>
                    <input type="radio" name="difficulty" id="easy" onChange={handleChange} value={'easy'} checked={difficulty === 5} />
                    <label htmlFor="easy">EASY</label>
                </div>
                <div className={clsx(styles.option)}>
                    <input type="radio" name="difficulty" id="normal" onChange={handleChange} value={'normal'} checked={difficulty === 7} />
                    <label htmlFor="normal">NORMAL</label>
                </div>
                <div className={clsx(styles.option)}>
                    <input type="radio" name="difficulty" id="hard" onChange={handleChange} value={'hard'} checked={difficulty === 9}/>
                    <label htmlFor="hard">HARD</label>
                </div>
            </div>
        </div>
    )
}