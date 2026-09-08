import date from "infra/date.js";
import styles from "./WeekStrip.module.css";

export default function WeekStrip({
  selectedDate,
  today,
  onSelectDate,
  disabled = false,
}) {
  const weekDates = date.getWeekDates(selectedDate);

  return (
    <div className={styles.strip}>
      <button
        type="button"
        className={styles.arrow}
        disabled={disabled}
        onClick={() => onSelectDate(date.shiftDays(selectedDate, -7))}
        aria-label="Semana anterior"
      >
        ‹
      </button>

      {weekDates.map((dateString) => {
        const isSelected = dateString === selectedDate;
        const isToday = dateString === today;

        return (
          <button
            key={dateString}
            type="button"
            disabled={disabled}
            onClick={() => onSelectDate(dateString)}
            className={`${styles.day} ${isSelected ? styles.selected : ""} ${
              isToday && !isSelected ? styles.today : ""
            }`}
          >
            <span className={styles.dayNumber}>
              {date.getDayNumber(dateString)}
            </span>
            <span className={styles.weekday}>
              {date.WEEKDAY_ABBREVIATIONS[date.getWeekdayIndex(dateString)]}
            </span>
          </button>
        );
      })}

      <button
        type="button"
        className={styles.arrow}
        disabled={disabled}
        onClick={() => onSelectDate(date.shiftDays(selectedDate, 7))}
        aria-label="Próxima semana"
      >
        ›
      </button>
    </div>
  );
}
