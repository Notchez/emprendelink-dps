"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { AccountActions } from "@/components/auth/AccountActions";

import { AppContent, DashboardLayout } from "@adminlte/react";

import {
  adminMenuItems,
  entrepreneurMenuItems,
  customerMenuItems,
} from "@/lib/navigation/dashboardMenus";

import "@adminlte/react/css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./DashboardShell.css";

function DashboardLink({ href, children, ...props }) {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}

const subscribe = () => () => {};

const getClientSnapshot = () => true;

const getServerSnapshot = () => false;

const emptyUser = {
  name: "",
  image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
};

function readSavedMode() {
  try {
    const saved = window.localStorage.getItem("lte-theme");

    return ["light", "dark", "auto"].includes(saved) ? saved : "light";
  } catch {
    return "light";
  }
}

export function DashboardShell(props) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div className="container" role="status">
        Cargando panel...
      </div>
    );
  }

  return <DashboardShellReady {...props} />;
}

function DashboardShellReady({ section, children }) {
  const [initialMode] = useState(readSavedMode);

  useEffect(() => {
    void import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  const menuItems =
    section === "admin"
      ? adminMenuItems
      : section === "customer"
        ? customerMenuItems
        : entrepreneurMenuItems;

  const logoHref =
    section === "admin" ? "/admin" : section === "customer" ? "/cliente" : "/emprendedor";

  return (
    <>
      <style jsx global>{`
        .app-header button[title="Fullscreen"],
        .app-header button[title="Exit fullscreen"] {
          display: none !important;
        }
        m .app-header kbd {
          display: none !important;
        }

        .app-header .navbar-search .input-group {
          overflow: hidden;
          border: 1px solid var(--bs-border-color);
          border-radius: 999px;
          background: var(--bs-body-bg);
          box-shadow: none;
        }

        .app-header .navbar-search .form-control {
          min-width: 220px;
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .app-header .navbar-search .input-group-text,
        .app-header .navbar-search .btn-navbar {
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .app-header .navbar-search .form-control::placeholder {
          color: var(--bs-secondary-color);
        }

        .el-topbar-account {
          padding-left: 0.5rem;
        }

        .accountActions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .accountNameLink {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.35rem 0.45rem;
          border-radius: 999px;
          color: inherit;
          text-decoration: none;
          transition:
            background-color 0.2s ease,
            color 0.2s ease;
        }

        .accountNameLink:hover {
          background: rgba(127, 127, 127, 0.12);
          color: inherit;
        }

        .accountNameBadge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.15rem;
          height: 2.15rem;
          border-radius: 999px;
          background: #2563eb;
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .accountNameText {
          display: flex;
          flex-direction: column;
          line-height: 1.05;
        }

        .accountNameText small {
          margin: 0;
          color: var(--bs-secondary-color);
          font-size: 0.7rem;
          font-weight: 600;
        }

        .accountNameText strong {
          max-width: 150px;
          overflow: hidden;
          font-size: 0.95rem;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .logoutActionButton {
          padding: 0.6rem 0.95rem;
          border: 1px solid transparent;
          border-radius: 0.8rem;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1;
          box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22);
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            opacity 0.15s ease;
        }

        .logoutActionButton:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.28);
        }

        .logoutActionButton:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .accountActionError {
          color: #dc3545;
          font-size: 0.82rem;
          font-weight: 600;
        }

        @media (max-width: 991.98px) {
          .app-header .navbar-search .form-control {
            min-width: 150px;
          }

          .accountNameText strong {
            max-width: 110px;
          }
        }

        @media (max-width: 767.98px) {
          .app-header .navbar-search .form-control {
            min-width: 110px;
          }

          .accountNameText {
            display: none;
          }

          .logoutActionButton {
            padding: 0.55rem 0.8rem;
            font-size: 0.82rem;
          }

          /* ========================= RESPONSIVE TOPBAR ========================= */

          .app-header .container-fluid {
            min-width: 0;
          }

          .app-header .navbar-nav {
            min-width: 0;
          }

          @media (max-width: 767.98px) {
            .app-header .container-fluid {
              flex-wrap: nowrap;
              padding-left: 0.5rem;
              padding-right: 0.5rem;
            }

            .app-header .navbar-nav.ms-auto {
              align-items: center;
              gap: 0.25rem;
              flex-shrink: 1;
            }

            /* Buscador compacto: solo lupa */
            .app-header .navbar-nav.ms-auto > li:first-child {
              margin-right: 0.15rem !important;
            }

            .app-header .navbar-nav.ms-auto > li:first-child button {
              width: 42px;
              height: 42px;
              padding: 0 !important;
              justify-content: center;
              border-radius: 50% !important;
            }

            /* Cuenta: solo avatar */
            .accountNameLink {
              padding: 0.2rem;
            }

            .accountNameText {
              display: none !important;
            }

            .accountNameBadge {
              width: 40px;
              height: 40px;
            }

            .accountActions {
              flex-wrap: nowrap;
              gap: 0.35rem;
            }

            /* Cerrar sesión se vuelve botón de icono */
            .logoutActionButton {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 42px;
              height: 42px;
              padding: 0;
              border-radius: 50%;
            }

            .logoutText {
              display: none;
            }

            .logoutActionButton i {
              font-size: 1.15rem;
            }

            /* Evitar que cualquier elemento ensanche la página */
            .emprendelink-dashboard .app-wrapper,
            .emprendelink-dashboard .app-main,
            .emprendelink-dashboard .app-content {
              min-width: 0;
              max-width: 100%;
            }
          }
        }
      `}</style>

      <DashboardLayout
        menuItems={menuItems}
        topbarEnd={
          <li className="nav-item d-flex align-items-center el-topbar-account">
            <AccountActions />
          </li>
        }
        logo={
          <span>
            <strong>Emprende</strong>Link
          </span>
        }
        logoHref={logoHref}
        sidebarTheme="dark"
        sidebarClass="bg-dark shadow"
        sidebarMini
        fixedHeader
        fixedSidebar
        colorModeToggle
        initialColorMode={initialMode}
        user={emptyUser}
        enableSidebarPersistence
        navbarClass="bg-body border-bottom"
        bodyClass="emprendelink-dashboard"
        linkComponent={DashboardLink}
        footer={
          <span>
            <strong> Muchas gracias por utilizar nuestros servicios</strong>
          </span>
        }
      >
        <AppContent>{children}</AppContent>
      </DashboardLayout>
    </>
  );
}
