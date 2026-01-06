import { Router } from "express"

import { all, get, run } from "../db.js"

function jsonError(res, status, error) {
  res.status(status).json({ error })
}

export function createExercisesRouter(db) {
  const router = Router()

  // LIST
  router.get("/", async (_req, res) => {
    try {
      const rows = await all(
        db,
        "SELECT id, name, created_at as createdAt FROM exercises ORDER BY name ASC"
      )
      res.json({ items: rows })
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  // CREATE
  router.post("/", async (req, res) => {
    try {
      const { name } = req.body || {}
      if (!name || typeof name !== "string") return jsonError(res, 400, "invalid_body")

      const trimmed = name.trim()
      if (!trimmed) return jsonError(res, 400, "invalid_body")

      const id = `ex-${Date.now()}`
      await run(db, "INSERT INTO exercises (id, name) VALUES (?, ?)", [id, trimmed])

      const row = await get(db, "SELECT id, name FROM exercises WHERE id = ?", [id])
      res.status(201).json(row)
    } catch {
      jsonError(res, 500, "internal_error")
    }
  })

  return router
}
