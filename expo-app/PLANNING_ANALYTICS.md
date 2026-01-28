# Analytics & Progress Page Planning

## 1. Overview
The **Progress** page will provide users with visual insights into their training consistency, strength gains, and muscle focus. It will leverage existing data from `workout_logs`, `set_logs`, and `exercise_muscle_groups`.

## 2. Page Structure (`app/(tabs)/progress.tsx`)
The page will be organized into several sections/cards:

### A. Training Consistency (The "Heatmap" or "Bar Chart")
- **Goal:** Show how many workouts the user completed over the last 4-8 weeks.
- **Metric:** Count of `workout_logs` with status `COMPLETED` grouped by week.
- **Visual:** Horizontal bar chart or a simple activity grid.

### B. Strength & Volume Trends
- **Goal:** Show progression in total tonnage.
- **Metric:** `SUM(weight * reps_done)` from `set_logs` across all exercises in a session, plotted over time.
- **Visual:** Line chart.

### C. Muscle Group Distribution
- **Goal:** Visualize which muscles are getting the most attention.
- **Metric:** Frequency of exercises performed per muscle group (linked via `exercise_muscle_groups`).
- **Visual:** Radar chart or horizontal bar chart.

### D. Personal Records (PRs)
- **Goal:** Celebrate milestones.
- **Metric:** Highest `weight` recorded for each exercise.
- **Visual:** A list of "Top PRs" (e.g., Squat 100kg, Bench 80kg).

---

## 3. Data Requirements (New Service Methods)

To support this, `workout-service.ts` will need:
1. `getVolumeHistory(period: 'month' | 'year')`: Returns aggregated volume trend.
2. `getMuscleGroupStats()`: Returns a count of sets/exercises per muscle group.
3. `getPersonalRecords()`: Returns the max weight/1RM per exercise.
4. `getConsistencyStats()`: Returns workout counts per week for the last 6 months.

---

## 4. UI/UX Components
- **`ProgressChart`**: A generic wrapper for `react-native-chart-kit` or similar.
- **`MetricCard`**: Small cards for "Total Workouts", "Total Volume", "Active Streak".
- **`ExerciseSelector`**: To filter the volume/strength chart by a specific exercise.

---

## 5. Implementation Strategy (Future)
1. **Phase 1:** Update `workout-service.ts` with aggregation queries.
2. **Phase 2:** Create `use-progress-view-model.ts` to transform raw DB data into chart-ready formats.
3. **Phase 3:** Build UI components using `ThemedView` and `ThemedText`.
4. **Phase 4:** Add the new tab to `_layout.tsx`.
