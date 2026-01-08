import { useEffect, useMemo, useState } from "react"
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

import { apiGet } from "@/lib/api"

type ProgressLog = {
  id: string
  metric: string
  value: number
  loggedAt: string
  notes?: string | null
}

type ProgressLogsResponse = {
  items: ProgressLog[]
}

type MetricPoint = {
  date: string
  value: number
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" })
}

export function ProgressPage() {
  const [items, setItems] = useState<ProgressLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    apiGet<ProgressLogsResponse>("/api/progress-logs")
      .then((res) => {
        if (cancelled) return
        setItems(res.items)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load progress logs")
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const metrics = useMemo(() => {
    const set = new Set(items.map((i) => i.metric).filter(Boolean))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  const [selectedMetric, setSelectedMetric] = useState("")

  useEffect(() => {
    if (selectedMetric) return
    if (metrics.length === 0) return
    setSelectedMetric(metrics[0] ?? "")
  }, [metrics, selectedMetric])

  const metricItems = useMemo(() => {
    const filtered = selectedMetric
      ? items.filter((i) => i.metric === selectedMetric)
      : items
    return [...filtered].sort((a, b) => a.loggedAt.localeCompare(b.loggedAt))
  }, [items, selectedMetric])

  const series = useMemo<MetricPoint[]>(() => {
    return metricItems.map((i) => ({ date: formatDateLabel(i.loggedAt), value: i.value }))
  }, [metricItems])

  const latest = metricItems.length > 0 ? metricItems[metricItems.length - 1] : null
  const previous = metricItems.length > 1 ? metricItems[metricItems.length - 2] : null
  const delta = latest && previous ? latest.value - previous.value : null

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Progress
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your progress over time.
          </p>
        </div>

        <div className="w-full md:w-[320px]">
          <div className="text-xs font-medium text-muted-foreground">Metric</div>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="si-btn mt-2 h-11 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
            disabled={loading || metrics.length === 0}
          >
            {metrics.length === 0 ? <option value="">No metrics</option> : null}
            {metrics.map((metric) => (
              <option key={metric} value={metric}>
                {metric}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="si-surface si-card rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Progress over time</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {selectedMetric || "Metric"}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">All entries</div>
          </div>

          <div className="mt-4 h-64">
            {loading ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : error ? (
              <div className="grid h-full place-items-center text-sm text-destructive">
                {error}
              </div>
            ) : series.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                No data yet for this metric.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 6" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} width={48} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    formatter={(value) => [String(value), "Value"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--color-chart-1))"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="si-surface si-card rounded-2xl p-5">
          <div className="text-sm font-semibold">Latest entry</div>
          <div className="mt-1 text-sm text-muted-foreground">Most recent value</div>

          <div className="mt-4 rounded-xl border border-border bg-background p-4">
            <div className="text-xs text-muted-foreground">{selectedMetric || "Metric"}</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {latest ? String(latest.value) : "--"}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {latest ? formatDateLabel(latest.loggedAt) : ""}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-background p-4">
            <div className="text-xs text-muted-foreground">Insight</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {delta === null
                ? "Add a second data point to see change vs the previous entry."
                : `Change vs previous: ${delta > 0 ? "+" : ""}${delta}`}
            </div>
          </div>
        </div>
      </div>

      <div className="si-surface si-card mt-6 rounded-2xl p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">History</div>
            <div className="mt-1 text-sm text-muted-foreground">Entries for this metric</div>
          </div>
          <div className="text-xs text-muted-foreground">Latest 12</div>
        </div>

        <div className="mt-4 h-64">
          {loading ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : error ? (
            <div className="grid h-full place-items-center text-sm text-destructive">
              {error}
            </div>
          ) : series.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              No history yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={series.slice(-12)}
                margin={{ left: 8, right: 12, top: 8, bottom: 8 }}
              >
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 6" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} width={48} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  formatter={(value) => [String(value), "Value"]}
                />
                <Bar dataKey="value" fill="hsl(var(--color-chart-2))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
