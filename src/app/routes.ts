import { createBrowserRouter } from "react-router";
import { TodayChecklist } from "./components/today-checklist";
import { MonthlyCalendar } from "./components/monthly-calendar";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: TodayChecklist,
  },
  {
    path: "/calendar",
    Component: MonthlyCalendar,
  },
]);
