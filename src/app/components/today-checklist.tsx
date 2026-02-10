import { supabase } from "../../supabase";

import { useState, useEffect } from "react";
import { Navigation } from "./navigation";
import { Check, Plus, Edit2, Trash2 } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  emoji: string;
  color: string;
  created_at?: string;
}

interface ExerciseLogRow {
  date: string;
  exercise_id: string;
  completed: boolean;
}

interface ExerciseRecord {
  [date: string]: {
    [exerciseId: string]: boolean;
  };
}

function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
}

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

const DEFAULT_EXERCISES: Exercise[] = [
  { id: "pushup", name: "팔굽혀펴기", emoji: "💪", color: "bg-red-500" },
  { id: "squat", name: "스쿼트", emoji: "🦵", color: "bg-orange-500" },
  { id: "plank", name: "플랭크", emoji: "🧘", color: "bg-yellow-500" },
  { id: "running", name: "런닝", emoji: "🏃", color: "bg-green-500" },
  { id: "stretching", name: "스트레칭", emoji: "🤸", color: "bg-blue-500" },
];

export function TodayChecklist() {
  const [records, setRecords] = useState<ExerciseRecord>({});
  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);

  const [loading, setLoading] = useState(true); // ✅ 추가

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("");

  const todayKey = getTodayKey();

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    if (data && data.length > 0) {
      const fixed = (data as any[]).map((ex, index) => ({
        ...ex,
        color: ex.color || COLORS[index % COLORS.length],
      }));
      setExercises(fixed as Exercise[]);
      return;
    }

    await supabase.from("exercises").insert(DEFAULT_EXERCISES);
    setExercises(DEFAULT_EXERCISES);
  };

  const fetchTodayRecords = async () => {
    const { data } = await supabase
      .from("exercise_logs")
      .select("date, exercise_id, completed")
      .eq("date", todayKey);

    const rows = (data ?? []) as ExerciseLogRow[];

    const todayMap: Record<string, boolean> = {};
    for (const row of rows) {
      todayMap[row.exercise_id] = !!row.completed;
    }

    setRecords({
      [todayKey]: todayMap,
    });
  };

  useEffect(() => {
    (async () => {
      await fetchExercises();
      await fetchTodayRecords();
      setLoading(false); // ✅ 데이터 다 받으면 화면 표시
    })();
  }, []);

  // ✅ 로딩 중이면 아무것도 안 보여줌
  if (loading) {
    return null;
  }

  const toggleExercise = async (exerciseId: string) => {
    const newRecords = { ...records };

    if (!newRecords[todayKey]) newRecords[todayKey] = {};
    newRecords[todayKey][exerciseId] = !newRecords[todayKey][exerciseId];

    setRecords(newRecords);

    const completed = newRecords[todayKey][exerciseId];

    await supabase
      .from("exercise_logs")
      .upsert(
        {
          date: todayKey,
          exercise_id: exerciseId,
          completed,
        },
        { onConflict: "date,exercise_id" }
      );
  };

  const isChecked = (exerciseId: string) => {
    return records[todayKey]?.[exerciseId] || false;
  };

  const completedCount = exercises.filter((ex) => isChecked(ex.id)).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-5xl">{completedCount}/{exercises.length}</div>
      </div>
      <Navigation />
    </div>
  );
}
