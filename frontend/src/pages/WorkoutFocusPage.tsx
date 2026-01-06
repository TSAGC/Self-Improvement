import { useParams } from "react-router-dom"

export function WorkoutFocusPage() {
  const { id } = useParams()

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Workout</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Focus mode placeholder. Workout id: <span className="font-mono">{id}</span>
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-medium">Logging UI (placeholder)</div>
        <div className="mt-3 h-56 rounded-lg bg-muted" />
      </div>
    </div>
  )
}
