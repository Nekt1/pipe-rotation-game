import styles from './styles.module.scss'

export default function PopUpMessage({message, isToggled}) {
    return (
        <div className={`${styles.popup} ${isToggled ? styles.visible: ''}`}>
            {message}
        </div>
    )
}