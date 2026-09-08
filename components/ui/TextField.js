import styles from "./TextField.module.css";

export default function TextField({ label, id, error, ...props }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
