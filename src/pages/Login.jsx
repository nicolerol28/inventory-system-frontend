import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginRequest } from "../api/auth";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const adminRoutes = ["/users", "/settings", "/forbidden"];
  const from = adminRoutes.includes(location.state?.from?.pathname)
    ? "/dashboard"
    : location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      login(data.token);
      navigate(from, { replace: true });
    } catch {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Lado izquierdo */}
      <div className="hidden lg:flex w-[54%] bg-[#1E3A5F] flex-col justify-between p-14 relative overflow-hidden">

        {/* Círculos decorativos */}
        <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full bg-[#185FA5] opacity-30"/>
        <div className="absolute bottom-[-80px] right-[-80px] w-80 h-80 rounded-full bg-[#2563EB] opacity-20"/>
        <div className="absolute top-16 right-24 w-32 h-32 rounded-full bg-[#378ADD] opacity-15"/>

        {/* Grid decorativo */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(#378ADD 1px, transparent 1px), linear-gradient(90deg, #378ADD 1px, transparent 1px)",
            backgroundSize: "130px 130px"
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 grid grid-cols-2 gap-0.5 p-2">
            <div className="bg-white rounded-sm"/>
            <div className="bg-white/50 rounded-sm"/>
            <div className="bg-white/50 rounded-sm"/>
            <div className="bg-white rounded-sm"/>
          </div>
          <span className="text-white font-bold text-lg tracking-wide">Inventario</span>
        </div>

        {/* Texto central */}
        <div className="relative">
          <h1 className="text-5xl font-bold text-white leading-tight tracking-tight mb-4">
            Gestión<br/>a la mano.
          </h1>
          <p className="text-blue-300 text-sm leading-relaxed mb-10">
            Controla tu inventario en tiempo real,<br/>desde cualquier lugar.
          </p>
          <div className="flex flex-col gap-3">
            {[
              "Stock en tiempo real por almacén",
              "Control de movimientos y proveedores",
              "Gestión de usuarios y productos"
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-sm bg-blue-500 flex-shrink-0"/>
                <span className="text-blue-200 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-blue-400 text-xs">© 2026 Nicole Roldan</p>
        </div>
      </div>

      {/* Lado derecho */}
      <div className="flex-1 flex items-center justify-center px-8" style={{ backgroundColor: "#F8FAFC" }}>
        <div className="w-full max-w-sm">

          {/* Logo móvil */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 grid grid-cols-2 gap-0.5 p-1.5">
              <div className="bg-white rounded-sm"/>
              <div className="bg-white/50 rounded-sm"/>
              <div className="bg-white/50 rounded-sm"/>
              <div className="bg-white rounded-sm"/>
            </div>
            <span className="text-gray-900 font-bold text-sm">Inventario</span>
          </div>

          <h2 className="text-2xl font-semibold mb-1" style={{ color: "#0F172A" }}>
            Bienvenido de nuevo
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            Ingresa tus credenciales para continuar
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@inventario.com"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Ingresando..." : "Ingresar al sistema"}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200"/>
            <span className="text-xs text-gray-400">o continúa con</span>
            <div className="flex-1 h-px bg-gray-200"/>
          </div>

          {/* Botón Google */}
          <button
            disabled
            className="w-full py-2.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-500 flex items-center justify-center gap-2.5 opacity-60 cursor-not-allowed"
            title="Próximamente"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          <p className="text-center text-[10px] text-gray-300 mt-3">
            Próximamente disponible
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-10">
            Sistema de administración de inventario
          </p>
        </div>
      </div>
    </div>
  );
}