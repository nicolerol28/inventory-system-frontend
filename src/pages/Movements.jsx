import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { getActiveWarehouses } from "../api/warehouses";
import { getMovementsByWarehouse, getMovementsByDateRange, registerMovement } from "../api/inventory";
import { getAllProducts } from "../api/products";
import { getActiveSuppliers } from "../api/suppliers";
import SearchableSelect from "../components/SearchableSelect";

const PAGE_SIZE = 20;

const MOVEMENT_TYPE_LABELS = {
  PURCHASE_ENTRY: "Entrada por compra",
  SALE_EXIT:      "Salida por venta",
  RETURN_ENTRY:   "Entrada por devolución",
  DAMAGE_EXIT:    "Salida por daño",
  ADJUSTMENT_IN:  "Ajuste positivo",
  ADJUSTMENT_OUT: "Ajuste negativo",
};

const MOVEMENT_TYPE_COLORS = {
  PURCHASE_ENTRY: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
  RETURN_ENTRY:   "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
  ADJUSTMENT_IN:  "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
  SALE_EXIT:      "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400",
  DAMAGE_EXIT:    "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400",
  ADJUSTMENT_OUT: "bg-orange-50 dark:bg-orange-950 text-orange-500 dark:text-orange-400",
};

function MovementTypeBadge({ type }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${MOVEMENT_TYPE_COLORS[type] ?? ""}`}>
      {MOVEMENT_TYPE_LABELS[type] ?? type}
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

function MovementForm({ warehouseId, warehouseName, products, suppliers, userId, onSubmit, onClose, isLoading }) {
  const [form, setForm] = useState({
    productId: "",
    warehouseId: warehouseId ?? "",
    supplierId: "",
    movementType: "",
    quantity: "",
    comment: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      productId: Number(form.productId),
      warehouseId: Number(form.warehouseId),
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      registeredBy: userId,
      movementType: form.movementType,
      quantity: Number(form.quantity),
      comment: form.comment || null,
    });
  }

  const isInbound = ["PURCHASE_ENTRY", "RETURN_ENTRY", "ADJUSTMENT_IN"].includes(form.movementType);
  const inputClass = "w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
            <label className={labelClass}>Almacén</label>
            <p className="px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {warehouseName ?? "—"}
            </p>
        </div>
      <div>
        <label className={labelClass}>Producto *</label>
        <SearchableSelect
          options={products?.content ?? []}
          value={form.productId || null}
          onChange={(id) => setForm(f => ({ ...f, productId: id }))}
          placeholder="Selecciona un producto"
        />
      </div>
      <div>
        <label className={labelClass}>Tipo de movimiento *</label>
        <SearchableSelect
          options={Object.entries(MOVEMENT_TYPE_LABELS).map(([id, name]) => ({ id, name }))}
          value={form.movementType || null}
          onChange={(id) => setForm(f => ({ ...f, movementType: id }))}
          placeholder="Selecciona un tipo"
        />
      </div>
      <div>
        <label className={labelClass}>Cantidad *</label>
        <input name="quantity" type="number" min="0.01" step="0.01" value={form.quantity} onChange={handleChange} required className={inputClass}/>
      </div>
      {isInbound && (
        <div>
            <label className={labelClass}>Proveedor</label>
            <SearchableSelect
            options={suppliers ?? []}
            value={form.supplierId || null}
            onChange={(id) => setForm(f => ({ ...f, supplierId: id }))}
            placeholder="Sin proveedor"
            />
        </div>
        )}
      <div>
        <label className={labelClass}>Comentario</label>
        <textarea name="comment" value={form.comment} onChange={handleChange} rows={3} className={inputClass}/>
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
          {isLoading ? "Registrando..." : "Registrar"}
        </button>
      </div>
    </form>
  );
}

export function Movements() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Filtros de fecha
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const [filterType, setFilterType] = useState("");

  const { data: activeWarehouses, isLoading: loadingWarehouses } = useQuery({
    queryKey: ["warehouses-active"],
    queryFn: getActiveWarehouses,
  });

  const activeWarehouseId = selectedWarehouseId ?? activeWarehouses?.[0]?.id;

  const { data: movements, isLoading: loadingMovements } = useQuery({
    queryKey: ["movements", activeWarehouseId, page, dateFilterActive, fromDate, toDate, filterType],
    queryFn: () => {
      if (dateFilterActive && fromDate && toDate) {
        return getMovementsByDateRange(activeWarehouseId, fromDate + ":00", toDate + ":00", page, PAGE_SIZE);
      }
      return getMovementsByWarehouse(activeWarehouseId, page, PAGE_SIZE, filterType);
    },
    enabled: !!activeWarehouseId,
  });

  const { data: products } = useQuery({
    queryKey: ["products-active-movements"],
    queryFn: () => getAllProducts(0, 1000, "", null, null, "asc", "active"),
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers-active"],
    queryFn: getActiveSuppliers,
  });

  const registerMutation = useMutation({
    mutationFn: registerMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["stock-warehouse"] });
      closePanel();
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message ?? "Error al registrar el movimiento.");
    },
  });

  function closePanel() {
    setIsPanelOpen(false);
    setErrorMsg(null);
  }

  function handleSubmit(data) {
    registerMutation.mutate(data);
  }

  function handleWarehouseChange(id) {
    setSelectedWarehouseId(id);
    setPage(0);
  }

  function handleApplyDateFilter() {
    if (fromDate && toDate) {
      setDateFilterActive(true);
      setPage(0);
    }
  }

  function handleClearDateFilter() {
    setFromDate("");
    setToDate("");
    setDateFilterActive(false);
    setPage(0);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const utcDate = new Date(dateStr + "Z");
    return utcDate.toLocaleString("es-CO", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
            timeZone: "America/Bogota",
        });
    }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Movimientos</h1>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
            {movements?.totalElements ?? 0} movimientos en total
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsPanelOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            + Nuevo movimiento
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl transition-colors duration-300">

        {/* Header con selector de almacén */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Por almacén</h2>
          {loadingWarehouses ? (
            <div className="h-8 w-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"/>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {activeWarehouses?.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleWarehouseChange(w.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeWarehouseId === w.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(0); }}
            className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-400">hasta</span>
          <input
            type="datetime-local"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleApplyDateFilter}
            disabled={!fromDate || !toDate}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Filtrar
          </button>
          {dateFilterActive && (
            <button
              onClick={handleClearDateFilter}
              className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              Limpiar fechas
            </button>
          )}
        </div>

        {/* Contenido */}
        {loadingMovements ? (
          <div className="p-6 flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"/>
            ))}
          </div>
        ) : movements?.content?.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 dark:text-gray-600 text-center">
            No se encontraron movimientos.
          </p>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Producto</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Tipo</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Cantidad</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Antes</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Después</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Comentario</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {movements?.content?.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {products?.content?.find(p => p.id === m.productId)?.name ?? `#${m.productId}`}
                    </td>
                    <td className="px-6 py-3">
                      <MovementTypeBadge type={m.movementType}/>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{m.quantity}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{m.quantityBefore}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{m.quantityAfter}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{m.comment ?? "—"}</td>
                    <td className="px-6 py-3 text-xs text-gray-400 dark:text-gray-600 whitespace-nowrap">{formatDate(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={movements?.totalPages ?? 0} onPageChange={setPage}/>
          </>
        )}
      </div>

      {/* Panel lateral */}
      {isPanelOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40" onClick={closePanel}/>
          <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Nuevo movimiento</h2>
              <button onClick={closePanel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {errorMsg && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900">
                  <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
                </div>
              )}
              <MovementForm
                warehouseName={activeWarehouses?.find(w => w.id === activeWarehouseId)?.name}
                warehouseId={activeWarehouseId}
                products={products}
                suppliers={suppliers}
                userId={user?.userId}
                onSubmit={handleSubmit}
                onClose={closePanel}
                isLoading={registerMutation.isPending}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}