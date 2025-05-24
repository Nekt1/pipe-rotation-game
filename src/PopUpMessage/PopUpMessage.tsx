import styles from './styles.module.css'

export default function PopUpMessage({message, isToggled}) {
    return (
        <div className={`${styles.popup} ${isToggled ? styles.visible: ''}`}>
            {message}
        </div>
    )
}