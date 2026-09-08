const TIMEZONE = "America/Sao_Paulo";

const WEEKDAYS = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

const WEEKDAY_ABBREVIATIONS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function getTodayInBrazil() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatFullDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const referenceDate = new Date(Date.UTC(year, month - 1, day));

  const weekday = WEEKDAYS[referenceDate.getUTCDay()];
  const monthName = MONTHS[month - 1];

  return `${weekday}, ${String(day).padStart(2, "0")} de ${monthName} de ${year}`;
}

// Dates are anchored at UTC midnight so weekday math never shifts by timezone.
function toReferenceDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toDateString(referenceDate) {
  return referenceDate.toISOString().slice(0, 10);
}

function getWeekdayIndex(dateString) {
  return toReferenceDate(dateString).getUTCDay();
}

function getDayNumber(dateString) {
  return dateString.slice(8, 10);
}

function addInterval(dateString, recurrence) {
  const base = toReferenceDate(dateString);

  if (recurrence === "daily") base.setUTCDate(base.getUTCDate() + 1);
  if (recurrence === "weekly") base.setUTCDate(base.getUTCDate() + 7);
  if (recurrence === "monthly") base.setUTCMonth(base.getUTCMonth() + 1);

  return toDateString(base);
}

function formatShortRange(startDate, endDate) {
  const startDay = getDayNumber(startDate);
  const endDay = getDayNumber(endDate);
  const endMonth = MONTHS[Number(endDate.slice(5, 7)) - 1];

  return `${startDay} – ${endDay} de ${endMonth}`;
}

function shiftDays(dateString, amount) {
  const base = toReferenceDate(dateString);
  base.setUTCDate(base.getUTCDate() + amount);
  return toDateString(base);
}

function generateOccurrenceDates(startDate, recurrence, endDate) {
  const dates = [startDate];
  let current = startDate;

  // Hard stop guards against a malformed endDate looping forever.
  while (dates.length < 1000) {
    current = addInterval(current, recurrence);
    if (current > endDate) break;
    dates.push(current);
  }

  return dates;
}

function getWeekDates(dateString) {
  const reference = toReferenceDate(dateString);
  const weekday = reference.getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;

  const monday = toReferenceDate(dateString);
  monday.setUTCDate(monday.getUTCDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(monday);
    current.setUTCDate(monday.getUTCDate() + index);
    return toDateString(current);
  });
}

const date = {
  getTodayInBrazil,
  formatFullDate,
  getWeekDates,
  getWeekdayIndex,
  getDayNumber,
  shiftDays,
  formatShortRange,
  generateOccurrenceDates,
  WEEKDAY_ABBREVIATIONS,
};

export default date;
