"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/client";
import { ROLES } from "@/lib/constants/roles";
import { apiRequest } from "@/services/apiClient";

import styles from "./AdminUsers.module.css";

const ROLE_LABELS = {
  ADMIN: "Administrador",
  ENTREPRENEUR: "Emprendedor",
  CUSTOMER: "Cliente",
};

function formatDate(value) {
  if (!value) return "No disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No disponible";
  }

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/El_Salvador",
  }).format(date);
}

async function getRegisteredUsers() {
  const snapshot = await getDocs(collection(getFirebaseDb(), "users"));

  return snapshot.docs
    .map((document) => ({
      ...document.data(),
      id: document.id,
    }))
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"));
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;

    getRegisteredUsers()
      .then((registeredUsers) => {
        if (active) {
          setUsers(registeredUsers);
          setError("");
        }
      })
      .catch((caughtError) => {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "No se pudieron consultar los usuarios."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function refreshUsers() {
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      setUsers(await getRegisteredUsers());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudieron actualizar los usuarios."
      );
    } finally {
      setLoading(false);
    }
  }

  async function changeCustomerStatus(customer) {
    const nextActive = !customer.active;

    const confirmed = window.confirm(
      nextActive
        ? `¿Deseas activar la cuenta de ${customer.name}?`
        : `¿Deseas desactivar la cuenta de ${customer.name}?\n\n` +
            "El cliente perderá acceso a las secciones privadas " +
            "y no podrá realizar nuevos pedidos mientras su cuenta esté inactiva."
    );

    if (!confirmed) {
      return;
    }

    setBusyId(customer.id);
    setError("");
    setFeedback("");

    try {
      const updatedCustomer = await apiRequest(
        `/api/admin/users/${encodeURIComponent(customer.id)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            active: nextActive,
          }),
        }
      );

      setUsers((previous) =>
        previous.map((user) =>
          user.id === updatedCustomer.id
            ? {
                ...user,
                active: updatedCustomer.active,
              }
            : user
        )
      );

      setFeedback(
        updatedCustomer.active
          ? `La cuenta de ${customer.name} fue activada.`
          : `La cuenta de ${customer.name} fue desactivada.`
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo cambiar el estado del cliente."
      );
    } finally {
      setBusyId(null);
    }
  }

  const selectedCustomer = users.find(
    (user) => user.id === selectedCustomerId && user.role === ROLES.CUSTOMER
  );

  const customersCount = users.filter((user) => user.role === ROLES.CUSTOMER).length;

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div>
          <p className="eyebrow">Panel del administrador</p>

          <h1>Usuarios registrados</h1>

          <p>Consulta las cuentas registradas y administra el acceso de los clientes.</p>
        </div>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => void refreshUsers()}
          disabled={loading || Boolean(busyId)}
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {feedback && (
        <p className={styles.success} role="status">
          {feedback}
        </p>
      )}

      {loading && users.length === 0 && <p role="status">Cargando usuarios...</p>}

      {!loading && !error && (
        <>
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <span>Usuarios registrados</span>

              <strong>{users.length}</strong>
            </div>

            <div className={styles.summaryCard}>
              <span>Clientes registrados</span>

              <strong>{customersCount}</strong>
            </div>
          </div>

          {users.length === 0 ? (
            <p>No hay usuarios registrados.</p>
          ) : (
            <section className={styles.tableCard}>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name || "Sin nombre"}</td>

                        <td>{user.email || "—"}</td>

                        <td>{ROLE_LABELS[user.role] || user.role || "No disponible"}</td>

                        <td>
                          <span className={user.active ? styles.active : styles.inactive}>
                            {user.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        <td>
                          {user.role === ROLES.CUSTOMER ? (
                            <button
                              type="button"
                              className={styles.secondaryButton}
                              onClick={() => {
                                setSelectedCustomerId((previous) =>
                                  previous === user.id ? null : user.id
                                );

                                setFeedback("");
                                setError("");
                              }}
                              disabled={Boolean(busyId)}
                            >
                              {selectedCustomerId === user.id ? "Cerrar detalles" : "Ver detalles"}
                            </button>
                          ) : (
                            <span className={styles.notApplicable}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {selectedCustomer && (
            <section className={styles.detailsCard} aria-labelledby="customer-details-title">
              <div className={styles.detailsHeading}>
                <div>
                  <p className={styles.sectionLabel}>Ficha del cliente</p>

                  <h2 id="customer-details-title">
                    {selectedCustomer.name || "Cliente sin nombre"}
                  </h2>
                </div>

                <span className={selectedCustomer.active ? styles.active : styles.inactive}>
                  {selectedCustomer.active ? "Cuenta activa" : "Cuenta inactiva"}
                </span>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detail}>
                  <span>Nombre completo</span>

                  <strong>{selectedCustomer.name || "—"}</strong>
                </div>

                <div className={styles.detail}>
                  <span>Correo electrónico</span>

                  {selectedCustomer.email ? (
                    <a href={`mailto:${selectedCustomer.email}`}>{selectedCustomer.email}</a>
                  ) : (
                    <strong>No registrado</strong>
                  )}
                </div>

                <div className={styles.detail}>
                  <span>Número de teléfono</span>

                  {selectedCustomer.phone ? (
                    <a href={`tel:${selectedCustomer.phone}`}>{selectedCustomer.phone}</a>
                  ) : (
                    <strong>No registrado</strong>
                  )}
                </div>

                <div className={styles.detail}>
                  <span>Fecha de registro</span>

                  <strong>{formatDate(selectedCustomer.createdAt)}</strong>
                </div>

                <div className={`${styles.detail} ${styles.fullWidth}`}>
                  <span>Dirección</span>

                  <strong>{selectedCustomer.address || "No registrada"}</strong>
                </div>

                <div className={`${styles.detail} ${styles.fullWidth}`}>
                  <span>Indicaciones de entrega</span>

                  <strong>
                    {selectedCustomer.deliveryInstructions || "Sin indicaciones adicionales"}
                  </strong>
                </div>
              </div>

              <div className={styles.accountActions}>
                <div>
                  <h3>Estado de la cuenta</h3>

                  <p>
                    {selectedCustomer.active
                      ? "Puedes desactivar el acceso del cliente sin borrar sus datos ni pedidos anteriores."
                      : "Puedes volver a activar el acceso de este cliente."}
                  </p>
                </div>

                <button
                  type="button"
                  className={selectedCustomer.active ? styles.dangerButton : styles.activateButton}
                  onClick={() => void changeCustomerStatus(selectedCustomer)}
                  disabled={Boolean(busyId)}
                >
                  {busyId === selectedCustomer.id
                    ? "Guardando..."
                    : selectedCustomer.active
                      ? "Desactivar cuenta"
                      : "Activar cuenta"}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
