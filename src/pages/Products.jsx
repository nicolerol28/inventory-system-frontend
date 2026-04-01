import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAllProducts, createProduct, updateProduct, deactivateProduct } from "../api/products";
import { getActiveCategories } from "../api/categories";
import { getActiveUnits } from "../api/units";
import { getActiveSuppliers } from "../api/suppliers";

const PAGE_SIZE = 10;

function Badge({ active }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block text-center w-20 ${
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

function ProductForm({ product, categories, units, suppliers, onSubmit, onClose, isLoading }) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    sku: product?.sku ?? "",
    unitId: product?.unitId ?? "",
    categoryId: product?.categoryId ?? "",
    supplierId: product?.supplierId ?? "",
    purchasePrice: product?.purchasePrice ?? "",
    salePrice: product?.salePrice ?? "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      name: form.name,
      description: form.description || null,
      sku: form.sku,
      unitId: form.unitId ? Number(form.unitId) : null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
      salePrice: form.salePrice ? Number(form.salePrice) : null,
    });
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
        <label className={labelClass}>SKU *</label>
        <input name="sku" value={form.sku} onChange={handleChange} required className={inputClass}/>
      </div>
      <div>
        <label className={labelClass}>Descripción</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} maxLength={150} className={inputClass}/>
      </div>
      <div>
        <label className={labelClass}>Unidad *</label>
        <select name="unitId" value={form.unitId} onChange={handleChange} required className={inputClass}>
          <option value="">Selecciona una unidad</option>
          {units?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div>
        <label className={labelClass}>Categoría *</label>
        <select name="categoryId" value={form.categoryId} onChange={handleChange} required className={inputClass}>
          <option value="">Selecciona una categoría</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className={labelClass}>Proveedor</label>
        <select name="supplierId" value={form.supplierId} onChange={handleChange} className={inputClass}>
          <option value="">Sin proveedor</option>
          {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Precio compra</label>
          <input name="purchasePrice" type="number" value={form.purchasePrice} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <label className={labelClass}>Precio venta</label>
          <input name="salePrice" type="number" value={form.salePrice} onChange={handleChange} className={inputClass}/>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Guardando..." : product ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

export function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";

  const [page, setPage] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterActive, setFilterActive] = useState("all");
  const [sortName, setSortName] = useState("asc");
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterUnit, setFilterUnit] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);


  const { data: products, isLoading } = useQuery({
    queryKey: ["products", page, urlSearch, filterActive, filterCategory, filterUnit, sortName],
    queryFn: () => getAllProducts(page, PAGE_SIZE, urlSearch, filterCategory, filterUnit, sortName, filterActive),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories-active"],
    queryFn: getActiveCategories,
  });

  const { data: units } = useQuery({
    queryKey: ["units-active"],
    queryFn: getActiveUnits,
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers-active"],
    queryFn: getActiveSuppliers,
  });
  
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        closePanel();
    },
    onError: (error) => {
        setErrorMsg(error.response?.data?.message ?? "Error al crear el producto.");
    },
    });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        closePanel();
    },
    onError: (error) => {
        setErrorMsg(error.response?.data?.message ?? "Error al actualizar el producto.");
    },
    });

  const deactivateMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      alert(error.response?.data?.message ?? "Error al desactivar el producto.");
    },
  });

  function openCreate() {
    setSelectedProduct(null);
    setIsPanelOpen(true);
  }

  function openEdit(product) {
    setSelectedProduct(product);
    setIsPanelOpen(true);
  }

  function closePanel() {
  setIsPanelOpen(false);
  setSelectedProduct(null);
  setErrorMsg(null);
}

  function handleSubmit(data) {
    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function handleDeactivate(id) {
    if (confirm("¿Desactivar este producto?")) {
      deactivateMutation.mutate(id);
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Productos</h1>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
            {products?.totalElements ?? 0} productos en total
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            + Nuevo producto
          </button>
        )}
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

          {/* Orden alfabético */}
          <button
            onClick={() => { setSortName(prev => prev === "asc" ? "desc" : "asc"); setPage(0); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Nombre {sortName === "asc" ? "A→Z" : "Z→A"}
          </button>

          {/* Filtro categoría */}
          <div className="relative">
            <button
              onClick={() => { setShowCategoryDropdown(p => !p); setShowUnitDropdown(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterCategory
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {filterCategory
                ? categories?.find(c => c.id === filterCategory)?.name
                : "Categoría ▾"}
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-40">
                <button
                  onClick={() => { setFilterCategory(null); setShowCategoryDropdown(false); setPage(0); }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Todas
                </button>
                {categories?.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setFilterCategory(c.id); setShowCategoryDropdown(false); setPage(0); }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtro unidad */}
          <div className="relative">
            <button
              onClick={() => { setShowUnitDropdown(p => !p); setShowCategoryDropdown(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterUnit
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {filterUnit
                ? units?.find(u => u.id === filterUnit)?.name
                : "Unidad ▾"}
            </button>
            {showUnitDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-40">
                <button
                  onClick={() => { setFilterUnit(null); setShowUnitDropdown(false); setPage(0); }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Todas
                </button>
                {units?.map(u => (
                  <button
                    key={u.id}
                    onClick={() => { setFilterUnit(u.id); setShowUnitDropdown(false); setPage(0); }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Limpiar filtros */}
          {(filterCategory || filterUnit || filterActive !== "all") && (
            <button
              onClick={() => { setFilterCategory(null); setFilterUnit(null); setFilterActive("all"); setPage(0); }}
              className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"/>
            ))}
          </div>
        ) : products?.content?.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 dark:text-gray-600 text-center">
            No se encontraron productos.
          </p>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">SKU</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Nombre</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Descripción</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Unidad</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Categoría</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Proveedor</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">P. Compra</th>
                    <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">P. Venta</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Estado</th>
                  {isAdmin && <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {products?.content?.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">{p.sku}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">{p.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-500 max-w-xs truncate">{p.description ?? "—"}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {units?.find(u => u.id === p.unitId)?.name ?? `#${p.unitId}`}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {categories?.find(c => c.id === p.categoryId)?.name ?? `#${p.categoryId}`}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {suppliers?.find(s => s.id === p.supplierId)?.name ?? `#${p.supplierId}`}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {p.purchasePrice ? `$${Number(p.purchasePrice).toLocaleString("es-CO")}` : "—"}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {p.salePrice ? `$${Number(p.salePrice).toLocaleString("es-CO")}` : "—"}
                    </td>
                    <td className="px-6 py-3"><Badge active={p.active}/></td>
                    {isAdmin && (
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                            
                         {p.active && (
                            <button
                                onClick={() => openEdit(p)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                                title="Editar"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            )}

                          {p.active && (
                            <button
                              onClick={() => handleDeactivate(p.id)}
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={products?.totalPages ?? 0} onPageChange={setPage}/>
          </>
        )}
      </div>

      {/* Panel lateral */}
      {isPanelOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            onClick={closePanel}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {selectedProduct ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button
                onClick={closePanel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {errorMsg && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900">
                    <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
                    </div>
                )}
                <ProductForm
                    product={selectedProduct}
                    categories={categories}
                    units={units}
                    suppliers={suppliers}
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