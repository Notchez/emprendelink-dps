"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AccountActions } from "@/components/auth/AccountActions";
import { adminMenuItems, entrepreneurMenuItems } from "@/lib/navigation/dashboardMenus";

import "bootstrap/dist/css/bootstrap.min.css";
import "./DashboardShell.css";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function readSavedValue(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function isActivePath(pathname, href) {
  if (href === "/admin" || href === "/emprendedor") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarItem({ item, pathname, onNavigate, collapsed, depth = 0 }) {
  const hasActiveChild = item.type === "group" && item.children.some(
    (child) => child.href && isActivePath(pathname, child.href)
  );
  const [expanded, setExpanded] = useState(Boolean(hasActiveChild));

  if (item.type === "header") {
    return <li className="el-nav-header">{item.text}</li>;
  }

  if (item.type === "group") {
    return (
      <li className="el-nav-group">
        <button
          type="button"
          className={`el-nav-link ${hasActiveChild ? "el-nav-parent-active" : ""}`}
          onClick={() => setExpanded((previous) => !previous)}
          aria-expanded={expanded}
          title={collapsed ? item.text : undefined}
        >
          <i className={item.icon} aria-hidden="true" />
          <span className="el-nav-text">{item.text}</span>
          <i className={`bi bi-chevron-${expanded ? "up" : "down"} el-chevron`} aria-hidden="true" />
        </button>
        {expanded && (
          <ul className="el-nav-children">
            {item.children.map((child) => (
              <SidebarItem key={child.href || child.text} item={child} pathname={pathname} onNavigate={onNavigate} collapsed={collapsed} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  const active = isActivePath(pathname, item.href);
  return (
    <li className={`el-nav-item ${depth ? "el-nav-subitem" : ""}`}>
      <Link
        href={item.href}
        className={`el-nav-link ${active ? "el-nav-active" : ""}`}
        aria-current={active ? "page" : undefined}
        title={collapsed ? item.text : undefined}
        onClick={onNavigate}
      >
        <i className={item.icon} aria-hidden="true" />
        <span className="el-nav-text">{item.text}</span>
      </Link>
    </li>
  );
}

export function DashboardShell({ section, children }) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) return <div className="container" role="status">Cargando panel...</div>;

  return <DashboardShellReady section={section}>{children}</DashboardShellReady>;
}

function DashboardShellReady({ section, children }) {
  const pathname = usePathname();
  const isAdmin = section === "admin";
  const logoHref = isAdmin ? "/admin" : "/emprendedor";
  const menuItems = isAdmin ? adminMenuItems : entrepreneurMenuItems;
  const [themeMode, setThemeMode] = useState(() => {
    const stored = readSavedValue("lte-theme", "light");
    return ["light", "dark", "auto"].includes(stored) ? stored : "light";
  });
  const [collapsed, setCollapsed] = useState(() => readSavedValue("el-sidebar-collapsed", "false") === "true");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const applyMode = () => {
      document.documentElement.setAttribute(
        "data-bs-theme",
        themeMode === "auto" ? (preference.matches ? "dark" : "light") : themeMode
      );
    };
    applyMode();
    preference.addEventListener("change", applyMode);
    try { window.localStorage.setItem("lte-theme", themeMode); } catch { /* Almacenamiento no disponible. */ }
    return () => preference.removeEventListener("change", applyMode);
  }, [themeMode]);

  useEffect(() => {
    try { window.localStorage.setItem("el-sidebar-collapsed", String(collapsed)); } catch { /* Modo privado. */ }
  }, [collapsed]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  return (
    <div className={`emprendelink-dashboard el-shell ${collapsed ? "el-collapsed" : ""} ${mobileOpen ? "el-mobile-open" : ""}`}>
      <button
        className="el-sidebar-overlay"
        type="button"
        aria-label="Cerrar menú lateral"
        onClick={() => setMobileOpen(false)}
      />
      <aside className="el-sidebar app-sidebar" aria-label="Navegación del panel">
        <Link className="el-brand" href={logoHref} onClick={() => setMobileOpen(false)} title="EmprendeLink">
          <span className="el-brand-icon" aria-hidden="true"><i className="bi bi-shop-window" /></span>
          <span className="el-brand-text"><strong>Emprende</strong>Link</span>
        </Link>
        <nav className="el-nav" aria-label={isAdmin ? "Administración" : "Mi emprendimiento"}>
          <ul>
            {menuItems.map((item, index) => (
              <SidebarItem key={item.href || `${item.text}-${index}`} item={item} pathname={pathname} onNavigate={() => setMobileOpen(false)} collapsed={collapsed} />
            ))}
          </ul>
        </nav>
        <div className="el-sidebar-foot">DPS941 · EmprendeLink</div>
      </aside>

      <div className="el-main-column">
        <header className="el-header app-header">
          <button className="el-menu-toggle el-desktop-toggle" type="button" onClick={() => setCollapsed((previous) => !previous)} aria-label={collapsed ? "Expandir menú" : "Contraer menú"} aria-expanded={!collapsed}>
            <i className="bi bi-list" aria-hidden="true" />
          </button>
          <button className="el-menu-toggle el-mobile-toggle" type="button" onClick={() => setMobileOpen((previous) => !previous)} aria-label="Abrir menú" aria-expanded={mobileOpen}>
            <i className="bi bi-list" aria-hidden="true" />
          </button>
          <span className="el-header-title">{isAdmin ? "Administración" : "Panel emprendedor"}</span>
          <div className="el-header-actions">
            <label className="el-theme-control">
              <i className="bi bi-circle-half" aria-hidden="true" />
              <span className="visually-hidden">Tema visual</span>
              <select aria-label="Tema visual" value={themeMode} onChange={(event) => setThemeMode(event.target.value)}>
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="auto">Sistema</option>
              </select>
            </label>
            <AccountActions />
          </div>
        </header>

        <main className="app-main el-main" id="contenido-principal">
          <div className="app-content el-content">{children}</div>
        </main>

        <footer className="app-footer el-footer">Muchas gracias por utilizar nuestros servicios.</footer>
      </div>
    </div>
  );
}
