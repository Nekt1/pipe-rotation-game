import clsx from 'clsx'
import styles from './styles.module.scss'

export default function PopUpMessage({message, isToggled}: {message: string, isToggled: boolean}) {
    return (
        <div className={clsx(styles.popup, {[styles.visible]: isToggled})}>
            {message}
        </div>
    )
}