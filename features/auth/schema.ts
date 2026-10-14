export type LoginFieldErrors = {
  email?: string;
  password?: string;
};

export function validateLogin(values: {
  email: string;
  password: string;
}): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  if (!values.email.trim()) {
    errors.email = "Escribí tu email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Ingresá un email válido";
  }

  if (!values.password) {
    errors.password = "Escribí tu contraseña";
  }

  return errors;
}
