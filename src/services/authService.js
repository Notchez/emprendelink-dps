// Responsable: completar únicamente dentro del dominio asignado.
// Mantener acceso a datos/API fuera de los componentes visuales.
const API_URL = '/api';

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Correo o contraseña incorrectos');
    }

    return await response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Error al registrar la cuenta');
    }

    return await response.json();
  }
};