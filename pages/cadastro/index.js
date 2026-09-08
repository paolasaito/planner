import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AuthCard from "components/AuthCard";
import TextField from "components/ui/TextField";
import Button from "components/ui/Button";
import styles from "components/AuthCard.module.css";

const MIN_PASSWORD_LENGTH = 8;

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.username || form.username.trim().length < 2) {
      nextErrors.username = "Informe seu nome de usuário.";
    }
    if (!form.email) {
      nextErrors.email = "Informe seu e-mail.";
    }
    if (!form.password || form.password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "As senhas não coincidem.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const createResponse = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const createBody = await createResponse.json();

      if (!createResponse.ok) {
        setFormError(createBody.message || "Não foi possível criar sua conta.");
        return;
      }

      const sessionResponse = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (!sessionResponse.ok) {
        router.push("/login");
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
      pageTitle="Criar conta"
      title="Vamos florescer juntas"
      footer={
        <>
          Já tem uma conta? <Link href="/login">Entrar</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError && <div className={styles.formError}>{formError}</div>}

        <TextField
          id="username"
          name="username"
          label="Nome de usuário"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
          autoComplete="username"
        />

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
          autoComplete="new-password"
        />

        <TextField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar senha"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" loading={loading}>
          Criar conta
        </Button>
      </form>
    </AuthCard>
  );
}
