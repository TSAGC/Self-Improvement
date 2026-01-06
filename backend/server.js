import { createApp } from "./src/app.js"

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000

const app = createApp()

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`)
})
