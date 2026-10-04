"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import Link from "next/link";

import { AccountActions } from "@/components/auth/AccountActions";

import { AppContent, DashboardLayout } from "@adminlte/react";

import { adminMenuItems, entrepreneurMenuItems } from "@/lib/navigation/dashboardMenus";

import "@adminlte/react/css";
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

  const isAdmin = section === "admin";

  const menuItems = isAdmin ? adminMenuItems : entrepreneurMenuItems;

  const logoHref = isAdmin ? "/admin" : "/emprendedor";

  return (
    <>
      <style jsx global>{`
        .app-header button[title="Fullscreen"],
        .app-header button[title="Exit fullscreen"] {
          display: none !important;
        }

        .app-header kbd {
          display: none !important;
        }

        .accountActions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: nowrap;
        }

        .accountNameLink {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.35rem 0.45rem;
          border-radius: 999px;
          color: inherit;
          text-decoration: none;
        }

        .accountNameLink:hover {
          background: rgb(127 127 127 / 12%);
          color: inherit;
        }

        .accountNameBadge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.15rem;
          height: 2.15rem;
          flex-shrink: 0;
          border-radius: 999px;
          background: #2563eb;
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 700;
        }

        .accountNameText {
          display: flex;
          flex-direction: column;
          line-height: 1.05;
        }

        .accountNameText small {
          color: var(--bs-secondary-color);
          font-size: 0.7rem;
          font-weight: 600;
        }

        .accountNameText strong {
          max-width: 150px;
          overflow: hidden;
          font-size: 0.95rem;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .logoutActionButton {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.6rem 0.95rem;
          border: 0;
          border-radius: 0.8rem;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 700;
          box-shadow: 0 8px 18px rgb(37 99 235 / 22%);
        }

        .logoutActionButton:disabled {
          opacity: 0.6;
        }

        .accountActionError {
          color: #dc3545;
          font-size: 0.8rem;
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

          .app-header .navbar-nav.ms-auto > li:first-child button {
            width: 42px;
            height: 42px;
            padding: 0 !important;
            justify-content: center;
            border-radius: 50% !important;
          }

          .accountNameText,
          .logoutText {
            display: none !important;
          }

          .accountNameLink {
            padding: 0.2rem;
          }

          .accountNameBadge,
          .logoutActionButton {
            width: 40px;
            height: 40px;
          }

          .logoutActionButton {
            justify-content: center;
            padding: 0;
            border-radius: 50%;
          }

          .emprendelink-dashboard .app-wrapper,
          .emprendelink-dashboard .app-main,
          .emprendelink-dashboard .app-content {
            min-width: 0;
            max-width: 100%;
          }
        }
      `}</style>

      <DashboardLayout
        menuItems={menuItems}
        topbarEnd={
          <li className="nav-item d-flex align-items-center">
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
            <strong>Muchas gracias por utilizar nuestros servicios</strong>
          </span>
        }
      >
        <AppContent>{children}</AppContent>
      </DashboardLayout>
    </>
  );
}
