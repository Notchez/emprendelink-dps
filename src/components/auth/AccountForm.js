"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { authService, authErrorMessage } from "@/services/authService";

import { useAuth } from "@/context/AuthContext";

import { ROLES, getLoginDestination } from "@/lib/constants/roles";

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

  function change(event) {
    setValues((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

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

  async function recoverPassword() {
    if (!values.email.trim()) {
      setError("Escribe tu correo para recuperar el acceso.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

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
  }

  if (isComplete && loading) {
    return (
      <main className={styles.page}>
        <p className={styles.loadingMessage} role="status">
          Comprobando sesión...
        </p>
      </main>
    );
  }

  if (isComplete && !identity) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <Link className={styles.brand} href="/">
            <strong>Emprende</strong>Link
          </Link>

          <h1>Inicia sesión</h1>

          <p className={styles.subtitle}>Necesitas iniciar sesión para completar tu cuenta.</p>

          <Link className={styles.primaryLink} href={`/login${suffix}`}>
            Ir a iniciar sesión
          </Link>
        </section>
      </main>
    );
  }

  if (user) {
    return (
      <main className={styles.page}>
        <p className={styles.loadingMessage} role="status">
          Abriendo tu cuenta...
        </p>
      </main>
    );
  }

  const title = isLogin ? "Iniciar sesión" : isComplete ? "Completar perfil" : "Crear cuenta";

  const subtitle = isLogin
    ? "Ingresa con tu correo y contraseña para continuar."
    : isComplete
      ? "Completa tus datos para comenzar a utilizar EmprendeLink."
      : "Regístrate para comprar o comenzar a vender en EmprendeLink.";

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.welcome}>
          <Link className={styles.brand} href="/">
            <strong>Emprende</strong>Link
          </Link>

          <div className={styles.welcomeContent}>
            <span className={styles.eyebrow}>COMPRA Y VENDE EN UN SOLO LUGAR</span>

            <h2>Conectamos clientes con emprendedores.</h2>

            <p>
              Descubre negocios de nuestra comunidad, explora sus productos y realiza pedidos
              directamente a sus emprendedores.
            </p>

            <div className={styles.benefit}>
              <span className={styles.benefitIcon} aria-hidden="true">
                🏪
              </span>

              <div>
                <strong>Descubre emprendimientos</strong>

                <p>Encuentra negocios y explora sus catálogos.</p>
              </div>
            </div>

            <div className={styles.benefit}>
              <span className={styles.benefitIcon} aria-hidden="true">
                🛒
              </span>

              <div>
                <strong>Compra de forma sencilla</strong>

                <p>Agrega productos a tu carrito y consulta el estado de tus pedidos.</p>
              </div>
            </div>

            <div className={styles.benefit}>
              <span className={styles.benefitIcon} aria-hidden="true">
                💵
              </span>

              <div>
                <strong>Pago contra entrega</strong>

                <p>Paga directamente al recibir tu pedido.</p>
              </div>
            </div>
          </div>

          <p className={styles.welcomeFooter}>EmprendeLink · DPS941</p>
        </aside>

        <section className={styles.card} aria-labelledby="account-title">
          <div className={styles.cardHeader}>
            <Link className={styles.mobileBrand} href="/">
              <strong>Emprende</strong>Link
            </Link>

            <span className={styles.formEyebrow}>
              {isLogin
                ? "BIENVENIDO DE NUEVO"
                : isComplete
                  ? "UN ÚLTIMO PASO"
                  : "ÚNETE A EMPRENDELINK"}
            </span>

            <h1 id="account-title">{title}</h1>

            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          {next && (
            <p className={styles.info}>
              Necesitas una cuenta de cliente para confirmar tu pedido. Tu carrito se conserva.
            </p>
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
            <p className={styles.info}>
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
                  placeholder="Escribe tu nombre completo"
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
              placeholder="correo@ejemplo.com"
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
                  placeholder="Escribe tu contraseña"
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
                  placeholder="Repite tu contraseña"
                />
              </>
            )}

            <button className={styles.submitButton} disabled={saving} type="submit">
              {saving
                ? "Procesando..."
                : isLogin
                  ? "Iniciar sesión"
                  : isComplete
                    ? "Guardar perfil"
                    : "Crear mi cuenta"}
            </button>

            {isLogin && (
              <button
                className={styles.recoverButton}
                disabled={saving}
                type="button"
                onClick={() => void recoverPassword()}
              >
                Recuperar contraseña
              </button>
            )}
          </form>

          {!isComplete && (
            <p className={styles.switchAccount}>
              {isLogin ? "¿Todavía no tienes cuenta?" : "¿Ya tienes una cuenta?"}{" "}
              <Link href={`${isLogin ? "/registro" : "/login"}${suffix}`}>
                {isLogin ? "Crear cuenta" : "Iniciar sesión"}
              </Link>
            </p>
          )}

          <Link className={styles.backHome} href="/">
            ← Volver a explorar negocios
          </Link>
        </section>
      </div>
    </main>
  );
}
