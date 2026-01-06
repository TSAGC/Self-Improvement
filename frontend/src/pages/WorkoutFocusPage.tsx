import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { apiGet, apiPatch, apiPost } from "@/lib/api"

export function WorkoutFocusPage() {
  const { id } = useParams()

  const workoutId = id || "active"

  const workoutTitle = useMemo(() => {
    if (!workoutId) return "Active Workout"
    if (workoutId === "active") return "Active Workout"
    return `Workout ${workoutId}`
  }, [workoutId])

  type SetRow = {
    id: string
    weightKg: number
    reps: number
    done: boolean
  }

  type Exercise = {
    id: string
    name: string
    sets: SetRow[]
  }

  type WorkoutPayload = {
    id: string
    name: string
    exercises: Exercise[]
  }

  const [exercises, setExercises] = useState<Exercise[]>(() => [
    {
      id: "ex-1",
      name: "Bench Press",
      sets: [
        { id: "s-1", weightKg: 80, reps: 5, done: false },
        { id: "s-2", weightKg: 80, reps: 5, done: false },
        { id: "s-3", weightKg: 80, reps: 5, done: false },
      ],
    },
    {
      id: "ex-2",
      name: "Incline Dumbbell Press",
      sets: [
        { id: "s-4", weightKg: 30, reps: 10, done: false },
        { id: "s-5", weightKg: 30, reps: 10, done: false },
      ],
    },
    {
      id: "ex-3",
      name: "Triceps Pushdown",
      sets: [
        { id: "s-6", weightKg: 35, reps: 12, done: false },
        { id: "s-7", weightKg: 35, reps: 12, done: false },
      ],
    },
  ])

  const [workoutName, setWorkoutName] = useState<string | null>(null)
  const [isBackendAvailable, setIsBackendAvailable] = useState(false)
  const pendingPatchTimersRef = useRef<Record<string, number>>({})
  const tempIdRef = useRef(0)

  const exerciseRefs = useRef<Array<HTMLDivElement | null>>([])

  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const payload = await apiGet<WorkoutPayload>(`/api/workouts/${workoutId}`)
        if (cancelled) return
        setIsBackendAvailable(true)
        setWorkoutName(payload.name)
        setExercises(payload.exercises)
      } catch {
        if (cancelled) return
        setIsBackendAvailable(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [workoutId])

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const elapsedSeconds = Math.max(0, Math.floor((now - startedAt) / 1000))
  const elapsedMm = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")
  const elapsedSs = String(elapsedSeconds % 60).padStart(2, "0")

  function isExerciseCompleted(ex: Exercise) {
    return ex.sets.length > 0 && ex.sets.every((s) => s.done)
  }

  const allExercisesCompleted =
    exercises.length > 0 && exercises.every((ex) => isExerciseCompleted(ex))

  function updateSetField(
    exerciseIndex: number,
    setId: string,
    patch: Partial<Pick<SetRow, "weightKg" | "reps" | "done">>
  ) {
    setExercises((prev) => {
      const next = prev.map((ex, idx) => {
        if (idx !== exerciseIndex) return ex
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
        }
      })

      const completedNow = isExerciseCompleted(next[exerciseIndex])
      if (completedNow && exerciseIndex < next.length - 1) {
        const nextEl = exerciseRefs.current[exerciseIndex + 1]
        if (nextEl) {
          window.setTimeout(() => {
            nextEl.scrollIntoView({ behavior: "smooth", block: "start" })
          }, 50)
        }
      }

      return next
    })

    if (!isBackendAvailable) return

    const existingTimer = pendingPatchTimersRef.current[setId]
    if (existingTimer) window.clearTimeout(existingTimer)

    pendingPatchTimersRef.current[setId] = window.setTimeout(() => {
      apiPatch(`/api/sets/${setId}`, patch).catch(() => {
        setIsBackendAvailable(false)
      })
    }, 250)
  }

  function toggleSetDone(exerciseIndex: number, setId: string) {
    const current = exercises[exerciseIndex]
    if (!current) return
    const target = current?.sets.find((s) => s.id === setId)
    updateSetField(exerciseIndex, setId, { done: !target?.done })
  }

  function addSet(exerciseIndex: number) {
    const ex = exercises[exerciseIndex]
    if (!ex) return
    const last = ex?.sets[ex.sets.length - 1]
    tempIdRef.current += 1

    const optimisticSet: SetRow = {
      id: `tmp-${tempIdRef.current}`,
      weightKg: last ? last.weightKg : 0,
      reps: last ? last.reps : 8,
      done: false,
    }

    if (!isBackendAvailable) {
      setExercises((prev) =>
        prev.map((e, idx) =>
          idx === exerciseIndex ? { ...e, sets: [...e.sets, optimisticSet] } : e
        )
      )
      return
    }

    setExercises((prev) =>
      prev.map((e, idx) =>
        idx === exerciseIndex ? { ...e, sets: [...e.sets, optimisticSet] } : e
      )
    )

    apiPost<{ id: string; weightKg: number; reps: number; done: boolean }>(
      `/api/workouts/${workoutId}/sets`,
      {
        exerciseId: ex.id,
        weightKg: optimisticSet.weightKg,
        reps: optimisticSet.reps,
      }
    )
      .then((created) => {
        setExercises((prev) =>
          prev.map((e) => {
            if (e.id !== ex.id) return e
            const sets = e.sets.map((s) =>
              s.id === optimisticSet.id ? { ...s, id: created.id } : s
            )
            return { ...e, sets }
          })
        )
      })
      .catch(() => {
        setIsBackendAvailable(false)
      })
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4 md:px-6 md:pt-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground">
              Workout
            </div>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight md:text-3xl">
              {workoutName || workoutTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-border bg-card px-3 py-2">
              <div className="text-[11px] font-medium text-muted-foreground">
                Timer
              </div>
              <div className="mt-0.5 font-mono text-lg font-semibold">
                {elapsedMm}:{elapsedSs}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {exercises.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <div className="text-lg font-semibold tracking-tight">No exercises yet</div>
              <div className="mt-2 text-sm text-muted-foreground">
                This workout template doesn’t have any exercises. Add some first, then come back to log.
              </div>
              <div className="mt-4">
                <Link
                  to="/workouts"
                  replace
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Go to Workouts
                </Link>
              </div>
            </div>
          ) : (
            exercises.map((ex, exerciseIndex) => {
              const completed = isExerciseCompleted(ex)

              return (
                <div
                  key={ex.id}
                  ref={(el) => {
                    exerciseRefs.current[exerciseIndex] = el
                  }}
                  className="rounded-2xl border border-border bg-card"
                >
                  <details open className="group">
                    <summary className="cursor-pointer list-none select-none px-4 py-4 md:px-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="truncate text-lg font-semibold md:text-xl">
                              {ex.name}
                            </div>
                            {completed ? (
                              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                                Completed
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {ex.sets.filter((s) => s.done).length}/{ex.sets.length} sets done
                          </div>
                        </div>

                        <div className="shrink-0 text-sm text-muted-foreground">
                          <span className="hidden group-open:inline">Collapse</span>
                          <span className="group-open:hidden">Expand</span>
                        </div>
                      </div>
                    </summary>

                    <div className="border-t border-border px-4 pb-4 pt-4 md:px-5">
                      <div className="space-y-2">
                        {ex.sets.map((set, setIndex) => (
                          <div
                            key={set.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-3"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-semibold">Set {setIndex + 1}</div>
                              <div className="mt-0.5 text-sm text-muted-foreground">
                                <div className="flex flex-wrap items-center gap-2">
                                  <label className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">kg</span>
                                    <input
                                      inputMode="decimal"
                                      type="number"
                                      step="0.5"
                                      value={set.weightKg}
                                      onChange={(e) =>
                                        updateSetField(exerciseIndex, set.id, {
                                          weightKg: Number(e.target.value),
                                        })
                                      }
                                      className="h-9 w-24 rounded-md border border-border bg-card px-2 text-sm text-foreground"
                                    />
                                  </label>

                                  <span className="text-muted-foreground/60">×</span>

                                  <label className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">reps</span>
                                    <input
                                      inputMode="numeric"
                                      type="number"
                                      step="1"
                                      value={set.reps}
                                      onChange={(e) =>
                                        updateSetField(exerciseIndex, set.id, {
                                          reps: Number(e.target.value),
                                        })
                                      }
                                      className="h-9 w-24 rounded-md border border-border bg-card px-2 text-sm text-foreground"
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={set.done}
                                onChange={() => toggleSetDone(exerciseIndex, set.id)}
                                className="size-5 accent-primary"
                              />
                              <span className="hidden sm:inline text-muted-foreground">Done</span>
                            </label>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addSet(exerciseIndex)}
                        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-card text-sm font-semibold hover:bg-accent"
                      >
                        Add set
                      </button>
                    </div>
                  </details>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Workout timer</div>
            <div className="font-mono text-base font-semibold">
              {elapsedMm}:{elapsedSs}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {allExercisesCompleted ? "Ready to finish" : "Complete all exercises to finish"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              replace
              aria-disabled={!allExercisesCompleted}
              tabIndex={allExercisesCompleted ? 0 : -1}
              className={
                allExercisesCompleted
                  ? "inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  : "pointer-events-none inline-flex h-11 items-center justify-center rounded-md bg-muted px-4 text-sm font-semibold text-muted-foreground"
              }
            >
              Finish Workout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
