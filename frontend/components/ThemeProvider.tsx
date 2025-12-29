"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type ThemeMode = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: ThemeMode
  resolvedTheme: "light" | "dark"
  setTheme: (t: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = "biblio.theme"

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyThemeClass(resolved: "light" | "dark") {
  const root = document.documentElement
  if (resolved === "dark") root.classList.add("dark")
  else root.classList.remove("dark")
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null
      if (saved === "light" || saved === "dark" || saved === "system") setThemeState(saved)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const update = () => {
      const resolved = theme === "system" ? getSystemTheme() : theme
      setResolvedTheme(resolved)
      applyThemeClass(resolved)
    }

    update()

    if (theme !== "system") return
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => update()

    if (mql.addEventListener) mql.addEventListener("change", handler)
    else mql.addListener(handler)

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler)
      else mql.removeListener(handler)
    }
  }, [theme])

  const setTheme = (t: ThemeMode) => {
    setThemeState(t)
    try {
      window.localStorage.setItem(STORAGE_KEY, t)
    } catch {
      // ignore
    }
  }

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
