import { useState, useEffect } from "react";
import { Navigation } from "./navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface ExerciseRecord {
  [date: string]: {
    [exerciseId: string]: boolean;
  };
}

const DEFAULT_EXERCISES: Exercise[] = [
  { id: "pushup", name: "팔굽혀펴기", emoji: "💪", color: "bg-red-500" },
  { id: "squat", name: "스쿼트", emoji: "🦵", color: "bg-orange-500" },
  { id: "plank", name: "플랭크", emoji: "🧘", color: "bg-yellow-500" },
  { id: "running", name: "런닝", emoji: "🏃", color: "bg-green-500" },
  { id: "stretching", name: "스트레칭", emoji: "🤸", color: "bg-blue-500" },
];

const COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
];

export function MonthlyCalendar() {
  const [records, setRecords] = useState<ExerciseRecord>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [visibleExercises, setVisibleExercises] = useState<Set<string>>(
    new Set(DEFAULT_EXERCISES.map((e) => e.id))
  );

  useEffect(() => {
    const savedRecords = localStorage.getItem("exerciseRecords");
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }

    const savedExercises = localStorage.getItem("exercises");
    if (savedExercises) {
      const loaded = JSON.parse(savedExercises);
      // 색상이 없는 경우 기본 색상 할당
      const exercisesWithColors = loaded.map((ex: any, index: number) => ({
        ...ex,
        color: ex.color || COLORS[index % COLORS.length],
      }));
      setExercises(exercisesWithColors);
      setVisibleExercises(new Set(exercisesWithColors.map((e: Exercise) => e.id)));
    }
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // 월요일 시작 (0=월, 6=일)

    return { daysInMonth, startDayOfWeek };
  };

  const { daysInMonth, startDayOfWeek } = getDaysInMonth(currentDate);

  const getDateKey = (day: number): string => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const toggleExercise = (exerciseId: string) => {
    const newVisible = new Set(visibleExercises);
    if (newVisible.has(exerciseId)) {
      newVisible.delete(exerciseId);
    } else {
      newVisible.add(exerciseId);
    }
    setVisibleExercises(newVisible);
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto px-3 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-3xl">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h1>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* 운동 필터 */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {exercises.map((exercise) => {
              const isVisible = visibleExercises.has(exercise.id);
              return (
                <button
                  key={exercise.id}
                  onClick={() => toggleExercise(exercise.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    isVisible
                      ? `${exercise.color} text-white`
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {exercise.emoji} {exercise.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 캘린더 */}
        <div className="bg-white rounded-2xl p-3 shadow-sm">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["월", "화", "수", "목", "금", "토", "일"].map((day, index) => (
              <div
                key={day}
                className={`text-center text-sm py-2 ${
                  index >= 4 ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateKey = getDateKey(day);
              const dayRecords = records[dateKey] || {};
              const completedExercises = exercises.filter(
                (ex) => dayRecords[ex.id] && visibleExercises.has(ex.id)
              );

              const dayOfWeek = (startDayOfWeek + day - 1) % 7;
              const isWeekend = dayOfWeek >= 5; // 토요일(5), 일요일(6)

              // 오늘 날짜 확인
              const today = new Date();
              const isToday =
                day === today.getDate() &&
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getFullYear() === today.getFullYear();

              return (
                <div
                  key={day}
                  className={`aspect-square border rounded-lg p-1 flex flex-col ${
                    isWeekend ? "bg-gray-50 border-gray-200" : "border-gray-100"
                  } ${isToday ? "ring-2 ring-blue-400" : ""}`}
                >
                  <div
                    className={`text-base text-center mb-1 ${
                      isToday ? "font-semibold text-blue-500" : ""
                    }`}
                  >
                    {day}
                  </div>
                  <div className="flex-1 flex flex-wrap gap-0.5 justify-center content-start">
                    {completedExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className={`w-2 h-2 rounded-full ${exercise.color}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
}