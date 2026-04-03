import { useNavigate } from "react-router-dom";

export function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-8xl font-bold text-blue-600">403</span>
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Sin permisos</h1>
          <p className="text-sm text-gray-400 dark:text-gray-600">No tienes acceso a esta página.</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Volver al dashboard
        </button>
      </div>
    </div>
  );
}
