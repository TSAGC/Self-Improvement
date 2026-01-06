import { NavLink } from "react-router-dom"
import {
  BarChart3,
  ClipboardList,
  Flame,
  LayoutDashboard,
  Settings,
  Target,
} from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workouts", label: "Workouts", icon: ClipboardList },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/settings", label: "Settings", icon: Settings },
] as const

export function Sidebar() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Flame className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold leading-tight">
            Self Improvement
          </div>
          <div className="truncate text-xs text-muted-foreground leading-tight">
            Gym & habits
          </div>
        </div>
      </div>

      <div className="flex-1 px-2 py-3">
        <div className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )
              }
              end
            >
              <Icon className="size-4" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="text-xs text-muted-foreground">v0.1</div>
      </div>
    </div>
  )
}
