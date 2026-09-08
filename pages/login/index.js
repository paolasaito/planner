import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AuthCard from "components/AuthCard";
import TextField from "components/ui/TextField";
import Button from "components/ui/Button";
import styles from "components/AuthCard.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.email) nextErrors.email = "Informe seu e-mail.";
    if (!form.password) nextErrors.password = "Informe sua senha.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const body = await response.json();

      if (!response.ok) {
        setFormError(body.message || "Não foi possível entrar.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setFormError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      pageTitle="Entrar"
      title="Bem-vinda de volta"
      footer={
        <>
          Ainda não tem uma conta? <Link href="/cadastro">Cadastre-se</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError && <div className={styles.formError}>{formError}</div>}

        <TextField
          id="email"
          name="email"
          label="E-mail"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        <TextField
          id="password"
          name="password"
          label="Senha"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <Button type="submit" loading={loading}>
          Entrar
        </Button>
      </form>
    </AuthCard>
  );
}
