import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type ExerciseOption = {
  id: string
  name: string
}

type WeightPoint = {
  date: string
  weightKg: number
}

type WeeklyVolumePoint = {
  week: string
  volumeKg: number
}

type ProgressData = {
  exercises: ExerciseOption[]
  weightProgressionByExerciseId: Record<string, WeightPoint[]>
  weeklyVolume: WeeklyVolumePoint[]
  prByExerciseId: Record<string, { label: string; date: string }>
}

function getMockProgressData(): ProgressData {
  const exercises: ExerciseOption[] = [
    { id: "ex-1", name: "Bench Press" },
    { id: "ex-4", name: "Squat" },
    { id: "ex-5", name: "Deadlift" },
  ]

  return {
    exercises,
    prByExerciseId: {
      "ex-1": { label: "100kg × 3", date: "2026-01-02" },
      "ex-4": { label: "150kg × 2", date: "2025-12-28" },
      "ex-5": { label: "180kg × 1", date: "2025-12-21" },
    },
    weightProgressionByExerciseId: {
      "ex-1": [
        { date: "Dec 01", weightKg: 85 },
        { date: "Dec 08", weightKg: 87.5 },
        { date: "Dec 15", weightKg: 90 },
        { date: "Dec 22", weightKg: 92.5 },
        { date: "Dec 29", weightKg: 95 },
        { date: "Jan 05", weightKg: 97.5 },
      ],
      "ex-4": [
        { date: "Dec 01", weightKg: 125 },
        { date: "Dec 08", weightKg: 130 },
        { date: "Dec 15", weightKg: 132.5 },
        { date: "Dec 22", weightKg: 135 },
        { date: "Dec 29", weightKg: 140 },
        { date: "Jan 05", weightKg: 145 },
      ],
      "ex-5": [
        { date: "Dec 01", weightKg: 160 },
        { date: "Dec 08", weightKg: 165 },
        { date: "Dec 15", weightKg: 170 },
        { date: "Dec 22", weightKg: 172.5 },
        { date: "Dec 29", weightKg: 175 },
        { date: "Jan 05", weightKg: 180 },
      ],
    },
    weeklyVolume: [
      { week: "W-6", volumeKg: 8200 },
      { week: "W-5", volumeKg: 9100 },
      { week: "W-4", volumeKg: 9800 },
      { week: "W-3", volumeKg: 10400 },
      { week: "W-2", volumeKg: 11250 },
      { week: "W-1", volumeKg: 12450 },
    ],
  }
}

export function ProgressPage() {
  const data = useMemo(() => getMockProgressData(), [])
  const [selectedExerciseId, setSelectedExerciseId] = useState(
    data.exercises[0]?.id || ""
  )

  const selectedExercise = data.exercises.find((e) => e.id === selectedExerciseId)
  const weightSeries = data.weightProgressionByExerciseId[selectedExerciseId] || []
  const pr = data.prByExerciseId[selectedExerciseId]

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Progress
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mock data for now. We’ll swap this to real backend data as soon as the progress endpoints are ready.
          </p>
        </div>

        <div className="w-full md:w-[320px]">
          <div className="text-xs font-medium text-muted-foreground">Exercise</div>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
          >
            {data.exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Weight progression</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {selectedExercise?.name || "Exercise"}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Last 6 sessions</div>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightSeries} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 6" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} width={36} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  formatter={(value) => [`${value} kg`, "Weight"]}
                />
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  stroke="hsl(var(--color-chart-1))"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-sm font-semibold">PR highlight</div>
          <div className="mt-1 text-sm text-muted-foreground">Best recent performance</div>

          <div className="mt-4 rounded-xl border border-border bg-background p-4">
            <div className="text-xs text-muted-foreground">{selectedExercise?.name}</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {pr ? pr.label : "--"}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{pr ? pr.date : ""}</div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-background p-4">
            <div className="text-xs text-muted-foreground">Insight</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Keep the line trending up. Small weekly increases win.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Weekly volume</div>
            <div className="mt-1 text-sm text-muted-foreground">Total lifted per week</div>
          </div>
          <div className="text-xs text-muted-foreground">Last 6 weeks</div>
        </div>

        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeklyVolume} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 6" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} width={48} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                formatter={(value) => [`${Number(value).toLocaleString()} kg`, "Volume"]}
              />
              <Bar dataKey="volumeKg" fill="hsl(var(--color-chart-2))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
