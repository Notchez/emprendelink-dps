"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { businessService } from "@/services/businessService";
import { AccountActions } from "@/components/auth/AccountActions";
import styles from "@/components/auth/Account.module.css";
export default function HomePage() {
  const [result, setResult] = useState(null);
  useEffect(() => {
    let active = true;
    businessService
      .getPublic()
      .then((businesses) => {
        if (active) setResult({ businesses });
      })
      .catch((error) => {
        if (active) setResult({ error: error.message });
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <main className={styles.page}>
      <div className="container">
        <AccountActions />
        <h1>EmprendeLink</h1>
        <p>Descubre negocios y compra directamente a sus emprendedores.</p>
        <p>
          <Link href="/registro">Crear cuenta de cliente o emprendedor</Link>
        </p>
        <h2>Negocios disponibles</h2>
        {!result && <p role="status">Cargando negocios...</p>}
        {result?.error && <p role="alert">{result.error}</p>}
        {result?.businesses?.length === 0 && <p>Todavía no hay negocios publicados.</p>}
        <ul className={styles.orders}>
          {result?.businesses?.map((business) => (
            <li key={business.id} className={styles.order}>
              <h3>{business.name}</h3>
              <Link href={`/catalogo/${encodeURIComponent(business.slug)}`}>Ver catálogo</Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
