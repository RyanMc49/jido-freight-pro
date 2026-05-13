type ClassValue = string | number | boolean | undefined | null | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const result: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string") { result.push(input); continue; }
    if (typeof input === "number") { result.push(String(input)); continue; }
  }
  return result.join(" ");
}
