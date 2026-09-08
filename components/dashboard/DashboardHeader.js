import WeekStrip from "./WeekStrip";
import styles from "./DashboardHeader.module.css";

export default function DashboardHeader({
  formattedDate,
  username,
  selectedDate,
  today,
  onSelectDate,
  isLoadingDay,
}) {
  return (
    <div className={styles.header}>
      <div className={styles.intro}>
        <h1 className={styles.greeting}>Olá, {username}!</h1>
        <p className={styles.date}>{formattedDate}</p>
      </div>

      <WeekStrip
        selectedDate={selectedDate}
        today={today}
        onSelectDate={onSelectDate}
        disabled={isLoadingDay}
      />
    </div>
  );
}
