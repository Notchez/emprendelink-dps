import { failure, success } from "./serviceResponse.js";

const AUTH_MESSAGES = {
  "auth/email-already-in-use": "Ya existe una cuenta con este correo.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/invalid-email": "El correo electrónico no es válido.",
  "auth/network-request-failed": "No hay conexión con Firebase. Revisa tu red.",
  "auth/too-many-requests": "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  "auth/weak-password": "La contraseña no cumple los requisitos de seguridad.",
};

function authFailure(error, fallback) {
  return failure(error?.code || "AUTH_ERROR", AUTH_MESSAGES[error?.code] || error?.message || fallback);
}

function loadFirebaseDependencies() {
  const firebaseAuth = require("firebase/auth");
  const firebaseClient = require("../lib/firebase/client.js");
  const users = require("./userService.js");
  return {
    auth: firebaseClient.getFirebaseAuth(),
    userService: users.userService,
    createUserWithEmailAndPassword: firebaseAuth.createUserWithEmailAndPassword,
    onAuthStateChanged: firebaseAuth.onAuthStateChanged,
    signInWithCredential: firebaseAuth.signInWithCredential,
    signInWithEmailAndPassword: firebaseAuth.signInWithEmailAndPassword,
    signOut: firebaseAuth.signOut,
    GoogleAuthProvider: firebaseAuth.GoogleAuthProvider,
  };
}

function loadGoogleSignIn() {
  const { GoogleSignin } = require("@react-native-google-signin/google-signin");
  GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
  return { GoogleSignin };
}

export function createAuthService({ loadDependencies = loadFirebaseDependencies, loadGoogle = loadGoogleSignIn } = {}) {
  async function resolveSession(identity, dependencies) {
    const profileResult = await dependencies.userService.getById(identity.uid);
    if (!profileResult.success) return profileResult;
    if (!profileResult.data) return success({ identity, user: null, profileRequired: true });
    if (profileResult.data.active !== true) {
      await dependencies.signOut(dependencies.auth);
      return failure("ACCOUNT_DISABLED", "Esta cuenta está desactivada.");
    }
    return success({ identity, user: profileResult.data, profileRequired: false });
  }

  return {
    async login({ email, password }) {
      try {
        const dependencies = await loadDependencies();
        const credential = await dependencies.signInWithEmailAndPassword(
          dependencies.auth,
          String(email).trim().toLowerCase(),
          password
        );
        return resolveSession(credential.user, dependencies);
      } catch (error) {
        return authFailure(error, "No se pudo iniciar sesión.");
      }
    },

    async register(values) {
      try {
        const dependencies = await loadDependencies();
        const credential = await dependencies.createUserWithEmailAndPassword(
          dependencies.auth,
          String(values.email).trim().toLowerCase(),
          values.password
        );
        const identity = credential.user;
        const profileResult = await dependencies.userService.create(identity.uid, values);
        if (!profileResult.success) return profileResult;
        return success({ identity, user: profileResult.data, profileRequired: false });
      } catch (error) {
        return authFailure(error, "No se pudo crear la cuenta.");
      }
    },

    async loginWithGoogle() {
      try {
        const dependencies = await loadDependencies();
        const { GoogleSignin } = await loadGoogle();
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();
        const idToken = response?.data?.idToken || response?.idToken;
        if (!idToken) throw new Error("Google no devolvió un token de identidad.");
        const googleCredential = dependencies.GoogleAuthProvider.credential(idToken);
        const credential = await dependencies.signInWithCredential(dependencies.auth, googleCredential);
        return resolveSession(credential.user, dependencies);
      } catch (error) {
        const message = String(error?.message || "");
        if (message.includes("native module") || message.includes("RNGoogleSignin")) {
          return failure("GOOGLE_BUILD_REQUIRED", "Google Sign-In requiere un development build; no funciona en Expo Go.");
        }
        return authFailure(error, "No se pudo iniciar sesión con Google.");
      }
    },

    async completeProfile(values) {
      try {
        const dependencies = await loadDependencies();
        const identity = dependencies.auth.currentUser;
        if (!identity) return failure("AUTH_REQUIRED", "La sesión ya no está disponible.");
        const result = await dependencies.userService.create(identity.uid, {
          ...values,
          email: identity.email || values.email,
        });
        if (!result.success) return result;
        return success({ identity, user: result.data, profileRequired: false });
      } catch (error) {
        return authFailure(error, "No se pudo completar el perfil.");
      }
    },

    async logout() {
      try {
        const dependencies = await loadDependencies();
        await dependencies.signOut(dependencies.auth);
        return success(null);
      } catch (error) {
        return authFailure(error, "No se pudo cerrar la sesión.");
      }
    },

    async getIdToken() {
      try {
        const dependencies = await loadDependencies();
        if (!dependencies.auth.currentUser) return failure("AUTH_REQUIRED", "Debes iniciar sesión.");
        return success(await dependencies.auth.currentUser.getIdToken());
      } catch (error) {
        return authFailure(error, "No se pudo autorizar la solicitud.");
      }
    },

    async restoreSession() {
      try {
        const dependencies = await loadDependencies();
        const identity = dependencies.auth.currentUser;
        if (!identity) return success({ identity: null, user: null, profileRequired: false });
        return resolveSession(identity, dependencies);
      } catch (error) {
        return authFailure(error, "No se pudo restaurar la sesión.");
      }
    },

    async subscribe(listener) {
      const dependencies = await loadDependencies();
      let revision = 0;
      const unsubscribe = dependencies.onAuthStateChanged(dependencies.auth, async (identity) => {
        const currentRevision = ++revision;
        if (!identity) return listener(success({ identity: null, user: null, profileRequired: false }));
        const result = await resolveSession(identity, dependencies);
        if (currentRevision !== revision) return;
        const recoverableIdentity = result.error?.code === "USER_READ_ERROR" ? identity : null;
        listener(result, recoverableIdentity);
      });
      return () => {
        revision += 1;
        unsubscribe();
      };
    },
  };
}

export const authService = createAuthService();
