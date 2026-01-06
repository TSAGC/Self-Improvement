import { Router } from "express"

import { all, get, run } from "../db.js"

function jsonError(res, status, error) {
  res.status(status).json({ error })
}

export function createSessionsRouter(db) {
  const router = Router()

  // LIST
  router.get("/", async (_req, res) => {
    try {
      const rows = await all(
        db,
        "SELECT id, workout_id as workoutId, started_at as startedAt, ended_at as endedAt, notes FROM workout_sessions ORDER BY started_at DESC"
      )
      res.json({ items: rows })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // CREATE
  router.post("/", async (req, res) => {
    try {
      const { workoutId, notes } = req.body || {}
      const id = `ws-${Date.now()}`

      await run(
        db,
        "INSERT INTO workout_sessions (id, workout_id, notes) VALUES (?, ?, ?)",
        [id, workoutId || null, typeof notes === "string" ? notes : null]
      )

      res.status(201).json({ id, workoutId: workoutId || null, notes: notes || null })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // READ
  router.get("/:id", async (req, res) => {
    try {
      const row = await get(
        db,
        "SELECT id, workout_id as workoutId, started_at as startedAt, ended_at as endedAt, notes FROM workout_sessions WHERE id = ?",
        [req.params.id]
      )
      if (!row) return jsonError(res, 404, "session_not_found")
      res.json(row)
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // UPDATE (PATCH)
  router.patch("/:id", async (req, res) => {
    try {
      const sessionId = req.params.id
      const { endedAt, notes } = req.body || {}

      const existing = await get(db, "SELECT id FROM workout_sessions WHERE id = ?", [sessionId])
      if (!existing) return jsonError(res, 404, "session_not_found")

      const updates = []
      const params = []

      if (typeof endedAt === "string") {
        updates.push("ended_at = ?")
        params.push(endedAt)
      }
      if (typeof notes === "string") {
        updates.push("notes = ?")
        params.push(notes)
      }

      if (updates.length === 0) return jsonError(res, 400, "no_updates")

      params.push(sessionId)
      await run(db, `UPDATE workout_sessions SET ${updates.join(", ")} WHERE id = ?`, params)
      res.json({ ok: true })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // DELETE
  router.delete("/:id", async (req, res) => {
    try {
      await run(db, "DELETE FROM workout_sessions WHERE id = ?", [req.params.id])
      res.json({ ok: true })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  return router
}
