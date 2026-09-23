import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client";
import { userService } from "@/services/userService";
import { normalizeProfile, validateProfile } from "@/utils/profileValidation";
import { ROLES } from "@/lib/constants/roles";

const auth = () => getAuth(getFirebaseApp());

export function getCurrentIdentity() {
  const identity = auth().currentUser;
  return identity ? { uid: identity.uid, email: identity.email } : null;
}

export function authErrorMessage(error) {
  const messages = {
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "Correo o contraseña incorrectos.",
    "auth/wrong-password": "Correo o contraseña incorrectos.",
    "auth/email-already-in-use":
      "Ese correo ya tiene cuenta. Inicia sesión o recupera la contraseña.",
    "auth/weak-password": "Usa una contraseña más segura, de al menos 8 caracteres.",
    "auth/operation-not-allowed": "Activa Correo/Contraseña en Firebase Authentication.",
    "auth/too-many-requests": "Demasiados intentos. Espera un momento y vuelve a intentar.",
    "auth/network-request-failed": "No se pudo conectar. Revisa tu conexión.",
    "permission-denied": "No se pudo acceder al perfil. Revisa las reglas de Firestore.",
  };
  return messages[error?.code] || error?.message || "No se pudo completar la operación.";
}

export const authService = {
  observeSession(onChange, onError) {
    let stopProfile = () => {};
    const stopAuth = onAuthStateChanged(
      auth(),
      (identity) => {
        stopProfile();
        if (!identity) {
          onChange({ user: null, identity: null, loading: false });
          return;
        }
        const account = { uid: identity.uid, email: identity.email };
        onChange({ user: null, identity: account, loading: true });
        stopProfile = userService.observeProfile(
          identity.uid,
          (user) => {
            onChange({ user, identity: account, loading: false });
          },
          onError
        );
      },
      onError
    );
    return () => {
      stopProfile();
      stopAuth();
    };
  },
  async login(email, password) {
    await setPersistence(auth(), browserLocalPersistence);
    const result = await signInWithEmailAndPassword(auth(), email.trim(), password);
    const user = await userService.getProfile(result.user.uid);
    if (user && !user.active) {
      await signOut(auth());
      throw new Error("La cuenta está desactivada.");
    }
    return user;
  },
  async register(data) {
    if (![ROLES.CUSTOMER, ROLES.ENTREPRENEUR].includes(data.role))
      throw new Error("Tipo de cuenta no permitido.");
    const error = validateProfile(normalizeProfile(data, data.email), data.role);
    if (error) throw new Error(error);
    if (typeof data.password !== "string" || data.password.length < 8)
      throw new Error("La contraseña debe tener al menos 8 caracteres.");
    await setPersistence(auth(), browserLocalPersistence);
    const result = await createUserWithEmailAndPassword(
      auth(),
      data.email.trim().toLowerCase(),
      data.password
    );
    // If this write fails, the signed-in account can retry from /completar-perfil.
    return userService.createProfile(result.user, data);
  },
  async completeProfile(data) {
    const identity = auth().currentUser;
    if (!identity) throw new Error("Inicia sesión para completar tu perfil.");
    return userService.createProfile(identity, data);
  },
  logout() {
    return signOut(auth());
  },
  resetPassword(email) {
    return sendPasswordResetEmail(auth(), email.trim());
  },
  async getToken() {
    const instance = auth();
    await instance.authStateReady();
    if (!instance.currentUser) throw new Error("Debes iniciar sesión.");
    return instance.currentUser.getIdToken();
  },
};
