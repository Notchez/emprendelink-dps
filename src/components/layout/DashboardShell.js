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
          <strong>EmprendeLink</strong> · DPS941
        </span>
      }
    >
      <AppContent>{children}</AppContent>
    </DashboardLayout>
  );
}
