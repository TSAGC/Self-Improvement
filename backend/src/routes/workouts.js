import { Router } from "express"

import { all, get, run } from "../db.js"

function jsonError(res, status, error) {
  res.status(status).json({ error })
}

export function createWorkoutsRouter(db) {
  const router = Router()

  // LIST
  router.get("/", async (_req, res) => {
    try {
      const rows = await all(
        db,
        "SELECT id, name, description, created_at as createdAt FROM workouts ORDER BY created_at DESC"
      )
      res.json({ items: rows })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // CREATE
  router.post("/", async (req, res) => {
    try {
      const { name, description } = req.body || {}
      if (!name || typeof name !== "string") return jsonError(res, 400, "invalid_body")

      const id = `w-${Date.now()}`
      await run(db, "INSERT INTO workouts (id, name, description) VALUES (?, ?, ?)", [
        id,
        name,
        typeof description === "string" ? description : null,
      ])

      res.status(201).json({ id, name, description: description || null })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // READ (keeps existing behavior: includes exercises + sets)
  router.get("/:id", async (req, res) => {
    try {
      const workoutId = req.params.id
      const workout = await get(
        db,
        "SELECT id, name, description, created_at as createdAt FROM workouts WHERE id = ?",
        [workoutId]
      )
      if (!workout) return jsonError(res, 404, "workout_not_found")

      const exerciseRows = await all(
        db,
        `
        SELECT e.id, e.name
        FROM workout_exercises we
        JOIN exercises e ON e.id = we.exercise_id
        WHERE we.workout_id = ?
        ORDER BY we.sort_order ASC
        `,
        [workoutId]
      )

      const setRows = await all(
        db,
        `
        SELECT id, exercise_id as exerciseId, set_index as setIndex, weight_kg as weightKg, reps, done
        FROM sets
        WHERE workout_id = ?
        ORDER BY exercise_id ASC, set_index ASC
        `,
        [workoutId]
      )

      const setsByExercise = new Map()
      for (const s of setRows) {
        const list = setsByExercise.get(s.exerciseId) || []
        list.push({
          id: s.id,
          weightKg: Number(s.weightKg),
          reps: Number(s.reps),
          done: Boolean(s.done),
          setIndex: Number(s.setIndex),
        })
        setsByExercise.set(s.exerciseId, list)
      }

      const exercises = exerciseRows.map((e) => ({
        id: e.id,
        name: e.name,
        sets: (setsByExercise.get(e.id) || []).map(({ setIndex, ...rest }) => rest),
      }))

      res.json({
        id: workout.id,
        name: workout.name,
        description: workout.description ?? null,
        createdAt: workout.createdAt,
        exercises,
      })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // UPDATE
  router.put("/:id", async (req, res) => {
    try {
      const workoutId = req.params.id
      const { name, description } = req.body || {}
      if (!name || typeof name !== "string") return jsonError(res, 400, "invalid_body")

      const existing = await get(db, "SELECT id FROM workouts WHERE id = ?", [workoutId])
      if (!existing) return jsonError(res, 404, "workout_not_found")

      await run(db, "UPDATE workouts SET name = ?, description = ? WHERE id = ?", [
        name,
        typeof description === "string" ? description : null,
        workoutId,
      ])

      res.json({ ok: true })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // DELETE
  router.delete("/:id", async (req, res) => {
    try {
      const workoutId = req.params.id
      await run(db, "DELETE FROM workouts WHERE id = ?", [workoutId])
      res.json({ ok: true })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // LIST workout exercises (composition)
  router.get("/:id/exercises", async (req, res) => {
    try {
      const workoutId = req.params.id
      const workout = await get(db, "SELECT id FROM workouts WHERE id = ?", [workoutId])
      if (!workout) return jsonError(res, 404, "workout_not_found")

      const rows = await all(
        db,
        `
        SELECT e.id, e.name, we.sort_order as sortOrder
        FROM workout_exercises we
        JOIN exercises e ON e.id = we.exercise_id
        WHERE we.workout_id = ?
        ORDER BY we.sort_order ASC
        `,
        [workoutId]
      )
      res.json({ items: rows })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // ADD exercise to workout (composition)
  router.post("/:id/exercises", async (req, res) => {
    try {
      const workoutId = req.params.id
      const { exerciseId } = req.body || {}
      if (!exerciseId || typeof exerciseId !== "string") {
        return jsonError(res, 400, "invalid_body")
      }

      const workout = await get(db, "SELECT id FROM workouts WHERE id = ?", [workoutId])
      if (!workout) return jsonError(res, 404, "workout_not_found")

      const exercise = await get(db, "SELECT id FROM exercises WHERE id = ?", [exerciseId])
      if (!exercise) return jsonError(res, 404, "exercise_not_found")

      const maxRow = await get(
        db,
        "SELECT COALESCE(MAX(sort_order), 0) as m FROM workout_exercises WHERE workout_id = ?",
        [workoutId]
      )
      const nextSort = Number(maxRow?.m || 0) + 1

      await run(
        db,
        "INSERT OR REPLACE INTO workout_exercises (workout_id, exercise_id, sort_order) VALUES (?, ?, ?)",
        [workoutId, exerciseId, nextSort]
      )

      res.status(201).json({ ok: true })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // REMOVE exercise from workout (composition)
  router.delete("/:id/exercises/:exerciseId", async (req, res) => {
    try {
      const workoutId = req.params.id
      const exerciseId = req.params.exerciseId

      await run(
        db,
        "DELETE FROM workout_exercises WHERE workout_id = ? AND exercise_id = ?",
        [workoutId, exerciseId]
      )
      res.json({ ok: true })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // Existing focus-mode endpoint: add set
  router.post("/:id/sets", async (req, res) => {
    try {
      const workoutId = req.params.id
      const { exerciseId, weightKg, reps } = req.body || {}
      if (!exerciseId || typeof weightKg !== "number" || typeof reps !== "number") {
        return jsonError(res, 400, "invalid_body")
      }

      const workout = await get(db, "SELECT id FROM workouts WHERE id = ?", [workoutId])
      if (!workout) return jsonError(res, 404, "workout_not_found")

      const countRow = await get(
        db,
        "SELECT COUNT(1) as c FROM sets WHERE workout_id = ? AND exercise_id = ?",
        [workoutId, exerciseId]
      )
      const nextIndex = Number(countRow?.c || 0) + 1
      const setId = `s-${Date.now()}`

      await run(
        db,
        "INSERT INTO sets (id, workout_id, exercise_id, set_index, weight_kg, reps, done) VALUES (?, ?, ?, ?, ?, ?, 0)",
        [setId, workoutId, exerciseId, nextIndex, weightKg, reps]
      )

      res.status(201).json({ id: setId, weightKg, reps, done: false })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // Existing focus-mode endpoint: patch set
  router.patch("/sets/:setId", async (req, res) => {
    try {
      const setId = req.params.setId
      const { weightKg, reps, done } = req.body || {}

      const existing = await get(db, "SELECT id FROM sets WHERE id = ?", [setId])
      if (!existing) return jsonError(res, 404, "set_not_found")

      const updates = []
      const params = []

      if (typeof weightKg === "number" && Number.isFinite(weightKg)) {
        updates.push("weight_kg = ?")
        params.push(weightKg)
      }
      if (typeof reps === "number" && Number.isFinite(reps)) {
        updates.push("reps = ?")
        params.push(reps)
      }
      if (typeof done === "boolean") {
        updates.push("done = ?")
        params.push(done ? 1 : 0)
      }

      if (updates.length === 0) return jsonError(res, 400, "no_updates")

      params.push(setId)
      await run(db, `UPDATE sets SET ${updates.join(", ")} WHERE id = ?`, params)
      res.json({ ok: true })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  return router
}
