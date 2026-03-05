import { parse } from "date-fns";
import { fr } from "date-fns/locale";

export function parseFrenchDate(input: string): Date {
  const withoutWeekday = input.replace(/^\w+\s/, "");
  const date = parse(withoutWeekday, "d MMMM", new Date(), { locale: fr });
  return date;
}
