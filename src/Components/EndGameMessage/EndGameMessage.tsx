import styles from './styles.module.css'

export default function EndGameMessage(props) {
    return (
        <div className={styles.endGameMessage}>
            <p>{props.message}</p>
        </div>
    )
}