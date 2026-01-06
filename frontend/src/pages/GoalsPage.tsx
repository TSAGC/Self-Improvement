import { useMemo, useRef, useState } from "react"

type GoalType = "strength" | "frequency" | "time"
type GoalStatus = "active" | "completed"

type Goal = {
  id: string
  type: GoalType
  title: string
  status: GoalStatus
  current: number
  target: number
  unit: string
  subtitle: string
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function formatGoalType(type: GoalType) {
  if (type === "strength") return "Strength target"
  if (type === "frequency") return "Frequency target"
  return "Time-based goal"
}

export function GoalsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const tempIdRef = useRef(0)

  const [goals, setGoals] = useState<Goal[]>(() => [
    {
      id: "g-1",
      type: "strength",
      title: "Bench Press 110kg",
      subtitle: "Target: single @ RPE 8",
      status: "active",
      current: 100,
      target: 110,
      unit: "kg",
    },
    {
      id: "g-2",
      type: "frequency",
      title: "Train 4× per week",
      subtitle: "This week",
      status: "active",
      current: 3,
      target: 4,
      unit: "workouts",
    },
    {
      id: "g-3",
      type: "time",
      title: "Sleep 8h average",
      subtitle: "Last 7 days",
      status: "completed",
      current: 8,
      target: 8,
      unit: "hours",
    },
  ])

  const [draftType, setDraftType] = useState<GoalType>("strength")
  const [draftTitle, setDraftTitle] = useState("")
  const [draftUnit, setDraftUnit] = useState("kg")
  const [draftCurrent, setDraftCurrent] = useState<number>(0)
  const [draftTarget, setDraftTarget] = useState<number>(0)
  const [draftSubtitle, setDraftSubtitle] = useState("")

  const activeGoals = useMemo(() => goals.filter((g) => g.status === "active"), [goals])
  const completedGoals = useMemo(
    () => goals.filter((g) => g.status === "completed"),
    [goals]
  )

  function openCreate() {
    setDraftType("strength")
    setDraftTitle("")
    setDraftUnit("kg")
    setDraftCurrent(0)
    setDraftTarget(0)
    setDraftSubtitle("")
    setIsCreateOpen(true)
  }

  function closeCreate() {
    setIsCreateOpen(false)
  }

  function createGoal() {
    const title = draftTitle.trim()
    if (!title) return
    if (!Number.isFinite(draftTarget) || draftTarget <= 0) return

    tempIdRef.current += 1

    const newGoal: Goal = {
      id: `g-${tempIdRef.current}`,
      type: draftType,
      title,
      subtitle: draftSubtitle.trim() || "",
      status: "active",
      current: Math.max(0, draftCurrent),
      target: Math.max(0, draftTarget),
      unit: draftUnit.trim() || "",
    }

    setGoals((prev) => [newGoal, ...prev])
    setIsCreateOpen(false)
  }

  function GoalCard({ goal }: { goal: Goal }) {
    const progressPercent = clampPercent((goal.current / goal.target) * 100)
    const isCompleted = goal.status === "completed"

    return (
      <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="truncate text-base font-semibold">{goal.title}</div>
              <span
                className={
                  isCompleted
                    ? "rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary"
                    : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                }
              >
                {isCompleted ? "Completed" : "Active"}
              </span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{formatGoalType(goal.type)}</div>
            {goal.subtitle ? (
              <div className="mt-2 text-sm text-muted-foreground">{goal.subtitle}</div>
            ) : null}
          </div>

          <div className="shrink-0 text-right">
            <div className="text-xs text-muted-foreground">Progress</div>
            <div className="mt-1 text-sm font-semibold">
              {goal.current} / {goal.target} {goal.unit}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={
                isCompleted
                  ? "h-full bg-primary"
                  : "h-full bg-primary/80"
              }
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(progressPercent)}%</span>
            <span>{isCompleted ? "Goal reached" : "Keep going"}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define targets. Track progress. Stay consistent.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Create goal
        </button>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Active</h2>
          <div className="text-xs text-muted-foreground">{activeGoals.length} goals</div>
        </div>
        <div className="grid gap-3">
          {activeGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Completed</h2>
          <div className="text-xs text-muted-foreground">{completedGoals.length} goals</div>
        </div>
        <div className="grid gap-3">
          {completedGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </section>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeCreate}
          />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-2xl border border-border bg-card p-5 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold tracking-tight">Create goal</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Choose a type and define a measurable target.
                </div>
              </div>
              <button
                type="button"
                onClick={closeCreate}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Goal type</div>
                <select
                  value={draftType}
                  onChange={(e) => {
                    const next = e.target.value as GoalType
                    setDraftType(next)
                    if (next === "strength") setDraftUnit("kg")
                    if (next === "frequency") setDraftUnit("workouts")
                    if (next === "time") setDraftUnit("hours")
                  }}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                >
                  <option value="strength">Strength target</option>
                  <option value="frequency">Frequency target</option>
                  <option value="time">Time-based goal</option>
                </select>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground">Title</div>
                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder={
                    draftType === "strength"
                      ? "e.g. Bench Press 110kg"
                      : draftType === "frequency"
                        ? "e.g. Train 4× per week"
                        : "e.g. Sleep 8h average"
                  }
                  className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                />
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground">Current</div>
                <input
                  inputMode="decimal"
                  type="number"
                  step={draftType === "strength" ? 0.5 : 1}
                  value={draftCurrent}
                  onChange={(e) => setDraftCurrent(Number(e.target.value))}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                />
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground">Target</div>
                <input
                  inputMode="decimal"
                  type="number"
                  step={draftType === "strength" ? 0.5 : 1}
                  value={draftTarget}
                  onChange={(e) => setDraftTarget(Number(e.target.value))}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                />
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground">Unit</div>
                <input
                  value={draftUnit}
                  onChange={(e) => setDraftUnit(e.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                />
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground">Subtitle (optional)</div>
                <input
                  value={draftSubtitle}
                  onChange={(e) => setDraftSubtitle(e.target.value)}
                  placeholder={
                    draftType === "strength"
                      ? "e.g. single @ RPE 8"
                      : draftType === "frequency"
                        ? "e.g. this week"
                        : "e.g. last 7 days"
                  }
                  className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 md:flex-row md:justify-end">
              <button
                type="button"
                onClick={closeCreate}
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createGoal}
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
