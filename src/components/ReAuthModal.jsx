import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginRequest } from "../api/auth";

export function ReAuthModal() {
  const { user, login, logout, showReAuth, setShowReAuth } = useAuth();
  const navigate = useNavigate();
  const email = user?.sub ?? "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!showReAuth) return null;

  async function handleContinue(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      login(data.token);
      setShowReAuth(false);
      setPassword("");
    } catch {
      setError("Contraseña incorrecta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    setShowReAuth(false);
    navigate("/login");
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40" />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Tu sesión expiró
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Ingresa tu contraseña para continuar
            </p>
          </div>

          <form onSubmit={handleContinue} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 focus:outline-none cursor-default"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
                className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Verificando..." : "Continuar"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
