import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useRef } from "react"

import { BottomNav } from "@/components/layout/BottomNav"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"

export function AppLayout() {
  const location = useLocation()
  const isWorkoutFocus = /^\/workout\//.test(location.pathname)
  const lockedPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isWorkoutFocus) {
      lockedPathRef.current = null
      return
    }

    lockedPathRef.current = location.pathname

    const onPopState = () => {
      if (!lockedPathRef.current) return
      if (window.location.pathname !== lockedPathRef.current) {
        window.history.pushState(null, "", lockedPathRef.current)
      }
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    window.history.pushState(null, "", location.pathname)
    window.addEventListener("popstate", onPopState)
    window.addEventListener("beforeunload", onBeforeUnload)

    return () => {
      window.removeEventListener("popstate", onPopState)
      window.removeEventListener("beforeunload", onBeforeUnload)
    }
  }, [isWorkoutFocus, location.pathname])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="flex min-h-dvh">
        {!isWorkoutFocus ? (
          <aside className="hidden w-64 border-r border-border bg-card md:flex">
            <Sidebar />
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TopBar compact={isWorkoutFocus} />
          </header>

          <main className={isWorkoutFocus ? "flex-1" : "flex-1 pb-16 md:pb-0"}>
            <div
              key={location.pathname}
              className="h-full w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {!isWorkoutFocus ? (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:hidden">
          <BottomNav />
        </nav>
      ) : null}
    </div>
  )
}
