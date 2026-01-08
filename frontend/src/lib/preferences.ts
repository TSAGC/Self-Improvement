export type ThemePreference = "system" | "light" | "dark"
export type WeightUnit = "kg" | "lb"

const THEME_KEY = "si:theme"
const WEIGHT_UNIT_KEY = "si:weightUnit"
const API_URL_OVERRIDE_KEY = "si:apiUrlOverride"

const PREF_CHANGE_EVENT = "si:preferencesChanged"

function emitChange() {
  window.dispatchEvent(new Event(PREF_CHANGE_EVENT))
}

export function subscribePreferencesChange(handler: () => void) {
  window.addEventListener(PREF_CHANGE_EVENT, handler)
  return () => window.removeEventListener(PREF_CHANGE_EVENT, handler)
}

export function getThemePreference(): ThemePreference {
  const raw = window.localStorage.getItem(THEME_KEY)
  if (raw === "light" || raw === "dark" || raw === "system") return raw
  return "system"
}

export function setThemePreference(value: ThemePreference) {
  window.localStorage.setItem(THEME_KEY, value)
  emitChange()
}

export function applyThemePreference(value: ThemePreference) {
  const root = document.documentElement

  if (value === "dark") {
    root.classList.add("dark")
    return
  }

  if (value === "light") {
    root.classList.remove("dark")
    return
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
  if (prefersDark) root.classList.add("dark")
  else root.classList.remove("dark")
}

export function getWeightUnit(): WeightUnit {
  const raw = window.localStorage.getItem(WEIGHT_UNIT_KEY)
  if (raw === "kg" || raw === "lb") return raw
  return "kg"
}

export function setWeightUnit(value: WeightUnit) {
  window.localStorage.setItem(WEIGHT_UNIT_KEY, value)
  emitChange()
}

export function kgToLb(kg: number) {
  return kg * 2.2046226218
}

export function lbToKg(lb: number) {
  return lb / 2.2046226218
}

export function formatWeight(valueKg: number, unit: WeightUnit) {
  if (!Number.isFinite(valueKg)) return "--"
  if (unit === "lb") return `${Math.round(kgToLb(valueKg))} lb`
  return `${valueKg} kg`
}

export function getApiUrlOverride(): string {
  const raw = window.localStorage.getItem(API_URL_OVERRIDE_KEY)
  if (typeof raw === "string" && raw.trim().length > 0) return raw.trim()
  return ""
}

export function setApiUrlOverride(value: string) {
  const v = value.trim()
  if (!v) window.localStorage.removeItem(API_URL_OVERRIDE_KEY)
  else window.localStorage.setItem(API_URL_OVERRIDE_KEY, v)
  emitChange()
}

export function clearPreferences() {
  window.localStorage.removeItem(THEME_KEY)
  window.localStorage.removeItem(WEIGHT_UNIT_KEY)
  window.localStorage.removeItem(API_URL_OVERRIDE_KEY)
  emitChange()
}
