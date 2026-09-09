import FlowerIcon from "components/icons/FlowerIcon";
import TaskItem from "./TaskItem";
import styles from "./AgendaCard.module.css";

export default function AgendaCard({
  tasks,
  categories,
  onToggleTask,
  onEditTask,
}) {
  const categoriesById = Object.fromEntries(
    categories.map((category) => [category.id, category]),
  );

  const completedCount = tasks.filter((task) => task.completed_at).length;
  const percentage =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  const allCompleted = tasks.length > 0 && completedCount === tasks.length;

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Agenda do dia</h2>

      <div className={styles.progress}>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={styles.progressLabel}>
          {percentage}% do dia concluído ({completedCount}/{tasks.length})
        </span>
      </div>

      {allCompleted && (
        <div className={styles.celebration}>
          <FlowerIcon
            size={40}
            color="var(--color-primary)"
            className={styles.celebrationFlower}
          />
          <div>
            <p className={styles.celebrationTitle}>Parabéns!</p>
            <p className={styles.celebrationText}>
              Você concluiu todas as tarefas do dia. Seu jardim floresceu hoje.
            </p>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <p className={styles.empty}>
          Nenhuma tarefa por aqui ainda. Que tal adicionar a primeira?
        </p>
      ) : (
        <ul className={styles.list}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              category={categoriesById[task.category_id] || null}
              onToggle={onToggleTask}
              onEdit={onEditTask}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
