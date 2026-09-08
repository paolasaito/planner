import { useState } from "react";
import TextField from "components/ui/TextField";
import Button from "components/ui/Button";
import NewCategoryModal from "./NewCategoryModal";
import styles from "./TaskModal.module.css";

const RECURRENCE_OPTIONS = [
  { value: "none", label: "Não repetir" },
  { value: "daily", label: "Diariamente" },
  { value: "weekly", label: "Semanalmente" },
  { value: "monthly", label: "Mensalmente" },
];

export default function TaskModal({
  task,
  defaultDate,
  categories,
  onClose,
  onSubmit,
  onDelete,
  onCreateCategory,
}) {
  const isEditing = Boolean(task);

  const [title, setTitle] = useState(task?.title || "");
  const [taskDate, setTaskDate] = useState(task?.date || defaultDate);
  const [time, setTime] = useState(task?.time ? task.time.slice(0, 5) : "");
  const [isUrgent, setIsUrgent] = useState(Boolean(task?.is_urgent));
  const [categoryId, setCategoryId] = useState(task?.category_id || "");
  const [recurrence, setRecurrence] = useState("none");
  const [repeatUntil, setRepeatUntil] = useState("");
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isConfirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Informe um título para a tarefa.");
      return;
    }

    if (!isEditing && recurrence !== "none" && !repeatUntil) {
      setError("Escolha até quando a tarefa deve se repetir.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmit({
        title: title.trim(),
        date: taskDate || defaultDate,
        time: time || null,
        isUrgent,
        categoryId: categoryId || null,
        recurrence: isEditing || recurrence === "none" ? null : recurrence,
        repeatUntil: isEditing || recurrence === "none" ? null : repeatUntil,
      });
      onClose();
    } catch (submitError) {
      setError(submitError.message || "Não foi possível salvar a tarefa.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setError("");
    setDeleting(true);

    try {
      await onDelete(task);
      onClose();
    } catch (deleteError) {
      setError(deleteError.message || "Não foi possível excluir a tarefa.");
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  function handleCategoryCreated(newCategory) {
    onCreateCategory(newCategory);
    setCategoryId(newCategory.id);
    setCategoryModalOpen(false);
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose}>
        <div
          className={styles.modal}
          onClick={(event) => event.stopPropagation()}
        >
          <h2 className={styles.title}>
            {isEditing ? "Editar tarefa" : "Nova tarefa"}
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            {error && <div className={styles.error}>{error}</div>}

            <TextField
              id="task-title"
              name="title"
              label="O que você precisa fazer?"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
            />

            <div className={styles.row}>
              <div className={styles.rowItem}>
                <TextField
                  id="task-date"
                  name="date"
                  label="Data"
                  type="date"
                  value={taskDate}
                  onChange={(event) => setTaskDate(event.target.value)}
                />
              </div>
              <div className={styles.rowItem}>
                <TextField
                  id="task-time"
                  name="time"
                  label="Horário"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="task-category" className={styles.label}>
                Categoria
              </label>
              <div className={styles.categoryRow}>
                <select
                  id="task-category"
                  className={styles.select}
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <option value="">Sem categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.newCategoryButton}
                  onClick={() => setCategoryModalOpen(true)}
                  aria-label="Nova categoria"
                  title="Nova categoria"
                >
                  +
                </button>
              </div>
            </div>

            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(event) => setIsUrgent(event.target.checked)}
              />
              Marcar como urgente
            </label>

            {!isEditing && (
              <>
                <div className={styles.field}>
                  <label htmlFor="task-recurrence" className={styles.label}>
                    Repetição
                  </label>
                  <select
                    id="task-recurrence"
                    className={styles.select}
                    value={recurrence}
                    onChange={(event) => setRecurrence(event.target.value)}
                  >
                    {RECURRENCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {recurrence !== "none" && (
                  <TextField
                    id="task-repeat-until"
                    name="repeatUntil"
                    label="Terminar repetição em"
                    type="date"
                    value={repeatUntil}
                    min={taskDate}
                    onChange={(event) => setRepeatUntil(event.target.value)}
                  />
                )}
              </>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.cancel} onClick={onClose}>
                Cancelar
              </button>
              <Button type="submit" loading={loading} className={styles.submit}>
                {isEditing ? "Salvar" : "Adicionar"}
              </Button>
            </div>

            {isEditing &&
              (isConfirmingDelete ? (
                <div className={styles.deleteConfirm}>
                  <span>Excluir esta tarefa?</span>
                  <div className={styles.deleteConfirmActions}>
                    <button
                      type="button"
                      className={styles.deleteConfirmCancel}
                      onClick={() => setConfirmingDelete(false)}
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      className={styles.deleteConfirmYes}
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? "Excluindo..." : "Sim, excluir"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.delete}
                  onClick={() => setConfirmingDelete(true)}
                >
                  Excluir tarefa
                </button>
              ))}
          </form>
        </div>
      </div>

      {isCategoryModalOpen && (
        <NewCategoryModal
          onClose={() => setCategoryModalOpen(false)}
          onCreate={handleCategoryCreated}
        />
      )}
    </>
  );
}
