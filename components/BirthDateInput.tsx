"use client";

export type BirthDateError = "empty" | "invalid" | "future";

type BirthDateInputProps = {
  id: string;
  name: string;
  value: string;
  className: string;
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

export function validateBirthDate(value: string): BirthDateError | null {
  if (!value) {
    return "empty";
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);

  if (!match) {
    return "invalid";
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (year < 1 || month < 1 || month > 12) {
    return "invalid";
  }

  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1];

  if (day < 1 || day > daysInMonth) {
    return "invalid";
  }

  const today = new Date();

  if (
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth() + 1) ||
    (year === today.getFullYear() &&
      month === today.getMonth() + 1 &&
      day > today.getDate())
  ) {
    return "future";
  }

  return null;
}

export function BirthDateInput({
  id,
  name,
  value,
  className,
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
