import { Router } from "express"

import { all, get, run } from "../db.js"

function jsonError(res, status, error) {
  res.status(status).json({ error })
}

export function createGoalsRouter(db) {
  const router = Router()

  // LIST
  router.get("/", async (req, res) => {
    try {
      const { status } = req.query
      const rows = await all(
        db,
        status
          ? "SELECT id, type, status, title, subtitle, exercise_id as exerciseId, current_value as currentValue, target_value as targetValue, unit, start_date as startDate, end_date as endDate, created_at as createdAt, completed_at as completedAt FROM goals WHERE status = ? ORDER BY created_at DESC"
          : "SELECT id, type, status, title, subtitle, exercise_id as exerciseId, current_value as currentValue, target_value as targetValue, unit, start_date as startDate, end_date as endDate, created_at as createdAt, completed_at as completedAt FROM goals ORDER BY created_at DESC",
        status ? [String(status)] : []
      )
      res.json({ items: rows })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // CREATE
  router.post("/", async (req, res) => {
    try {
      const {
        type,
        title,
        subtitle,
        exerciseId,
        currentValue,
        targetValue,
        unit,
        startDate,
        endDate,
      } = req.body || {}

      if (!type || !title || typeof targetValue !== "number" || !unit) {
        return jsonError(res, 400, "invalid_body")
      }

      const id = `g-${Date.now()}`
      await run(
        db,
        `
        INSERT INTO goals (id, type, status, title, subtitle, exercise_id, current_value, target_value, unit, start_date, end_date)
        VALUES (?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          id,
          type,
          title,
          typeof subtitle === "string" ? subtitle : null,
          typeof exerciseId === "string" ? exerciseId : null,
          typeof currentValue === "number" ? currentValue : 0,
          targetValue,
          unit,
          typeof startDate === "string" ? startDate : null,
          typeof endDate === "string" ? endDate : null,
        ]
      )

      res.status(201).json({ id })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // READ
  router.get("/:id", async (req, res) => {
    try {
      const row = await get(
        db,
        "SELECT id, type, status, title, subtitle, exercise_id as exerciseId, current_value as currentValue, target_value as targetValue, unit, start_date as startDate, end_date as endDate, created_at as createdAt, completed_at as completedAt FROM goals WHERE id = ?",
        [req.params.id]
      )
      if (!row) return jsonError(res, 404, "goal_not_found")
      res.json(row)
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // UPDATE
  router.patch("/:id", async (req, res) => {
    try {
      const id = req.params.id
      const {
        status,
        title,
        subtitle,
        currentValue,
        targetValue,
        unit,
        startDate,
        endDate,
        completedAt,
      } = req.body || {}

      const existing = await get(db, "SELECT id FROM goals WHERE id = ?", [id])
      if (!existing) return jsonError(res, 404, "goal_not_found")

      const updates = []
      const params = []

      if (typeof status === "string") {
        updates.push("status = ?")
        params.push(status)
      }
      if (typeof title === "string") {
        updates.push("title = ?")
        params.push(title)
      }
      if (typeof subtitle === "string") {
        updates.push("subtitle = ?")
        params.push(subtitle)
      }
      if (typeof currentValue === "number" && Number.isFinite(currentValue)) {
        updates.push("current_value = ?")
        params.push(currentValue)
      }
      if (typeof targetValue === "number" && Number.isFinite(targetValue)) {
        updates.push("target_value = ?")
        params.push(targetValue)
      }
      if (typeof unit === "string") {
        updates.push("unit = ?")
        params.push(unit)
      }
      if (typeof startDate === "string") {
        updates.push("start_date = ?")
        params.push(startDate)
      }
      if (typeof endDate === "string") {
        updates.push("end_date = ?")
        params.push(endDate)
      }
      if (typeof completedAt === "string") {
        updates.push("completed_at = ?")
        params.push(completedAt)
      }

      if (updates.length === 0) return jsonError(res, 400, "no_updates")

      params.push(id)
      await run(db, `UPDATE goals SET ${updates.join(", ")} WHERE id = ?`, params)
      res.json({ ok: true })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // DELETE
  router.delete("/:id", async (req, res) => {
    try {
      await run(db, "DELETE FROM goals WHERE id = ?", [req.params.id])
      res.json({ ok: true })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  return router
}
