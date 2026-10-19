export function success(data) {
  return { success: true, data, error: null };
}

export function failure(code, message) {
  return { success: false, data: null, error: { code, message } };
}

export function wait(milliseconds = 450) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
