import styles from "./CategoryProgressCard.module.css";

const UNCATEGORIZED = {
  id: "uncategorized",
  name: "Sem categoria",
  color: "#c9bcce",
};

export default function CategoryProgressCard({
  tasks,
  categories,
  onOpenCategories,
}) {
  const groups = buildGroups(tasks, categories);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tarefas por categoria</h2>
        <button
          type="button"
          className={styles.manageButton}
          onClick={onOpenCategories}
        >
          Ver categorias
        </button>
      </div>

      {groups.length === 0 ? (
        <p className={styles.empty}>
          Nenhuma tarefa para acompanhar neste dia.
        </p>
      ) : (
        <ul className={styles.list}>
          {groups.map((group) => {
            const percentage = Math.round(
              (group.completed / group.total) * 100,
            );

            return (
              <li key={group.id} className={styles.group}>
                <div className={styles.groupHeader}>
                  <span className={styles.groupName}>
                    <span
                      className={styles.dot}
                      style={{ backgroundColor: group.color }}
                    />
                    {group.name}
                  </span>
                  <span className={styles.count}>
                    {group.completed}/{group.total}
                  </span>
                </div>

                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: group.color,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function buildGroups(tasks, categories) {
  const categoriesById = Object.fromEntries(
    categories.map((category) => [category.id, category]),
  );

  const groups = {};

  tasks.forEach((task) => {
    const category = categoriesById[task.category_id] || UNCATEGORIZED;

    if (!groups[category.id]) {
      groups[category.id] = {
        id: category.id,
        name: category.name,
        color: category.color,
        total: 0,
        completed: 0,
      };
    }

    groups[category.id].total += 1;
    if (task.completed_at) groups[category.id].completed += 1;
  });

  return Object.values(groups);
}
