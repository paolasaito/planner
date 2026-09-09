import { useEffect, useState } from "react";
import date from "infra/date.js";
import FlowerIcon from "components/icons/FlowerIcon";
import styles from "./WeekAgendaCard.module.css";

export default function WeekAgendaCard({
  anchorDate,
  today,
  categories,
  refreshToken,
}) {
  const [weekAnchor, setWeekAnchor] = useState(anchorDate);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekDates = date.getWeekDates(weekAnchor);
  const startDate = weekDates[0];
  const endDate = weekDates[6];

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(`/api/v1/tasks?startDate=${startDate}&endDate=${endDate}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((body) => {
        if (active) setTasks(body);
      })
      .catch(() => {
        if (active) setTasks([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [startDate, endDate, refreshToken]);

  const categoriesById = Object.fromEntries(
    categories.map((category) => [category.id, category]),
  );

  const completedCount = tasks.filter((task) => task.completed_at).length;
  const percentage =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Agenda da semana</h2>

        <div className={styles.selector}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => setWeekAnchor(date.shiftDays(weekAnchor, -7))}
            aria-label="Semana anterior"
          >
            ‹
          </button>
          <span className={styles.range}>
            {date.formatShortRange(startDate, endDate)}
          </span>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => setWeekAnchor(date.shiftDays(weekAnchor, 7))}
            aria-label="Próxima semana"
          >
            ›
          </button>
        </div>
      </div>

      <div className={styles.progress}>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={styles.progressLabel}>
          {percentage}% da semana concluído ({completedCount}/{tasks.length})
        </span>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <FlowerIcon size={26} spinning color="var(--color-primary)" />
        </div>
      ) : (
        <div className={styles.days}>
          {weekDates.map((dateString) => {
            const dayTasks = tasks.filter((task) => task.date === dateString);

            return (
              <div key={dateString} className={styles.day}>
                <p
                  className={`${styles.dayHeader} ${
                    dateString === today ? styles.todayHeader : ""
                  }`}
                >
                  {date.WEEKDAY_ABBREVIATIONS[date.getWeekdayIndex(dateString)]}{" "}
                  {date.getDayNumber(dateString)}
                </p>

                {dayTasks.length === 0 ? (
                  <p className={styles.emptyDay}>—</p>
                ) : (
                  <ul className={styles.list}>
                    {dayTasks.map((task) => {
                      const category = categoriesById[task.category_id];

                      return (
                        <li key={task.id} className={styles.task}>
                          <span
                            className={styles.taskDot}
                            style={{
                              backgroundColor: category
                                ? category.color
                                : "var(--color-primary-light)",
                            }}
                          />
                          <span
                            className={`${styles.taskTitle} ${
                              task.completed_at ? styles.completed : ""
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.time && (
                            <span className={styles.taskTime}>
                              {task.time.slice(0, 5)}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
