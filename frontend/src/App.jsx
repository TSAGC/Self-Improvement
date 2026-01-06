import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { DashboardPage } from "@/pages/DashboardPage"
import { GoalsPage } from "@/pages/GoalsPage"
import { ProgressPage } from "@/pages/ProgressPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { WorkoutFocusPage } from "@/pages/WorkoutFocusPage"
import { WorkoutsPage } from "@/pages/WorkoutsPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/workout/:id" element={<WorkoutFocusPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
