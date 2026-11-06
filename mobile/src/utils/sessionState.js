export function identityChanged(previousIdentityId, nextIdentityId) {
  return previousIdentityId !== nextIdentityId;
}

export function getIdentityScopeKey(identity) {
  return identity?.uid || "anonymous";
}

export function getAuthSessionState(result, authenticatedIdentity = null) {
  if (result.success) {
    return {
      ...result.data,
      sessionError: "",
      sessionRecoverable: false,
    };
  }

  const sessionRecoverable = Boolean(authenticatedIdentity);
  return {
    identity: sessionRecoverable ? authenticatedIdentity : null,
    user: null,
    profileRequired: false,
    sessionError: result.error?.message || "No se pudo restaurar la sesión.",
    sessionRecoverable,
  };
}

export function createSessionRequestGuard(initialIdentityId = null) {
  let identityId = initialIdentityId;
  let version = 0;

  return {
    setIdentity(nextIdentityId) {
      if (!identityChanged(identityId, nextIdentityId)) return false;
      identityId = nextIdentityId;
      version += 1;
      return true;
    },

    begin() {
      version += 1;
      return { identityId, version };
    },

    isCurrent(request) {
      return request.identityId === identityId && request.version === version;
    },

    invalidate() {
      version += 1;
    },
  };
}
