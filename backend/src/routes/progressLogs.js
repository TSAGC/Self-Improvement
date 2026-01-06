import { Router } from "express"

import { all, get, run } from "../db.js"

function jsonError(res, status, error) {
  res.status(status).json({ error })
}

export function createProgressLogsRouter(db) {
  const router = Router()

  // LIST
  router.get("/", async (req, res) => {
    try {
      const { metric } = req.query
      const rows = await all(
        db,
        metric
          ? "SELECT id, metric, value, logged_at as loggedAt, notes FROM progress_logs WHERE metric = ? ORDER BY logged_at DESC"
          : "SELECT id, metric, value, logged_at as loggedAt, notes FROM progress_logs ORDER BY logged_at DESC",
        metric ? [String(metric)] : []
      )
      res.json({ items: rows })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // CREATE
  router.post("/", async (req, res) => {
    try {
      const { metric, value, loggedAt, notes } = req.body || {}
      if (!metric || typeof metric !== "string" || typeof value !== "number") {
        return jsonError(res, 400, "invalid_body")
      }

      const id = `pl-${Date.now()}`
      await run(
        db,
        "INSERT INTO progress_logs (id, metric, value, logged_at, notes) VALUES (?, ?, ?, COALESCE(?, datetime('now')), ?)",
        [id, metric, value, typeof loggedAt === "string" ? loggedAt : null, typeof notes === "string" ? notes : null]
      )

      res.status(201).json({ id, metric, value })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // READ
  router.get("/:id", async (req, res) => {
    try {
      const row = await get(
        db,
        "SELECT id, metric, value, logged_at as loggedAt, notes FROM progress_logs WHERE id = ?",
        [req.params.id]
      )
      if (!row) return jsonError(res, 404, "progress_log_not_found")
      res.json(row)
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // UPDATE
  router.patch("/:id", async (req, res) => {
    try {
      const id = req.params.id
      const { metric, value, loggedAt, notes } = req.body || {}

      const existing = await get(db, "SELECT id FROM progress_logs WHERE id = ?", [id])
      if (!existing) return jsonError(res, 404, "progress_log_not_found")

      const updates = []
      const params = []

      if (typeof metric === "string") {
        updates.push("metric = ?")
        params.push(metric)
      }
      if (typeof value === "number" && Number.isFinite(value)) {
        updates.push("value = ?")
        params.push(value)
      }
      if (typeof loggedAt === "string") {
        updates.push("logged_at = ?")
        params.push(loggedAt)
      }
      if (typeof notes === "string") {
        updates.push("notes = ?")
        params.push(notes)
      }

      if (updates.length === 0) return jsonError(res, 400, "no_updates")

      params.push(id)
      await run(db, `UPDATE progress_logs SET ${updates.join(", ")} WHERE id = ?`, params)
      res.json({ ok: true })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // DELETE
  router.delete("/:id", async (req, res) => {
    try {
      await run(db, "DELETE FROM progress_logs WHERE id = ?", [req.params.id])
      res.json({ ok: true })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  return router
}
