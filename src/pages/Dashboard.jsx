import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { getAllProducts } from "../api/products";
import { getActiveSuppliers } from "../api/suppliers";
import { getActiveWarehouses } from "../api/warehouses";
import { getStockByWarehouse, updateMinQuantity } from "../api/inventory";
import { getInventoryInsights } from "../api/assistant";
import { useAuth } from "../hooks/useAuth";
import { exportToExcel } from "../utils/exportExcel";

function StatCard({ label, value, subtitle, isLoading, icon, iconBg, iconColor }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 transition-colors duration-300">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: iconBg }}>
        {icon(iconColor)}
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      {isLoading ? (
        <div className="h-8 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"/>
      ) : (
        <p className="text-3xl font-semibold text-gray-900 dark:text-white">{value ?? "—"}</p>
      )}
      {subtitle && !isLoading && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

const iconProducts = (color) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
    <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
  </svg>
);

const iconSuppliers = (color) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const iconWarehouses = (color) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

function StockBadge({ belowMinimum }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block text-center w-24 ${
      belowMinimum
        ? "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400"
        : "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
    }`}>
      {belowMinimum ? "Bajo mínimo" : "Sobre mínimo"}
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
            className="px-2 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2 text-xs shadow-sm">
        <p className="text-gray-900 dark:text-white font-medium">{payload[0].payload.name}</p>
        <p className="text-blue-600 dark:text-blue-400">Cantidad: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [stockPage, setStockPage] = useState(0);
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingStock, setEditingStock] = useState(null);
  const [minInput, setMinInput] = useState("");
  const [exporting, setExporting] = useState(false);
  const PAGE_SIZE = 10;

  const updateMinMutation = useMutation({
    mutationFn: ({ stockId, minQuantity }) => updateMinQuantity(stockId, minQuantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-warehouse"] });
      queryClient.invalidateQueries({ queryKey: ["stock-warehouse-all"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-insights"] });
      setEditingStock(null);
    },
  });

  function handleEditMin(s) {
    setEditingStock(s);
    setMinInput(String(s.minQuantity ?? "0"));
  }

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products-count"],
    queryFn: () => getAllProducts(0, 1),
  });

  const { data: activeProductsData, isLoading: loadingActiveProducts } = useQuery({
    queryKey: ["products-count-active"],
    queryFn: () => getAllProducts(0, 1, "", null, null, "asc", "active"),
  });


  const { data: activeSuppliers, isLoading: loadingSuppliers } = useQuery({
    queryKey: ["suppliers-active"],
    queryFn: getActiveSuppliers,
  });

  const { data: activeWarehouses, isLoading: loadingActive } = useQuery({
    queryKey: ["warehouses-active"],
    queryFn: getActiveWarehouses,
  });

  const activeWarehouseId = selectedWarehouseId ?? activeWarehouses?.[0]?.id;

  const { data: stock, isLoading: loadingStock } = useQuery({
    queryKey: ["stock-warehouse", activeWarehouseId, stockPage, urlSearch, sortOrder],
    queryFn: () => getStockByWarehouse(activeWarehouseId, stockPage, PAGE_SIZE, urlSearch, sortOrder),
    enabled: !!activeWarehouseId,
  });

  const { data: stockAll } = useQuery({
    queryKey: ["stock-warehouse-all", activeWarehouseId],
    queryFn: () => getStockByWarehouse(activeWarehouseId, 0, 1000, "", "asc"),
    enabled: !!activeWarehouseId,
  });

  const { data: insightsRaw, isLoading: loadingInsights } = useQuery({
    queryKey: ["dashboard-insights"],
    queryFn: getInventoryInsights,
    refetchOnWindowFocus: true,
  });

  const insights = (() => {
    if (!insightsRaw) return null;
    try {
      const parsed = JSON.parse(insightsRaw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  })();

  const chartData = stockAll?.content
    ?.filter((s) => s.belowMinimum)
    .map((s) => ({
      name: s.productName ?? `#${s.productId}`,
      cantidad: parseFloat(s.quantity),
      minQuantity: parseFloat(s.minQuantity),
    })) ?? [];

  function handleWarehouseChange(id) {
    setSelectedWarehouseId(id);
    setStockPage(0);
  }

  function handleSortToggle() {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setStockPage(0);
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total productos"
          value={products?.totalElements}
          isLoading={loadingProducts || loadingActiveProducts}
          iconBg="#E6F1FB"
          iconColor="#185FA5"
          icon={iconProducts}
          subtitle={activeProductsData !== undefined ? `${activeProductsData.totalElements} activos` : undefined}
        />
        <StatCard
          label="Proveedores"
          value={activeSuppliers?.length}
          isLoading={loadingSuppliers}
          iconBg="#FCEBEB"
          iconColor="#A32D2D"
          icon={iconSuppliers}
          subtitle={activeSuppliers ? `${activeSuppliers.length} activos` : undefined}
        />
        <StatCard
          label="Almacenes"
          value={activeWarehouses?.length}
          isLoading={loadingActive}
          iconBg="#EEEDFE"
          iconColor="#534AB7"
          icon={iconWarehouses}
          subtitle={activeWarehouses ? `${activeWarehouses.length} activos` : undefined}
        />
      </div>

      {/* AI Insights */}
      {(loadingInsights || insights) && (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loadingInsights
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 animate-pulse"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800"/>
                    <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded"/>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded mb-2"/>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4"/>
                </div>
              ))
            : insights?.map((insight, i) => {
                const accent =
                  insight.tipo === "critico"
                    ? {
                        border: "border-red-200 dark:border-red-900",
                        iconBg: "bg-red-50 dark:bg-red-950",
                        iconColor: "#E24B4A",
                        label: "Alerta",
                        labelColor: "text-red-500 dark:text-red-400",
                      }
                    : insight.tipo === "warning"
                    ? {
                        border: "border-amber-200 dark:border-amber-900",
                        iconBg: "bg-amber-50 dark:bg-amber-950",
                        iconColor: "#D97706",
                        label: "Atención",
                        labelColor: "text-amber-600 dark:text-amber-400",
                      }
                    : {
                        border: "border-blue-200 dark:border-blue-900",
                        iconBg: "bg-blue-50 dark:bg-blue-950",
                        iconColor: "#185FA5",
                        label: "Info",
                        labelColor: "text-blue-600 dark:text-blue-400",
                      };

                return (
                  <div
                    key={i}
                    className={`rounded-2xl border ${accent.border} p-4 bg-white dark:bg-gray-900 transition-colors duration-300`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${accent.iconBg}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6L15 18H9l-.3-3C6.8 13.7 5 11.5 5 9a7 7 0 0 1 7-7z"/>
                          <line x1="9" y1="21" x2="15" y2="21"/>
                          <line x1="10" y1="18" x2="14" y2="18"/>
                        </svg>
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-widest ${accent.labelColor}`}>
                        {accent.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight.mensaje}</p>
                  </div>
                );
              })}
        </div>
        {loadingInsights && (
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 -mt-2">
            Analizando inventario con IA...
          </p>
        )}
        </>
      )}

      {/* Stock por almacén */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl transition-colors duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Stock por almacén</h2>
            {urlSearch && (
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                Filtro: "{urlSearch}"
              </span>
            )}
          </div>
          {loadingActive ? (
            <div className="h-8 w-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"/>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {activeWarehouses?.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleWarehouseChange(w.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
                    activeWarehouseId === w.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600"
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ordenamiento */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-50 dark:border-gray-800">
          <button
            onClick={handleSortToggle}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Cantidad {sortOrder === "asc" ? "↑ Menor a mayor" : "↓ Mayor a menor"}
          </button>

          {/* Exportar */}
          {stock?.content?.length > 0 && (
            <button
              disabled={exporting}
              onClick={async () => {
                setExporting(true);
                try {
                  const activeWarehouseName = activeWarehouses?.find(w => w.id === activeWarehouseId)?.name ?? "almacen";
                  const all = await getStockByWarehouse(activeWarehouseId, 0, 10000, "", sortOrder);
                  const rows = (all.content ?? []).map((s) => ({
                    ...s,
                    belowMinimum: s.belowMinimum ? "Bajo mínimo" : "Sobre mínimo",
                  }));
                  await exportToExcel(rows, [
                    { key: "productName", header: "Producto" },
                    { key: "quantity", header: "Cantidad" },
                    { key: "minQuantity", header: "Mínimo" },
                    { key: "belowMinimum", header: "Estado" },
                  ], "stock-" + activeWarehouseName);
                } finally {
                  setExporting(false);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {exporting ? "Exportando..." : "Exportar"}
            </button>
          )}
        </div>

        {/* Tabla */}
        {loadingStock ? (
          <div className="p-6 flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"/>
            ))}
          </div>
        ) : stock?.content?.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 dark:text-gray-600 text-center">
            No se encontraron productos{urlSearch ? ` para "${urlSearch}"` : ""}.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Producto</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Cantidad</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Mín.</th>
                  <th className="px-6 py-3 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {stock?.content?.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{s.productName ?? `Producto #${s.productId}`}</td>
                    <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{s.quantity}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-2">
                        {s.minQuantity}
                        {isAdmin && (
                          <button
                            onClick={() => handleEditMin(s)}
                            className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                            title="Editar mínimo"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-start">
                        <StockBadge belowMinimum={s.belowMinimum}/>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <Pagination page={stockPage} totalPages={stock?.totalPages ?? 0} onPageChange={setStockPage}/>
          </>
        )}
      </div>

      {/* Gráfica */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 transition-colors duration-300">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Productos bajo mínimo</h2>
          {chartData.length > 0 && (
            <span className="text-[10px] font-semibold bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 px-2 py-0.5 rounded-full">
              {chartData.length}
            </span>
          )}
        </div>
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 36)}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 48, left: 8, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" width={63} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(226,75,74,0.05)" }}/>
                <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} maxBarSize={20} fill="#E24B4A">
                  <LabelList
                    dataKey="minQuantity"
                    position="right"
                    formatter={(v) => `mín. ${v}`}
                    style={{ fontSize: 10, fill: "#94A3B8" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-4">
              Productos cuyo stock actual está por debajo del mínimo requerido.
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-10">
            ✓ Todos los productos tienen stock suficiente.
          </p>
        )}
      </div>

      {/* Modal editar mínimo */}
      {editingStock && (
        <>
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40" onClick={() => setEditingStock(null)}/>
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="pointer-events-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Editar cantidad mínima</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{editingStock.productName}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cantidad mínima</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingStock(null)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => updateMinMutation.mutate({ stockId: editingStock.id, minQuantity: Number(minInput) })}
                  disabled={updateMinMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {updateMinMutation.isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
