import { useEffect, useRef } from "react";
import styles from './styles.module.scss'
import clsx from "clsx";

export default function Timer(props) {
    const { timeLeft, setTimeLeft, setGameOver, gameOver } = props;
    const timerRef = useRef<number | null>(null)
    if (gameOver && timerRef.current) clearInterval(timerRef.current)

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft((timeLeft) => timeLeft - 1);
        }, 1000);

        if (timeLeft === 0 && timerRef.current) {
            setGameOver('You Lost')
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };

    }, [timeLeft]);

    return (
        <div className={clsx(styles.timer, {
            [styles.warning]: (timeLeft < 10 && timeLeft > 0)
        }
        )}>{timeLeft}</div>
    )
}