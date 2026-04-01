import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getUsers, createUser, updateUser, deactivateUser } from "../api/users";

const PAGE_SIZE = 20;

const ROLE_LABELS = {
  ADMIN: "Administrador",
  OPERATOR: "Operador",
};

const ROLE_COLORS = {
  ADMIN: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
  OPERATOR: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

function RoleBadge({ role }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block text-center w-24 ${ROLE_COLORS[role] ?? ""}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function Badge({ active }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block text-center w-16 ${
      active
        ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
        : "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400"
    }`}>
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  const [inputPage, setInputPage] = useState("");

  function handleJump() {
    const num = parseInt(inputPage) - 1;
    if (!isNaN(num) && num >= 0 && num < totalPages) {
      onPageChange(num);
      setInputPage("");
    }
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs text-gray-400 dark:text-gray-600">
        Página {page + 1} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJump()}
            placeholder="Ir a..."
            className="w-16 px-2 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleJump}
            className="px-2 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Ir
          </button>
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

function UserForm({ user, onSubmit, onClose, isLoading }) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "OPERATOR",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (user) {
      onSubmit({ name: form.name, email: form.email, role: form.role });
    } else {
      onSubmit({ name: form.name, email: form.email, password: form.password, role: form.role });
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Nombre *</label>
        <input name="name" value={form.name} onChange={handleChange} required className={inputClass}/>
      </div>
      <div>
        <label className={labelClass}>Email *</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass}/>
      </div>
      {!user && (
        <div>
          <label className={labelClass}>Contraseña *</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} className={inputClass}/>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">Mínimo 8 caracteres</p>
        </div>
      )}
      <div>
        <label className={labelClass}>Rol *</label>
        <select name="role" value={form.role} onChange={handleChange} required className={inputClass}>
          <option value="OPERATOR">Operador</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {isLoading ? "Guardando..." : user ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

export function Users() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";

  const [page, setPage] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterActive, setFilterActive] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [sortName, setSortName] = useState("asc");
  const [errorMsg, setErrorMsg] = useState(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", page, urlSearch, filterActive, sortName],
    queryFn: () => getUsers(page, PAGE_SIZE, urlSearch, filterActive, sortName),
  });

  const filteredUsers = filterRole === "all"
    ? users?.content
    : users?.content?.filter(u => u.role === filterRole);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closePanel();
    },
    onError: (e) => setErrorMsg(e.response?.data?.message ?? "Error al crear el usuario."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closePanel();
    },
    onError: (e) => setErrorMsg(e.response?.data?.message ?? "Error al actualizar el usuario."),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (e) => alert(e.response?.data?.message ?? "Error al desactivar el usuario."),
  });

  function closePanel() {
    setIsPanelOpen(false);
    setSelectedUser(null);
    setErrorMsg(null);
  }

  function handleSubmit(data) {
    if (selectedUser) updateMutation.mutate({ id: selectedUser.id, data });
    else createMutation.mutate(data);
  }

  function handleDeactivate(id) {
    if (id === currentUser?.userId) {
      alert("No puedes desactivar tu propio usuario.");
      return;
    }
    if (confirm("¿Desactivar este usuario?")) deactivateMutation.mutate(id);
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Usuarios</h1>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
            {users?.totalElements ?? 0} usuarios en total
          </p>
        </div>
        <button
          onClick={() => setIsPanelOpen(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          + Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl transition-colors duration-300">

        {/* Filtros */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-wrap">

          {/* Filtro activo */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {["all", "active"].map((f) => (
              <button
                key={f}
                onClick={() => { setFilterActive(f); setPage(0); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterActive === f
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {f === "all" ? "Todos" : "Solo activos"}
              </button>
            ))}
          </div>

          {/* Filtro rol */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {["all", "ADMIN", "OPERATOR"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterRole(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterRole === f
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {f === "all" ? "Todos los roles" : ROLE_LABELS[f]}
              </button>
            ))}
          </div>

          {/* Ordenamiento */}
          <button
            onClick={() => { setSortName(prev => prev === "asc" ? "desc" : "asc"); setPage(0); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Nombre {sortName === "asc" ? "A→Z" : "Z→A"}
          </button>

          {/* Limpiar filtros */}
          {(filterActive !== "all" || filterRole !== "all" || sortName !== "asc") && (
            <button
              onClick={() => { setFilterActive("all"); setFilterRole("all"); setSortName("asc"); setPage(0); }}
              className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"/>
            ))}
          </div>
        ) : filteredUsers?.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 dark:text-gray-600 text-center">
            No se encontraron usuarios.
          </p>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Nombre</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Email</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Rol</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Estado</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredUsers?.map((u) => (
                  <tr key={u.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${u.id === currentUser?.userId ? "bg-blue-50/30 dark:bg-blue-950/20" : ""}`}>
                    <td className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {u.name}
                      {u.id === currentUser?.userId && (
                        <span className="ml-2 text-[10px] text-blue-500 dark:text-blue-400">(tú)</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                    <td className="px-6 py-3"><RoleBadge role={u.role}/></td>
                    <td className="px-6 py-3"><Badge active={u.active}/></td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {u.active && (
                          <button
                            onClick={() => { setSelectedUser(u); setIsPanelOpen(true); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                            title="Editar"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        )}
                        {u.active && u.id !== currentUser?.userId && (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                            title="Desactivar"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={users?.totalPages ?? 0} onPageChange={setPage}/>
          </>
        )}
      </div>

      {/* Panel lateral */}
      {isPanelOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40" onClick={closePanel}/>
          <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {selectedUser ? "Editar usuario" : "Nuevo usuario"}
              </h2>
              <button onClick={closePanel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {errorMsg && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900">
                  <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
                </div>
              )}
              <UserForm
                user={selectedUser}
                onSubmit={handleSubmit}
                onClose={closePanel}
                isLoading={isMutating}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}