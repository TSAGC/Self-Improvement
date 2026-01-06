export function ProgressPage() {
  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Placeholder. This will show charts and PRs.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="h-40 rounded-lg bg-muted" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="h-40 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}
