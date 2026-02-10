import { Link, useLocation } from "react-router";
import { CheckSquare, Calendar } from "lucide-react";

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="max-w-md mx-auto flex">
        <Link
          to="/"
          className={`flex-1 flex flex-col items-center gap-1 py-3 ${
            location.pathname === "/" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <CheckSquare size={28} />
          <span className="text-xs">오늘</span>
        </Link>
        <Link
          to="/calendar"
          className={`flex-1 flex flex-col items-center gap-1 py-3 ${
            location.pathname === "/calendar" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <Calendar size={28} />
          <span className="text-xs">캘린더</span>
        </Link>
      </div>
    </nav>
  );
}
