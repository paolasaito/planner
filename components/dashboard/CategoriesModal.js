import { useState } from "react";
import PencilIcon from "components/icons/PencilIcon";
import TrashIcon from "components/icons/TrashIcon";
import styles from "./CategoriesModal.module.css";

export default function CategoriesModal({
  categories,
  onClose,
  onUpdate,
  onDelete,
}) {
  const [editingId, setEditingId] = useState(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function startEditing(category) {
    setEditingId(category.id);
    setConfirmingDeleteId(null);
    setName(category.name);
    setColor(category.color);
    setError("");
  }

  async function handleSave(category) {
    if (!name.trim()) {
      setError("Informe um nome para a categoria.");
      return;
    }

    setError("");
    setBusy(true);

    try {
      await onUpdate(category, { name: name.trim(), color });
      setEditingId(null);
    } catch (saveError) {
      setError(saveError.message || "Não foi possível salvar a categoria.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(category) {
    setError("");
    setBusy(true);

    try {
      await onDelete(category);
      setConfirmingDeleteId(null);
    } catch (deleteError) {
      setError(deleteError.message || "Não foi possível excluir a categoria.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className={styles.title}>Minhas categorias</h2>

        {error && <div className={styles.error}>{error}</div>}

        {categories.length === 0 ? (
          <p className={styles.empty}>
            Você ainda não criou nenhuma categoria. Elas aparecem aqui assim que
            você cadastrar a primeira.
          </p>
        ) : (
          <ul className={styles.list}>
            {categories.map((category) => (
              <li key={category.id} className={styles.item}>
                {editingId === category.id ? (
                  <div className={styles.editRow}>
                    <input
                      type="color"
                      value={color}
                      onChange={(event) => setColor(event.target.value)}
                      className={styles.colorInput}
                      aria-label="Cor da categoria"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className={styles.nameInput}
                      aria-label="Nome da categoria"
                      autoFocus
                    />
                    <button
                      type="button"
                      className={styles.save}
                      onClick={() => handleSave(category)}
                      disabled={busy}
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : confirmingDeleteId === category.id ? (
                  <div className={styles.confirmRow}>
                    <span>Excluir &quot;{category.name}&quot;?</span>
                    <div className={styles.confirmActions}>
                      <button
                        type="button"
                        className={styles.textButton}
                        onClick={() => setConfirmingDeleteId(null)}
                      >
                        Não
                      </button>
                      <button
                        type="button"
                        className={styles.confirmDelete}
                        onClick={() => handleDelete(category)}
                        disabled={busy}
                      >
                        Sim, excluir
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.viewRow}>
                    <span
                      className={styles.dot}
                      style={{ backgroundColor: category.color }}
                    />
                    <span className={styles.name}>{category.name}</span>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => startEditing(category)}
                      aria-label={`Editar categoria ${category.name}`}
                      title="Editar"
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                      onClick={() => {
                        setConfirmingDeleteId(category.id);
                        setEditingId(null);
                      }}
                      aria-label={`Excluir categoria ${category.name}`}
                      title="Excluir"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className={styles.hint}>
          Ao excluir uma categoria, as tarefas dela continuam existindo, apenas
          ficam sem categoria.
        </p>

        <button type="button" className={styles.close} onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
