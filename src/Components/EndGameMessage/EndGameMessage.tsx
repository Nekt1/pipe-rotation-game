import clsx from 'clsx'
import styles from './styles.module.scss'

export default function EndGameMessage({message}: {message: string}) {
    return (
        <div className={clsx(styles.endGameMessage)}>
            <p>{message}</p>
        </div>
    )
}