import express from "express"
import cors from "cors"

import { openDb } from "./db.js"
import { initSchema, seedDemo } from "./schema.js"

import { createHealthRouter } from "./routes/health.js"
import { createWorkoutsRouter } from "./routes/workouts.js"
import { createSessionsRouter } from "./routes/sessions.js"
import { createProgressLogsRouter } from "./routes/progressLogs.js"
import { createGoalsRouter } from "./routes/goals.js"
import { createExercisesRouter } from "./routes/exercises.js"

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  const db = openDb()
  initSchema(db)
  seedDemo(db).catch(() => {})

  app.locals.db = db

  app.use(createHealthRouter())
  const workoutsRouter = createWorkoutsRouter(db)
  app.use("/api/workouts", workoutsRouter)
  app.patch("/api/sets/:setId", (req, res) => {
    req.url = `/sets/${req.params.setId}`
    workoutsRouter.handle(req, res)
  })
  app.use("/api/sessions", createSessionsRouter(db))
  app.use("/api/exercises", createExercisesRouter(db))
  app.use("/api/progress-logs", createProgressLogsRouter(db))
  app.use("/api/goals", createGoalsRouter(db))

  return app
}
