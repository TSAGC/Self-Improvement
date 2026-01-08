import { Link } from "react-router-dom"

export function DashboardPage() {
  const todaysWorkout = {
    name: "Push Day (Strength)",
    exercisesCount: 6,
    estimatedMinutes: 55,
  }

  const stats = {
    weeklyWorkouts: 4,
    streakDays: 12,
    lastPr: "Bench Press 100kg x 3",
    weeklyVolumeKg: 12450,
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Today’s focus, momentum, and quick actions.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/workout/active"
            className="si-btn inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Start Workout
          </Link>
          <Link
            to="/workouts"
            className="si-btn inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium text-card-foreground hover:bg-accent"
          >
            Workouts
          </Link>
        </div>
      </div>

      <section className="mt-6">
        <div className="si-surface si-card rounded-2xl p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-medium text-muted-foreground">
                Today’s Workout
              </div>
              <div className="si-float mt-2 text-2xl font-semibold tracking-tight">
                {todaysWorkout.name}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {todaysWorkout.exercisesCount} exercises
                </div>
                <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  ~{todaysWorkout.estimatedMinutes} min
                </div>
                <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  Strength focus
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Warm-up ready. Log fast. Stay in the zone.
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-60">
              <Link
                to="/workout/active"
                className="si-btn inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Start Workout
              </Link>
              <div className="rounded-xl border border-border bg-background p-3">
                <div className="text-xs text-muted-foreground">Estimated duration</div>
                <div className="mt-1 text-lg font-semibold">
                  {todaysWorkout.estimatedMinutes} min
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="text-xs text-muted-foreground">Next exercise</div>
              <div className="mt-1 text-sm font-semibold">Bench Press</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="text-xs text-muted-foreground">Session goal</div>
              <div className="mt-1 text-sm font-semibold">Beat last week’s reps</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="text-xs text-muted-foreground">Readiness</div>
              <div className="mt-1 text-sm font-semibold">Good</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Stats</h2>
          <div className="text-xs text-muted-foreground">This week</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="si-surface si-card rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Workouts completed</div>
            <div className="mt-2 text-2xl font-semibold">{stats.weeklyWorkouts}</div>
            <div className="mt-1 text-xs text-muted-foreground">Target: 5</div>
          </div>

          <div className="si-surface si-card rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Current streak</div>
            <div className="mt-2 text-2xl font-semibold">{stats.streakDays} days</div>
            <div className="mt-1 text-xs text-muted-foreground">Keep it alive today</div>
          </div>

          <div className="si-surface si-card rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Last PR</div>
            <div className="mt-2 truncate text-sm font-semibold">{stats.lastPr}</div>
            <div className="mt-1 text-xs text-muted-foreground">Nice work</div>
          </div>

          <div className="si-surface si-card rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Total volume</div>
            <div className="mt-2 text-2xl font-semibold">
              {stats.weeklyVolumeKg.toLocaleString()} kg
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Across all lifts</div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Quick actions</h2>
          <div className="text-xs text-muted-foreground">Get things done fast</div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Link
            to="/workouts"
            className="si-card group rounded-xl border border-border bg-card p-4 hover:bg-accent"
          >
            <div className="text-sm font-semibold">Create workout</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Build a template in under a minute.
            </div>
            <div className="mt-4 h-1 w-14 rounded-full bg-primary/70 transition-all group-hover:w-20" />
          </Link>

          <Link
            to="/progress"
            className="si-card group rounded-xl border border-border bg-card p-4 hover:bg-accent"
          >
            <div className="text-sm font-semibold">View progress</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Charts, PRs, and trends.
            </div>
            <div className="mt-4 h-1 w-14 rounded-full bg-primary/70 transition-all group-hover:w-20" />
          </Link>

          <Link
            to="/goals"
            className="si-card group rounded-xl border border-border bg-card p-4 hover:bg-accent"
          >
            <div className="text-sm font-semibold">Set a goal</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Choose what “winning” looks like.
            </div>
            <div className="mt-4 h-1 w-14 rounded-full bg-primary/70 transition-all group-hover:w-20" />
          </Link>
        </div>
      </section>
    </div>
  )
}
