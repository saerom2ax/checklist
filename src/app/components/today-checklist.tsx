import { useState, useEffect } from "react";
import { Navigation } from "./navigation";
import { Check, Plus, Edit2, Trash2 } from "lucide-react";

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

function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("");

  const todayKey = getTodayKey();

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
    }
  }, []);

  const saveExercises = (newExercises: Exercise[]) => {
    setExercises(newExercises);
    localStorage.setItem("exercises", JSON.stringify(newExercises));
  };

  const toggleExercise = (exerciseId: string) => {
    const newRecords = { ...records };
    if (!newRecords[todayKey]) {
      newRecords[todayKey] = {};
    }
    newRecords[todayKey][exerciseId] = !newRecords[todayKey][exerciseId];
    setRecords(newRecords);
    localStorage.setItem("exerciseRecords", JSON.stringify(newRecords));
  };

  const isChecked = (exerciseId: string): boolean => {
    return records[todayKey]?.[exerciseId] || false;
  };

  const startEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setEditName(exercise.name);
    setEditEmoji(exercise.emoji);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      const newExercises = exercises.map((ex) =>
        ex.id === editingId
          ? { ...ex, name: editName.trim(), emoji: editEmoji || ex.emoji }
          : ex
      );
      saveExercises(newExercises);
      setEditingId(null);
      setEditName("");
      setEditEmoji("");
    }
  };

  const deleteExercise = (id: string) => {
    const newExercises = exercises.filter((ex) => ex.id !== id);
    saveExercises(newExercises);
  };

  const addExercise = () => {
    if (newName.trim()) {
      const newExercise: Exercise = {
        id: `exercise-${Date.now()}`,
        name: newName.trim(),
        emoji: newEmoji || "💪",
        color: COLORS[exercises.length % COLORS.length],
      };
      saveExercises([...exercises, newExercise]);
      setIsAdding(false);
      setNewName("");
      setNewEmoji("");
    }
  };

  const completedCount = exercises.filter((ex) => isChecked(ex.id)).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <p className="text-4xl mb-2">
            {new Date().getFullYear()}년
          </p>
          <p className="text-4xl">
            {new Date().getMonth() + 1}월 {new Date().getDate()}일{" "}
            {new Date().toLocaleDateString("ko-KR", { weekday: "long" })}
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="text-5xl mb-2">
              {completedCount}/{exercises.length}
            </div>
            <div className="text-lg text-gray-600">완료</div>
          </div>
        </div>

        <div className="space-y-3">
          {exercises.map((exercise) => {
            const checked = isChecked(exercise.id);
            const isEditing = editingId === exercise.id;

            if (isEditing) {
              return (
                <div key={exercise.id} className="bg-white rounded-2xl p-4 shadow">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editEmoji}
                      onChange={(e) => setEditEmoji(e.target.value)}
                      placeholder="이모지"
                      className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl"
                      maxLength={2}
                    />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="운동 이름"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-lg"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditName("");
                        setEditEmoji("");
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                    >
                      취소
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={exercise.id}
                className={`w-full rounded-2xl p-6 flex items-center justify-between transition-all ${
                  checked
                    ? `${exercise.color} text-white shadow-lg`
                    : "bg-white text-gray-900 shadow"
                }`}
              >
                <button
                  onClick={() => toggleExercise(exercise.id)}
                  className="flex items-center gap-4 flex-1"
                >
                  <span className="text-3xl">{exercise.emoji}</span>
                  <span className="text-2xl">{exercise.name}</span>
                </button>
                <div className="flex items-center gap-2">
                  {checked && (
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <Check className={exercise.color ? exercise.color.replace('bg-', 'text-') : 'text-blue-500'} size={20} />
                    </div>
                  )}
                  <button
                    onClick={() => startEdit(exercise)}
                    className={`p-2 rounded-lg ${
                      checked ? "hover:bg-opacity-80" : "hover:bg-gray-100"
                    }`}
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => deleteExercise(exercise.id)}
                    className={`p-2 rounded-lg ${
                      checked ? "hover:bg-opacity-80" : "hover:bg-gray-100"
                    }`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {isAdding ? (
          <div className="mt-3 bg-white rounded-2xl p-4 shadow">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                placeholder="이모지"
                className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl"
                maxLength={2}
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="운동 이름"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-lg"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addExercise}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                추가
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewName("");
                  setNewEmoji("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-3 w-full rounded-2xl p-6 bg-white shadow flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Plus size={24} />
            <span className="text-xl">항목 추가</span>
          </button>
        )}
      </div>

      <Navigation />
    </div>
  );
}