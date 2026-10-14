"use client";

import {
  validateBirthDate,
  type BirthDateError,
} from "@/features/kids/schema";

type BirthDateInputProps = {
  id: string;
  name: string;
  value: string;
  className: string;
  error?: string;
  onChange: (value: string) => void;
};

export function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);

  if (digits.length < 2) {
    return digits;
  }

  if (digits.length === 2) {
    return `${digits}/`;
  }

  if (digits.length < 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  if (digits.length === 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}/`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function BirthDateInput({
  id,
  name,
  value,
  className,
  error,
  onChange,
}: BirthDateInputProps) {
  function handleChange(raw: string) {
    onChange(formatDateInput(raw));
  }

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="bday"
      maxLength={10}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      value={value}
      onChange={(event) => handleChange(event.target.value)}
      onPaste={(event) => {
        event.preventDefault();
        handleChange(event.clipboardData.getData("text"));
      }}
      placeholder="dd/mm/aaaa"
      className={className}
    />
  );
}
