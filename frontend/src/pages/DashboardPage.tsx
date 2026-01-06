import { Link } from "react-router-dom"

export function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Today’s focus and quick actions.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Today’s Workout</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Placeholder. This will become your “Start / Continue workout” card.
              </div>
            </div>

            <Link
              to="/workout/active"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start Workout
            </Link>
          </div>
          <div className="mt-4 h-24 rounded-lg bg-muted" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm font-medium">Progress Preview</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Placeholder chart area.
          </div>
          <div className="mt-4 h-24 rounded-lg bg-muted" />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-medium">Quick notes</div>
        <div className="mt-2 text-sm text-muted-foreground">
          Placeholder.
        </div>
      </div>
    </div>
  )
}
