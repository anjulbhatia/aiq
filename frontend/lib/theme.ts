export type ThemeId = "00" | "01" | "02" | "03";

// Role → theme mapping. Single place to change.
// 00 emerald: children + parents | 01 violet: teachers
// 02 blue: school/principal | 03 zinc: state/authority
export const ROLE_THEME: Record<string, ThemeId> = {
  parent: "00",
  children: "00",
  home: "00",
  teacher: "01",
  principal: "02",
  school: "02",
  authority: "03",
  state: "03",
};

export function themeClass(id: ThemeId): string {
  return `theme-${id}`;
}

export function roleTheme(role: string): string {
  return themeClass(ROLE_THEME[role] ?? "00");
}
