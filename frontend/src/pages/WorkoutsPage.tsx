import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { apiDelete, apiGet, apiPost } from "@/lib/api"

type WorkoutListItem = {
  id: string
  name: string
  description: string | null
  createdAt: string
}

type ExerciseListItem = {
  id: string
  name: string
  createdAt?: string
}

type WorkoutExerciseItem = {
  id: string
  name: string
  sortOrder: number
}

function formatCreatedAt(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function WorkoutsPage() {
  const [items, setItems] = useState<WorkoutListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null)
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExerciseItem[]>([])
  const [allExercises, setAllExercises] = useState<ExerciseListItem[]>([])
  const [exerciseSearch, setExerciseSearch] = useState("")
  const [newExerciseName, setNewExerciseName] = useState("")

  const filteredExercises = useMemo(() => {
    const q = exerciseSearch.trim().toLowerCase()
    if (!q) return allExercises
    return allExercises.filter((e) => e.name.toLowerCase().includes(q))
  }, [allExercises, exerciseSearch])

  async function refreshWorkouts() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGet<{ items: WorkoutListItem[] }>("/api/workouts")
      setItems(res.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load workouts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshWorkouts()
  }, [])

  function openCreate() {
    setNewName("")
    setNewDescription("")
    setIsCreateOpen(true)
  }

  function closeCreate() {
    setIsCreateOpen(false)
  }

  async function createWorkout() {
    const name = newName.trim()
    if (!name) return

    try {
      await apiPost<{ id: string }>("/api/workouts", {
        name,
        description: newDescription.trim() || null,
      })
      setIsCreateOpen(false)
      await refreshWorkouts()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create workout")
    }
  }

  async function openEditExercises(workoutId: string) {
    setError(null)
    try {
      setEditingWorkoutId(workoutId)
      setExerciseSearch("")
      setNewExerciseName("")

      const [we, ex] = await Promise.all([
        apiGet<{ items: WorkoutExerciseItem[] }>(`/api/workouts/${workoutId}/exercises`),
        apiGet<{ items: ExerciseListItem[] }>("/api/exercises"),
      ])

      setWorkoutExercises(we.items)
      setAllExercises(ex.items)
    } catch (e) {
      setEditingWorkoutId(null)
      setWorkoutExercises([])
      setAllExercises([])
      setError(e instanceof Error ? e.message : "Failed to load exercises")
    }
  }

  function closeEditExercises() {
    setEditingWorkoutId(null)
    setWorkoutExercises([])
    setAllExercises([])
  }

  async function addExerciseToWorkout(exerciseId: string) {
    if (!editingWorkoutId) return
    setError(null)
    try {
      await apiPost(`/api/workouts/${editingWorkoutId}/exercises`, { exerciseId })
      const we = await apiGet<{ items: WorkoutExerciseItem[] }>(
        `/api/workouts/${editingWorkoutId}/exercises`
      )
      setWorkoutExercises(we.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add exercise")
    }
  }

  async function removeExerciseFromWorkout(exerciseId: string) {
    if (!editingWorkoutId) return
    setError(null)
    try {
      await apiDelete(`/api/workouts/${editingWorkoutId}/exercises/${exerciseId}`)
      setWorkoutExercises((prev) => prev.filter((x) => x.id !== exerciseId))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove exercise")
    }
  }

  async function createExercise() {
    const name = newExerciseName.trim()
    if (!name) return
    setError(null)
    try {
      const created = await apiPost<ExerciseListItem>("/api/exercises", { name })
      setAllExercises((prev) =>
        [created, ...prev].sort((a, b) => a.name.localeCompare(b.name))
      )
      setNewExerciseName("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create exercise")
    }
  }

  const workoutExerciseIds = useMemo(
    () => new Set(workoutExercises.map((e) => e.id)),
    [workoutExercises]
  )

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Workouts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create templates, add exercises, and start logging.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={refreshWorkouts}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Create workout
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="mt-3 h-4 w-64 rounded bg-muted" />
            <div className="mt-5 h-10 w-full rounded bg-muted" />
          </div>
        ) : null}

        {!loading && items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 md:col-span-2">
            <div className="text-base font-semibold">No workouts yet</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Create your first template and add exercises.
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Create workout
            </button>
          </div>
        ) : null}

        {!loading
          ? items.map((w) => (
              <div key={w.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold">{w.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {w.description || "No description"}
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Created {formatCreatedAt(w.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/workout/${w.id}`}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Start
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEditExercises(w.id)}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
                  >
                    Edit exercises
                  </button>
                </div>
              </div>
            ))
          : null}
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={closeCreate} />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-2xl border border-border bg-card p-5 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold tracking-tight">Create workout</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Templates make logging fast.
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

            <div className="mt-5 grid gap-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Name</div>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Push Day"
                  className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Description (optional)</div>
                <input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. Chest + shoulders + triceps"
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
                onClick={createWorkout}
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingWorkoutId ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={closeEditExercises} />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-4xl rounded-t-2xl border border-border bg-card p-5 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold tracking-tight">Workout exercises</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Add exercises to make this workout usable.
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditExercises}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="text-sm font-semibold">In workout</div>
                <div className="mt-3 space-y-2">
                  {workoutExercises.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No exercises yet.
                    </div>
                  ) : (
                    workoutExercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{ex.name}</div>
                          <div className="text-xs text-muted-foreground">Order: {ex.sortOrder}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExerciseFromWorkout(ex.id)}
                          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold">Exercise library</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Search or create a new exercise.
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">Search</div>
                    <input
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
                      placeholder="e.g. Squat"
                      className="mt-2 h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">New exercise</div>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={newExerciseName}
                        onChange={(e) => setNewExerciseName(e.target.value)}
                        placeholder="e.g. Pull-up"
                        className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
                      />
                      <button
                        type="button"
                        onClick={createExercise}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 max-h-[360px] overflow-auto rounded-lg border border-border">
                  <div className="divide-y divide-border">
                    {filteredExercises.map((ex) => {
                      const alreadyInWorkout = workoutExerciseIds.has(ex.id)
                      return (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between gap-3 bg-card px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">{ex.name}</div>
                            <div className="text-xs text-muted-foreground">{ex.id}</div>
                          </div>

                          <button
                            type="button"
                            disabled={alreadyInWorkout}
                            onClick={() => addExerciseToWorkout(ex.id)}
                            className={
                              alreadyInWorkout
                                ? "inline-flex h-9 items-center justify-center rounded-md bg-muted px-3 text-sm font-semibold text-muted-foreground"
                                : "inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                            }
                          >
                            {alreadyInWorkout ? "Added" : "Add"}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
