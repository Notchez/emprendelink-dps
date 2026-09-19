"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor llena todos los campos");
      return;
    }
    setError("");

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "40px 30px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "#2563eb", fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
          EmprendeLink
        </h1>
        <h2 style={{ color: "#0f172a", fontSize: "20px", fontWeight: "bold", marginBottom: "6px" }}>
          Bienvenido de nuevo
        </h2>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
          Ingresa a tu cuenta para continuar
        </p>

        {error && (
          <div
            style={{
              color: "#dc2626",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "14px",
              width: "100%",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Correo Electronico
            </label>
            <input
              type="email"
              placeholder="Ingresa tu correo electronico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <a
              href="#"
              style={{
                color: "#2563eb",
                fontSize: "12px",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            Iniciar sesion
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
          <span style={{ padding: "0 10px", color: "#64748b", fontSize: "12px" }}>
            o continuar con
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
        </div>

        <button
          type="button"
          style={{
            width: "100%",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "24px",
          }}
        >
          continuar con google
        </button>

        <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
          ¿No tienes una cuenta?{" "}
          <Link
            href="/registro"
            style={{ color: "#2563eb", textDecoration: "none", fontWeight: "bold" }}
          >
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
