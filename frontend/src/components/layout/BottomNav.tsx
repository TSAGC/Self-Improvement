import { NavLink } from "react-router-dom"
import { BarChart3, ClipboardList, LayoutDashboard, Target } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workouts", label: "Workouts", icon: ClipboardList },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/goals", label: "Goals", icon: Target },
] as const

export function BottomNav() {
  return (
    <div className="grid grid-cols-4 px-2 py-2">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }: { isActive: boolean }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-xs text-muted-foreground",
              isActive && "bg-accent text-accent-foreground"
            )
          }
          end
        >
          <Icon className="size-4" />
          <span className="leading-none">{label}</span>
        </NavLink>
      ))}
    </div>
  )
}
