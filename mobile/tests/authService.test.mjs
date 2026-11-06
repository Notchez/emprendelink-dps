import assert from "node:assert/strict";
import test from "node:test";
import { createAuthService } from "../src/services/authService.js";
import { failure, success } from "../src/services/serviceResponse.js";

function fixture(profile = { id: "uid_1", role: "CUSTOMER", active: true }) {
  const auth = { currentUser: { uid: "uid_1", email: "user@example.test", getIdToken: async () => "token" } };
  let signedOut = false;
  const dependencies = {
    auth,
    userService: { getById: async () => success(profile), create: async (uid, values) => success({ id: uid, active: true, ...values }) },
    signInWithEmailAndPassword: async () => ({ user: auth.currentUser }),
    createUserWithEmailAndPassword: async () => ({ user: auth.currentUser }),
    signInWithCredential: async () => ({ user: auth.currentUser }),
    signOut: async () => { signedOut = true; },
    onAuthStateChanged: (_auth, listener) => { listener(auth.currentUser); return () => {}; },
    GoogleAuthProvider: { credential: (token) => ({ token }) },
  };
  return { dependencies, wasSignedOut: () => signedOut };
}

test("login devuelve el perfil activo de Firestore", async () => {
  const { dependencies } = fixture();
  const result = await createAuthService({ loadDependencies: async () => dependencies }).login({ email: "USER@example.test", password: "secret" });
  assert.equal(result.success, true);
  assert.equal(result.data.user.id, "uid_1");
  assert.equal(result.data.profileRequired, false);
});

test("registro crea Auth y perfil con el mismo UID", async () => {
  const { dependencies } = fixture();
  let created;
  dependencies.userService.create = async (uid, values) => {
    created = { uid, values };
    return success({ id: uid, role: values.role, active: true });
  };
  const result = await createAuthService({ loadDependencies: async () => dependencies }).register({
    email: "new@example.test", password: "Demo1234", role: "CUSTOMER", name: "Nueva cuenta",
  });
  assert.equal(result.success, true);
  assert.equal(created.uid, "uid_1");
  assert.equal(result.data.user.id, "uid_1");
});

test("una identidad Google sin perfil solicita completar datos", async () => {
  const { dependencies } = fixture(null);
  const service = createAuthService({ loadDependencies: async () => dependencies, loadGoogle: async () => ({ GoogleSignin: { hasPlayServices: async () => {}, signIn: async () => ({ data: { idToken: "google-token" } }) } }) });
  const result = await service.loginWithGoogle();
  assert.equal(result.success, true);
  assert.equal(result.data.profileRequired, true);
});

test("una cuenta desactivada se cierra y no obtiene sesión", async () => {
  const data = fixture({ id: "uid_1", role: "CUSTOMER", active: false });
  const result = await createAuthService({ loadDependencies: async () => data.dependencies }).login({ email: "user@example.test", password: "secret" });
  assert.equal(result.error.code, "ACCOUNT_DISABLED");
  assert.equal(data.wasSignedOut(), true);
});

test("getIdToken falla sin usuario autenticado", async () => {
  const { dependencies } = fixture();
  dependencies.auth.currentUser = null;
  const service = createAuthService({ loadDependencies: async () => dependencies });
  assert.deepEqual(await service.getIdToken(), failure("AUTH_REQUIRED", "Debes iniciar sesión."));
});

test("logout elimina la sesión mediante Firebase Auth", async () => {
  const data = fixture();
  const result = await createAuthService({ loadDependencies: async () => data.dependencies }).logout();
  assert.equal(result.success, true);
  assert.equal(data.wasSignedOut(), true);
});

test("subscribe restaura una sesión persistida y su perfil", async () => {
  const { dependencies } = fixture();
  let onAuthStateChanged;
  dependencies.onAuthStateChanged = (_auth, listener) => {
    onAuthStateChanged = listener;
    return () => {};
  };
  const events = [];
  await createAuthService({ loadDependencies: async () => dependencies }).subscribe((result) => events.push(result));

  await onAuthStateChanged(dependencies.auth.currentUser);

  assert.equal(events.length, 1);
  assert.equal(events[0].success, true);
  assert.equal(events[0].data.identity.uid, "uid_1");
  assert.equal(events[0].data.user.id, "uid_1");
});

test("un fallo temporal de Firestore conserva la identidad autenticada y permite recuperar el perfil", async () => {
  const { dependencies, wasSignedOut } = fixture();
  let onAuthStateChanged;
  let profileAvailable = false;
  dependencies.onAuthStateChanged = (_auth, listener) => {
    onAuthStateChanged = listener;
    return () => {};
  };
  dependencies.userService.getById = async () => profileAvailable
    ? success({ id: "uid_1", role: "CUSTOMER", active: true })
    : failure("USER_READ_ERROR", "Firestore no disponible.");
  const events = [];
  const service = createAuthService({ loadDependencies: async () => dependencies });
  await service.subscribe((result, authenticatedIdentity) => events.push({ result, authenticatedIdentity }));

  await onAuthStateChanged(dependencies.auth.currentUser);
  assert.equal(events[0].result.success, false);
  assert.equal(events[0].authenticatedIdentity.uid, "uid_1");
  assert.equal(wasSignedOut(), false);

  profileAvailable = true;
  const recovered = await service.restoreSession();
  assert.equal(recovered.success, true);
  assert.equal(recovered.data.user.id, "uid_1");
});

test("subscribe publica una sesión vacía ante un cierre de sesión real", async () => {
  const { dependencies } = fixture();
  let onAuthStateChanged;
  dependencies.onAuthStateChanged = (_auth, listener) => {
    onAuthStateChanged = listener;
    return () => {};
  };
  const events = [];
  await createAuthService({ loadDependencies: async () => dependencies }).subscribe((result) => events.push(result));

  await onAuthStateChanged(null);

  assert.deepEqual(events, [success({ identity: null, user: null, profileRequired: false })]);
});

test("una consulta de perfil antigua no sobrescribe un logout reciente", async () => {
  const { dependencies } = fixture();
  let onAuthStateChanged;
  let finishProfileRead;
  dependencies.onAuthStateChanged = (_auth, listener) => {
    onAuthStateChanged = listener;
    return () => {};
  };
  dependencies.userService.getById = () => new Promise((resolve) => { finishProfileRead = resolve; });
  const events = [];
  await createAuthService({ loadDependencies: async () => dependencies }).subscribe((result) => events.push(result));

  const oldRestoration = onAuthStateChanged(dependencies.auth.currentUser);
  await onAuthStateChanged(null);
  finishProfileRead(success({ id: "uid_1", role: "CUSTOMER", active: true }));
  await oldRestoration;

  assert.deepEqual(events, [success({ identity: null, user: null, profileRequired: false })]);
});
