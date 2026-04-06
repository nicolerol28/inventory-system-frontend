import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginRequest } from "../api/auth";
import { googleLoginRequest } from "../api/auth";


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
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState(null);
  const [googleError, setGoogleError] = useState(null);

  useEffect(() => {
    const init = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-btn-container"),
        { width: 384 }
      );
    };

    if (window.google) {
      init();
      return;
    }

    if (!document.getElementById("gsi-script")) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.id = "gsi-script";
      script.onload = init;
      document.body.appendChild(script);
    }
  }, []);

  async function handleGoogleCallback(response) {
    setGoogleError(null);
    try {
      const data = await googleLoginRequest(response.credential);
      login(data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setGoogleError(err.response?.data?.message ?? "Error al iniciar sesión con Google.");
    }
  }

  async function handleDemo() {
    setDemoError(null);
    setDemoLoading(true);
    try {
      const data = await loginRequest("demo@inventory.com", "demo1234");
      login(data.token);
      navigate("/dashboard", { replace: true });
    } catch {
      setDemoError("Error al cargar el demo, intenta de nuevo");
    } finally {
      setDemoLoading(false);
    }
  }

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

          {/* Botón demo */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleDemo}
              disabled={demoLoading}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
            >
              {demoLoading ? "Cargando demo..." : "Probar demo"}
            </button>
            {demoError && (
              <p className="text-xs text-red-500 mt-1.5">{demoError}</p>
            )}
          </div>

          {/* Separador */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200"/>
            <span className="text-xs text-gray-400">o continúa con</span>
            <div className="flex-1 h-px bg-gray-200"/>
          </div>

          {/* Botón Google */}
          <div id="google-btn-container" className="w-full"/>
          {googleError && (
            <p className="text-xs text-red-500 mt-1.5">{googleError}</p>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-10">
            Sistema de administración de inventario
          </p>
        </div>
      </div>
    </div>
  );
}