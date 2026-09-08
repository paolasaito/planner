import FlowerIcon from "components/icons/FlowerIcon";
import styles from "./TaskItem.module.css";

export default function TaskItem({ task, category, onToggle, onEdit }) {
  const completed = Boolean(task.completed_at);
  const highlighted = task.is_urgent && !completed;

  return (
    <li className={`${styles.item} ${highlighted ? styles.urgent : ""}`}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => onToggle(task)}
        aria-label={
          completed ? "Marcar como não concluída" : "Marcar como concluída"
        }
      >
        {completed ? (
          <FlowerIcon
            size={22}
            color="var(--color-primary)"
            className={styles.bloom}
          />
        ) : (
          <span className={styles.circle} />
        )}
      </button>

      <button
        type="button"
        className={styles.info}
        onClick={() => onEdit(task)}
        title="Editar tarefa"
      >
        <span
          className={`${styles.title} ${completed ? styles.completed : ""}`}
        >
          {task.title}
        </span>

        {(category || highlighted) && (
          <span className={styles.meta}>
            {category && (
              <span
                className={styles.category}
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
            )}
            {highlighted && <span className={styles.urgentBadge}>Urgente</span>}
          </span>
        )}
      </button>

      {task.time && (
        <span className={styles.time}>{task.time.slice(0, 5)}</span>
      )}
    </li>
  );
}
