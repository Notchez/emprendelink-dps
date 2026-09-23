"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authService, authErrorMessage } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { ROLES, getLoginDestination, getRoleHome } from "@/lib/constants/roles";
import { ContactFields } from "./ContactFields";
import styles from "./Account.module.css";

export function AccountForm({ mode }) {
  const isLogin = mode === "login";
  const isComplete = mode === "complete";
  const { identity, user, loading, login, register, completeProfile } = useAuth();
  const search = useSearchParams();
  const next = search.get("next") === "/checkout" ? "/checkout" : null;
  const suffix = next ? "?next=%2Fcheckout" : "";
  const router = useRouter();
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ROLES.CUSTOMER,
    phone: "",
    address: "",
    deliveryInstructions: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace(getLoginDestination(user.role, next));
    }
  }, [next, router, user]);
  const change = (event) =>
    setValues((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!isLogin && !isComplete && values.password !== values.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSaving(true);
    try {
      const account = isLogin
        ? await login(values.email, values.password)
        : isComplete
          ? await completeProfile(values)
          : await register(values);
      router.replace(
        account ? getLoginDestination(account.role, next) : `/completar-perfil${suffix}`
      );
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setSaving(false);
    }
  }
  if (isComplete && loading) return <p role="status">Comprobando sesión...</p>;
  if (isComplete && !identity)
    return (
      <main className={styles.page}>
        <Link href={`/login${suffix}`}>Inicia sesión para completar tu cuenta</Link>
      </main>
    );
  if (user)
    return (
      <main className={styles.page}>
        <p role="status">Abriendo tu cuenta...</p>
      </main>
    );
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Link href="/">EmprendeLink</Link>
        <h1>{isLogin ? "Iniciar sesión" : isComplete ? "Completa tu perfil" : "Crear cuenta"}</h1>
        {next && (
          <p>Necesitas una cuenta de cliente para confirmar tu pedido. Tu carrito se conserva.</p>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className={styles.success} role="status">
            {message}
          </p>
        )}
        {!isLogin && !isComplete && identity && (
          <p>
            Tu acceso ya existe.{" "}
            <Link href={`/completar-perfil${suffix}`}>Completar los datos pendientes</Link>.
          </p>
        )}
        <form className={styles.form} onSubmit={submit}>
          {!isLogin && (
            <>
              <label htmlFor="role">Tipo de cuenta</label>
              <select
                id="role"
                name="role"
                value={values.role}
                onChange={change}
                disabled={Boolean(next)}
              >
                <option value={ROLES.CUSTOMER}>Cliente: quiero comprar</option>
                <option value={ROLES.ENTREPRENEUR}>Emprendedor: quiero vender</option>
              </select>
              <label htmlFor="name">Nombre completo</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={change}
                required
                minLength={2}
                maxLength={100}
              />
            </>
          )}
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={isComplete ? identity.email || "" : values.email}
            onChange={change}
            required
            readOnly={isComplete}
          />
          {!isLogin && values.role === ROLES.CUSTOMER && (
            <ContactFields values={values} onChange={change} />
          )}
          {!isComplete && (
            <>
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={values.password}
                onChange={change}
                required
                minLength={isLogin ? 1 : 8}
              />
            </>
          )}
          {!isLogin && !isComplete && (
            <>
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={change}
                required
                minLength={8}
              />
            </>
          )}
          <button disabled={saving} type="submit">
            {saving ? "Procesando..." : isLogin ? "Entrar" : "Guardar cuenta"}
          </button>
          {isLogin && (
            <button
              disabled={saving}
              type="button"
              onClick={async () => {
                if (!values.email.trim()) {
                  setError("Escribe tu correo para recuperar el acceso.");
                  return;
                }
                setSaving(true);
                setError("");
                try {
                  await authService.resetPassword(values.email);
                  setMessage(
                    "Si el correo tiene cuenta, recibirás instrucciones para restablecer tu contraseña."
                  );
                } catch (failure) {
                  setError(authErrorMessage(failure));
                } finally {
                  setSaving(false);
                }
              }}
            >
              Recuperar contraseña
            </button>
          )}
        </form>
        {!isComplete && (
          <p>
            <Link href={`${isLogin ? "/registro" : "/login"}${suffix}`}>
              {isLogin ? "Crear una cuenta" : "Ya tengo cuenta"}
            </Link>
          </p>
        )}
        {isComplete && user && <Link href={getRoleHome(user.role)}>Volver a mi cuenta</Link>}
      </section>
    </main>
  );
}
