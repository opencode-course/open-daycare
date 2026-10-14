export type AddKidValues = {
  name: string;
  birthDate: string;
  classroom: string;
  allergies: string;
  notes: string;
};

export type AddKidErrors = Partial<
  Record<"name" | "birthDate" | "classroom", string>
>;

export type BirthDateError = "empty" | "invalid" | "future";

export const allergyTagLabels: Readonly<Record<string, string>> = {
  peanut: "Maní",
  lactose: "Lactosa",
  gluten: "Gluten",
  egg: "Huevo",
  sesame: "Sésamo",
  soy: "Soja",
};

const allergyTagCodes: Readonly<Record<string, string>> = {
  maní: "peanut",
  peanut: "peanut",
  lactosa: "lactose",
  lactose: "lactose",
  gluten: "gluten",
  huevo: "egg",
  egg: "egg",
  sésamo: "sesame",
  sesame: "sesame",
  soja: "soy",
  soy: "soy",
};

export function parseAllergyTags(input: string): string[] {
  const tags = input
    .split(",")
    .map((tag) => tag.trim().toLocaleLowerCase("es"))
    .filter(Boolean)
    .map((tag) => allergyTagCodes[tag] ?? tag);

  return [...new Set(tags)];
}

export function validateBirthDate(value: string): BirthDateError | null {
  if (!value.trim()) {
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

export function validateAddKid(values: AddKidValues): AddKidErrors {
  const birthDateError = validateBirthDate(values.birthDate);

  return {
    name: values.name.trim() ? undefined : "Ingresá el nombre",
    birthDate:
      birthDateError === "empty"
        ? "Ingresá la fecha de nacimiento"
        : birthDateError === "invalid"
          ? "La fecha no es válida"
          : birthDateError === "future"
            ? "La fecha no puede ser posterior a hoy"
            : undefined,
    classroom: values.classroom.trim() ? undefined : "Elegí una sala",
  };
}
