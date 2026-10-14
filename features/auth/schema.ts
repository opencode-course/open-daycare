export type LoginFieldErrors = {
  email?: string;
  password?: string;
};

export type ActivationFieldErrors = {
  code?: string;
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

export function validateActivation(values: {
  code: string;
  email: string;
  password: string;
}): ActivationFieldErrors {
  const errors: ActivationFieldErrors = {};

  if (!values.code.trim()) {
    errors.code = "Ingresá el código";
  }

  if (!values.email.trim()) {
    errors.email = "Escribí tu email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Ingresá un email válido";
  }

  if (!values.password) {
    errors.password = "Escribí tu contraseña";
  } else if (values.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  }

  return errors;
}
