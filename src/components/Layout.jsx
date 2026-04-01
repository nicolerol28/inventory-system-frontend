import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDarkMode } from "../hooks/useDarkMode";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Productos" },
  { to: "/movements", label: "Movimientos" },
  { to: "/suppliers", label: "Proveedores" },
  { to: "/warehouses", label: "Almacenes" },
];

const adminItems = [
  { to: "/settings", label: "Configuración" },
  { to: "/users", label: "Usuarios" },
];

function SunIcon() {
  return (
    <svg className="w-5 h-5 overflow-hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5 overflow-hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const hideSearch = location.pathname === "/movements";
  const [searchInput, setSearchInput] = useState("");

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleSearch(e) {
    if (e.key === "Enter") {
      if (searchInput.trim()) {
        navigate(`${location.pathname}?search=${encodeURIComponent(searchInput.trim())}`);
      } else {
        navigate(location.pathname);
      }
    }
  }

  function handleClearSearch() {
    setSearchInput("");
    navigate(location.pathname);
  }

  const initials = user?.name
  ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  : user?.sub?.split("@")[0].slice(0, 2).toUpperCase() ?? "U";

  const username = user?.name ?? user?.sub?.split("@")[0] ?? "Usuario";

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 transition-colors duration-300 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 flex flex-col bg-blue-50 dark:bg-gray-900 border-r border-blue-100 dark:border-gray-800 transition-colors duration-300">

          {/* Logo */}
          <div className="px-5 py-6 border-b border-blue-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 grid grid-cols-2 gap-0.5 p-1.5">
                <div className="bg-white rounded-sm"/>
                <div className="bg-white/50 rounded-sm"/>
                <div className="bg-white/50 rounded-sm"/>
                <div className="bg-white rounded-sm"/>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                Inventario
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
            <p className="text-[10px] text-blue-500 dark:text-blue-400 tracking-widest px-2 mb-2 uppercase font-semibold">
              Menú principal
            </p>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                      : "text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {user?.role === "ADMIN" && (
              <>
                <div className="border-t border-blue-100 dark:border-gray-800 my-3"/>
                <p className="text-[10px] text-blue-500 dark:text-blue-400 tracking-widest px-2 mb-2 uppercase font-semibold">
                  Administración
                </p>
                {adminItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                          : "text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-white"
                      }`
                    }
                  >
                    {item.label}
                    <span className="text-[9px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium tracking-wide">
                      ADMIN
                    </span>
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          {/* User bottom */}
          <div className="px-3 py-4 border-t border-blue-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-200 truncate">
                  {username}
                </p>
                <p className="text-[10px] text-blue-500 dark:text-blue-400">
                  {user?.role ?? ""}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-[10px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                Buenos días, {username}
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                {new Date().toLocaleDateString("es-CO", {
                  weekday: "long", year: "numeric",
                  month: "long", day: "numeric"
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              {!hideSearch && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 w-52 transition-colors duration-300">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" className="text-gray-400 flex-shrink-0">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearch}
                    placeholder="Buscar..."
                    className="flex-1 text-xs bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none"
                  />
                  {searchInput && (
                    <button
                      onClick={handleClearSearch}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {/* Dark mode toggle */}
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                {initials}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-950 transition-colors duration-300">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}