import { get, run } from "./db.js"

export function initSchema(db) {
  db.exec(
    `
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS _meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_exercises (
      workout_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      PRIMARY KEY (workout_id, exercise_id),
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );

    -- NOTE: We started with sets keyed by workout_id for early focus-mode logging.
    -- We'll introduce workout_sessions separately for CRUD and evolve towards session-based sets later.
    CREATE TABLE IF NOT EXISTS sets (
      id TEXT PRIMARY KEY,
      workout_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      set_index INTEGER NOT NULL,
      weight_kg REAL NOT NULL,
      reps INTEGER NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY,
      workout_id TEXT,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      notes TEXT,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS progress_logs (
      id TEXT PRIMARY KEY,
      metric TEXT NOT NULL,
      value REAL NOT NULL,
      logged_at TEXT NOT NULL DEFAULT (datetime('now')),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('strength','frequency','time')),
      status TEXT NOT NULL CHECK (status IN ('active','completed','canceled')),
      title TEXT NOT NULL,
      subtitle TEXT,
      exercise_id TEXT,
      current_value REAL NOT NULL DEFAULT 0,
      target_value REAL NOT NULL,
      unit TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_workout_exercises_order
    ON workout_exercises(workout_id, sort_order);

    CREATE INDEX IF NOT EXISTS idx_sets_workout_exercise
    ON sets(workout_id, exercise_id, set_index);

    CREATE INDEX IF NOT EXISTS idx_sessions_workout_started
    ON workout_sessions(workout_id, started_at DESC);

    CREATE INDEX IF NOT EXISTS idx_progress_metric_time
    ON progress_logs(metric, logged_at DESC);

    CREATE INDEX IF NOT EXISTS idx_goals_status
    ON goals(status);
    `
  )
}

export async function seedDemo(db) {
  const existing = await get(db, "SELECT id FROM workouts WHERE id = ?", ["active"])
  if (existing) return

  await run(db, "INSERT INTO workouts (id, name, description) VALUES (?, ?, ?)", [
    "active",
    "Push Day (Strength)",
    "Seeded demo workout for focus-mode logging",
  ])

  const demoExercises = [
    { id: "ex-1", name: "Bench Press", sort: 1 },
    { id: "ex-2", name: "Incline Dumbbell Press", sort: 2 },
    { id: "ex-3", name: "Triceps Pushdown", sort: 3 },
  ]

  for (const ex of demoExercises) {
    await run(db, "INSERT INTO exercises (id, name) VALUES (?, ?)", [ex.id, ex.name])
    await run(
      db,
      "INSERT INTO workout_exercises (workout_id, exercise_id, sort_order) VALUES (?, ?, ?)",
      ["active", ex.id, ex.sort]
    )
  }

  const demoSets = [
    { id: "s-1", exerciseId: "ex-1", setIndex: 1, weightKg: 80, reps: 5 },
    { id: "s-2", exerciseId: "ex-1", setIndex: 2, weightKg: 80, reps: 5 },
    { id: "s-3", exerciseId: "ex-1", setIndex: 3, weightKg: 80, reps: 5 },
    { id: "s-4", exerciseId: "ex-2", setIndex: 1, weightKg: 30, reps: 10 },
    { id: "s-5", exerciseId: "ex-2", setIndex: 2, weightKg: 30, reps: 10 },
    { id: "s-6", exerciseId: "ex-3", setIndex: 1, weightKg: 35, reps: 12 },
    { id: "s-7", exerciseId: "ex-3", setIndex: 2, weightKg: 35, reps: 12 },
  ]

  for (const s of demoSets) {
    await run(
      db,
      "INSERT INTO sets (id, workout_id, exercise_id, set_index, weight_kg, reps, done) VALUES (?, ?, ?, ?, ?, ?, 0)",
      [s.id, "active", s.exerciseId, s.setIndex, s.weightKg, s.reps]
    )
  }
}
