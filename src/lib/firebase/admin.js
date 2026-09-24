import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const APP_NAME = "emprendelink-server";

function getAdminApp() {
  const existingApp = getApps().find((app) => app.name === APP_NAME);

  if (existingApp) {
    return existingApp;
  }

  const credentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!credentials) {
    throw new Error("Faltan las credenciales del servidor de Firebase.");
  }

  return initializeApp(
    {
      credential: cert(JSON.parse(credentials)),
    },
    APP_NAME
  );
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
