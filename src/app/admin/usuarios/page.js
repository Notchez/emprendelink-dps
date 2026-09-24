"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/client";

const ROLE_LABELS = {
  ADMIN: "Administrador",
  ENTREPRENEUR: "Emprendedor",
  CUSTOMER: "Cliente",
};

export default function AdminUsersPage() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const snapshot = await getDocs(collection(getFirebaseDb(), "users"));

        const users = snapshot.docs
          .map((document) => ({
            id: document.id,
            ...document.data(),
          }))
          .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"));

        if (active) {
          setResult({ users, error: "" });
        }
      } catch (error) {
        if (active) {
          setResult({
            users: [],
            error: error.message,
          });
        }
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container">
      <p className="eyebrow">Panel del administrador</p>

      <h1>Usuarios registrados</h1>

      {!result && <p>Cargando usuarios...</p>}

      {result?.error && <p role="alert">{result.error}</p>}

      {result && !result.error && (
        <>
          <p>Usuarios encontrados: {result.users.length}</p>

          {result.users.length === 0 ? (
            <p>No hay usuarios registrados.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {result.users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name || "Sin nombre"}</td>

                      <td>{user.email || "—"}</td>

                      <td>{ROLE_LABELS[user.role] || user.role}</td>

                      <td>{user.active ? "Activo" : "Inactivo"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
