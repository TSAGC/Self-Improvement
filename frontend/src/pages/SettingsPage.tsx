import { useEffect, useState } from "react"

import {
  clearPreferences,
  getApiUrlOverride,
  getThemePreference,
  getWeightUnit,
  setApiUrlOverride,
  setThemePreference,
  setWeightUnit,
  subscribePreferencesChange,
} from "@/lib/preferences"

import type { ThemePreference, WeightUnit } from "@/lib/preferences"

export function SettingsPage() {
  const [theme, setTheme] = useState<ThemePreference>(() => getThemePreference())
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>(() => getWeightUnit())
  const [apiUrlOverride, setApiUrlOverrideState] = useState(() => getApiUrlOverride())

  useEffect(() => {
    return subscribePreferencesChange(() => {
      setTheme(getThemePreference())
      setWeightUnitState(getWeightUnit())
      setApiUrlOverrideState(getApiUrlOverride())
    })
  }, [])

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Theme, units, and app preferences.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="si-surface si-card rounded-2xl p-5">
          <div className="text-sm font-semibold">Appearance</div>
          <div className="mt-1 text-sm text-muted-foreground">Choose your theme.</div>

          <div className="mt-4">
            <div className="text-xs font-medium text-muted-foreground">Theme</div>
            <select
              value={theme}
              onChange={(e) => {
                const next = e.target.value as ThemePreference
                setThemePreference(next)
              }}
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
            >
              <option value="system">System</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>

        <div className="si-surface si-card rounded-2xl p-5">
          <div className="text-sm font-semibold">Units</div>
          <div className="mt-1 text-sm text-muted-foreground">Control how values are displayed.</div>

          <div className="mt-4">
            <div className="text-xs font-medium text-muted-foreground">Weight unit</div>
            <select
              value={weightUnit}
              onChange={(e) => {
                const next = e.target.value as WeightUnit
                setWeightUnit(next)
              }}
              className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>
        </div>

        <div className="si-surface si-card rounded-2xl p-5 md:col-span-2">
          <div className="text-sm font-semibold">Developer</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Override the backend API base URL (useful for testing).
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="text-xs font-medium text-muted-foreground">API URL override</div>
              <input
                value={apiUrlOverride}
                onChange={(e) => setApiUrlOverrideState(e.target.value)}
                placeholder="e.g. http://localhost:4000"
                className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                Leave empty to use <code>VITE_API_URL</code> or the default.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setApiUrlOverride(apiUrlOverride)}
              className="si-btn inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </div>

        <div className="si-surface si-card rounded-2xl p-5 md:col-span-2">
          <div className="text-sm font-semibold">Data</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Clear locally stored preferences.
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => clearPreferences()}
              className="si-btn inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
            >
              Reset settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
