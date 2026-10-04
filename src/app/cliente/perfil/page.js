"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import { userService } from "@/services/userService";
import { authErrorMessage } from "@/services/authService";

import styles from "./CustomerProfile.module.css";

export default function CustomerProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return <p role="status">Cargando tu perfil...</p>;
  }

  return <ProfileForm key={user.id} user={user} logout={logout} router={router} />;
}

function ProfileForm({ user, logout, router }) {
  const [values, setValues] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
    deliveryInstructions: user.deliveryInstructions || "",
  });

  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function change(event) {
    setValues((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function save(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await userService.updateProfile(user, values);

      setMessage("Tus datos se guardaron correctamente.");
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
      router.replace("/login");
    } catch {
      setError("No se pudo cerrar sesión.");
      setLoggingOut(false);
    }
  }

  const firstName = user.name?.trim()?.split(/\s+/)[0] || "Cliente";

  return (
    <div className={styles.page}>
      <header className={styles.profileHeader}>
        <div className={styles.avatar}>{firstName.charAt(0).toUpperCase()}</div>

        <div>
          <p>MI PERFIL</p>

          <h1>¡Hola, {firstName}!</h1>

          <span>{user.email}</span>
        </div>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className={styles.success} role="status">
          {message}
        </div>
      )}

      <section className={styles.card}>
        <div className={styles.sectionHeading}>
          <h2>Mi información</h2>

          <p>Estos datos se utilizan para gestionar tus pedidos.</p>
        </div>

        <form className={styles.form} onSubmit={save}>
          <div className={styles.field}>
            <label htmlFor="profile-name">Nombre completo</label>

            <input
              id="profile-name"
              name="name"
              value={values.name}
              onChange={change}
              minLength={2}
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="profile-email">Correo electrónico</label>

            <input id="profile-email" type="email" value={user.email || ""} readOnly />
          </div>

          <div className={styles.field}>
            <label htmlFor="profile-phone">Teléfono</label>

            <input
              id="profile-phone"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={change}
              maxLength={25}
              autoComplete="tel"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="profile-address">Dirección</label>

            <textarea
              id="profile-address"
              name="address"
              value={values.address}
              onChange={change}
              rows={3}
              minLength={5}
              maxLength={500}
              autoComplete="street-address"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="profile-instructions">
              Indicaciones de entrega
              <span> (opcional)</span>
            </label>

            <textarea
              id="profile-instructions"
              name="deliveryInstructions"
              value={values.deliveryInstructions}
              onChange={change}
              rows={3}
              maxLength={500}
              placeholder="Ej.: portón azul, llamar al llegar."
            />
          </div>

          <button className={styles.saveButton} type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeading}>
          <h2>Cuenta</h2>

          <p>Administra tu sesión de EmprendeLink.</p>
        </div>

        <button
          className={styles.logoutButton}
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <i className="bi bi-box-arrow-right" aria-hidden="true"></i>

          {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
      </section>
    </div>
  );
}
