import { CalendarDays, Settings } from "lucide-react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function TopBar({ compact }: { compact?: boolean }) {
  const isWorkoutFocus = Boolean(compact)

  return (
    <div className={cn("flex items-center justify-between gap-4 px-4 py-3", compact && "py-2")}>
      <div className="min-w-0">
        <div className="truncate text-base font-semibold leading-tight">
          Self Improvement
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          <span>{formatToday()}</span>
          <span className="text-muted-foreground/60">•</span>
          <span>Streak: --</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isWorkoutFocus ? (
          <Link
            to="/dashboard"
            replace
            className="si-btn inline-flex h-9 items-center justify-center rounded-md bg-destructive px-3 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            End Workout
          </Link>
        ) : (
          <Link
            to="/settings"
            className="si-btn inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-card-foreground hover:bg-accent"
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
