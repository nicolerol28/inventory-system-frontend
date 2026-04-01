import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deactivateCategory } from "../api/categories";
import { getUnits, createUnit, updateUnit, deactivateUnit } from "../api/units";

const PAGE_SIZE = 20;

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
            className="px-2 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-grmapay-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

function CategoryForm({ category, onSubmit, onClose, isLoading }) {
  const [form, setForm] = useState({
    name: category?.name ?? "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ name: form.name });
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Nombre *</label>
        <input
          name="name"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          required
          className={inputClass}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {isLoading ? "Guardando..." : category ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

function CategoriesTab({ urlSearch }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filterActive, setFilterActive] = useState("all");
  const [sortName, setSortName] = useState("asc");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", page, urlSearch, filterActive, sortName],
    queryFn: () => getCategories(page, PAGE_SIZE, urlSearch, filterActive, sortName),
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); closePanel(); },
    onError: (e) => setErrorMsg(e.response?.data?.message ?? "Error al crear la categoría."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); closePanel(); },
    onError: (e) => setErrorMsg(e.response?.data?.message ?? "Error al actualizar la categoría."),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    onError: (e) => alert(e.response?.data?.message ?? "Error al desactivar la categoría."),
  });

  function closePanel() { setIsPanelOpen(false); setSelected(null); setErrorMsg(null); }

  function handleSubmit(data) {
    if (selected) updateMutation.mutate({ id: selected.id, data });
    else createMutation.mutate(data);
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl transition-colors duration-300">
      <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-600">{categories?.totalElements ?? 0} categorías en total</p>
          <button onClick={() => setIsPanelOpen(true)} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            + Nueva categoría
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle activos */}
          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
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

          {/* Ordenamiento */}
          <button
            onClick={() => { setSortName(prev => prev === "asc" ? "desc" : "asc"); setPage(0); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Nombre {sortName === "asc" ? "A→Z" : "Z→A"}
          </button>

          {/* Limpiar filtros */}
          {(filterActive !== "all" || sortName !== "asc") && (
            <button
              onClick={() => { setFilterActive("all"); setSortName("asc"); setPage(0); }}
              className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 flex flex-col gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"/>)}
        </div>
      ) : categories?.content?.length === 0 ? (
        <p className="px-6 py-8 text-sm text-gray-400 text-center">No se encontraron categorías.</p>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Nombre</th>
                <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Estado</th>
                <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {categories?.content?.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">{c.name}</td>
                  <td className="px-6 py-3"><Badge active={c.active}/></td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      {c.active && (
                        <button onClick={() => { setSelected(c); setIsPanelOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors" title="Editar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      )}
                      {c.active && (
                        <button onClick={() => { if (confirm("¿Desactivar esta categoría?")) deactivateMutation.mutate(c.id); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors" title="Desactivar">
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
          <Pagination page={page} totalPages={categories?.totalPages ?? 0} onPageChange={setPage}/>
        </>
      )}

      {isPanelOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40" onClick={closePanel}/>
          <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{selected ? "Editar categoría" : "Nueva categoría"}</h2>
              <button onClick={closePanel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {errorMsg && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900"><p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p></div>}
              <CategoryForm category={selected} onSubmit={handleSubmit} onClose={closePanel} isLoading={isMutating}/>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── UNITS ───────────────────────────────────────────────────────────────────

function UnitForm({ unit, onSubmit, onClose, isLoading }) {
  const [form, setForm] = useState({
    name: unit?.name ?? "",
    symbol: unit?.symbol ?? "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ name: form.name, symbol: form.symbol });
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
        <label className={labelClass}>Símbolo *</label>
        <input name="symbol" value={form.symbol} onChange={handleChange} required className={inputClass} placeholder="Ej: KG, LT, UND"/>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {isLoading ? "Guardando..." : unit ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

function UnitsTab({ urlSearch }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filterActive, setFilterActive] = useState("all");
  const [sortName, setSortName] = useState("asc");

  const { data: units, isLoading } = useQuery({
    queryKey: ["units", page, urlSearch, filterActive, sortName],
    queryFn: () => getUnits(page, PAGE_SIZE, urlSearch, filterActive, sortName),
  });

  const createMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["units"] }); closePanel(); },
    onError: (e) => setErrorMsg(e.response?.data?.message ?? "Error al crear la unidad."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUnit(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["units"] }); closePanel(); },
    onError: (e) => setErrorMsg(e.response?.data?.message ?? "Error al actualizar la unidad."),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUnit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["units"] }),
    onError: (e) => alert(e.response?.data?.message ?? "Error al desactivar la unidad."),
  });

  function closePanel() { setIsPanelOpen(false); setSelected(null); setErrorMsg(null); }

  function handleSubmit(data) {
    if (selected) updateMutation.mutate({ id: selected.id, data });
    else createMutation.mutate(data);
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl transition-colors duration-300">
      <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-600">{units?.totalElements ?? 0} unidades en total</p>
          <button onClick={() => setIsPanelOpen(true)} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            + Nueva unidad
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle activos */}
          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
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

          {/* Ordenamiento */}
          <button
            onClick={() => { setSortName(prev => prev === "asc" ? "desc" : "asc"); setPage(0); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Nombre {sortName === "asc" ? "A→Z" : "Z→A"}
          </button>

          {/* Limpiar filtros */}
          {(filterActive !== "all" || sortName !== "asc") && (
            <button
              onClick={() => { setFilterActive("all"); setSortName("asc"); setPage(0); }}
              className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 flex flex-col gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"/>)}
        </div>
      ) : units?.content?.length === 0 ? (
        <p className="px-6 py-8 text-sm text-gray-400 text-center">No se encontraron unidades.</p>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Nombre</th>
                <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Símbolo</th>
                <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Estado</th>
                <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {units?.content?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">{u.name}</td>
                  <td className="px-6 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">{u.symbol}</td>
                  <td className="px-6 py-3"><Badge active={u.active}/></td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      {u.active && (
                        <button onClick={() => { setSelected(u); setIsPanelOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors" title="Editar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      )}
                      {u.active && (
                        <button onClick={() => { if (confirm("¿Desactivar esta unidad?")) deactivateMutation.mutate(u.id); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors" title="Desactivar">
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
          <Pagination page={page} totalPages={units?.totalPages ?? 0} onPageChange={setPage}/>
        </>
      )}

      {isPanelOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40" onClick={closePanel}/>
          <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{selected ? "Editar unidad" : "Nueva unidad"}</h2>
              <button onClick={closePanel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {errorMsg && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900"><p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p></div>}
              <UnitForm unit={selected} onSubmit={handleSubmit} onClose={closePanel} isLoading={isMutating}/>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────

export function Settings() {
  const [activeTab, setActiveTab] = useState("categories");
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración</h1>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">Gestiona categorías y unidades de medida</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 w-fit">
        {[
          { key: "categories", label: "Categorías" },
          { key: "units", label: "Unidades" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeTab === "categories" ? <CategoriesTab urlSearch={urlSearch}/> : <UnitsTab urlSearch={urlSearch}/>}

    </div>
  );
}