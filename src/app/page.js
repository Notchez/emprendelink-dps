"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { CustomerShell } from "@/components/customer/CustomerShell";
import { businessService } from "@/services/businessService";

import styles from "./Home.module.css";

export default function HomePage() {
  const [result, setResult] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    businessService
      .getPublic()
      .then((businesses) => {
        if (!active) return;

        setResult({
          businesses,
          error: "",
        });
      })
      .catch((error) => {
        if (!active) return;

        setResult({
          businesses: [],
          error: error instanceof Error ? error.message : "No se pudieron cargar los negocios.",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const businesses = useMemo(() => result?.businesses ?? [], [result?.businesses]);

  const filteredBusinesses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return businesses
      .filter((business) => {
        if (!query) return true;

        return String(business.name || "")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"));
  }, [businesses, search]);

  return (
    <CustomerShell>
      <div className={styles.page}>
        <header className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>EMPRENDELINK</p>

            <h1>Negocios</h1>

            <p>Descubre emprendimientos y explora sus productos.</p>
          </div>
        </header>

        <label className={styles.searchBox}>
          <i className="bi bi-search" aria-hidden="true"></i>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="¿Qué estás buscando?"
            aria-label="Buscar negocios"
          />
        </label>

        <div className={styles.resultsHeader}>
          <strong>
            {result && !result.error
              ? `${filteredBusinesses.length} ${
                  filteredBusinesses.length === 1 ? "negocio" : "negocios"
                }`
              : "Negocios"}
          </strong>
        </div>

        {!result && <div className={styles.message}>Cargando negocios...</div>}

        {result?.error && (
          <div className={styles.error} role="alert">
            {result.error}
          </div>
        )}

        {result && !result.error && businesses.length === 0 && (
          <div className={styles.message}>Todavía no hay negocios publicados.</div>
        )}

        {result && !result.error && businesses.length > 0 && filteredBusinesses.length === 0 && (
          <div className={styles.message}>No encontramos negocios con ese nombre.</div>
        )}

        <section className={styles.businessGrid} aria-label="Negocios disponibles">
          {filteredBusinesses.map((business) => (
            <Link
              className={styles.businessCard}
              href={`/catalogo/${encodeURIComponent(business.slug)}`}
              key={business.id}
            >
              <div className={styles.logo}>
                {business.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={business.logoUrl} alt={`Logotipo de ${business.name}`} />
                ) : (
                  <i className="bi bi-shop" aria-hidden="true"></i>
                )}
              </div>

              <div className={styles.businessInfo}>
                <h2>{business.name}</h2>

                <p>Emprendimiento local</p>

                <span>Catálogo disponible</span>
              </div>

              <i className={`bi bi-chevron-right ${styles.chevron}`} aria-hidden="true"></i>
            </Link>
          ))}
        </section>
      </div>
    </CustomerShell>
  );
}
