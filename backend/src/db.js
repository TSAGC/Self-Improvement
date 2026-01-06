import Database from "better-sqlite3"

const DB_PATH = process.env.DB_PATH || "./data/app.db"

export function openDb() {
  return new Database(DB_PATH)
}

export function run(db, sql, params = []) {
  try {
    const info = db.prepare(sql).run(params)
    return Promise.resolve(info)
  } catch (err) {
    return Promise.reject(err)
  }
}

export function get(db, sql, params = []) {
  try {
    const row = db.prepare(sql).get(params)
    return Promise.resolve(row)
  } catch (err) {
    return Promise.reject(err)
  }
}

export function all(db, sql, params = []) {
  try {
    const rows = db.prepare(sql).all(params)
    return Promise.resolve(rows)
  } catch (err) {
    return Promise.reject(err)
  }
}
