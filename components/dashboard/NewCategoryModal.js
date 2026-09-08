import { useState } from "react";
import TextField from "components/ui/TextField";
import Button from "components/ui/Button";
import styles from "./NewCategoryModal.module.css";

const DEFAULT_COLOR = "#a47dab";

export default function NewCategoryModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Informe um nome para a categoria.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color }),
      });

      const body = await response.json();

      if (!response.ok) {
        setError(body.message || "Não foi possível criar a categoria.");
        return;
      }

      onCreate(body);
    } catch {
      setError("Não foi possível criar a categoria.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className={styles.title}>Nova categoria</h2>

        <form onSubmit={handleSubmit} noValidate>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.row}>
            <div className={styles.nameField}>
              <TextField
                id="category-name"
                name="name"
                label="Nome"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.colorField}>
              <label htmlFor="category-color" className={styles.label}>
                Cor
              </label>
              <input
                id="category-color"
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className={styles.colorInput}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancelar
            </button>
            <Button type="submit" loading={loading} className={styles.submit}>
              Criar categoria
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
