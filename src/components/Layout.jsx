import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDarkMode } from "../hooks/useDarkMode";
import { ReAuthModal } from "./ReAuthModal";
import axiosClient from "../api/axiosClient";

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
  const { user, login, logout } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const hideSearch = location.pathname === "/movements";
  const [searchInput, setSearchInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile dropdown (sidebar bottom)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  // Change password modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [cpError, setCpError] = useState(null);
  const [cpLoading, setCpLoading] = useState(false);
  const [cpSuccess, setCpSuccess] = useState(false);

  // Edit profile modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [epName, setEpName] = useState("");
  const [epEmail, setEpEmail] = useState("");
  const [epError, setEpError] = useState(null);
  const [epLoading, setEpLoading] = useState(false);
  const [epSuccess, setEpSuccess] = useState(false);

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

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Change password
  function openChangePassword() {
    setShowChangePassword(true);
    setProfileMenuOpen(false);
  }

  function closeChangePassword() {
    setShowChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setCpError(null);
    setCpSuccess(false);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setCpError(null);
    setCpLoading(true);
    try {
      await axiosClient.patch(`/users/${user.userId}/password`, {
        currentPassword,
        newPassword,
      });
      setCpSuccess(true);
      setTimeout(() => closeChangePassword(), 1500);
    } catch (err) {
      setCpError(err.response?.data?.message ?? "Error al cambiar la contraseña.");
    } finally {
      setCpLoading(false);
    }
  }

  // Edit profile
  function openEditProfile() {
    setEpName(user?.name ?? "");
    setEpEmail(user?.sub ?? "");
    setEpError(null);
    setEpSuccess(false);
    setShowEditProfile(true);
    setProfileMenuOpen(false);
  }

  function closeEditProfile() {
    setShowEditProfile(false);
    setEpName("");
    setEpEmail("");
    setEpError(null);
    setEpSuccess(false);
  }

  async function handleEditProfile(e) {
    e.preventDefault();
    setEpError(null);
    setEpLoading(true);
    try {
      const response = await axiosClient.put(`/users/${user.userId}`, {
        name: epName,
        email: epEmail,
        role: user.role,
      });
      const { token } = response.data;
      login(token);
      setEpSuccess(true);
      setTimeout(() => closeEditProfile(), 1500);
    } catch (err) {
      setEpError(err.response?.data?.message ?? "Error al actualizar el perfil.");
    } finally {
      setEpLoading(false);
    }
  }

  const initials = user?.name
  ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  : user?.sub?.split("@")[0].slice(0, 2).toUpperCase() ?? "U";

  const username = user?.name ?? user?.sub?.split("@")[0] ?? "Usuario";

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 transition-colors duration-300 overflow-hidden">

        {/* Overlay (mobile only) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-56 flex-shrink-0 flex flex-col bg-blue-50 dark:bg-gray-900 border-r border-blue-100 dark:border-gray-800 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

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
                onClick={() => setSidebarOpen(false)}
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
                    onClick={() => setSidebarOpen(false)}
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
            <div ref={profileRef} className="relative">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 focus:outline-none"
                >
                  {initials}
                </button>
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
              {profileMenuOpen && (
                <div className="absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-50 py-1">
                  <button
                    onClick={openEditProfile}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Editar perfil
                  </button>
                  <button
                    onClick={openChangePassword}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cambiar contraseña
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
            {/* Hamburger (mobile only) */}
            <button
              className="lg:hidden mr-3 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="hidden lg:block text-base font-semibold text-gray-900 dark:text-white">
                Buenos días, {username}
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-600 truncate">
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

      {/* Change password modal */}
      {showChangePassword && (
        <>
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40" onClick={closeChangePassword} />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="pointer-events-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Cambiar contraseña
                </h3>
              </div>

              <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoFocus
                    className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {cpError && (
                  <p className="text-xs text-red-500">{cpError}</p>
                )}

                {cpSuccess && (
                  <p className="text-xs text-green-500">Contraseña actualizada correctamente</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeChangePassword}
                    className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={cpLoading || cpSuccess}
                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {cpLoading ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Edit profile modal */}
      {showEditProfile && (
        <>
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40" onClick={closeEditProfile} />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="pointer-events-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Editar perfil
                </h3>
              </div>

              <form onSubmit={handleEditProfile} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={epName}
                    onChange={(e) => setEpName(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={epEmail}
                    onChange={(e) => setEpEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {epError && (
                  <p className="text-xs text-red-500">{epError}</p>
                )}

                {epSuccess && (
                  <p className="text-xs text-green-500">Perfil actualizado correctamente</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeEditProfile}
                    className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={epLoading || epSuccess}
                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {epLoading ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <ReAuthModal />
    </div>
  );
}
