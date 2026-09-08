import { useEffect, useRef } from "react";
import FlowerIcon from "components/icons/FlowerIcon";
import styles from "./TaskCreatedPopup.module.css";

const VISIBLE_DURATION_IN_MILLISECONDS = 2200;

export default function TaskCreatedPopup({ onClose }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timeoutId = setTimeout(
      () => onCloseRef.current(),
      VISIBLE_DURATION_IN_MILLISECONDS,
    );
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.popup}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.flower}>
          <FlowerIcon size={72} color="var(--color-primary)" />
        </div>
        <h2 className={styles.title}>Tarefa criada!</h2>
        <p className={styles.subtitle}>Mais uma flor no seu jardim do dia.</p>
      </div>
    </div>
  );
}
