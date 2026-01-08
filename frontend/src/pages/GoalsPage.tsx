import { useEffect, useMemo, useState } from "react"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api"
import { getWeightUnit } from "@/lib/preferences"

type GoalType = "strength" | "frequency" | "time"
type GoalStatus = "active" | "completed" | "canceled"

type Goal = {
  id: string
  type: GoalType
  title: string
  status: GoalStatus
  currentValue: number
  targetValue: number
  unit: string
  subtitle: string
  createdAt?: string
  completedAt?: string | null
}

type GoalsResponse = {
  items: Array<{
    id: string
    type: GoalType
    status: GoalStatus
    title: string
    subtitle: string | null
    exerciseId: string | null
    currentValue: number
    targetValue: number
    unit: string
    startDate: string | null
    endDate: string | null
    createdAt: string
    completedAt: string | null
  }>
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
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<"all" | GoalStatus>("all")
  const [typeFilter, setTypeFilter] = useState<"all" | GoalType>("all")

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const [draftType, setDraftType] = useState<GoalType>("strength")
  const [draftTitle, setDraftTitle] = useState("")
  const [draftUnit, setDraftUnit] = useState("kg")
  const [draftCurrent, setDraftCurrent] = useState<number>(0)
  const [draftTarget, setDraftTarget] = useState<number>(0)
  const [draftSubtitle, setDraftSubtitle] = useState("")

  async function refreshGoals() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGet<GoalsResponse>("/api/goals")
      const mapped: Goal[] = res.items.map((g) => ({
        id: g.id,
        type: g.type,
        title: g.title,
        status: g.status,
        currentValue: g.currentValue,
        targetValue: g.targetValue,
        unit: g.unit,
        subtitle: g.subtitle || "",
        createdAt: g.createdAt,
        completedAt: g.completedAt,
      }))
      setGoals(mapped)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load goals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshGoals()
  }, [])

  const filteredGoals = useMemo(() => {
    let list = goals
    if (statusFilter !== "all") list = list.filter((g) => g.status === statusFilter)
    if (typeFilter !== "all") list = list.filter((g) => g.type === typeFilter)
    return list
  }, [goals, statusFilter, typeFilter])

  const activeGoals = useMemo(
    () => filteredGoals.filter((g) => g.status === "active"),
    [filteredGoals]
  )
  const completedGoals = useMemo(
    () => filteredGoals.filter((g) => g.status === "completed"),
    [filteredGoals]
  )
  const canceledGoals = useMemo(
    () => filteredGoals.filter((g) => g.status === "canceled"),
    [filteredGoals]
  )

  function openCreate() {
    setDraftType("strength")
    setDraftTitle("")
    setDraftUnit(getWeightUnit() === "lb" ? "lb" : "kg")
    setDraftCurrent(0)
    setDraftTarget(0)
    setDraftSubtitle("")
    setIsCreateOpen(true)
  }

  function closeCreate() {
    setIsCreateOpen(false)
  }

  async function createGoal() {
    const title = draftTitle.trim()
    if (!title) return
    if (!Number.isFinite(draftTarget) || draftTarget <= 0) return

    setError(null)
    try {
      await apiPost<{ id: string }>("/api/goals", {
        type: draftType,
        title,
        subtitle: draftSubtitle.trim() || null,
        currentValue: Math.max(0, draftCurrent),
        targetValue: Math.max(0, draftTarget),
        unit: draftUnit.trim() || "",
      })
      setIsCreateOpen(false)
      await refreshGoals()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create goal")
    }
  }

  async function patchGoal(id: string, body: Record<string, unknown>) {
    setError(null)
    try {
      await apiPatch("/api/goals/" + id, body)
      await refreshGoals()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update goal")
    }
  }

  async function deleteGoal(id: string) {
    setError(null)
    try {
      await apiDelete("/api/goals/" + id)
      await refreshGoals()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete goal")
    }
  }

  function openEdit(goal: Goal) {
    setEditingGoal(goal)
    setDraftType(goal.type)
    setDraftTitle(goal.title)
    setDraftUnit(goal.unit)
    setDraftCurrent(goal.currentValue)
    setDraftTarget(goal.targetValue)
    setDraftSubtitle(goal.subtitle)
  }

  function closeEdit() {
    setEditingGoal(null)
  }

  async function saveEdit() {
    if (!editingGoal) return
    const title = draftTitle.trim()
    if (!title) return
    if (!Number.isFinite(draftTarget) || draftTarget <= 0) return
    await patchGoal(editingGoal.id, {
      type: draftType,
      title,
      subtitle: draftSubtitle.trim() || null,
      currentValue: Math.max(0, draftCurrent),
      targetValue: Math.max(0, draftTarget),
      unit: draftUnit.trim() || "",
    })
    setEditingGoal(null)
  }

  function GoalCard({ goal }: { goal: Goal }) {
    const progressPercent = clampPercent((goal.currentValue / goal.targetValue) * 100)
    const isCompleted = goal.status === "completed"
    const isCanceled = goal.status === "canceled"

    return (
      <div className="si-surface si-card rounded-2xl p-4 md:p-5">
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
              {goal.currentValue} / {goal.targetValue} {goal.unit}
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
            <span>{isCanceled ? "Canceled" : isCompleted ? "Goal reached" : "Keep going"}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {goal.status === "active" ? (
            <>
              <button
                type="button"
                onClick={() => patchGoal(goal.id, { currentValue: Math.max(0, goal.currentValue - 1) })}
                className="si-btn inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => patchGoal(goal.id, { currentValue: goal.currentValue + 1 })}
                className="si-btn inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => patchGoal(goal.id, { status: "completed", completedAt: new Date().toISOString() })}
                className="si-btn inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Complete
              </button>
              <button
                type="button"
                onClick={() => patchGoal(goal.id, { status: "canceled" })}
                className="si-btn inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
              >
                Cancel
              </button>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => openEdit(goal)}
            className="si-btn inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => deleteGoal(goal.id)}
            className="si-btn inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
          >
            Delete
          </button>
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

        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Status</div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | GoalStatus)}
                className="mt-2 h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Type</div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "all" | GoalType)}
                className="mt-2 h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
              >
                <option value="all">All</option>
                <option value="strength">Strength</option>
                <option value="frequency">Frequency</option>
                <option value="time">Time</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={refreshGoals}
              className="si-btn inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="si-btn inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Create goal
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Active</h2>
          <div className="text-xs text-muted-foreground">{activeGoals.length} goals</div>
        </div>
        <div className="grid gap-3">
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="mt-3 h-4 w-64 rounded bg-muted" />
              <div className="mt-5 h-10 w-full rounded bg-muted" />
            </div>
          ) : null}

          {!loading && activeGoals.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-base font-semibold">No active goals</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Create a goal to start tracking.
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="si-btn mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Create goal
              </button>
            </div>
          ) : null}

          {!loading ? activeGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />) : null}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Completed</h2>
          <div className="text-xs text-muted-foreground">{completedGoals.length} goals</div>
        </div>
        <div className="grid gap-3">
          {!loading ? completedGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />) : null}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Canceled</h2>
          <div className="text-xs text-muted-foreground">{canceledGoals.length} goals</div>
        </div>
        <div className="grid gap-3">
          {!loading ? canceledGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />) : null}
        </div>
      </section>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeCreate}
          />
          <div className="si-surface absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-2xl p-5 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-2xl">
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
                className="si-btn inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
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
                    if (next === "strength") setDraftUnit(getWeightUnit() === "lb" ? "lb" : "kg")
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
                className="si-btn inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createGoal}
                className="si-btn inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingGoal ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={closeEdit} />
          <div className="si-surface absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-2xl p-5 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold tracking-tight">Edit goal</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Update fields and save.
                </div>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="si-btn inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Goal type</div>
                <select
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value as GoalType)}
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
                  className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 md:flex-row md:justify-end">
              <button
                type="button"
                onClick={closeEdit}
                className="si-btn inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="si-btn inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
