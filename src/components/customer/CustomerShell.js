"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/hooks/useCart";

import { ROLES, getRoleHome } from "@/lib/constants/roles";

import styles from "./CustomerShell.module.css";

const THEME_KEY = "lte-theme";
const THEME_CHANGE_EVENT = "emprendelink-theme-change";

function getPageTitle(pathname) {
  if (pathname.startsWith("/cliente/pedidos")) return "Pedidos";
  if (pathname.startsWith("/cliente/perfil")) return "Mi perfil";
  if (pathname.startsWith("/carrito")) return "Carrito";
  if (pathname.startsWith("/checkout")) return "Finalizar compra";
  if (pathname.startsWith("/catalogo")) return "Catálogo";

  return "Negocios";
}

function getClientTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);

    if (saved === "light" || saved === "dark") {
      return saved;
    }

    if (saved === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  } catch {
    return "light";
  }
}

function getServerTheme() {
  return "light";
}

function subscribeToTheme(callback) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  window.addEventListener("storage", callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);

  media.addEventListener("change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);

    media.removeEventListener("change", callback);
  };
}

export function CustomerShell({ children }) {
  const pathname = usePathname();

  const { user, identity, loading } = useAuth();
  const { totalItemsCount } = useCart();

  const theme = useSyncExternalStore(subscribeToTheme, getClientTheme, getServerTheme);

  const isCustomer = user?.role === ROLES.CUSTOMER;

  const isPurchaseFlow =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/carrito") ||
    pathname.startsWith("/catalogo");

  const showBottomNavigation = isCustomer && !isPurchaseFlow;

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // La aplicación puede seguir funcionando sin persistencia.
    }

    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  function isActive(href) {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/catalogo");
    }

    return pathname.startsWith(href);
  }

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "Usuario";

  const accountHref = !user
    ? "/completar-perfil"
    : user.role === ROLES.CUSTOMER
      ? "/cliente/perfil"
      : getRoleHome(user.role);

  return (
    <div
      className={`${styles.shell} ${showBottomNavigation ? styles.withBottomNavigation : ""}`}
      data-theme={theme}
    >
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/">
            <strong>Emprende</strong>Link
          </Link>

          <span className={styles.mobileTitle}>{getPageTitle(pathname)}</span>

          {isCustomer && (
            <nav className={styles.desktopNavigation} aria-label="Navegación del cliente">
              <Link className={isActive("/") ? styles.activeNavigation : ""} href="/">
                Negocios
              </Link>

              <Link
                className={isActive("/cliente/pedidos") ? styles.activeNavigation : ""}
                href="/cliente/pedidos"
              >
                Pedidos
              </Link>

              <Link
                className={isActive("/cliente/perfil") ? styles.activeNavigation : ""}
                href="/cliente/perfil"
              >
                Mi perfil
              </Link>
            </nav>
          )}

          <div className={styles.actions}>
            <Link
              className={styles.iconButton}
              href="/carrito"
              aria-label={`Carrito con ${totalItemsCount} productos`}
              title="Carrito"
            >
              <i className="bi bi-cart3" aria-hidden="true"></i>

              {totalItemsCount > 0 && (
                <span className={styles.cartBadge}>
                  {totalItemsCount > 99 ? "99+" : totalItemsCount}
                </span>
              )}
            </Link>

            <button
              className={styles.iconButton}
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            >
              <i
                className={theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars"}
                aria-hidden="true"
              ></i>
            </button>

            {!loading && !identity && (
              <div className={styles.authLinks}>
                <Link href="/login">Iniciar sesión</Link>

                <Link className={styles.registerButton} href="/registro">
                  Crear cuenta
                </Link>
              </div>
            )}

            {!loading && identity && (
              <Link className={styles.accountButton} href={accountHref}>
                <span className={styles.avatar}>{firstName.charAt(0).toUpperCase()}</span>

                <span className={styles.accountText}>
                  <small>Hola</small>
                  <strong>{firstName}</strong>
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div>
          <strong>EmprendeLink</strong>

          <span>Conectando clientes con emprendimientos.</span>
        </div>
      </footer>

      {showBottomNavigation && (
        <nav className={styles.mobileNavigation} aria-label="Navegación móvil del cliente">
          <Link
            className={`${styles.mobileNavigationItem} ${isActive("/") ? styles.mobileActive : ""}`}
            href="/"
          >
            <i className="bi bi-shop" aria-hidden="true"></i>

            <span>Negocios</span>
          </Link>

          <Link
            className={`${styles.mobileNavigationItem} ${
              isActive("/cliente/pedidos") ? styles.mobileActive : ""
            }`}
            href="/cliente/pedidos"
          >
            <i className="bi bi-receipt" aria-hidden="true"></i>

            <span>Pedidos</span>
          </Link>

          <Link
            className={`${styles.mobileNavigationItem} ${
              isActive("/cliente/perfil") ? styles.mobileActive : ""
            }`}
            href="/cliente/perfil"
          >
            <i className="bi bi-person" aria-hidden="true"></i>

            <span>Mi perfil</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
