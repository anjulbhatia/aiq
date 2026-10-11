export type ThemeId = "00" | "01" | "02" | "03";

// Role → theme mapping. Single place to change.
// 00: children + parents | 01: teachers | 03: schools + authority
export const ROLE_THEME: Record<string, ThemeId> = {
  parent: "00",
  children: "00",
  home: "00",
  student: "00",
  teacher: "01",
  principal: "03",
  school: "03",
  authority: "03",
  state: "03",
};

export function themeClass(id: ThemeId): string {
  return `theme-${id}`;
}

export function roleTheme(role: string): string {
  return themeClass(ROLE_THEME[role] ?? "00");
}
